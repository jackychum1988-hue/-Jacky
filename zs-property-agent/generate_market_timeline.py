#!/usr/bin/env python3
"""generate_market_timeline.py — 数据→JSON 桥接脚本

从安居客爬取中山房源数据，计算统计指标，生成 PipOverlay 兼容的 JSON 时间线。
用法: python generate_market_timeline.py [--output PATH] [--hk-ref-price 800]
"""

import argparse
import json
import os
import re
import sys
from collections import Counter
from datetime import datetime, timedelta
from pathlib import Path

from fetchers.anjuke import fetch_anjuke

# ── 配置默认值 ──────────────────────────────────────────────
DEFAULT_HK_REF_PRICE = 800  # 香港参考房价（万港币），用于中山 vs 香港对比
FPS = 30


# ── 价格解析 ──────────────────────────────────────────────────
def parse_price_wan(raw: str) -> tuple:
    """解析价格字符串，返回 (数值_万, 类型)。

    支持格式:
      "280万"    → (280.0, "total")
      "21.8万起" → (21.8, "starting")
      "3500元/平" → (3500.0, "per_sqm")
      "暂无报价"  → (None, "unknown")
    """
    raw = raw.strip()
    if not raw:
        return None, "unknown"

    # "280万" / "21.8万起" / "1,280万"
    m = re.match(r"([\d,]+\.?\d*)\s*万\s*(起)?", raw)
    if m:
        return float(m.group(1).replace(",", "")), "starting" if m.group(2) else "total"

    # "3,500元/平" / "3500元/㎡"
    m = re.match(r"([\d,]+\.?\d*)\s*元\s*/\s*[平㎡m]", raw)
    if m:
        return float(m.group(1).replace(",", "")), "per_sqm"

    return None, "unknown"


# ── 周标签生成 ──────────────────────────────────────────────
def get_week_label() -> str:
    """返回如 '5月第4周' 的周标签。"""
    today = datetime.now()
    month = today.month
    week_of_month = ((today.day - 1) // 7) + 1
    return f"{month}月第{week_of_month}周"


def get_date_range_label() -> str:
    """返回如 '2026.05.25 - 2026.05.31' 的日期范围。"""
    today = datetime.now()
    weekday = today.weekday()  # 0=周一
    monday = today - timedelta(days=weekday)
    sunday = monday + timedelta(days=6)
    return f"{monday.strftime('%Y.%m.%d')} - {sunday.strftime('%Y.%m.%d')}"


# ── 统计计算 ──────────────────────────────────────────────────
def compute_stats(listings: list[dict]) -> dict:
    """从房源列表计算统计数据。"""
    prices = []
    districts = Counter()
    cheapest = None
    most_expensive = None

    for item in listings:
        area = item.get("area", "").strip()
        if area:
            districts[area] += 1

        price_str = item.get("price", "")
        val, ptype = parse_price_wan(price_str)
        if val is not None and ptype in ("total", "starting"):
            prices.append(val)
            if cheapest is None or val < cheapest[0]:
                cheapest = (val, item["title"], item.get("area", ""))
            if most_expensive is None or val > most_expensive[0]:
                most_expensive = (val, item["title"], item.get("area", ""))

    total = len(listings)
    valid_prices = len(prices)

    return {
        "total_listings": total,
        "valid_price_count": valid_prices,
        "avg_price_wan": round(sum(prices) / len(prices), 1) if prices else None,
        "min_price_wan": min(prices) if prices else None,
        "max_price_wan": max(prices) if prices else None,
        "cheapest": cheapest,
        "most_expensive": most_expensive,
        "district_ranking": districts.most_common(5),
        "district_count": len(districts),
    }


# ── JSON 生成 ─────────────────────────────────────────────────
def build_hook_card(enter_at: int, exit_at: int, label: str, headline: str,
                    subline: str = "", icon: str = "building",
                    color: str = "#F5A623") -> dict:
    return {
        "type": "HookCard",
        "enterAt": enter_at,
        "exitAt": exit_at,
        "animation": "spring",
        "position": "safe-top",
        "offset": {"x": 0, "y": 20},
        "props": {
            "label": label,
            "headline": headline,
            "subline": subline,
            "icon": icon,
            "color": color,
        },
    }


def build_stat_card(enter_at: int, exit_at: int, stats: list[dict],
                    columns: int = 2, color: str = "#1A56DB") -> dict:
    return {
        "type": "StatCard",
        "enterAt": enter_at,
        "exitAt": exit_at,
        "animation": "spring",
        "position": "safe-top",
        "offset": {"x": 0, "y": 20},
        "props": {
            "stats": stats,
            "columns": columns,
            "color": color,
        },
    }


def build_timeline_card(enter_at: int, exit_at: int, title: str,
                        steps: list[dict], color: str = "#10B981") -> dict:
    return {
        "type": "TimelineCard",
        "enterAt": enter_at,
        "exitAt": exit_at,
        "animation": "spring",
        "position": "safe-top",
        "offset": {"x": 0, "y": 20},
        "props": {
            "title": title,
            "steps": steps,
            "color": color,
        },
    }


def build_comparison_card(enter_at: int, exit_at: int,
                          left_label: str, left_value: str, left_unit: str = "",
                          right_label: str = "", right_value: str = "", right_unit: str = "",
                          delta: str = "", color: str = "#8B5CF6") -> dict:
    return {
        "type": "DataComparisonCard",
        "enterAt": enter_at,
        "exitAt": exit_at,
        "animation": "spring",
        "position": "safe-top",
        "offset": {"x": 0, "y": 20},
        "props": {
            "leftLabel": left_label,
            "leftValue": left_value,
            "leftUnit": left_unit,
            "rightLabel": right_label,
            "rightValue": right_value,
            "rightUnit": right_unit,
            "delta": delta,
            "color": color,
        },
    }


def build_cta_card(enter_at: int, exit_at: int, headline: str,
                   contact: str, en_headline: str = "",
                   color: str = "#F5A623", tags: list[str] | None = None) -> dict:
    props = {
        "headline": headline,
        "contact": contact,
        "color": color,
    }
    if en_headline:
        props["enHeadline"] = en_headline
    if tags:
        props["tags"] = tags
    return {
        "type": "CTACard",
        "enterAt": enter_at,
        "exitAt": exit_at,
        "animation": "spring",
        "position": "safe-top",
        "offset": {"x": 0, "y": 20},
        "props": props,
    }


def build_end_card(enter_at: int, exit_at: int, channel_name: str,
                   subscribe_text: str = "", color: str = "#F5A623") -> dict:
    return {
        "type": "EndCard",
        "enterAt": enter_at,
        "exitAt": exit_at,
        "animation": "spring",
        "position": "safe-top",
        "offset": {"x": 0, "y": 20},
        "props": {
            "channelName": channel_name,
            "subscribeText": subscribe_text,
            "color": color,
        },
    }


# ── 主逻辑 ─────────────────────────────────────────────────────
def generate_timeline(listings: list[dict], hk_ref_price: int = DEFAULT_HK_REF_PRICE,
                      output_path: str = "") -> dict:
    """主入口：从房源列表生成完整 PipOverlay JSON。"""
    week_label = get_week_label()
    date_range = get_date_range_label()
    stats = compute_stats(listings)

    elements = []

    # ── 0 条数据：致歉降级 ──
    if stats["total_listings"] == 0:
        elements.append(build_hook_card(
            0, 140,
            label="中山楼市周报",
            headline="本周暂无新盘数据",
            subline="安居客反爬升级中，下周恢复 · 敬请期待",
            icon="building", color="#FF4136",
        ))
        elements.append(build_cta_card(
            140, 290,
            headline="想睇楼？即刻联络 Jacky！",
            en_headline="Want a Viewing? Contact Jacky Now!",
            contact="+852 6672 2526",
        ))
        elements.append(build_end_card(
            290, 0,
            channel_name="港人中山置业通 Jacky",
            subscribe_text="关注我，带你睇更多中山好楼",
        ))
        timeline = {
            "width": 1080,
            "height": 1920,
            "fps": FPS,
            "durationInFrames": 450,
            "elements": elements,
        }
        _write_json(timeline, output_path)
        return timeline

    n = stats["total_listings"]
    avg = stats["avg_price_wan"]
    min_p = stats["min_price_wan"]
    max_p = stats["max_price_wan"]
    districts_n = stats["district_count"]

    # ── 少量数据（1-2 条）：精简版 ──
    if n <= 2:
        elements.append(build_hook_card(
            0, 160,
            label=f"中山楼市速报 · {week_label}",
            headline=f"{n}个新盘动态",
            subline=f"{date_range} · 覆盖{districts_n}区",
            icon="building",
        ))
        if avg:
            elements.append(build_stat_card(
                160, 370,
                stats=[
                    {"icon": "building", "value": str(n), "label": "在售新盘", "enLabel": "Active Listings"},
                    {"icon": "currency", "value": f"{avg}", "label": "均价(万)", "enLabel": "Avg Price (10K RMB)"},
                    {"icon": "mapPin", "value": str(districts_n), "label": "覆盖区域", "enLabel": "Districts"},
                    {"icon": "trending", "value": f"{min_p}", "label": "最低入手(万)", "enLabel": "Entry Price"},
                ],
                columns=2,
            ))
        else:
            elements.append(build_stat_card(
                160, 370,
                stats=[
                    {"icon": "building", "value": str(n), "label": "在售新盘", "enLabel": "Active Listings"},
                    {"icon": "mapPin", "value": str(districts_n), "label": "覆盖区域", "enLabel": "Districts"},
                ],
                columns=2,
            ))
        elements.append(build_cta_card(
            370, 520,
            headline="想睇楼？即刻联络 Jacky！",
            en_headline="Want a Viewing? Contact Jacky Now!",
            contact="+852 6672 2526",
        ))
        elements.append(build_end_card(
            520, 0,
            channel_name="港人中山置业通 Jacky",
            subscribe_text="关注我，带你睇更多中山好楼",
        ))
        timeline = {
            "width": 1080,
            "height": 1920,
            "fps": FPS,
            "durationInFrames": 720,
            "elements": elements,
        }
        _write_json(timeline, output_path)
        return timeline

    # ── 正常数据（3+ 条）：完整周报 ──
    # Card 1: HookCard — 开场钩子
    elements.append(build_hook_card(
        0, 140,
        label=f"中山楼市周报 · {week_label}",
        headline=f"{n}个新盘动态",
        subline=f"{date_range} · 覆盖{districts_n}区 · 均价约{avg}万起 · 港人置业速览",
        icon="building",
    ))

    # Card 2: StatCard — 4 个关键指标
    stat_items = [
        {"icon": "building", "value": str(n), "label": "在售新盘", "enLabel": "Active Listings"},
        {"icon": "currency", "value": str(avg), "label": "均价(万)", "enLabel": "Avg Price (10K RMB)"},
        {"icon": "mapPin", "value": str(districts_n), "label": "覆盖区域", "enLabel": "Districts Covered"},
        {"icon": "trending", "value": str(min_p) if min_p else "-", "label": "最低入手(万)", "enLabel": "Entry Price"},
    ]
    elements.append(build_stat_card(140, 320, stats=stat_items, columns=2, color="#1A56DB"))

    # Card 3: TimelineCard — 热门区域排行
    ranking = stats["district_ranking"]
    if ranking:
        steps = []
        for district, count in ranking:
            desc_parts = [f"{count}个新盘"]
            # 尝试计算该区域均价
            district_prices = [
                parse_price_wan(item["price"])[0]
                for item in listings
                if item.get("area", "").strip() == district
            ]
            district_prices = [p for p in district_prices if p is not None]
            if district_prices:
                d_avg = round(sum(district_prices) / len(district_prices), 1)
                desc_parts.append(f"均价{d_avg}万")
            steps.append({
                "label": district,
                "desc": " · ".join(desc_parts),
            })
        elements.append(build_timeline_card(320, 560, title="热门区域排行", steps=steps, color="#10B981"))

    # Card 4: DataComparisonCard — 最低价 vs 最高价
    if stats["cheapest"] and stats["most_expensive"] and stats["cheapest"][0] != stats["most_expensive"][0]:
        cheap_price, cheap_name, _ = stats["cheapest"]
        exp_price, exp_name, _ = stats["most_expensive"]
        ratio = round(exp_price / cheap_price, 1)
        elements.append(build_comparison_card(
            560, 710,
            left_label=cheap_name,
            left_value=str(cheap_price),
            left_unit="万",
            right_label=exp_name,
            right_value=str(exp_price),
            right_unit="万",
            delta=f"价差{ratio}倍",
            color="#8B5CF6",
        ))

    # Card 5: DataComparisonCard — 中山 vs 香港
    if avg:
        ratio = round(hk_ref_price / avg, 1) if avg > 0 else 0
        elements.append(build_comparison_card(
            710, 860,
            left_label="中山均价",
            left_value=str(avg),
            left_unit="万人民币",
            right_label="香港参考",
            right_value=str(hk_ref_price),
            right_unit="万港币",
            delta=f"{ratio}倍价差",
            color="#F5A623",
        ))

    # Card 6: HookCard — 港人视角洞察
    insights = []
    if stats["cheapest"]:
        cheap_price, cheap_name, cheap_area = stats["cheapest"]
        insights.append(f"最低入场{cheap_price}万（{cheap_name}）")
    if ranking:
        top_district = ranking[0][0]
        insights.append(f"最热区域：{top_district}")
    insight_line = " · ".join(insights) if insights else "关注中山楼市，先人一步"
    elements.append(build_hook_card(
        860, 1040,
        label="港人视角",
        headline=insight_line,
        subline="深中通道1小时直达 · 港车北上更方便",
        icon="mapPin",
        color="#06B6D4",
    ))

    # Card 7: CTACard — 行动号召
    elements.append(build_cta_card(
        1040, 1190,
        headline="想睇楼？即刻联络 Jacky！",
        en_headline="Want a Viewing? Contact Jacky Now!",
        contact="+852 6672 2526",
        tags=["港人尊享优惠", "免费专车接送", "粤语全程讲解"],
    ))

    # Card 8: EndCard — 片尾
    elements.append(build_end_card(
        1190, 0,
        channel_name="港人中山置业通 Jacky",
        subscribe_text="关注我，带你睇更多中山好楼",
    ))

    timeline = {
        "width": 1080,
        "height": 1920,
        "fps": FPS,
        "durationInFrames": 1350,
        "elements": elements,
    }

    _write_json(timeline, output_path)
    return timeline


def _write_json(timeline: dict, output_path: str) -> None:
    """写入 JSON 文件，确保目录存在。"""
    if not output_path:
        return
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(timeline, f, ensure_ascii=False, indent=2)
    print(f"[market_timeline] written to {output_path}", file=sys.stderr)


# ── CLI ─────────────────────────────────────────────────────────
def main() -> None:
    parser = argparse.ArgumentParser(
        description="从安居客数据生成 PipOverlay JSON 时间线"
    )
    parser.add_argument(
        "--output", "-o",
        default=os.path.join(os.path.dirname(__file__), "..",
                             "remotion-realestate", "config", "market-timeline.json"),
        help="输出 JSON 文件路径",
    )
    parser.add_argument(
        "--hk-ref-price",
        type=int,
        default=DEFAULT_HK_REF_PRICE,
        help=f"香港参考房价（万港币），默认 {DEFAULT_HK_REF_PRICE}",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="打印 JSON 到 stdout 而不写入文件",
    )
    args = parser.parse_args()

    print("[market_timeline] fetching anjuke listings...", file=sys.stderr)
    listings = fetch_anjuke()
    print(f"[market_timeline] got {len(listings)} listings", file=sys.stderr)

    output = "" if args.dry_run else os.path.abspath(args.output)
    timeline = generate_timeline(listings, hk_ref_price=args.hk_ref_price,
                                 output_path=output)

    if args.dry_run:
        json.dump(timeline, sys.stdout, ensure_ascii=False, indent=2)

    print(f"[market_timeline] done: {len(timeline['elements'])} elements, "
          f"{timeline['durationInFrames']} frames "
          f"({timeline['durationInFrames'] / FPS:.0f}s)", file=sys.stderr)


if __name__ == "__main__":
    main()
