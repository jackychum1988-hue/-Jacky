"""Markdown report generation for daily and weekly KOL competitor analysis."""
from datetime import datetime


def render_daily(analysis: str, item_count: int, platform_stats: dict) -> str:
    today = datetime.now().strftime("%Y-%m-%d")
    weekday = ["一", "二", "三", "四", "五", "六", "日"][datetime.now().weekday()]

    header = f"""📊 **港人KOL竞品快讯** | {today} 周{weekday}

> 今日监测 {item_count} 条新内容 | YouTube {platform_stats.get('youtube', 0)} | 小红书 {platform_stats.get('xiaohongshu', 0)} | Facebook {platform_stats.get('facebook', 0)} | 视频号 {platform_stats.get('shipinhao', 0)}

---
"""
    return header + analysis


def render_weekly(analysis: str, item_count: int, week_label: str, platform_stats: dict) -> str:
    header = f"""📈 **港人KOL竞品周报** | {week_label}

> 本周监测 {item_count} 条内容 | YouTube {platform_stats.get('youtube', 0)} | 小红书 {platform_stats.get('xiaohongshu', 0)} | Facebook {platform_stats.get('facebook', 0)} | 视频号 {platform_stats.get('shipinhao', 0)}

---
"""
    return header + analysis
