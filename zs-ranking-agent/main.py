"""zs-ranking-agent — Weekly Zhongshan real estate ranking video data pipeline."""
from datetime import datetime
from config import PROJECTS
from fetchers.zs_gov_transactions import fetch_transactions
from fetchers.beike_popularity import fetch_popularity
from aggregator import aggregate, aggregate_empty
from generate_timeline import build_timeline, save_timeline


def main():
    print(f"[zs-ranking-agent] Starting weekly ranking pipeline — {datetime.now().isoformat()}")

    print("[1/4] Fetching transaction data from ZS housing bureau...")
    transactions = fetch_transactions()
    print(f"  -> {len(transactions)} transaction records")

    print("[2/4] Fetching popularity data from Beike...")
    project_names = [p["name"] for p in PROJECTS]
    popularity = fetch_popularity(project_names)
    print(f"  -> {len(popularity)} popularity records")

    print("[3/4] Aggregating and computing rankings...")
    if transactions or popularity:
        aggregated = aggregate(transactions, popularity)
    else:
        print("  WARNING: No data fetched. Generating empty timeline as fallback.")
        aggregated = aggregate_empty()

    vol_count = len(aggregated.get("volume_ranking", []))
    pop_count = len(aggregated.get("popularity_ranking", []))
    chg_count = len(aggregated.get("change_ranking", []))
    print(f"  -> Volume: {vol_count}, Popularity: {pop_count}, Change: {chg_count}")

    print("[4/4] Generating timeline JSON...")
    timeline = build_timeline(aggregated)
    output_path = save_timeline(timeline)
    print(f"  -> Saved to {output_path}")
    print("[zs-ranking-agent] Pipeline complete.")
    return output_path


if __name__ == "__main__":
    main()
