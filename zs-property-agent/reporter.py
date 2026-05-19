from datetime import datetime


def build_report(
    anjuke_items: list[dict],
    zs_gov_items: list[dict],
    zs_news_items: list[dict],
    douyin_items: list[dict],
    youtube_items: list[dict],
    facebook_items: list[dict],
) -> str:
    today = datetime.now().strftime("%Y-%m-%d")
    lines = [f"🏠 中山房产日报 | {today}", ""]

    _add_section(lines, "📰 【政策与城建】", zs_gov_items, _format_gov)
    _add_section(lines, "📰 【中山日报·楼市城建】", zs_news_items, _format_news)
    _add_section(lines, "🏗 【新盘动态】", anjuke_items, _format_anjuke)
    _add_section(lines, "🎙 【抖音主播动态】", douyin_items, _format_douyin)
    _add_section(lines, "📺 【YouTube 热门短片】", youtube_items, _format_youtube)
    _add_section(lines, "📘 【Facebook 热门帖文】", facebook_items, _format_facebook)

    if len(lines) <= 2:
        lines.append("今日暂无新数据，请稍后关注。")

    lines.append("")
    lines.append("> 🤖 由中山房产智能Agent自动生成")
    return "\n".join(lines)


def _add_section(lines: list[str], heading: str, items: list[dict], fmt_fn):
    if not items:
        return
    lines.append(heading)
    for item in items:
        lines.append(fmt_fn(item))
    lines.append("")


def _format_gov(item: dict) -> str:
    date = f" ({item.get('date', '')})" if item.get("date") else ""
    return f"- [{item['title']}]({item['link']}){date}"


def _format_news(item: dict) -> str:
    summary = item.get("summary", "")
    detail = f" — {summary}" if summary else ""
    return f"- [{item['title']}]({item['link']}){detail}"


def _format_anjuke(item: dict) -> str:
    parts = []
    if item.get("area"):
        parts.append(item["area"])
    if item.get("price"):
        parts.append(item["price"])
    tags = " · ".join(item.get("tags", []))
    info = f" | {' · '.join(parts)}" if parts else ""
    tag_str = f" [🏷 {tags}]" if tags else ""
    link = item.get("link", "")
    if link:
        return f"- [{item['title']}]({link}){info}{tag_str}"
    return f"- {item['title']}{info}{tag_str}"


def _format_douyin(item: dict) -> str:
    snippet = f" — {item.get('snippet', '')}" if item.get("snippet") else ""
    return f"- **{item['blogger']}**：[{item['title']}]({item['link']}){snippet}"


def _format_youtube(item: dict) -> str:
    channel = f" | {item['channel']}" if item.get("channel") else ""
    return f"- [{item['title']}]({item['link']}){channel}"


def _format_facebook(item: dict) -> str:
    snippet = f" — {item.get('snippet', '')}" if item.get("snippet") else ""
    title = item.get("title", "") or "查看帖文"
    return f"- [{title}]({item['link']}){snippet}"
