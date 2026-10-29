#!/usr/bin/env python3
"""Summarize existing integration JSON by runtime entry, lane and viewport.

This reports only each file's recorded pass/fail state. It does not calculate
scores, combine evidence into acceptance, or modify source reports.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
DEFAULT_DIRS = [
    ROOT / "docs/qa-evidence/final-integration-20261029",
    ROOT / "docs/qa-evidence/catalogue-entry-smoke-20261029",
]


def short_failure(value: Any) -> str | None:
    if isinstance(value, str):
        return value[:400]
    if isinstance(value, dict):
        return str(value.get("message") or value.get("error") or value)[:400]
    if isinstance(value, list):
        messages = [short_failure(item) for item in value]
        return "; ".join(message for message in messages if message)[:400] or None
    return None


def lane_rows(data: dict[str, Any]) -> list[dict[str, str]]:
    rows = data.get("lanes")
    if not isinstance(rows, list):
        rows = data.get("rows")
    result: list[dict[str, str]] = []
    if isinstance(rows, list):
        for row in rows:
            if not isinstance(row, dict):
                continue
            lane_id = row.get("id") or row.get("gameId") or row.get("lane")
            title = row.get("title") or row.get("name")
            if lane_id or title:
                result.append({"id": str(lane_id or title), "title": str(title or lane_id)})
    if not result:
        for lane_id in data.get("completedIds", []) if isinstance(data.get("completedIds"), list) else []:
            result.append({"id": str(lane_id), "title": str(lane_id)})
    return result


def summarize(path: Path) -> dict[str, Any] | None:
    try:
        data = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError):
        return None
    if not isinstance(data, dict) or not isinstance(data.get("passed"), bool):
        return None

    runtime = data.get("runtime") if isinstance(data.get("runtime"), dict) else {}
    viewport_value = data.get("viewport")
    if isinstance(viewport_value, dict):
        viewport = f"{viewport_value.get('width', '?')}x{viewport_value.get('height', '?')}"
    elif isinstance(viewport_value, str):
        viewport = viewport_value
    else:
        viewport = "unknown"

    actual_entry = (
        data.get("actualEntry") or data.get("entryIdentity") or data.get("entry")
        or runtime.get("entry") or "unknown"
    )
    failure = short_failure(data.get("failure") or data.get("failures"))
    return {
        "report": str(path.relative_to(ROOT)),
        "outcome": "passed" if data["passed"] else "failed",
        "stage": data.get("stage") or path.name.split("-", 1)[0],
        "profile": data.get("profile") or data.get("player") or "unknown",
        "viewport": viewport,
        "runtimeSource": data.get("runtimeSource") or data.get("sourceHead") or "unrecorded",
        "expectedEntry": data.get("expectedEntry") or "unrecorded",
        "actualEntry": actual_entry,
        "entryMatches": data.get("entryMatches"),
        "lanes": lane_rows(data),
        "failure": failure,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", type=Path, help="report files or directories; defaults to final-integration and catalogue-entry reports")
    args = parser.parse_args()
    inputs = args.paths or DEFAULT_DIRS
    files: set[Path] = set()
    for item in inputs:
        resolved = item if item.is_absolute() else ROOT / item
        if resolved.is_dir():
            files.update(path for path in resolved.rglob("*.json") if path.is_file())
        elif resolved.is_file() and resolved.suffix.lower() == ".json":
            files.add(resolved)

    reports = [row for path in sorted(files) if (row := summarize(path)) is not None]
    by_lane: dict[str, list[dict[str, Any]]] = {}
    for report in reports:
        for lane in report["lanes"]:
            by_lane.setdefault(lane["id"], []).append({
                "title": lane["title"],
                "report": report["report"],
                "outcome": report["outcome"],
                "stage": report["stage"],
                "entry": report["actualEntry"],
                "viewport": report["viewport"],
                "note": "report-level outcome; not a separate lane score",
            })
    result = {
        "scope": "index of recorded report outcomes only; no game scores or combined acceptance",
        "reportCount": len(reports),
        "passedReports": sum(report["outcome"] == "passed" for report in reports),
        "failedReports": sum(report["outcome"] == "failed" for report in reports),
        "reports": reports,
        "byLane": by_lane,
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
