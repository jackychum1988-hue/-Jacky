"""zs-ranking-agent — Weekly Zhongshan real estate ranking video data pipeline.

Architecture:
  1. Fetch transaction data (住建局 / 合富研究院 news scrape)
  2. Fetch popularity data (贝壳找房 + Bing fallback)
  3. Aggregate → rank → compute 环比 from history.json
  4. Generate PipOverlay timeline JSON → Remotion render

Fallback: if scrapers fail (proxy/SSL/block), use manual data compilation
  via run_real_data.py which builds data from web search results.
"""
import sys
import os
from datetime import datetime

from config import PROJECTS
from fetchers.zs_gov_transactions import fetch_transactions
from fetchers.beike_popularity import fetch_popularity
from aggregator import aggregate, aggregate_empty
from generate_timeline import build_timeline, save_timeline


def main():
    print(f"[zs-ranking-agent] Weekly pipeline start — {datetime.now().isoformat()}")
    print(f"[zs-ranking-agent] Environment: Python {sys.version.split()[0]}")

    # Step 1: Fetch transaction data
    print("[1/4] Fetching transaction data...")
    transactions = []
    try:
        transactions = fetch_transactions()
    except Exception as e:
        print(f"  ERROR fetching transactions: {e}")
    print(f"  -> {len(transactions)} transaction records")

    # Step 2: Fetch popularity data
    print("[2/4] Fetching popularity data from Beike...")
    popularity = []
    try:
        project_names = [p["name"] for p in PROJECTS]
        popularity = fetch_popularity(project_names)
    except Exception as e:
        print(f"  ERROR fetching popularity: {e}")
    print(f"  -> {len(popularity)} popularity records")

    # Step 3: Aggregate
    print("[3/4] Aggregating and computing rankings...")
    if transactions or popularity:
        aggregated = aggregate(transactions, popularity)
    else:
        # Check if run_real_data output exists
        real_data_path = os.path.join(os.path.dirname(__file__), "output", "timeline-latest.json")
        if os.path.exists(real_data_path):
            print("  WARNING: Scrapers returned no data.")
            print("  Using last known timeline as baseline — run 'python run_real_data.py'")
            print("  to compile fresh data from web search if this persists.")
        aggregated = aggregate_empty()

    vol_count = len(aggregated.get("volume_ranking", []))
    pop_count = len(aggregated.get("popularity_ranking", []))
    chg_count = len(aggregated.get("change_ranking", []))
    print(f"  -> Volume: {vol_count}, Popularity: {pop_count}, Change: {chg_count}")

    # Step 4: Generate timeline
    print("[4/4] Generating timeline JSON...")
    timeline = build_timeline(aggregated)
    output_path = save_timeline(timeline)

    print(f"[zs-ranking-agent] Pipeline complete -> {output_path}")
    print(f"  Elements: {len(timeline['elements'])}, Frames: {timeline['durationInFrames']}")
    return output_path


if __name__ == "__main__":
    main()
