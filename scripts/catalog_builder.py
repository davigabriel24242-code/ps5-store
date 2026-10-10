# language: Python, file: scripts/catalog_builder.py, target: PS5 store catalog
# *reads sources.json, hits GitHub API, writes apps/<TITLEID>.json + index.json + store_catalog.json*
# *sha256 comes from GitHub asset digest field - nothing is downloaded*

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
SOURCES_PATH = ROOT / "sources.json"
APPS_DIR = ROOT / "apps"
INDEX_PATH = ROOT / "index.json"
STORE_PATH = ROOT / "store_catalog.json"

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
HEADERS = {"Accept": "application/vnd.github+json", "User-Agent": "ps5-store-builder"}
if GITHUB_TOKEN:
    HEADERS["Authorization"] = f"Bearer {GITHUB_TOKEN}"

API = "https://api.github.com"
EXT_MAP = {".zip": "zip", ".ffpkg": "ffpkg", ".ffpfsc": "ffpfsc", ".ffpfs": "ffpfs"}


def latest_release(repo):
    r = requests.get(f"{API}/repos/{repo}/releases/latest", headers=HEADERS, timeout=20)
    if r.status_code == 404:
        return None
    r.raise_for_status()
    return r.json()


def digest_sha256(asset):
    d = asset.get("digest")
    if d and d.startswith("sha256:"):
        return d.split(":", 1)[1]
    return None


def pick_artifact(assets):
    order = {"ffpkg": 0, "zip": 1, "ffpfsc": 2, "ffpfs": 3}
    candidates = []
    for a in assets:
        low = a["name"].lower()
        for ext, fmt in EXT_MAP.items():
            if low.endswith(ext):
                candidates.append((order.get(fmt, 9), fmt, a))
                break
    if not candidates:
        return None
    candidates.sort(key=lambda x: x[0])
    return candidates[0]


def build_record(src):
    rel = latest_release(src["repo"])
    if not rel:
        print(f"[skip] {src["repo"]}: no release", file=sys.stderr)
        return None
    art = pick_artifact(rel.get("assets", []))
    if not art:
        print(f"[skip] {src["repo"]}: no artifact", file=sys.stderr)
        return None
    _, fmt, asset = art
    sha = digest_sha256(asset)
    icon_url = None
    for a in rel.get("assets", []):
        if a["name"].lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
            icon_url = a["browser_download_url"]
            break
    if not icon_url:
        tag = rel["tag_name"]
        icon_url = f"https://raw.githubusercontent.com/{src["repo"]}/{tag}/sce_sys/icon0.png"
    return {
        "titleid": src["titleid"],
        "name": (rel["name"] or repo.split("/")[-1]).split(" v")[0].split(" V")[0].strip(),
        "kind": src.get("kind", "app"),
        "description": (rel.get("body") or "").split("\n")[0].strip().lstrip("#").strip()[:200],
        "license": src.get("license"),
        "author": src["repo"].split("/")[0],
        "version": rel["tag_name"].lstrip("v"),
        "source_repo": f"https://github.com/{src["repo"]}",
        "artifact_url": asset["browser_download_url"],
        "sha256": sha,
        "icon_url": icon_url,
    }


def main():
    srcs = json.loads(SOURCES_PATH.read_text(encoding="utf-8"))["sources"]
    APPS_DIR.mkdir(exist_ok=True)
    records = []
    for src in srcs:
        try:
            rec = build_record(src)
            if not rec:
                continue
            records.append(rec)
            (APPS_DIR / (rec["titleid"] + ".json")).write_text(
                json.dumps(rec, indent=2, ensure_ascii=False), encoding="utf-8"
            )
            print("[ok] " + rec["titleid"] + "  " + rec["name"] + "  v" + rec["version"])
        except Exception as e:
            print(f"[err] {src["repo"]}: {e}", file=sys.stderr)
    index = {
        "schema": "ps5-store-index/v1",
        "updated": datetime.now(timezone.utc).isoformat(),
        "count": len(records),
        "apps": [
            {"titleid": r["titleid"], "name": r["name"], "version": r["version"],
             "author": r["author"], "icon_url": r["icon_url"]}
            for r in records
        ],
    }
    INDEX_PATH.write_text(json.dumps(index, indent=2, ensure_ascii=False), encoding="utf-8")
    store = {
        "schema": "ps5-store-catalog/v1",
        "updated": index["updated"],
        "count": len(records),
        "apps": records,
    }
    STORE_PATH.write_text(json.dumps(store, indent=2, ensure_ascii=False), encoding="utf-8")
    print("[done] " + str(len(records)) + " apps")


if __name__ == "__main__":
    main()