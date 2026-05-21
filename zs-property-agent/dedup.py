"""Cross-day URL deduplication via JSON cache (7-day rolling window)."""
import json
import os
from datetime import datetime, timedelta

CACHE_FILE = ".seen_urls.json"
CACHE_TTL_DAYS = 7


def load_seen_urls() -> set:
    """Load all URLs seen in the last 7 days from cache file."""
    if not os.path.exists(CACHE_FILE):
        return set()
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError):
        return set()

    cutoff = datetime.now() - timedelta(days=CACHE_TTL_DAYS)
    urls = set()
    for day_str, url_list in data.items():
        try:
            day = datetime.strptime(day_str, "%Y-%m-%d")
        except ValueError:
            continue
        if day >= cutoff:
            urls.update(url_list)
    return urls


def dedup_results(results: dict) -> dict:
    """Remove items whose link has been seen in the last 7 days.

    Args:
        results: {source_name: [items_with_link_key]}

    Returns:
        Same structure with duplicate items removed.
    """
    seen = load_seen_urls()
    deduped = {}
    removed = 0
    for source, items in results.items():
        deduped[source] = []
        for item in items:
            link = item.get("link", "")
            if link and link in seen:
                removed += 1
                continue
            deduped[source].append(item)
    if removed:
        print(f"[dedup] removed {removed} duplicate items across all sources")
    return deduped


def save_seen_urls(results: dict):
    """Persist today's URLs to the cache file, dropping entries older than 7 days.

    Args:
        results: {source_name: [items_with_link_key]} (after dedup, ready to push)
    """
    today = datetime.now().strftime("%Y-%m-%d")
    cutoff = (datetime.now() - timedelta(days=CACHE_TTL_DAYS)).strftime("%Y-%m-%d")

    data = {}
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, OSError):
            pass

    today_urls = []
    for items in results.values():
        for item in items:
            link = item.get("link", "")
            if link:
                today_urls.append(link)
    data[today] = today_urls

    # Trim old
    data = {k: v for k, v in data.items() if k >= cutoff}

    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
