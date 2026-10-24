#!/usr/bin/env python3
"""Reuse or restore exactly one persistent, headless synthetic Amari QA session."""
import argparse
import datetime as dt
import fcntl
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parent.parent
SESSION = "amari-targeted-contained"
PROFILE = ROOT / "tmp/amari-production-qa-profile"
OWNER = ROOT / "tmp/amari-qa-browser-owner.json"
CLI = Path.home() / ".codex/skills/playwright/scripts/playwright_cli.sh"
GUARDS = r"""async page => {
  await page.unroute('**/api/**');
  await page.route('**/api/**', route => route.fulfill({status:403,body:'Synthetic QA provider guard'}));
  const namespace = () => {
    if (window.__amariQaNamespaced) return;
    window.__amariQaNamespaced = true;
    for (const method of ['getItem','setItem','removeItem']) {
      const original = Storage.prototype[method];
      Storage.prototype[method] = function(key,...args) {
        return original.call(this,/^(amari_|askia_)/.test(key)?'qa_rewards_20261024_'+key:key,...args);
      };
    }
  };
  if (!page.__amariQaNamespaceInstalled) {
    await page.addInitScript(namespace);
    page.__amariQaNamespaceInstalled = true;
  }
  await page.evaluate(namespace);
  return {guards:true,namespace:'qa_rewards_20261024_',url:page.url()};
}"""


def command(*args):
    result = subprocess.run(["bash", str(CLI), *args], cwd=ROOT, capture_output=True, text=True, timeout=60)
    if result.returncode or "### Error" in result.stdout:
        raise RuntimeError((result.stderr + result.stdout)[-1500:])
    return result.stdout


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--owner", default="production-health-monitor")
    parser.add_argument("--release", action="store_true")
    args = parser.parse_args()
    OWNER.parent.mkdir(exist_ok=True)
    with (OWNER.parent / "amari-qa-browser-recovery.lock").open("a") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print(json.dumps({"status":"busy", "reason":"QA recovery lock held", "browserTouched":False}))
            return
        current = json.loads(OWNER.read_text()) if OWNER.exists() else {}
        now = dt.datetime.now(dt.timezone.utc)
        expires = dt.datetime.fromisoformat(current.get("expiresAt", "1970-01-01T00:00:00+00:00"))
        if current.get("active") and expires > now and current.get("owner") != args.owner:
            print(json.dumps({"status":"busy", "owner":current.get("owner"), "browserTouched":False}))
            return
        if args.release:
            if current.get("owner") == args.owner:
                current.update(active=False, releasedAt=now.isoformat())
                OWNER.write_text(json.dumps(current))
            print(json.dumps({"status":"released"}))
            return
        listing = command("list")
        section = listing.split(f"- {SESSION}:", 1)
        restored = len(section) == 1 or "status: open" not in section[1].split("\n- ", 1)[0]
        if restored:
            # A surviving profile process must not get a competing browser.
            processes = subprocess.run(["ps","-axo","command"],capture_output=True,text=True,check=True).stdout
            if any(str(PROFILE) in line and ("--user-data-dir" in line or "cliDaemon.js" in line) for line in processes.splitlines()):
                raise RuntimeError("The dedicated profile is still in use; preserve it and review its process before recovery.")
            PROFILE.mkdir(exist_ok=True)
            command("-s="+SESSION,"open","about:blank","--config",str(ROOT/"scripts/amari-qa-browser.json"),"--profile",str(PROFILE),"--idle-timeout","0")
            listing = command("list")
        section = listing.split(f"- {SESSION}:", 1)[1].split("\n- ", 1)[0]
        if str(PROFILE) not in section or "headed: false" not in section:
            raise RuntimeError("Session is not the expected isolated headless profile; left untouched.")
        tabs = command("-s="+SESSION,"tab-list")
        if len([line for line in tabs.splitlines() if line.startswith("- ")]) != 1:
            raise RuntimeError("Expected one dedicated QA tab; no tabs were closed or created.")
        processes = subprocess.run(["ps","-axo","command"],capture_output=True,text=True,check=True).stdout
        daemon = [line for line in processes.splitlines() if "cliDaemon.js" in line and SESSION in line]
        if not daemon or not all("--idle-timeout=0" in line for line in daemon):
            raise RuntimeError("The QA daemon still has an idle timeout; root review required.")
        command("-s="+SESSION,"run-code",GUARDS)
        OWNER.write_text(json.dumps({"owner":args.owner,"active":True,"expiresAt":(now+dt.timedelta(minutes=20)).isoformat(),"profile":str(PROFILE),"idleTimeoutMs":0}))
        print(json.dumps({"status":"ready","restored":restored,"session":SESSION,"headless":True,"tabs":1,"idleTimeoutMs":0,"profile":str(PROFILE),"providerGuards":True}))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(json.dumps({"status":"blocked","error":str(error)}))
        raise SystemExit(1)
