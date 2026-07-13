"""竞品监控模块 — 百度搜索 + DeepSeek AI 文案分析。"""

import json
import requests
from bs4 import BeautifulSoup
from config import (
    COMPETITOR_QUERIES, REQUEST_TIMEOUT, MAX_COMPETITOR_ITEMS,
    DEEPSEEK_API_KEY, deepseek_chat,
)

BAIDU_URL = "https://www.baidu.com/s"
BAIDU_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9",
}


def fetch_competitors() -> list[dict]:
    """百度搜索同行汤店相关内容。"""
    items = []
    for query in COMPETITOR_QUERIES:
        try:
            params = {"wd": query, "rn": 10}
            resp = requests.get(BAIDU_URL, headers=BAIDU_HEADERS, params=params, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            for container in soup.select(".result, .c-container")[:5]:
                title_el = container.select_one("h3 a")
                if not title_el:
                    continue
                title = title_el.get_text(strip=True)
                snippet_el = container.select_one(".c-abstract, .content-right_8Zs40")
                snippet = snippet_el.get_text(strip=True)[:200] if snippet_el else ""
                link = title_el.get("href", "")
                if title and len(title) > 3:
                    items.append({"title": title, "link": link, "snippet": snippet})
        except requests.RequestException:
            continue

    seen = set()
    unique = []
    for item in items:
        key = item["link"] or item["title"]
        if key not in seen:
            seen.add(key)
            unique.append(item)
    return unique[:MAX_COMPETITOR_ITEMS]


def summarize_competitors(items: list[dict]) -> str:
    """汇总：基础摘要 + AI 文案分析。"""
    if not items:
        basic = "今日暂无抓取到周边同行新动态，建议从菜单和时令选题。"
    else:
        lines = ["【今日周边同行抖音动态】"]
        for i, item in enumerate(items, 1):
            lines.append(f"{i}. {item['title'][:100]}")
            if item.get("snippet"):
                lines.append(f"   摘要: {item['snippet'][:120]}")
        basic = "\n".join(lines)

    analysis = _analyze_competitor_copy(items)
    parts = [basic]
    if analysis:
        parts.append("")
        if analysis.get("hot_patterns"):
            parts.append("## 🔥 同行爆款标题/钩子句式")
            for p in analysis["hot_patterns"]:
                parts.append(f"- {p}")
        if analysis.get("selling_point_phrases"):
            parts.append("\n## 💰 同行高频卖点话术")
            for p in analysis["selling_point_phrases"]:
                parts.append(f"- {p}")
        if analysis.get("hooks_that_work"):
            parts.append("\n## 🎯 有效的钩子类型")
            for h in analysis["hooks_that_work"]:
                parts.append(f"- {h}")
        if analysis.get("recommendation"):
            parts.append(f"\n## 💡 今日文案建议\n{analysis['recommendation']}")
    return "\n".join(parts)


def _analyze_competitor_copy(items: list[dict]) -> dict | None:
    """AI 深度拆解同行视频文案模式。"""
    if not DEEPSEEK_API_KEY or not items:
        return None

    raw_content = "\n".join(
        f"- 标题：{item['title']}\n  摘要：{item.get('snippet', '')[:150]}"
        for item in items[:MAX_COMPETITOR_ITEMS]
    )

    prompt = f"""你是抖音短视频内容分析师。以下是搜索到的汤店同行内容片段：
{raw_content}

提炼文案策略，严格按 JSON 返回：
{{
  "hot_patterns": ["标题/钩子句式1", "句式2"],
  "selling_point_phrases": ["卖点话术1", "话术2"],
  "hooks_that_work": ["钩子类型1", "类型2"],
  "recommendation": "给三姐汤店的文案建议（100字以内）"
}}"""

    try:
        text = deepseek_chat(prompt, max_tokens=600, temperature=0.6)
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(text)
    except Exception as e:
        print(f"  ⚠ AI 竞品文案分析失败: {e}")
        return None
