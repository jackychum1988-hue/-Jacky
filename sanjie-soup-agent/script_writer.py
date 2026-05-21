import json
from openai import OpenAI
from config import (
    DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL,
    SOUP_MENU, SNACK_MENU, DRINK_MENU,
    SHOP_NAME, SHOP_LOCATION, SHOP_SLOGAN, SHOP_PERSONA,
    PLATFORMS,
)


def build_script(topic_info: dict) -> dict:
    """调用DeepSeek API生成完整口播脚本和分镜。"""
    if not DEEPSEEK_API_KEY:
        return _fallback_script(topic_info)

    client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)

    soup_name = topic_info.get("main_soup", "")
    angle = topic_info.get("angle", "")
    topic_type = topic_info.get("topic_type", "")

    # 找到对应汤品信息
    soup_info = next((s for s in SOUP_MENU if s["name"] == soup_name), None)
    soup_price = soup_info["price"] if soup_info else "?"
    soup_effect = soup_info["effect"] if soup_info else "?"

    # 推荐搭配套餐
    cheap_snacks = [s for s in SNACK_MENU if s["price"] <= 6]
    cheap_drinks = [d for d in DRINK_MENU if d["price"] <= 4]
    combo_snack = cheap_snacks[0]["name"] if cheap_snacks else "小笼包"
    combo_drink = cheap_drinks[0]["name"] if cheap_drinks else "豆奶"
    combo_price = soup_price + (cheap_snacks[0]["price"] if cheap_snacks else 6) + (cheap_drinks[0]["price"] if cheap_drinks else 3)

    prompt = f"""你是{SHOP_NAME}（{SHOP_LOCATION}）的抖音短视频脚本撰写师。
{SHOP_PERSONA}

店铺标语：{SHOP_SLOGAN}

## 今日视频信息
- 选题类型：{topic_type}
- 主打汤品：{soup_name}（{soup_effect}，{soup_price}元）
- 切入角度：{angle}
- 推荐套餐：{soup_name}({soup_price}元)+{combo_snack}+{combo_drink}={combo_price}元

## 脚本要求（抖音专属）
- 时长：20-35秒（抖音黄金时长，不超35秒）
- 语言：粤语口播风格，接地气，有网感
- 固定开场白：每条必须以「饮汤啦！我系东凤三姐～」开头（这条不算在钩子里）
- 节奏：每5-8秒一个信息转折，保持注意力不滑落
- 参考风格："回答我"式反问句式，加强互动感和情绪张力
- 结构必须包含：
  1. 开场白：「饮汤啦！我系东凤三姐～」
  2. 强钩子（前1.5秒必须抓注意力——可以是反问/惊人事实/价格冲击）
  3. 内容主体（讲汤品特点、功效、做法、性价比，分2-3个节奏点）
  4. 互动钩子（抛一个问题给观众，引导评论区互动）
  5. 结尾CTA（引导点赞/收藏/导航到店）
- 人设：三姐是懂煲汤、接地气、为街坊着想的广东阿姐
- 关键信息（价格、功效）用口语重复强调至少两次
- 结尾加入固定互动话术：「你今日饮咗汤未？评论区话我知～」

## 输出格式
请严格按JSON格式返回（不要markdown代码块）：
{{
  "title": "视频标题（用于封面，15字以内，有吸引力，含emoji）",
  "hook": "强钩子（前1.5秒，一句有冲击力的话，不含开场白）",
  "body": "口播正文（15-25秒，分2-3个节奏点，每段不超过8秒）",
  "interaction": "互动问题（抛给观众，引发评论区讨论）",
  "cta": "结尾行动号召（引导点赞收藏到店，含固定互动话术）",
  "full_script": "完整口播文案（开场白+钩子+正文+互动+CTA，可直接读稿）",
  "hashtags": ["话题标签1", "话题标签2", ...],
  "scene_notes": ["分镜1：画面建议+字幕强调点", "分镜2：画面建议+字幕强调点", ...]
}}"""

    try:
        resp = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.9,
            max_tokens=1000,
        )
        text = resp.choices[0].message.content.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 0)[0]
        return json.loads(text)
    except Exception:
        return _fallback_script(topic_info)


def build_platform_posts(script: dict) -> dict:
    """生成抖音发布文案。"""
    title = script.get("title", "")
    hashtags = script.get("hashtags", [])
    tags_str = " ".join(hashtags) if hashtags else ""

    config = PLATFORMS.get("抖音", {})
    platform_tags = " ".join(config.get("hashtags", []))
    all_tags = f"{tags_str} {platform_tags}".strip()

    return {
        "抖音": {
            "title": f"{title}\n\n{all_tags}",
            "note": f"建议发布时段：{' / '.join(config.get('best_times', ['11:30-12:30', '17:30-18:30']))}",
        }
    }


def _fallback_script(topic_info: dict) -> dict:
    soup_name = topic_info.get("main_soup", "老火靓汤")
    soup_info = next((s for s in SOUP_MENU if s["name"] == soup_name), None)
    soup_price = soup_info["price"] if soup_info else "?"
    soup_effect = soup_info["effect"] if soup_info else "?"

    opening = "饮汤啦！我系东凤三姐～"

    return {
        "title": f"🔥东凤街坊都话正！{soup_name}{soup_price}蚊",
        "hook": f"喂！{soup_price}蚊喺东凤可以食到啲乜？连个饭盒都买唔到啦！",
        "body": f"我呢度{soup_name}，{soup_effect}，足料足火候。每日凌晨起身开火，瓦罐慢炖几个钟，一滴味精都唔落。饮过嘅街坊都话：比阿妈煲嘅仲正！",
        "interaction": f"你哋平时最钟意饮咩汤？留言话我知，下次三姐亲手煲俾你试！",
        "cta": f"钟意饮汤嘅朋友，点赞收藏，带朋友一齐嚟东凤揾三姐！你今日饮咗汤未？评论区话我知～",
        "full_script": f"{opening}\n喂！{soup_price}蚊喺东凤可以食到啲乜？连个饭盒都买唔到啦！\n我呢度{soup_name}，{soup_effect}，足料足火候。每日凌晨起身开火，瓦罐慢炖几个钟，一滴味精都唔落。饮过嘅街坊都话：比阿妈煲嘅仲正！\n你哋平时最钟意饮咩汤？留言话我知，下次三姐亲手煲俾你试！\n钟意饮汤嘅朋友，点赞收藏，带朋友一齐嚟东凤揾三姐！你今日饮咗汤未？评论区话我知～",
        "hashtags": ["#东凤美食", "#老火靓汤", "#中山探店", f"#{soup_name}", "#三姐煲汤"],
        "scene_notes": [
            "画面1：三姐面对镜头微笑+「饮汤啦」大字标题动画（品牌色黄底红字）- 开场白",
            "画面2：瓦罐汤热气腾腾特写+BGM切入 - 对应钩子",
            "画面3：凌晨后厨煲汤过程快放 - 对应「凌晨起身开火」",
            "画面4：汤品舀起特写（慢动作）+价格标签浮层「仅售XX元」- 对应价格强调",
            "画面5：食客喝汤满足表情抓拍 - 对应「比阿妈煲嘅仲正」",
            "画面6：片尾：门头招牌+地址定位+营业时间+「点赞收藏」动画引导",
        ],
    }
