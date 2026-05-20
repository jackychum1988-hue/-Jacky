"""AI-powered real estate news analyzer via OpenAI-compatible API (DeepSeek default)."""
import json
import requests
from config import AI_API_KEY, AI_API_BASE, AI_MODEL, REQUEST_TIMEOUT

SYSTEM_PROMPT = """你是一位资深中山房地产分析师，为"港人中山置业通Jacky"频道提供每日市场情报分析。

你的任务：
1. **严格筛选**：只保留与「中山房地产市场」直接相关的内容。以下类型必须排除：
   - 家具、家电、装修、家居装饰类新闻（如床垫发布、家电促销等）
   - 纯社会新闻、娱乐新闻、体育新闻
   - 汽车、美食、旅游等与房产无关的内容
   - 如果某条内容边缘相关（如商业地产影响住宅市场），可保留但需说明关联性

2. **深度提取**：对每条保留的内容提取：
   - 核心事实（发生了什么）
   - 数据/政策要点（具体数字、政策名称、影响范围）
   - 对香港买家在中山置业的实际影响

3. **逻辑串联**：将相关新闻串联分析：
   - 多条新闻指向同一趋势时，归纳总结
   - 政策+市场反应+博主观点的因果关系
   - 不同区域/板块的对比

4. **输出格式**：严格按以下Markdown结构输出，每部分控制在2-5条精华内容：

## 📊 今日市场速览
（2-3句话概括今天最重要的市场动态，让香港买家快速了解大局）

## 🏛 政策与城建
（每条：新闻要点 → 对市场/港人买房的影响分析）
格式：**标题**：要点分析 [原文](链接)

## 🏗 新盘与市场动态
（每条：项目/动态要点 → 区域影响/投资价值判断）
格式：**项目名/动态**：分析 [原文](链接)

## 🎙 博主观点精选
（从博主内容中提取有价值的市场观点，进行分析点评）
格式：**博主名**：核心观点 → 我的分析 [来源](链接)

## 💡 Jacky今日话题建议
（基于今天的内容，推荐2-3个适合拍视频的话题角度，吸引香港买家）

重要规则：
- 如果某个类别今天没有相关内容，写"今日暂无相关动态"
- 每条分析控制在100-200字，精炼有力
- 用粤语/香港用词风格（如"買樓"、"上車"、"筍盤"、"呎價"等）
- 链接格式：[原文](完整URL)
- 绝对不要输出家具/家电/装修等非房产内容"""


def analyze(items_by_source: dict) -> str:
    """Send collected items to LLM and return the analytical report."""
    if not AI_API_KEY:
        return ""

    # Build user message with all items
    parts = ["今日收集到的中山相关资讯：\n"]

    news_items = []
    social_items = []

    for source_name, items in items_by_source.items():
        if not items:
            continue

        if source_name in ("zs_gov", "zs_news"):
            news_items.extend(items)
        else:
            social_items.extend(items)

    # News items first (higher priority)
    if news_items:
        parts.append("## 新闻/政策类")
        for item in news_items:
            parts.append(f"- 标题：{item.get('title', '')}")
            if item.get("date"):
                parts.append(f"  日期：{item['date']}")
            if item.get("full_text"):
                parts.append(f"  正文摘要：{item['full_text'][:800]}")
            elif item.get("summary"):
                parts.append(f"  摘要：{item['summary']}")
            if item.get("link"):
                parts.append(f"  链接：{item['link']}")
            parts.append("")

    # Social/blogger items
    if social_items:
        parts.append("## 博主/社交媒体类")
        for item in social_items:
            blogger = item.get("blogger") or item.get("channel") or ""
            if blogger:
                parts.append(f"- 来源：{blogger}")
            parts.append(f"  标题：{item.get('title', '')}")
            if item.get("snippet"):
                parts.append(f"  内容片段：{item['snippet']}")
            if item.get("link"):
                parts.append(f"  链接：{item['link']}")
            parts.append("")

    user_message = "\n".join(parts)

    try:
        resp = requests.post(
            f"{AI_API_BASE}/chat/completions",
            headers={
                "Authorization": f"Bearer {AI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": AI_MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
                "temperature": 0.7,
                "max_tokens": 2500,
            },
            timeout=REQUEST_TIMEOUT * 4,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]

    except requests.RequestException as e:
        # Retry once with longer timeout
        try:
            resp = requests.post(
                f"{AI_API_BASE}/chat/completions",
                headers={
                    "Authorization": f"Bearer {AI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": AI_MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_message[:3000]},
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2000,
                },
                timeout=REQUEST_TIMEOUT * 6,
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
        except Exception:
            return f"[AI分析暂时不可用: {e}]"
    except Exception as e:
        return f"[AI分析出错: {e}]"
