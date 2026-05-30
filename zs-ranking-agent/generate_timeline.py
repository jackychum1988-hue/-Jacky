"""Generate PipOverlay-compatible timeline JSON from aggregated ranking data."""
import json
import os
from datetime import datetime

OUTPUT_DIR = "output"
TIMELINE_FILE = "timeline-latest.json"

WIDTH = 1080
HEIGHT = 1920
FPS = 30
TOTAL_FRAMES = 2040  # 68s @ 30fps

# Segment timing (in frames)
TITLE_START, TITLE_END = 0, 90        # 3s
VOLUME_START, VOLUME_END = 90, 690     # 20s
POP_START, POP_END = 720, 1320         # 20s
CHANGE_START, CHANGE_END = 1350, 1950  # 20s
END_START, END_END = 1980, 2040        # 2s


def build_timeline(aggregated: dict) -> dict:
    """Build full PipOverlay timeline JSON from aggregated data."""
    volume = aggregated.get("volume_ranking", [])
    popularity = aggregated.get("popularity_ranking", [])
    changes = aggregated.get("change_ranking", [])
    trend = aggregated.get("trend_data", {"weeks": [], "prices": []})

    elements = []

    # 1. Title card
    elements.append({
        "type": "HookCard",
        "enterAt": TITLE_START,
        "exitAt": TITLE_END,
        "animation": "spring",
        "position": "center",
        "props": {
            "label": "中山楼盘数据周报",
            "headline": "本周排行榜",
            "subline": f"成交量 TOP10 · 热度 TOP10 · 涨跌 TOP10  |  {datetime.now().strftime('%Y.%m.%d')}",
            "color": "#C8A052",
        },
    })

    # 2. Volume segment label
    elements.append({
        "type": "KeywordTag",
        "enterAt": VOLUME_START - 20,
        "exitAt": VOLUME_END,
        "animation": "fade",
        "position": "safe-top",
        "props": {"text": "成交量榜", "color": "#C8A052", "size": "lg"},
    })

    # 3. Volume ranking
    if volume:
        elements.append({
            "type": "RankingBarChart",
            "enterAt": VOLUME_START,
            "exitAt": VOLUME_END,
            "animation": "spring",
            "position": "center",
            "props": {
                "title": "本周成交量 TOP10",
                "items": volume,
                "unit": "套",
                "color": "#C8A052",
            },
        })

    # 4. Popularity segment label
    elements.append({
        "type": "KeywordTag",
        "enterAt": POP_START - 20,
        "exitAt": POP_END,
        "animation": "fade",
        "position": "safe-top",
        "props": {"text": "热度榜", "color": "#F5A623", "size": "lg"},
    })

    # 5. Popularity ranking
    if popularity:
        elements.append({
            "type": "RankingBarChart",
            "enterAt": POP_START,
            "exitAt": POP_END,
            "animation": "spring",
            "position": "center",
            "props": {
                "title": "本周热度 TOP10",
                "items": popularity,
                "unit": "人关注",
                "color": "#F5A623",
            },
        })

    # 6. Change segment label
    elements.append({
        "type": "KeywordTag",
        "enterAt": CHANGE_START - 20,
        "exitAt": CHANGE_END,
        "animation": "fade",
        "position": "safe-top",
        "props": {"text": "涨跌榜", "color": "#10B981", "size": "lg"},
    })

    # 7. Change ranking
    if changes:
        elements.append({
            "type": "RankingChangeList",
            "enterAt": CHANGE_START,
            "exitAt": CHANGE_END,
            "animation": "spring",
            "position": "center",
            "props": {
                "title": "本周涨跌 TOP10",
                "items": changes,
                "color": "#10B981",
            },
        })

    # 8. Trend chart (bottom-right overlay during change segment)
    if trend["weeks"] and len(trend["weeks"]) >= 2:
        elements.append({
            "type": "TrendLineChart",
            "enterAt": CHANGE_START + 30,
            "exitAt": CHANGE_END,
            "animation": "fade",
            "position": "bottom-right",
            "offset": {"x": -40, "y": -40},
            "props": {
                "weeks": trend["weeks"],
                "prices": trend["prices"],
                "title": "近8周均价走势",
                "color": "#C8A052",
            },
        })

    # 9. End card
    elements.append({
        "type": "EndCard",
        "enterAt": END_START,
        "exitAt": END_END,
        "animation": "fade",
        "position": "center",
        "props": {
            "channelName": "港人中山置业通Jacky",
            "subscribeText": "关注我 · 每周更新中山楼盘数据",
            "color": "#C8A052",
        },
    })

    return {
        "width": WIDTH,
        "height": HEIGHT,
        "fps": FPS,
        "durationInFrames": TOTAL_FRAMES,
        "elements": elements,
    }


def save_timeline(timeline: dict) -> str:
    """Save timeline JSON to output dir. Returns file path."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filepath = os.path.join(OUTPUT_DIR, TIMELINE_FILE)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(timeline, f, ensure_ascii=False, indent=2)

    # Also save dated copy for archive
    dated = os.path.join(OUTPUT_DIR, f"timeline-{datetime.now().strftime('%Y-%m-%d')}.json")
    with open(dated, "w", encoding="utf-8") as f:
        json.dump(timeline, f, ensure_ascii=False, indent=2)

    print(f"Timeline saved: {filepath} ({len(timeline['elements'])} elements, {timeline['durationInFrames']} frames)")
    return filepath


if __name__ == "__main__":
    # Test with rich mock data — 10 items per ranking
    mock = {
        "volume_ranking": [
            {"name": "保利琅悦", "value": 328, "changePct": 12.5},
            {"name": "華發觀山水", "value": 291, "changePct": -3.2},
            {"name": "錦繡海灣城", "value": 256, "changePct": 8.1},
            {"name": "雅居樂·萬象郡", "value": 228, "changePct": 5.7},
            {"name": "中山108天寓", "value": 201, "changePct": -1.8},
            {"name": "招商臻灣府", "value": 187, "changePct": 15.3},
            {"name": "港航匯", "value": 165, "changePct": 22.0},
            {"name": "御峰香林", "value": 142, "changePct": -7.5},
            {"name": "幸福匯", "value": 128, "changePct": 3.1},
            {"name": "遠洋天著", "value": 115, "changePct": -0.9},
        ],
        "popularity_ranking": [
            {"name": "保利琅悦", "value": 15200, "changePct": 5.3},
            {"name": "華發觀山水", "value": 12100, "changePct": -1.2},
            {"name": "錦繡海灣城", "value": 10800, "changePct": 8.7},
            {"name": "雅居樂灣際壹號", "value": 9500, "changePct": 3.5},
            {"name": "港航匯", "value": 8700, "changePct": 15.7},
            {"name": "招商臻灣府", "value": 8200, "changePct": 12.1},
            {"name": "中山108天寓", "value": 7600, "changePct": -2.8},
            {"name": "朗詩金鐘湖壹號", "value": 6800, "changePct": 6.4},
            {"name": "保利天匯·熙岸", "value": 6100, "changePct": -4.1},
            {"name": "華發學府壹號", "value": 5500, "changePct": 1.9},
        ],
        "change_ranking": [
            {"name": "港航匯", "priceBefore": 21800, "priceAfter": 23500, "changePct": 7.8},
            {"name": "招商臻灣府", "priceBefore": 18500, "priceAfter": 19700, "changePct": 6.5},
            {"name": "錦繡海灣城", "priceBefore": 12800, "priceAfter": 12000, "changePct": -6.2},
            {"name": "保利琅悦", "priceBefore": 13800, "priceAfter": 14700, "changePct": 6.5},
            {"name": "雅居樂·萬象郡", "priceBefore": 10500, "priceAfter": 11200, "changePct": 6.7},
            {"name": "御峰香林", "priceBefore": 16200, "priceAfter": 15000, "changePct": -7.4},
            {"name": "中山粵海城", "priceBefore": 14200, "priceAfter": 15050, "changePct": 6.0},
            {"name": "幸福匯", "priceBefore": 9500, "priceAfter": 9100, "changePct": -4.2},
            {"name": "遠洋天著", "priceBefore": 11800, "priceAfter": 12200, "changePct": 3.4},
            {"name": "朗詩金鐘湖壹號", "priceBefore": 15500, "priceAfter": 14900, "changePct": -3.9},
        ],
        "trend_data": {
            "weeks": ["W15", "W16", "W17", "W18", "W19", "W20", "W21", "W22"],
            "prices": [12800, 13000, 12950, 13100, 13250, 13400, 13300, 13580],
        },
    }
    timeline = build_timeline(mock)
    save_timeline(timeline)
    print(f"Test timeline generated with {len(timeline['elements'])} elements")
