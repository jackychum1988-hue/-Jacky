"""KOL Competitor Content Analysis Agent — daily briefing + weekly deep-dive report."""
import sys
import json
import os
import argparse
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

from config import (
    HISTORY_FILE, OUTPUT_DIR, Platform,
)
from fetchers import fetch_youtube, fetch_xiaohongshu, fetch_facebook, fetch_shipinhao
from dedup import dedup_items, save_seen
from analyzer import analyze_daily, analyze_weekly
from reporter import render_daily, render_weekly
from pusher import push_to_wechat


def fetch_all() -> dict:
    """Fetch content from all 4 platforms in parallel."""
    results = {}
    tasks = {
        Platform.YOUTUBE.value: fetch_youtube,
        Platform.XIAOHONGSHU.value: fetch_xiaohongshu,
        Platform.FACEBOOK.value: fetch_facebook,
        Platform.SHIPINHAO.value: fetch_shipinhao,
    }

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(fn): name for name, fn in tasks.items()}
        for future in as_completed(futures):
            name = futures[future]
            try:
                results[name] = future.result()
                print(f"[{name}] fetched {len(results[name])} items")
            except Exception as e:
                print(f"[{name}] failed: {e}")
                results[name] = []

    return results


def flatten_items(results: dict) -> list:
    items = []
    for platform, platform_items in results.items():
        for item in platform_items:
            if "platform" not in item:
                item["platform"] = platform
            items.append(item)
    return items


def platform_stats(results: dict) -> dict:
    return {k: len(v) for k, v in results.items()}


def load_history() -> dict:
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"weeks": {}}


def save_history(history: dict):
    os.makedirs(os.path.dirname(HISTORY_FILE) or ".", exist_ok=True)
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)


def update_history(items: list):
    """Update history.json with this week's aggregated data."""
    history = load_history()
    today = datetime.now()
    week_label = f"{today.year}-W{today.isocalendar()[1]:02d}"

    if "weeks" not in history:
        history["weeks"] = {}

    week_data = history["weeks"].get(week_label, {
        "top_keywords": {},
        "top_topics": [],
        "total_posts": 0,
        "top_kols": [],
    })

    week_data["total_posts"] += len(items)
    author_counts = {}
    for item in items:
        author = item.get("author", "")
        if author:
            author_counts[author] = author_counts.get(author, 0) + 1
    week_data["top_kols"] = sorted(author_counts, key=author_counts.get, reverse=True)[:5]

    history["weeks"][week_label] = week_data
    save_history(history)


def get_week_items() -> list:
    """Get all items from the last 7 days for weekly report.
    Reads from cache files within the week range.
    """
    today = datetime.now()
    start_of_week = today - timedelta(days=7)
    week_label = f"{today.year}-W{today.isocalendar()[1]:02d}"

    items = []
    # Collect items from daily caches
    for i in range(7):
        day = start_of_week + timedelta(days=i)
        cache_file = f"{OUTPUT_DIR}/daily_{day.strftime('%Y-%m-%d')}.json"
        if os.path.exists(cache_file):
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    day_items = json.load(f)
                    items.extend(day_items)
            except (json.JSONDecodeError, OSError):
                continue

    return items, week_label


def save_daily_cache(items: list):
    """Save today's items for weekly aggregation."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    today = datetime.now().strftime("%Y-%m-%d")
    cache_file = f"{OUTPUT_DIR}/daily_{today}.json"
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)


def run_daily():
    print("=" * 50)
    print(f"  KOL竞品日报 — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 50)

    results = fetch_all()
    items = flatten_items(results)
    items = dedup_items(items)

    if not items:
        push_to_wechat("📊 港人KOL竞品快讯", "今日暂无竞品更新。")
        return

    save_seen(items)
    save_daily_cache(items)
    update_history(items)

    print(f"[main] analyzing {len(items)} items...")
    analysis = analyze_daily(items)

    stats = platform_stats(results)
    report = render_daily(analysis, len(items), stats)

    push_to_wechat("📊 港人KOL竞品快讯", report)
    print("[main] daily report pushed.")


def run_weekly():
    print("=" * 50)
    print(f"  KOL竞品周报 — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 50)

    # Also fetch fresh data for the current day
    results = fetch_all()
    items = flatten_items(results)

    # Merge with cached daily items for the week
    week_items, week_label = get_week_items()
    seen_urls = {item.get("url") for item in week_items}
    for item in items:
        if item.get("url") not in seen_urls:
            week_items.append(item)
            seen_urls.add(item.get("url"))

    if not week_items:
        push_to_wechat("📈 港人KOL竞品周报", "本周暂无竞品数据。")
        return

    print(f"[main] analyzing {len(week_items)} weekly items...")
    analysis = analyze_weekly(week_items, week_label)

    stats = platform_stats(results)
    report = render_weekly(analysis, len(week_items), week_label, stats)

    # Save weekly report to output/
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    week_file = f"{OUTPUT_DIR}/weekly_{week_label}.md"
    with open(week_file, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"[main] weekly report saved to {week_file}")

    push_to_wechat(f"📈 港人KOL竞品周报 {week_label}", report)
    print("[main] weekly report pushed.")


def main():
    parser = argparse.ArgumentParser(description="KOL Competitor Content Analysis Agent")
    parser.add_argument("--mode", choices=["daily", "weekly"], default="daily",
                        help="Run mode: daily briefing or weekly deep-dive")
    args = parser.parse_args()

    if args.mode == "weekly":
        run_weekly()
    else:
        run_daily()


if __name__ == "__main__":
    main()
