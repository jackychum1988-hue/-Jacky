import json
import os
from datetime import datetime
from config import (
    DEEPSEEK_API_KEY, deepseek_chat,
    SOUP_MENU, SNACK_MENU, DRINK_MENU,
    TOPIC_TYPES, SHOP_NAME, SHOP_LOCATION, SHOP_PERSONA,
    HISTORY_FILE, SOUP_HOOK_MAP,
)


def build_menu_text() -> str:
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
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    return []


def save_to_history(topic: str, script_title: str):
    history = load_history()
    history.append({
        "date": datetime.now().strftime("%Y-%m-%d"),
        "topic": topic,
        "title": script_title,
    })
    history = history[-30:]
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)


def select_topic(competitor_summary: str) -> dict:
    """调用 DeepSeek API 选定今日视频主题。"""
    if not DEEPSEEK_API_KEY:
        return _fallback_topic()

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

请综合判断，选出今日最佳视频主题：
1. **硬性规则：15天内已发布的汤品+选题类型组合绝对不能重复。**
2. **优先「经验分享」和「单品深挖」**：这两类内容卖点+经验感最强，最容易出爆款。
3. 参考竞品热门方向和爆款文案模式，但要做出差异化。
4. 结合当前季节/天气，选最应季的汤品。
5. 优先选择价格适中、受众广的汤品（13-18元价位）。

严格按 JSON 返回：
{{"topic_type": "选题类型", "main_soup": "主打汤品名称", "angle": "切入角度（一句话）", "reason": "选题理由", "target_audience": "目标人群"}}"""

    try:
        text = deepseek_chat(prompt, max_tokens=500, temperature=0.8)
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        topic_info = json.loads(text)

        raw_type = topic_info.get("topic_type", "")
        if "：" in raw_type:
            topic_info["topic_type"] = raw_type.split("：")[0]

        if _is_topic_duplicate(topic_info, recent_15):
            print("  ⚠ 检测到15天内重复主题，自动重试...")
            excluded = _build_exclusion_list(recent_15)
            retry_prompt = prompt + f"\n\n⚠ 以下主题在15天内已使用过，请严格避开：\n{excluded}\n请重新选择一个完全不同的汤品和角度。"
            text = deepseek_chat(retry_prompt, max_tokens=500, temperature=0.9)
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0]
            topic_info = json.loads(text)
            raw_type = topic_info.get("topic_type", "")
            if "：" in raw_type:
                topic_info["topic_type"] = raw_type.split("：")[0]

        return topic_info
    except Exception as e:
        print(f"  ❌ DeepSeek API选題失败: {e}")
        import traceback
        traceback.print_exc()
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
        return "冬季，寒冷，适合暖身暖胃类汤品（胡椒猪肚鸡汤、当归羊肉汤、滋补牛鞭汤）"


def _is_topic_duplicate(topic_info: dict, recent_history: list[dict]) -> bool:
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
    return "\n".join(f"- {h['date']}: {h.get('topic', '')}" for h in recent_history)


def _fallback_topic() -> dict:
    history = load_history()
    recent_15 = history[-15:]

    used_soups = set()
    used_types = set()
    for h in recent_15:
        topic = h.get("topic", "")
        for s in SOUP_MENU:
            if s["name"] in topic:
                used_soups.add(s["name"])
        for t in TOPIC_TYPES:
            if t.split("：")[0] in topic:
                used_types.add(t.split("：")[0])

    available = [s for s in SOUP_MENU if s["name"] not in used_soups]
    if not available:
        available = SOUP_MENU

    now = datetime.now()
    month = now.month
    if month in [3, 4, 5]:
        seasonal = ["菜干猪肺汤", "海带排骨汤", "鸡骨草排骨"]
    elif month in [6, 7, 8]:
        seasonal = ["玉米排骨汤", "莲藕排骨汤"]
    elif month in [9, 10, 11]:
        seasonal = ["花旗参乌鸡汤", "板栗煲老鸡汤", "猪脚花生汤"]
    else:
        seasonal = ["胡椒猪肚鸡汤", "当归羊肉汤", "滋补牛鞭汤"]

    available.sort(key=lambda s: (s["name"] not in seasonal, s["name"]))
    soup = available[0]

    all_types = [t.split("：")[0] for t in TOPIC_TYPES]
    available_types = [t for t in all_types if t not in used_types]
    if not available_types:
        available_types = all_types
    priority = ["经验分享", "单品深挖"]
    topic_type = next((t for t in priority if t in available_types), available_types[0])

    return {
        "topic_type": topic_type,
        "main_soup": soup["name"],
        "angle": f"{soup['name']}怎么煲才好喝？三姐分享十几年经验",
        "reason": f"离线模式：按季节和历史轮换，优先{topic_type}类型",
        "target_audience": "东凤上班族、社区家庭、养生爱好者",
    }
