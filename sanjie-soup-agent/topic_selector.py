import json
import os
from datetime import datetime
from openai import OpenAI
from config import (
    DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL,
    SOUP_MENU, SNACK_MENU, DRINK_MENU,
    TOPIC_TYPES, SHOP_NAME, SHOP_LOCATION, SHOP_PERSONA,
    HISTORY_FILE,
)


def build_menu_text() -> str:
    """构建菜单文本供AI理解。"""
    lines = ["## 汤品菜单"]
    for s in SOUP_MENU:
        lines.append(f"- {s['name']}（{s['effect']}）{s['price']}元")
    lines.append("\n## 小吃")
    for s in SNACK_MENU:
        lines.append(f"- {s['name']} {s['price']}元")
    lines.append("\n## 饮品/主食")
    for d in DRINK_MENU:
        lines.append(f"- {d['name']} {d['price']}元")
    return "\n".join(lines)


def load_history() -> list[dict]:
    """加载已发布主题历史。"""
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    return []


def save_to_history(topic: str, script_title: str):
    """保存今日主题到历史记录，用于防重复。"""
    history = load_history()
    history.append({
        "date": datetime.now().strftime("%Y-%m-%d"),
        "topic": topic,
        "title": script_title,
    })
    # 仅保留最近30条
    history = history[-30:]
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)


def select_topic(competitor_summary: str) -> dict:
    """调用DeepSeek API选定今日视频主题。"""
    if not DEEPSEEK_API_KEY:
        return _fallback_topic()

    client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)

    menu_text = build_menu_text()
    history = load_history()
    recent_15 = history[-15:]
    history_text = "\n".join(
        f"- {h['date']}: {h['topic']} | 标题: {h.get('title', '')}" for h in recent_15
    ) if recent_15 else "暂无历史记录"

    now = datetime.now()
    season_info = _get_season_info(now)

    prompt = f"""你是{SHOP_NAME}（{SHOP_LOCATION}）的视频内容策划师。
{SHOP_PERSONA}

## 菜单
{menu_text}

## 近15天已发布主题（严禁重复，必须避开）
{history_text}

## 竞品动态
{competitor_summary}

## 时令信息
{season_info}

## 可选选题类型
{chr(10).join(f'{i+1}. {t}' for i, t in enumerate(TOPIC_TYPES))}

请从以下角度综合判断，选出今日最佳视频主题：
1. **硬性规则：15天内已发布的汤品+选题类型组合绝对不能重复使用。**
    - 如果某汤品已在15天内出现过，必须选不同的汤品。
    - 如果某种切入角度近期已用，必须换一个新角度。
2. 参考竞品热门方向但要有差异化
3. 结合当前季节/天气，选最应季的汤品
4. 优先选择价格适中、受众广的汤品（13-18元价位）

请严格按JSON格式返回：
{{"topic_type": "选题类型", "main_soup": "主打汤品名称", "angle": "切入角度（一句话）", "reason": "选题理由（为什么今天选这个）", "target_audience": "目标人群"}}"""

    try:
        resp = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
            max_tokens=500,
        )
        text = resp.choices[0].message.content.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        topic_info = json.loads(text)

        # 硬校验：15天内不得重复
        if _is_topic_duplicate(topic_info, recent_15):
            print("  ⚠ 检测到15天内重复主题，自动重试...")
            excluded = _build_exclusion_list(recent_15)
            retry_prompt = prompt + f"\n\n⚠ 以下主题在15天内已使用过，请严格避开：\n{excluded}\n请重新选择一个完全不同的汤品和角度。"
            resp = client.chat.completions.create(
                model="deepseek-chat",
                messages=[{"role": "user", "content": retry_prompt}],
                temperature=0.9,
                max_tokens=500,
            )
            text = resp.choices[0].message.content.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0]
            topic_info = json.loads(text)

        return topic_info
    except Exception:
        return _fallback_topic()


def _get_season_info(now: datetime) -> str:
    month = now.month
    if month in [3, 4, 5]:
        return "春季，潮湿回南天，适合祛湿类汤品（菜干猪肺汤、海带排骨汤、鸡骨草排骨）"
    elif month in [6, 7, 8]:
        return "夏季，炎热，适合清热降火类汤品（玉米排骨汤、莲藕排骨汤）"
    elif month in [9, 10, 11]:
        return "秋季，干燥转凉，适合滋补润肺类汤品（花旗参乌鸡汤、板栗煲老鸡汤、猪脚花生汤）"
    else:
        return "冬季，寒冷，适合驱寒暖胃类汤品（胡椒猪肚鸡汤、当归羊肉汤、滋补牛鞭汤）"


def _is_topic_duplicate(topic_info: dict, recent_history: list[dict]) -> bool:
    """检查选题是否在近期历史中重复。

    判断标准：主打汤品相同 且 选题类型相同 → 视为重复。
    """
    main_soup = topic_info.get("main_soup", "").strip()
    topic_type = topic_info.get("topic_type", "").strip()

    if not main_soup or not topic_type:
        return False

    for h in recent_history:
        h_topic = h.get("topic", "")
        if main_soup in h_topic and topic_type in h_topic:
            return True
    return False


def _build_exclusion_list(recent_history: list[dict]) -> str:
    """构建近期已用主题的排除列表文本。"""
    lines = []
    for h in recent_history:
        lines.append(f"- {h['date']}: {h.get('topic', '')}")
    return "\n".join(lines)


def _fallback_topic() -> dict:
    return {
        "topic_type": "单品深挖",
        "main_soup": "花旗参乌鸡汤",
        "angle": "花旗参乌鸡足料慢炖，16蚊补血养颜",
        "reason": "秋季应季滋补，花旗参乌鸡汤受众广、价格适中",
        "target_audience": "东凤上班族女性、社区居民",
    }
