# language: Python, file: scripts/catalog_builder.py, target: PS5 store catalog
# *reads sources.json, hits GitHub API, merges metadata.json overrides, writes catalog*

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
SOURCES_PATH = ROOT / "sources.json"
METADATA_PATH = ROOT / "metadata.json"
ICONS_DIR = ROOT / "icons"
APPS_DIR = ROOT / "apps"
INDEX_PATH = ROOT / "index.json"
STORE_PATH = ROOT / "store_catalog.json"

REPO_SLUG = "davigabriel24242-code/ps5-store"
RAW_BASE = "https://raw.githubusercontent.com/" + REPO_SLUG + "/main"

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
HEADERS = {"Accept": "application/vnd.github+json", "User-Agent": "ps5-store-builder"}
if GITHUB_TOKEN:
    HEADERS["Authorization"] = "Bearer " + GITHUB_TOKEN

API = "https://api.github.com"
EXT_MAP = {".zip": "zip", ".ffpkg": "ffpkg", ".ffpfsc": "ffpfsc", ".ffpfs": "ffpfs"}


def load_metadata():
    if METADATA_PATH.exists():
        return json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    return {}


def latest_release(repo):
    r = requests.get(API + "/repos/" + repo + "/releases/latest", headers=HEADERS, timeout=20)
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


def resolve_icon(titleid, rel, repo):
    # 1. icone local no repo (curadoria manual)
    local = ICONS_DIR / (titleid + ".png")
    if local.exists():
        return RAW_BASE + "/icons/" + titleid + ".png"
    # 2. asset png do release
    for a in rel.get("assets", []):
        if a["name"].lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
            return a["browser_download_url"]
    # 3. fallback: convencao do repo
    return "https://raw.githubusercontent.com/" + repo + "/" + rel["tag_name"] + "/sce_sys/icon0.png"


def build_record(src, meta_db):
    repo = src["repo"]
    titleid = src["titleid"]
    rel = latest_release(repo)
    if not rel:
        print("[skip] " + repo + ": no release", file=sys.stderr)
        return None
    art = pick_artifact(rel.get("assets", []))
    if not art:
        print("[skip] " + repo + ": no artifact", file=sys.stderr)
        return None
    _, fmt, asset = art
    sha = digest_sha256(asset)
    meta = meta_db.get(titleid, {})

    raw_name = (rel["name"] or repo.split("/")[-1]).split(" v")[0].split(" V")[0].strip()
    raw_desc = (rel.get("body") or "").split("\n")[0].strip().lstrip("#").strip()[:200]

    return {
        "titleid": titleid,
        "name": meta.get("display_name") or raw_name,
        "kind": src.get("kind", "app"),
        "category": meta.get("category", "Homebrew"),
        "description": meta.get("description") or raw_desc,
        "hero_tag": meta.get("hero_tag"),
        "meta_line": meta.get("meta_line"),
        "license": src.get("license"),
        "author": repo.split("/")[0],
        "version": rel["tag_name"].lstrip("v"),
        "source_repo": "https://github.com/" + repo,
        "artifact_url": asset["browser_download_url"],
        "sha256": sha,
        "icon_url": resolve_icon(titleid, rel, repo),
    }


def main():
    srcs = json.loads(SOURCES_PATH.read_text(encoding="utf-8"))["sources"]
    meta_db = load_metadata()
    APPS_DIR.mkdir(exist_ok=True)
    ICONS_DIR.mkdir(exist_ok=True)
    records = []
    for src in srcs:
        try:
            rec = build_record(src, meta_db)
            if not rec:
                continue
            records.append(rec)
            (APPS_DIR / (rec["titleid"] + ".json")).write_text(
                json.dumps(rec, indent=2, ensure_ascii=False), encoding="utf-8"
            )
            print("[ok] " + rec["titleid"] + "  " + rec["name"] + "  v" + rec["version"])
        except Exception as e:
            print("[err] " + src["repo"] + ": " + str(e), file=sys.stderr)
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