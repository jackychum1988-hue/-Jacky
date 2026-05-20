import concurrent.futures
import traceback
from datetime import datetime
from fetchers import (
    fetch_anjuke,
    fetch_zs_gov,
    fetch_zs_news,
    fetch_douyin,
    fetch_youtube,
    fetch_facebook,
    fetch_hk_news,
    fetch_finance_news,
)
from fetchers.content_extractor import extract_article
from analyzer import analyze
from reporter import build_report
from pusher import push_to_wechat


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
    """Extract full article text for zs_news and zs_gov items."""
    for source in ("zs_news", "zs_gov"):
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
        ("douyin", fetch_douyin),
        ("youtube", fetch_youtube),
        ("facebook", fetch_facebook),
        ("hk_news", fetch_hk_news),
        ("finance", fetch_finance_news),
    ]

    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(run_fetcher, name, fn): name for name, fn in fetchers}
        for future in concurrent.futures.as_completed(futures, timeout=60):
            name, items = future.result()
            results[name] = items

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

    report = build_report(
        anjuke_items=results.get("anjuke", []),
        zs_gov_items=results.get("zs_gov", []),
        zs_news_items=results.get("zs_news", []),
        douyin_items=results.get("douyin", []),
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

    print(report)
    print("=== Done ===")


if __name__ == "__main__":
    main()
