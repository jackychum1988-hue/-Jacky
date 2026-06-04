import concurrent.futures
import traceback
from datetime import datetime
from fetchers import (
    fetch_anjuke,
    fetch_zs_gov,
    fetch_zs_news,
    fetch_zs_fang,
    fetch_zs_leju,
    fetch_douyin,
    fetch_xiaohongshu,
    fetch_bilibili,
    fetch_wechat,
    fetch_youtube,
    fetch_facebook,
    fetch_hk_news,
    fetch_finance_news,
)
from fetchers.content_extractor import extract_article
from analyzer import analyze
from reporter import build_report
from pusher import push_to_wechat
from dedup import dedup_results, save_seen_urls

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL, PUSHPLUS_TOKEN


def run_fetcher(name: str, fn) -> tuple[str, list[dict]]:
    try:
        result = fn()
        print(f"[{name}] fetched {len(result)} items")
        return name, result
    except Exception as e:
        print(f"[{name}] failed: {e}")
        traceback.print_exc()
        return name, []


def enrich_news_items(results: dict) -> dict:
    """Extract full article text for zs_news, zs_gov, zs_fang, and zs_leju items."""
    for source in ("zs_news", "zs_gov", "zs_fang", "zs_leju"):
        items = results.get(source, [])
        for item in items:
            link = item.get("link", "")
            if link:
                text = extract_article(link)
                if text:
                    item["full_text"] = text
                    print(f"[enrich] {source}: extracted {len(text)} chars from {link[:60]}")
    return results


def main():
    print(f"=== 中山房产日报 Agent | {datetime.now().isoformat()} ===")

    fetchers = [
        ("anjuke", fetch_anjuke),
        ("zs_gov", fetch_zs_gov),
        ("zs_news", fetch_zs_news),
        ("zs_fang", fetch_zs_fang),
        ("zs_leju", fetch_zs_leju),
        ("douyin", fetch_douyin),
        ("xiaohongshu", fetch_xiaohongshu),
        ("bilibili", fetch_bilibili),
        ("wechat", fetch_wechat),
        ("youtube", fetch_youtube),
        ("facebook", fetch_facebook),
        ("hk_news", fetch_hk_news),
        ("finance", fetch_finance_news),
    ]

    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
        futures = {executor.submit(run_fetcher, name, fn): name for name, fn in fetchers}
        for future in concurrent.futures.as_completed(futures, timeout=60):
            name, items = future.result()
            results[name] = items

    # Dedup across days
    print("[main] deduplicating against 7-day URL cache...")
    results = dedup_results(results)

    # Extract full article text for news sources
    print("[main] enriching news items with full content...")
    results = enrich_news_items(results)

    # AI analysis
    print("[main] running AI analysis...")
    ai_analysis = analyze(results)
    if ai_analysis:
        print(f"[main] AI analysis: {len(ai_analysis)} chars")
    else:
        print("[main] AI analysis skipped (no API key or failed)")

    # Generate spoken scripts from topic suggestions
    print("[main] generating spoken scripts...")
    try:
        from shared.script_writer import generate_and_push
        generate_and_push(
            analysis_text=ai_analysis or "",
            deepseek_api_key=DEEPSEEK_API_KEY,
            pushplus_token=PUSHPLUS_TOKEN,
            deepseek_base_url=DEEPSEEK_BASE_URL,
            deepseek_model=DEEPSEEK_MODEL,
        )
    except Exception as e:
        print(f"[main] script generation failed (non-fatal): {e}")

    report = build_report(
        anjuke_items=results.get("anjuke", []),
        zs_gov_items=results.get("zs_gov", []),
        zs_news_items=results.get("zs_news", []),
        zs_fang_items=results.get("zs_fang", []),
        zs_leju_items=results.get("zs_leju", []),
        douyin_items=results.get("douyin", []),
        xiaohongshu_items=results.get("xiaohongshu", []),
        bilibili_items=results.get("bilibili", []),
        wechat_items=results.get("wechat", []),
        youtube_items=results.get("youtube", []),
        facebook_items=results.get("facebook", []),
        hk_news_items=results.get("hk_news", []),
        finance_items=results.get("finance", []),
        ai_analysis=ai_analysis,
    )

    title = f"🏠 中山房产日报 {datetime.now().strftime('%m/%d')}"
    push_result = push_to_wechat(title, report)
    print(f"Push result: {push_result}")

    # Write sentinel for dedup across scheduled runs
    if push_result.get("code") == 200:
        with open(".sentinel", "w") as f:
            f.write(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        save_seen_urls(results)

    print(report)
    print("=== Done ===")


if __name__ == "__main__":
    main()
