import json
import os
from datetime import datetime, timedelta
from config import SEEN_URLS_FILE, CACHE_TTL_DAYS


def _hash_url(url: str) -> str:
    import hashlib
    return hashlib.md5(url.encode()).hexdigest()


def load_seen_hashes() -> set:
    if not os.path.exists(SEEN_URLS_FILE):
        return set()
    try:
        with open(SEEN_URLS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError):
        return set()

    cutoff = (datetime.now() - timedelta(days=CACHE_TTL_DAYS)).strftime("%Y-%m-%d")
    hashes = set()
    for day_str, hash_list in data.items():
        if day_str >= cutoff:
            hashes.update(hash_list)
    return hashes


def dedup_items(items: list) -> list:
    seen = load_seen_hashes()
    deduped = []
    removed = 0
    for item in items:
        url = item.get("url", "") if isinstance(item, dict) else getattr(item, "url", "")
        if url and _hash_url(url) in seen:
            removed += 1
            continue
        deduped.append(item)
    if removed:
        print(f"[dedup] removed {removed} duplicate items")
    return deduped


def save_seen(items: list):
    today = datetime.now().strftime("%Y-%m-%d")
    cutoff = (datetime.now() - timedelta(days=CACHE_TTL_DAYS)).strftime("%Y-%m-%d")

    data = {}
    if os.path.exists(SEEN_URLS_FILE):
        try:
            with open(SEEN_URLS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, OSError):
            pass

    today_hashes = []
    for item in items:
        url = item.get("url", "") if isinstance(item, dict) else getattr(item, "url", "")
        if url:
            today_hashes.append(_hash_url(url))
    data[today] = today_hashes

    data = {k: v for k, v in data.items() if k >= cutoff}

    with open(SEEN_URLS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
