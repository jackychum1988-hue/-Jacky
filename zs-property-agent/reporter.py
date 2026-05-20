from datetime import datetime

# Keywords that indicate NON-real-estate content to filter out
_NON_PROPERTY_KEYWORDS = [
    "床垫", "沙发", "衣柜", "家电", "装修", "装饰", "厨卫", "卫浴",
    "红星美凯龙", "家具", "家私", "家居", "瓷砖", "地板", "涂料",
    "灯具", "窗帘", "布艺", "摆设", "工艺品",
]

# Keywords that strongly indicate real estate content
_PROPERTY_KEYWORDS = [
    "楼盘", "楼市", "房产", "买房", "房价", "开盘", "预售", "土地",
    "地块", "拍卖", "政策", "调控", "房贷", "公积金", "契税",
    "深中通道", "大湾区", "地铁", "交通", "规划", "开发商", "项目",
    "交付", "交房", "看房", "置业", "買樓", "上車", "筍盤",
    "呎價", "住宅", "公寓", "别墅", "商舖", "写字楼", "按揭",
    "供應", "成交", "放盤", "業主", "二手", "一手", "現樓",
    "樓花", "示範單位", "入場費", "首期", "供款",
]


def _is_real_estate(item: dict) -> bool:
    """Basic keyword filter to exclude non-real-estate content (furniture, decor, etc)."""
    title = item.get("title", "")
    text = title + " " + item.get("summary", "") + " " + item.get("snippet", "")

    for kw in _NON_PROPERTY_KEYWORDS:
        if kw in text:
            return False

    # If no property keyword found, still include it (might be edge case)
    return True


def build_report(
    anjuke_items: list[dict],
    zs_gov_items: list[dict],
    zs_news_items: list[dict],
    douyin_items: list[dict],
    youtube_items: list[dict],
    facebook_items: list[dict],
    ai_analysis: str = "",
) -> str:
    today = datetime.now().strftime("%Y-%m-%d")
    lines = [f"🏠 中山房产日报 | {today}", ""]

    if ai_analysis:
        lines.append(ai_analysis)
        lines.append("")
        lines.append("---")
        lines.append("")
        lines.append("📎 **原始数据来源**")
        _add_links_section(lines, "🏛 中山住建局", zs_gov_items, _format_link)
        _add_links_section(lines, "📰 中山楼市网", zs_news_items, _format_link)
        _add_links_section(lines, "🏗 安居客新盘", anjuke_items, _format_anjuke_link)
        _add_links_section(lines, "🎙 抖音博主", douyin_items, _format_douyin_link)
        _add_links_section(lines, "📺 YouTube", youtube_items, _format_youtube_link)
        _add_links_section(lines, "📘 Facebook", facebook_items, _format_facebook_link)
    else:
        # Apply basic keyword filter to news items in fallback mode
        filtered_news = [i for i in zs_news_items if _is_real_estate(i)]
        _add_section(lines, "📰 【政策与城建】", zs_gov_items, _format_gov)
        _add_section(lines, "📰 【中山日报·楼市城建】", filtered_news, _format_news)
        _add_section(lines, "🏗 【新盘动态】", anjuke_items, _format_anjuke)
        _add_section(lines, "🎙 【抖音主播动态】", douyin_items, _format_douyin)
        _add_section(lines, "📺 【YouTube 热门短片】", youtube_items, _format_youtube)
        _add_section(lines, "📘 【Facebook 热门帖文】", facebook_items, _format_facebook)

        if len(lines) <= 2:
            lines.append("今日暂无新数据，请稍后关注。")

    lines.append("")
    lines.append("> 🤖 由中山房产智能Agent自动生成 | AI分析仅供参考")
    return "\n".join(lines)


def _add_section(lines: list[str], heading: str, items: list[dict], fmt_fn):
    if not items:
        return
    lines.append(heading)
    for item in items:
        lines.append(fmt_fn(item))
    lines.append("")


def _add_links_section(lines: list[str], heading: str, items: list[dict], fmt_fn):
    if not items:
        return
    lines.append(heading)
    for item in items:
        lines.append(fmt_fn(item))


def _format_link(item: dict) -> str:
    return f"- [{item['title']}]({item['link']})"


def _format_gov(item: dict) -> str:
    date = f" ({item.get('date', '')})" if item.get("date") else ""
    return f"- [{item['title']}]({item['link']}){date}"


def _format_news(item: dict) -> str:
    date = f" ({item.get('date', '')})" if item.get("date") else ""
    return f"- [{item['title']}]({item['link']}){date}"


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


def _format_anjuke_link(item: dict) -> str:
    parts = []
    if item.get("area"):
        parts.append(item["area"])
    if item.get("price"):
        parts.append(item["price"])
    info = f" | {' · '.join(parts)}" if parts else ""
    link = item.get("link", "")
    if link:
        return f"- [{item['title']}]({link}){info}"
    return f"- {item['title']}{info}"


def _format_douyin(item: dict) -> str:
    snippet = f" — {item.get('snippet', '')}" if item.get("snippet") else ""
    return f"- **{item['blogger']}**：[{item['title']}]({item['link']}){snippet}"


def _format_douyin_link(item: dict) -> str:
    return f"- **{item['blogger']}**：[{item['title']}]({item['link']})"


def _format_youtube(item: dict) -> str:
    channel = f" | {item['channel']}" if item.get("channel") else ""
    return f"- [{item['title']}]({item['link']}){channel}"


def _format_youtube_link(item: dict) -> str:
    channel = f" | {item['channel']}" if item.get("channel") else ""
    return f"- [{item['title']}]({item['link']}){channel}"


def _format_facebook(item: dict) -> str:
    snippet = f" — {item.get('snippet', '')}" if item.get("snippet") else ""
    title = item.get("title", "") or "查看帖文"
    return f"- [{title}]({item['link']}){snippet}"


def _format_facebook_link(item: dict) -> str:
    title = item.get("title", "") or "查看帖文"
    return f"- [{title}]({item['link']})"
