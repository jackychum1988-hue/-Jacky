"""DeepSeek AI analyzer for KOL competitor content — daily + weekly modes."""
import json
import requests
from config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL, REQUEST_TIMEOUT

DAILY_SYSTEM_PROMPT = """你是港人中山置业KOL竞品分析助手，为"港人中山置业通Jacky"提供每日竞品快讯分析。

目标观众：计划在中山买楼的香港人。Jacky的内容支柱：
- 带客看房纪实（50%）— 带香港客户实地睇楼、成交故事、客户反馈
- 专业知识/港中对比（30%）— 按揭、税费、政策、深中通道、港中生活对比
- 售后日常/个人生活（20%）— 代客收楼、装修、台风天关窗、中山生活日常

对以下今日抓取的竞品内容进行分析：

1. 【发布动态】逐条摘要，每条≤30字
2. 【今日热词】提取TOP10高频关键词（排除通用词：楼盘、中山、买房、大湾区），格式：关键词(出现次数)
3. 【话题风向】识别今日最热2-3个话题方向，每个≤15字
4. 【差异化选题】基于竞品话题，结合Jacky三大内容支柱，输出2-3个今日可拍的选题建议：
   - 标题（吸引香港买家点击）
   - 切入角度（为什么这样切入）
   - 与竞品的差异（竞品在讲什么，Jacky可以讲什么不同）

重要规则：
- 用粤语/香港用词风格（買樓、上車、筍盤、呎價、按揭、首期、供款）
- 每条建议100-150字，精炼有力
- 如果今天没有竞品数据，如实说明
- Markdown格式输出"""

WEEKLY_SYSTEM_PROMPT = """你是港人中山置业KOL竞品分析专家，为"港人中山置业通Jacky"提供每周深度竞品分析报告。

Jacky的内容支柱：
- 带客看房纪实（50%）— 带香港客户实地睇楼、成交故事、客户反馈
- 专业知识/港中对比（30%）— 按揭、税费、政策、深中通道、港中生活对比
- 售后日常/个人生活（20%）— 代客收楼、装修、台风天关窗、中山生活日常

对以下本周竞品数据（7天汇总）进行深度分析：

1. 【本周概览】总内容数、活跃KOL数、总互动量，用2-3句话总结本周竞品动态
2. 【话题趋势】TOP5话题及时间序列，标注上升↗/下降↘/持平→趋势
3. 【关键词排行榜】TOP20关键词+出现次数，标注🆕新兴关键词（本周首次大量出现）
4. 【爆款拆解】互动量TOP3内容深度拆解：
   - Hook方式（痛点型/数据型/故事型/对比型/恐吓型）
   - 内容结构（开头-中间-结尾的时间线）
   - 情绪触发点
   - 为什么这条能火？
5. 【蓝海发现】竞品完全没覆盖但港人关注的中山置业话题（2-3个）
6. 【差异化选题建议】3-5个本周选题，每个含：
   - 标题 + 内容支柱归类
   - 切入角度
   - 与竞品的差异化对比（竞品讲什么 vs Jacky讲什么）
   - 预计受众情绪反应
7. 【下周预测】基于历史趋势预判下周可能的1-2个热点

重要规则：
- 粤语/香港用词风格（買樓、上車、筍盤、呎價、按揭、首期、供款）
- 数据驱动，拒绝空泛建议
- Markdown格式输出，2000-3000字"""


def _call_deepseek(system_prompt: str, user_message: str, max_tokens: int = 3000) -> str:
    """Call DeepSeek API with retry on failure."""
    if not DEEPSEEK_API_KEY:
        return "[AI分析暂不可用：未配置 DEEPSEEK_API_KEY]"

    for attempt in range(2):
        try:
            truncated = user_message if attempt == 0 else user_message[:4000]
            resp = requests.post(
                f"{DEEPSEEK_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": DEEPSEEK_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": truncated},
                    ],
                    "temperature": 0.7,
                    "max_tokens": max_tokens,
                },
                timeout=REQUEST_TIMEOUT * 4,
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
        except requests.RequestException as e:
            if attempt == 0:
                print(f"[analyzer] retry after error: {e}")
                continue
            return f"[AI分析暂时不可用: {e}]"
        except Exception as e:
            return f"[AI分析出错: {e}]"


def _build_items_text(items: list) -> str:
    if not items:
        return "今日暂无竞品数据。"
    lines = []
    for i, item in enumerate(items, 1):
        lines.append(f"{i}. [{item.get('platform', '')}] {item.get('author', '')}: {item.get('title', '')}")
        if item.get("description"):
            lines.append(f"   描述: {item['description'][:120]}")
        eng = item.get("engagement", {})
        if eng:
            parts = []
            if eng.get("views"):
                parts.append(f"观看{eng['views']}")
            if eng.get("likes"):
                parts.append(f"点赞{eng['likes']}")
            if eng.get("comments"):
                parts.append(f"评论{eng['comments']}")
            if parts:
                lines.append(f"   互动: {', '.join(parts)}")
        if item.get("published_at"):
            lines.append(f"   时间: {item['published_at']}")
    return "\n".join(lines)


def _load_history() -> dict:
    try:
        with open("history.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"weeks": {}}


def analyze_daily(items: list) -> str:
    user_message = "今日竞品内容：\n\n" + _build_items_text(items)
    return _call_deepseek(DAILY_SYSTEM_PROMPT, user_message, max_tokens=2000)


def analyze_weekly(items: list, week_label: str) -> str:
    history = _load_history()
    prev_weeks = history.get("weeks", {})

    user_message = f"本周（{week_label}）竞品内容汇总：\n\n"
    user_message += _build_items_text(items)
    user_message += "\n\n历史数据参考：\n"
    user_message += json.dumps(prev_weeks, ensure_ascii=False, indent=2)[:2000]

    return _call_deepseek(WEEKLY_SYSTEM_PROMPT, user_message, max_tokens=4000)
