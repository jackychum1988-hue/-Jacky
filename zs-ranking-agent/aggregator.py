"""Aggregator — clean, match, rank, and compute period-over-period changes."""
import json
import os
from datetime import datetime
from config import match_project, PROJECTS, HISTORY_FILE


def load_history() -> dict:
    """Load history.json for 环比 calculation."""
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_history(data: dict) -> None:
    """Save current snapshot to history.json."""
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def aggregate(transactions: list[dict], popularity: list[dict]) -> dict:
    """Merge multi-source data, match to canonical projects, compute rankings.

    Returns:
        {
            volume_ranking: [{name, value, changePct}],
            popularity_ranking: [{name, value, changePct}],
            change_ranking: [{name, priceBefore, priceAfter, changePct}],
            trend_data: {weeks: [str], prices: [float]}
        }
    """
    prev = load_history()
    today_str = datetime.now().strftime("%Y-%m-%d")

    current: dict[str, dict] = {}
    for p in PROJECTS:
        current[p["name"]] = {
            "name": p["name"],
            "district": p["district"],
            "units_sold": 0,
            "followers": 0,
            "listing_avg_price": 0.0,
            "avg_price": 0.0,
        }

    for t in transactions:
        canonical = match_project(t["project_name"])
        if canonical:
            current[canonical]["units_sold"] += t.get("units_sold", 0)
            if t.get("avg_price", 0) > 0:
                current[canonical]["avg_price"] = t["avg_price"]

    for p in popularity:
        canonical = match_project(p["project_name"])
        if canonical:
            current[canonical]["followers"] = max(
                current[canonical]["followers"],
                p.get("followers", 0),
            )
            if p.get("listing_avg_price", 0) > 0:
                current[canonical]["listing_avg_price"] = p["listing_avg_price"]

    # Volume ranking
    volume_ranking = sorted(
        [{"name": c["name"], "value": c["units_sold"]} for c in current.values() if c["units_sold"] > 0],
        key=lambda x: x["value"],
        reverse=True,
    )[:10]
    for item in volume_ranking:
        prev_val = prev.get("volume", {}).get(item["name"], {}).get("value", 0)
        item["changePct"] = round((item["value"] - prev_val) / prev_val * 100, 1) if prev_val > 0 else 0

    # Popularity ranking
    popularity_ranking = sorted(
        [{"name": c["name"], "value": c["followers"]} for c in current.values() if c["followers"] > 0],
        key=lambda x: x["value"],
        reverse=True,
    )[:10]
    for item in popularity_ranking:
        prev_val = prev.get("popularity", {}).get(item["name"], {}).get("value", 0)
        item["changePct"] = round((item["value"] - prev_val) / prev_val * 100, 1) if prev_val > 0 else 0

    # Price change ranking
    raw_changes = []
    for c in current.values():
        curr_price = c["avg_price"] if c["avg_price"] > 0 else c["listing_avg_price"]
        if curr_price > 0:
            prev_price = prev.get("prices", {}).get(c["name"], 0)
            change_pct = round((curr_price - prev_price) / prev_price * 100, 1) if prev_price > 0 else 0
            raw_changes.append({
                "name": c["name"],
                "priceBefore": prev_price if prev_price > 0 else curr_price,
                "priceAfter": curr_price,
                "changePct": change_pct,
            })
    change_ranking = sorted(raw_changes, key=lambda x: abs(x["changePct"]), reverse=True)[:10]

    # Trend data (8-week avg price)
    avg_prices = [c["avg_price"] for c in current.values() if c["avg_price"] > 0]
    current_avg = round(sum(avg_prices) / len(avg_prices)) if avg_prices else 0
    trend = prev.get("trend", {"weeks": [], "prices": []})
    week_label = f"W{datetime.now().isocalendar()[1]}"
    trend["weeks"].append(week_label)
    trend["prices"].append(current_avg)
    if len(trend["weeks"]) > 8:
        trend["weeks"] = trend["weeks"][-8:]
        trend["prices"] = trend["prices"][-8:]

    history = {
        "updated": today_str,
        "volume": {item["name"]: {"value": item["value"]} for item in volume_ranking},
        "popularity": {item["name"]: {"value": item["value"]} for item in popularity_ranking},
        "prices": {item["name"]: item["priceAfter"] for item in change_ranking},
        "trend": trend,
    }
    save_history(history)

    return {
        "volume_ranking": volume_ranking,
        "popularity_ranking": popularity_ranking,
        "change_ranking": change_ranking,
        "trend_data": trend,
    }


def aggregate_empty() -> dict:
    """Return empty aggregate structure (used when no data available)."""
    return {
        "volume_ranking": [],
        "popularity_ranking": [],
        "change_ranking": [],
        "trend_data": {"weeks": [], "prices": []},
    }


if __name__ == "__main__":
    import tempfile
    real_history = HISTORY_FILE

    # Test matching
    assert match_project("华发观山水") == "華發觀山水"
    assert match_project("保利琅悦") == "保利琅悦"
    assert match_project("保利瑯悦") == "保利琅悦"
    assert match_project("港航汇") == "港航匯"
    assert match_project("unknown xyz") is None

    # Test aggregate with mock data
    with tempfile.TemporaryDirectory() as tmpdir:
        import aggregator as agg
        agg.HISTORY_FILE = os.path.join(tmpdir, "history.json")
        with open(agg.HISTORY_FILE, "w") as f:
            json.dump({}, f)

        txn = [
            {"project_name": "华发观山水", "units_sold": 50, "avg_price": 9500.0},
            {"project_name": "保利琅悦", "units_sold": 80, "avg_price": 14800.0},
        ]
        pop = [
            {"project_name": "华发观山水", "followers": 3200},
            {"project_name": "保利瑯悦", "followers": 5100},
        ]

        result = aggregate(txn, pop)
        assert len(result["volume_ranking"]) == 2
        assert result["volume_ranking"][0]["name"] == "保利琅悦"
        assert result["volume_ranking"][0]["value"] == 80
        assert result["volume_ranking"][1]["name"] == "華發觀山水"
        assert len(result["popularity_ranking"]) == 2
        assert result["popularity_ranking"][0]["name"] == "保利琅悦"
        assert len(result["trend_data"]["weeks"]) == 1

    # Test aggregate_empty
    empty = aggregate_empty()
    assert empty["volume_ranking"] == []
    assert empty["popularity_ranking"] == []

    print("All aggregator tests passed!")
