# language: Python, file: scripts/catalog_builder.py, target: PS5 store catalog
# *reads sources.json, hits GitHub API, merges metadata.json, writes catalog*
# *supports two source types: github releases (auto) and manual (games)*

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
    local = ICONS_DIR / (titleid + ".png")
    if local.exists():
        return RAW_BASE + "/icons/" + titleid + ".png"
    for a in rel.get("assets", []):
        if a["name"].lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
            return a["browser_download_url"]
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
        "featured": src.get("featured", False),
    }


def build_manual(src, meta_db):
    titleid = src["titleid"]
    meta = meta_db.get(titleid, {})
    downloads = src.get("downloads", [])
    return {
        "titleid": titleid,
        "name": meta.get("display_name") or src.get("name", titleid),
        "kind": src.get("kind", "game"),
        "category": meta.get("category") or src.get("category", "Jogo"),
        "description": meta.get("description") or src.get("description", ""),
        "hero_tag": meta.get("hero_tag"),
        "meta_line": meta.get("meta_line"),
        "license": src.get("license"),
        "author": src.get("author", "-"),
        "version": src.get("version", "01.000"),
        "source_repo": src.get("source_repo"),
        "artifact_url": downloads[0].get("url") if downloads else None,
        "downloads": downloads,
        "sha256": None,
        "icon_url": None,
        "featured": src.get("featured", False),
        "region": src.get("region"),
        "size_gb": src.get("size_gb"),
    }


def main():
    srcs = json.loads(SOURCES_PATH.read_text(encoding="utf-8"))["sources"]
    meta_db = load_metadata()
    APPS_DIR.mkdir(exist_ok=True)
    ICONS_DIR.mkdir(exist_ok=True)

    records = []
    for src in srcs:
        try:
            if src.get("manual"):
                rec = build_manual(src, meta_db)
            else:
                rec = build_record(src, meta_db)
            if not rec:
                continue
            records.append(rec)
            out = APPS_DIR / (rec["titleid"] + ".json")
            out.write_text(json.dumps(rec, indent=2, ensure_ascii=False), encoding="utf-8")
            print("[ok] " + rec["titleid"] + "  " + rec["name"] + "  v" + rec["version"])
        except Exception as e:
            print("[err] " + src.get("repo", src.get("titleid", "?")) + ": " + str(e), file=sys.stderr)

    # featured primeiro
    records.sort(key=lambda r: (not r.get("featured", False), r.get("name", "")))

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