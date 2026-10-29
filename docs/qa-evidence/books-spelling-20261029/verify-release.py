#!/usr/bin/env python3
"""Bounded HTTP identity/art/media verifier for the Pair 8 release owner.

This script does not deploy or call generation/provider APIs. It performs no
network work until invoked with a stage. Use a fresh output filename per run.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DEFAULT_DIST = ROOT / "dist"
MAX_RESPONSE_BYTES = 8 * 1024 * 1024
TIMEOUT_SECONDS = 20
WORKERS = 6
NETLIFY_ORIGIN = "https://dinospace.netlify.app"
DEFAULT_OLD_ALIAS = "https://dinospace-eight.vercel.app"
CATALOGUE_REPORT = ROOT / "docs/qa-evidence/dino-pair-20261029/production-critical-art.json"
SHADOW_PROVENANCE = ROOT / "docs/qa-evidence/shadow-progression-20261023/art-provenance.json"
SPELLING_INVENTORY = ROOT / "docs/game-delivery-20261019/batch1/spelling-voice-inventory.json"
BOOK_ROOT = ROOT / "public/storybooks"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


OPENER = urllib.request.build_opener(NoRedirect)


class StageFailure(RuntimeError):
    def __init__(self, message: str, partial: dict | None = None):
        super().__init__(message)
        self.partial = partial or {}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def local_sha(path: Path) -> str:
    return sha256(path.read_bytes())


def clean_origin(value: str) -> str:
    parsed = urllib.parse.urlsplit(value)
    if parsed.scheme != "https" or not parsed.netloc or parsed.username or parsed.password:
        raise ValueError(f"Expected an HTTPS origin without credentials: {value!r}")
    if parsed.path not in ("", "/") or parsed.query or parsed.fragment:
        raise ValueError(f"Origin must not include a path, query, or fragment: {value!r}")
    return f"https://{parsed.netloc}"


def request(url: str, method: str = "GET") -> dict:
    req = urllib.request.Request(url, method=method, headers={"Cache-Control": "no-cache"})
    try:
        with OPENER.open(req, timeout=TIMEOUT_SECONDS) as response:
            status = response.status
            headers = response.headers
            body = response.read(MAX_RESPONSE_BYTES + 1) if method == "GET" else b""
    except urllib.error.HTTPError as error:
        status = error.code
        headers = error.headers
        body = error.read(MAX_RESPONSE_BYTES + 1) if method == "GET" else b""
    if len(body) > MAX_RESPONSE_BYTES:
        raise RuntimeError(f"Response exceeds {MAX_RESPONSE_BYTES} bytes: {url}")
    return {
        "status": status,
        "contentType": (headers.get("Content-Type") or "").split(";", 1)[0].strip().lower(),
        "location": headers.get("Location"),
        "bytes": body,
    }


def expect_response(url: str, method: str, accepted_types: tuple[str, ...], expected_sha: str | None = None) -> dict:
    response = request(url, method)
    if response["status"] != 200:
        raise RuntimeError(f"{method} {url} returned HTTP {response['status']}")
    if response["location"]:
        raise RuntimeError(f"Unexpected redirect from {url} to {response['location']}")
    content_type = response["contentType"]
    if accepted_types and not any(content_type.startswith(kind) if kind.endswith("/") else (content_type == kind or content_type.startswith(kind + "+")) for kind in accepted_types):
        raise RuntimeError(f"Unexpected content type {content_type!r} from {url}")
    digest = sha256(response["bytes"]) if method == "GET" else None
    if expected_sha and digest != expected_sha:
        raise RuntimeError(f"SHA256 mismatch for {url}: expected {expected_sha}, got {digest}")
    return {"status": 200, "contentType": content_type, "sha256": digest, "bytes": len(response["bytes"])}


def verify_head_path(path: str, origin: str, backend: str, expected_type: tuple[str, ...]) -> dict:
    rows = {}
    for label, base in (("origin", origin), ("backend", backend)):
        rows[label] = expect_response(base + path, "HEAD", expected_type)
    return {"path": path, **rows}


def verify_get_path(path: str, origin: str, backend: str, local: Path, expected_type: tuple[str, ...], expected_sha: str | None = None) -> dict:
    local_digest = local_sha(local)
    if expected_sha and local_digest != expected_sha:
        raise RuntimeError(f"Local SHA256 differs from supplied provenance for {path}")
    origin_row = expect_response(origin + path, "GET", expected_type, local_digest)
    backend_row = expect_response(backend + path, "GET", expected_type, local_digest)
    return {"path": path, "localSha256": local_digest, "origin": origin_row, "backend": backend_row}


def parallel_map(items, function):
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = [(item, pool.submit(function, item)) for item in items]
        rows = []
        for item, future in futures:
            try:
                rows.append(future.result())
            except Exception as error:
                rows.append({"item": str(item), "error": str(error)})
        return rows


def require_rows(rows: list[dict], label: str, partial: dict) -> None:
    failures = [row for row in rows if row.get("error")]
    if failures:
        partial[label] = rows
        raise StageFailure(f"{len(failures)} {label} checks failed", partial)


def verify_old_alias(alias: str, origin: str) -> list[dict]:
    alias = clean_origin(alias)
    expected = NETLIFY_ORIGIN + "/"
    rows = []
    for path in ("/", "/index.html"):
        result = request(alias + path, "HEAD")
        if result["status"] != 307 or result["location"] != expected:
            rows.append({"path": path, "status": result["status"], "location": result["location"], "error": "expected fixed canonical Netlify redirect"})
            raise StageFailure(f"Old alias {path} must return 307 to {expected}", {"oldAlias": rows})
        rows.append({"path": path, "status": 307, "location": result["location"]})
    return rows


def extract_core_assets(html: bytes) -> list[tuple[str, str]]:
    text = html.decode("utf-8", errors="strict")
    found: dict[str, str] = {}
    for tag in re.findall(r"<[^>]+>", text, flags=re.IGNORECASE):
        rel = re.search(r"\brel=[\"']([^\"']+)[\"']", tag, flags=re.IGNORECASE)
        href = re.search(r"\bhref=[\"']([^\"']+)[\"']", tag, flags=re.IGNORECASE)
        src = re.search(r"\bsrc=[\"']([^\"']+)[\"']", tag, flags=re.IGNORECASE)
        if rel and "modulepreload" in rel.group(1).split() and href:
            found[href.group(1)] = "js"
        elif rel and "stylesheet" in rel.group(1).split() and href:
            found[href.group(1)] = "css"
        elif src:
            found[src.group(1)] = "js"
    result = []
    for path, kind in found.items():
        parsed = urllib.parse.urlsplit(path)
        if parsed.scheme or parsed.netloc or not parsed.path.startswith("/assets/"):
            continue
        if not (parsed.path.endswith(".js") or parsed.path.endswith(".css")):
            continue
        if kind == "js" and not parsed.path.endswith(".js"):
            continue
        if kind == "css" and not parsed.path.endswith(".css"):
            continue
        result.append((parsed.path, kind))
    if not result or not any(kind == "js" for _, kind in result) or not any(kind == "css" for _, kind in result):
        raise RuntimeError("Local entry did not expose both a JS entry/modulepreload and CSS stylesheet")
    return sorted(result)


def core_stage(args, origin: str, backend: str) -> dict:
    dist = Path(args.dist).resolve()
    entry = dist / "index.html"
    worker = dist / "sw.js"
    if not entry.is_file() or not worker.is_file():
        raise RuntimeError(f"Expected local build files {entry} and {worker}")
    if not re.fullmatch(r"[0-9a-f]{40}", args.runtime_sha):
        raise ValueError("--runtime-sha must be a 40-character lowercase Git SHA")
    actual_sha = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, check=True, text=True, capture_output=True).stdout.strip()
    if actual_sha != args.runtime_sha:
        raise RuntimeError(f"Checkout HEAD {actual_sha} does not match requested runtime SHA {args.runtime_sha}")

    local_html = entry.read_bytes()
    html_digest = sha256(local_html)
    content = local_html.decode("utf-8", errors="strict")
    if ".js" not in content or ".css" not in content:
        raise RuntimeError("Local entry is missing JS/CSS references")
    html_rows = {}
    for label, base in (("origin", origin), ("backend", backend)):
        try:
            html_rows[label] = expect_response(base + "/", "GET", ("text/html",), html_digest)
        except Exception as error:
            html_rows[label] = {"error": str(error)}
            raise StageFailure(f"{label} entry failed HTML identity validation", {"htmlSha256": html_digest, "html": html_rows})
    assets = extract_core_assets(local_html)

    def verify_asset(asset):
        path, kind = asset
        local = dist / path.lstrip("/")
        if not local.is_file():
            raise RuntimeError(f"Referenced local asset does not exist: {local}")
        mime = ("text/javascript", "application/javascript") if kind == "js" else ("text/css",)
        local_digest = local_sha(local)
        rows = {label: expect_response(base + path, "GET", mime, local_digest) for label, base in (("origin", origin), ("backend", backend))}
        return {"path": path, "kind": kind, "localSha256": local_digest, **rows}

    asset_rows = parallel_map(assets, verify_asset)
    require_rows(asset_rows, "assets", {"htmlSha256": html_digest, "html": html_rows, "assets": asset_rows})
    local_worker = worker.read_bytes()
    marker = b"amari-discovery-v44"
    if marker not in local_worker:
        raise RuntimeError("Local service worker does not contain expected v44 cache marker")
    worker_digest = sha256(local_worker)
    worker_rows = {}
    for label, base in (("origin", origin), ("backend", backend)):
        try:
            worker_rows[label] = expect_response(base + "/sw.js", "GET", ("text/javascript", "application/javascript"), worker_digest)
        except Exception as error:
            worker_rows[label] = {"error": str(error)}
    partial = {"htmlSha256": html_digest, "html": html_rows, "assets": asset_rows,
               "worker": {"version": 44, "sha256": worker_digest, **worker_rows}}
    if any(row.get("error") for row in worker_rows.values()):
        raise StageFailure("Service worker check failed", partial)
    try:
        alias_rows = verify_old_alias(args.old_alias, origin)
    except StageFailure as error:
        error.partial = {"htmlSha256": html_digest, "html": html_rows, "assets": asset_rows,
                         "worker": {"version": 44, "sha256": worker_digest, **worker_rows}, **error.partial}
        raise
    return {
        "stage": "core", "runtimeSha": actual_sha, "origin": origin, "backend": backend,
        "html": {"sha256": html_digest, "origin": "200 text/html exact bytes", "backend": "200 text/html exact bytes"},
        "assets": asset_rows, "worker": {"version": 44, "sha256": worker_digest, "origin": worker_rows["origin"], "backend": worker_rows["backend"]},
        "oldAlias": alias_rows,
    }


def inventory_rows(report_path: Path) -> list[dict]:
    data = json.loads(report_path.read_text(encoding="utf-8"))
    return data.get("rows", [])


def art_stage(args, origin: str, backend: str) -> dict:
    provenance = json.loads(SHADOW_PROVENANCE.read_text(encoding="utf-8"))
    shadows = []
    for item in provenance:
        path = "/" + item["runtime"].removeprefix("public/")
        shadows.append((path, ROOT / item["runtime"], item["runtimeSha256"]))
    if len(shadows) != 6:
        raise RuntimeError(f"Expected six Shadow Match provenance assets, got {len(shadows)}")
    shadow_rows = parallel_map(shadows, lambda row: verify_get_path(row[0], origin, backend, row[1], ("image/",), row[2]))
    require_rows(shadow_rows, "shadowAssets", {"shadowAssets": shadow_rows})

    catalogue = [row["path"] for row in inventory_rows(CATALOGUE_REPORT)
                 if row.get("path", "").startswith("/art/catalog-v3/")]
    catalogue = sorted(set(catalogue))
    if len(catalogue) != 39:
        raise RuntimeError(f"Existing Pair 7 inventory contains {len(catalogue)} unique catalogue paths, expected 39")
    catalogue_rows = parallel_map(catalogue, lambda path: verify_head_path(path, origin, backend, ("image/",)))
    require_rows(catalogue_rows, "catalogueHead", {"shadowAssets": shadow_rows, "catalogueHead": catalogue_rows})
    return {"stage": "art", "shadowAssets": shadow_rows, "catalogueHead": catalogue_rows}


def storybook_media_paths() -> list[str]:
    paths = []
    for manifest_path in sorted(BOOK_ROOT.glob("*/book.json")):
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        slug = manifest.get("id")
        if not isinstance(slug, str) or slug != manifest_path.parent.name:
            raise RuntimeError(f"Invalid Storybook manifest identity: {manifest_path}")
        base = f"/storybooks/{slug}/"
        cover = manifest.get("cover") or {}
        for asset in (cover.get("image"), cover.get("audio")):
            if isinstance(asset, str) and asset:
                paths.append(base + asset.lstrip("/"))
        pages = manifest.get("pages")
        if not isinstance(pages, list):
            raise RuntimeError(f"Storybook manifest has no page list: {manifest_path}")
        for page in pages:
            if not isinstance(page, dict):
                raise RuntimeError(f"Malformed page in {manifest_path}")
            for field in ("image", "audio"):
                asset = page.get(field)
                if isinstance(asset, str) and asset:
                    paths.append(base + asset.lstrip("/"))
    if len(paths) != 154 or len(set(paths)) != 154:
        raise RuntimeError(f"Expected 154 unique included Storybook image/audio paths from book.json manifests; got {len(paths)}")
    for path in paths:
        if ".." in path.split("/"):
            raise RuntimeError(f"Unsafe manifest media path: {path}")
        if not (ROOT / "public" / path.lstrip("/")).is_file():
            raise RuntimeError(f"Manifest media file is missing locally: {path}")
    return paths


def media_stage(args, origin: str, backend: str) -> dict:
    story_paths = storybook_media_paths()
    inventory = json.loads((Path(__file__).parent / "current-packaged-prompt-inventory.json").read_text(encoding="utf-8"))
    spelling_paths = sorted({item["path"] for item in inventory["spelling"]})
    auxiliary_paths = sorted({item["path"] for item in inventory["storybookAuxiliary"]})
    if len(spelling_paths) != 71 or len(auxiliary_paths) != 84:
        raise RuntimeError("Expected current71 spelling and84 Storybook auxiliary prompts")
    for path in [*spelling_paths, *auxiliary_paths]:
        if not path.startswith("/audio/") or ".." in path.split("/") or not (ROOT / "public" / path.lstrip("/")).is_file():
            raise RuntimeError(f"Unsafe or missing packaged clip: {path}")
    all_paths = [(path, ("image/",) if path.endswith((".webp", ".png", ".jpg", ".jpeg")) else ("audio/",))
                 for path in story_paths]
    all_paths.extend((path, ("audio/",)) for path in sorted(set(spelling_paths + auxiliary_paths)))
    rows = parallel_map(all_paths, lambda item: verify_head_path(item[0], origin, backend, item[1]))
    require_rows(rows, "head", {"storybookCount": len(story_paths), "spellingClipCount": len(spelling_paths), "storybookAuxiliaryClipCount": len(auxiliary_paths), "head": rows})
    return {"stage": "media", "storybookCount": len(story_paths), "spellingClipCount": len(spelling_paths), "storybookAuxiliaryClipCount": len(auxiliary_paths), "head": rows}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--origin", required=True, help="Canonical origin, for example https://dinospace.netlify.app")
    parser.add_argument("--backend", required=True, help="Verified immutable backend origin; never pass a public redirect alias")
    parser.add_argument("--runtime-sha", required=True, help="Expected current 40-character Git SHA")
    parser.add_argument("--output", required=True, help="Unique small JSON output path")
    parser.add_argument("--stage", required=True, choices=("core", "art", "media"))
    parser.add_argument("--old-alias", default=DEFAULT_OLD_ALIAS, help="Legacy public Vercel alias to check without following redirects")
    parser.add_argument("--dist", default=str(DEFAULT_DIST), help="Existing local dist directory")
    args = parser.parse_args()

    origin = clean_origin(args.origin)
    backend = clean_origin(args.backend)
    if origin == backend:
        parser.error("origin and immutable backend must be distinct origins")
    if not re.fullmatch(r"[0-9a-f]{40}", args.runtime_sha):
        parser.error("--runtime-sha must be a 40-character lowercase Git SHA")
    actual_sha = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, check=True, text=True, capture_output=True).stdout.strip()
    if actual_sha != args.runtime_sha:
        parser.error(f"Checkout HEAD {actual_sha} does not match requested runtime SHA {args.runtime_sha}")
    started = time.time()
    try:
        if args.stage == "core":
            result = core_stage(args, origin, backend)
        elif args.stage == "art":
            result = art_stage(args, origin, backend)
        else:
            result = media_stage(args, origin, backend)
        result["runtimeSha"] = actual_sha
        result.update({"atUnix": int(time.time()), "passed": True, "requestsBound": "at most six concurrent; 20s timeout; GET body cap 8 MiB"})
        result["elapsedSeconds"] = round(time.time() - started, 2)
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(result, separators=(",", ":")) + "\n", encoding="utf-8")
        print(json.dumps({"passed": True, "stage": args.stage, "output": str(output), "checks": len(result.get("assets", result.get("head", result.get("catalogueHead", []))))}))
        return 0
    except Exception as error:
        failure = {"stage": args.stage, "runtimeSha": actual_sha, "origin": origin, "backend": backend,
                   "atUnix": int(time.time()), "passed": False, "error": str(error),
                   "partial": error.partial if isinstance(error, StageFailure) else {}}
        try:
            output = Path(args.output)
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(json.dumps(failure, separators=(",", ":")) + "\n", encoding="utf-8")
        except Exception:
            pass
        print(f"release verifier failed ({args.stage}): {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
