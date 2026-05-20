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
)
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


def main():
    print(f"=== 中山房产日报 Agent | {datetime.now().isoformat()} ===")

    fetchers = [
        ("anjuke", fetch_anjuke),
        ("zs_gov", fetch_zs_gov),
        ("zs_news", fetch_zs_news),
        ("douyin", fetch_douyin),
        ("youtube", fetch_youtube),
        ("facebook", fetch_facebook),
    ]

    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
        futures = {executor.submit(run_fetcher, name, fn): name for name, fn in fetchers}
        for future in concurrent.futures.as_completed(futures, timeout=60):
            name, items = future.result()
            results[name] = items

    report = build_report(
        anjuke_items=results.get("anjuke", []),
        zs_gov_items=results.get("zs_gov", []),
        zs_news_items=results.get("zs_news", []),
        douyin_items=results.get("douyin", []),
        youtube_items=results.get("youtube", []),
        facebook_items=results.get("facebook", []),
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
