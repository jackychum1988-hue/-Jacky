"""Generate timeline combining scraped + compiled data.

Merges:
  - Beike-scraped real-time prices (fetchers/beike_popularity.py)
  - Volume ranking from history.json baseline (合富研究院)
  - Popularity from web-search estimates / history baseline

Run this when scrapers partially succeed or fail.
"""
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import PROJECTS
from generate_timeline import build_timeline, save_timeline
from aggregator import load_history


def main():
    print("[run_real_data] Building hybrid data pipeline...")

    # ---- 1. Try to get live Beike prices ----
    beike_prices = {}
    try:
        from fetchers.beike_popularity import fetch_popularity
        names = [p["name"] for p in PROJECTS]
        beike_results = fetch_popularity(names)
        for r in beike_results:
            if r["listing_avg_price"] > 0:
                beike_prices[r["project_name"]] = r["listing_avg_price"]
        print(f"  Beike: {len(beike_prices)} live prices")
    except Exception as e:
        print(f"  Beike: error — {e}")

    # ---- 2. Load history baseline ----
    prev = load_history()
    print(f"  History: {prev.get('updated', 'none')}, {prev.get('period', '')}")

    # ---- 3. Build volume ranking ----
    # From history.json if scrapers failed, otherwise from scraped transaction data
    volume_ranking = []
    if prev.get("volume"):
        for name, v in prev["volume"].items():
            volume_ranking.append({
                "name": name,
                "value": v["value"],
                "changePct": 0,  # Will be updated when next week's data arrives
            })
        volume_ranking.sort(key=lambda x: x["value"], reverse=True)
        volume_ranking = volume_ranking[:10]
    print(f"  Volume ranking: {len(volume_ranking)} items")

    # ---- 4. Build popularity ranking ----
    popularity_ranking = []
    if prev.get("popularity"):
        for name, v in prev["popularity"].items():
            popularity_ranking.append({
                "name": name,
                "value": v["value"],
                "changePct": 0,
            })
        popularity_ranking.sort(key=lambda x: x["value"], reverse=True)
        popularity_ranking = popularity_ranking[:10]
    print(f"  Popularity ranking: {len(popularity_ranking)} items")

    # ---- 5. Build change ranking ----
    # Merge Beike live prices with history baseline
    change_ranking = []
    prev_prices = prev.get("prices", {})

    # First, use Beike live prices as "current" prices
    for name, live_price in beike_prices.items():
        prev_price = prev_prices.get(name, live_price)
        change_pct = round((live_price - prev_price) / prev_price * 100, 1) if prev_price > 0 else 0
        change_ranking.append({
            "name": name,
            "priceBefore": prev_price if prev_price > 0 else live_price,
            "priceAfter": live_price,
            "changePct": change_pct,
        })

    # Then add any projects from history not covered by Beike
    for name, hist_price in prev_prices.items():
        if name not in beike_prices:
            change_ranking.append({
                "name": name,
                "priceBefore": hist_price,
                "priceAfter": hist_price,
                "changePct": 0,
            })

    change_ranking.sort(key=lambda x: abs(x["changePct"]), reverse=True)
    change_ranking = change_ranking[:10]
    print(f"  Change ranking: {len(change_ranking)} items")

    # ---- 6. Build trend data ----
    trend = prev.get("trend", {"weeks": [], "prices": []})
    # Append current week if we have new data
    if beike_prices:
        live_avg = sum(beike_prices.values()) / len(beike_prices)
        import datetime
        week_label = f"W{datetime.datetime.now().isocalendar()[1]}"
        if not trend["weeks"] or trend["weeks"][-1] != week_label:
            trend["weeks"].append(week_label)
            trend["prices"].append(round(live_avg))
        if len(trend["weeks"]) > 8:
            trend["weeks"] = trend["weeks"][-8:]
            trend["prices"] = trend["prices"][-8:]

    # ---- 7. Generate timeline ----
    data = {
        "volume_ranking": volume_ranking,
        "popularity_ranking": popularity_ranking,
        "change_ranking": change_ranking,
        "trend_data": trend,
    }

    print(f"\n  Final: V={len(volume_ranking)}, P={len(popularity_ranking)}, C={len(change_ranking)}")

    timeline = build_timeline(data)
    save_timeline(timeline)

    print(f"  Timeline: {len(timeline['elements'])} elements, {timeline['durationInFrames']} frames")
    print("[run_real_data] Done.")


if __name__ == "__main__":
    main()
