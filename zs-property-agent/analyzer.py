"""AI-powered real estate news analyzer via OpenAI-compatible API (DeepSeek default)."""
import requests
from config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL, REQUEST_TIMEOUT

SYSTEM_PROMPT = """你是一位资深房地产分析师，为"港人中山置业通Jacky"频道提供每日市场情报分析。目标观众是计划在中山买楼的香港人。

你的任务：
1. **严格筛选**：只保留与「房地产」直接相关的内容。以下类型必须排除：
   - 家具、家电、装修、家居装饰类新闻（如床垫发布、家电促销等）
   - 纯社会新闻、娱乐新闻、体育新闻
   - 汽车、美食、旅游等与房产无关的内容
   - 如果某条内容边缘相关（如商业地产影响住宅市场），可保留但需说明关联性

2. **深度提取**：对每条保留的内容提取：
   - 核心事实（发生了什么）
   - 数据/政策要点（具体数字、政策名称、影响范围）
   - 对香港买家在中山置业的实际影响
   - 香港地产新闻重点关注：房价走势、利率变化、政策调整、以及如何影响港人北上买楼意愿

3. **逻辑串联**：将中山+香港+财经新闻串联分析：
   - 香港楼市跌/升 → 港人北上中山置业意愿变化
   - 利率/汇率变化 → 对跨境买房决策的影响
   - 大湾区政策 → 中山在湾区的定位和机会
   - 多条新闻指向同一趋势时，归纳总结

4. **输出格式**：严格按以下Markdown结构输出，每部分控制在2-5条精华内容：

## 📊 今日市场速览
（2-3句话概括今天最重要的市场动态，涵盖中山+香港+财经，让香港买家快速了解大局）

## 🏛 政策与城建（中山）
格式：**标题**：要点分析 → 对港人买房的影响 [原文](链接)

## 🏗 新盘与市场动态（中山）
格式：**项目名/动态**：分析 → 区域影响/投资价值判断 [原文](链接)

## 🇭🇰 香港楼市焦点
（香港地产新闻分析，重点：如何影响港人北上中山置业）
格式：**标题**：要点分析 [原文](链接)

## 💰 财经要闻与置业影响
（利率/汇率/经济政策等，分析对跨境置业决策的影响）
格式：**标题**：要点 → 对置业决策的影响 [原文](链接)

## 🎙 博主观点精选
格式：**博主名**：核心观点 → 我的分析 [来源](链接)

## 💡 Jacky今日话题建议
（基于今天的内容，推荐2-3个适合拍视频的话题角度，吸引香港买家）

重要规则：
- 如果某个类别今天没有相关内容，写"今日暂无相关动态"
- 每条分析控制在100-200字，精炼有力
- 用粤语/香港用词风格（如"買樓"、"上車"、"筍盤"、"呎價"、"經紀"、"按揭"、"首期"、"供款"）
- 链接格式：[原文](完整URL)
- 绝对不要输出家具/家电/装修等非房产内容"""


def analyze(items_by_source: dict) -> str:
    """Send collected items to LLM and return the analytical report."""
    if not DEEPSEEK_API_KEY:
        return ""

    parts = ["今日收集到的中山+香港地产+财经资讯：\n"]

    # Category 1: Zhongshan news/policy
    zs_items = items_by_source.get("zs_gov", []) + items_by_source.get("zs_news", [])
    if zs_items:
        parts.append("## 中山楼市新闻/政策")
        for item in zs_items:
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

    # Category 2: New projects
    anjuke_items = items_by_source.get("anjuke", [])
    if anjuke_items:
        parts.append("## 中山新盘")
        for item in anjuke_items:
            parts.append(f"- 标题：{item.get('title', '')}")
            if item.get("price"):
                parts.append(f"  价格：{item['price']}")
            if item.get("area"):
                parts.append(f"  区域：{item['area']}")
            if item.get("tags"):
                parts.append(f"  标签：{', '.join(item['tags'])}")
            if item.get("link"):
                parts.append(f"  链接：{item['link']}")
            parts.append("")

    # Category 3: HK property news
    hk_items = items_by_source.get("hk_news", [])
    if hk_items:
        parts.append("## 香港地产新闻")
        for item in hk_items:
            parts.append(f"- 标题：{item.get('title', '')}")
            if item.get("snippet"):
                parts.append(f"  内容片段：{item['snippet']}")
            if item.get("link"):
                parts.append(f"  链接：{item['link']}")
            parts.append("")

    # Category 4: Finance news
    finance_items = items_by_source.get("finance", [])
    if finance_items:
        parts.append("## 财经资讯")
        for item in finance_items:
            parts.append(f"- 标题：{item.get('title', '')}")
            if item.get("snippet"):
                parts.append(f"  内容片段：{item['snippet']}")
            if item.get("link"):
                parts.append(f"  链接：{item['link']}")
            parts.append("")

    # Category 5: Social/blogger
    social_sources = ("douyin", "xiaohongshu", "bilibili", "youtube", "facebook")
    social_items = []
    for src in social_sources:
        social_items.extend(items_by_source.get(src, []))
    if social_items:
        parts.append("## 博主/社交媒体")
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
            f"{DEEPSEEK_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": DEEPSEEK_MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
                "temperature": 0.7,
                "max_tokens": 3000,
            },
            timeout=REQUEST_TIMEOUT * 4,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]

    except requests.RequestException as e:
        try:
            resp = requests.post(
                f"{DEEPSEEK_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": DEEPSEEK_MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_message[:4000]},
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2500,
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
