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

    prompt = f"""你是{SHOP_NAME}（{SHOP_LOCATION}）的短视频脚本撰写师。
{SHOP_PERSONA}

店铺标语：{SHOP_SLOGAN}

## 今日视频信息
- 选题类型：{topic_type}
- 主打汤品：{soup_name}（{soup_effect}，{soup_price}元）
- 切入角度：{angle}
- 推荐套餐：{soup_name}({soup_price}元)+{combo_snack}+{combo_drink}={combo_price}元

## 脚本要求
- 时长：30-45秒
- 语言：粤语口播风格，接地气，有网感
- 参考风格：可以适当使用"回答我"式的反问句式，加强互动感和情绪张力
- 结构必须包含：
  1. 钩子开头（前3秒抓住注意力，可以是一个问题/反问/惊人事实）
  2. 内容主体（讲汤品特点、功效、做法、性价比）
  3. 结尾CTA（引导点赞/评论/收藏/导航到店）
- 人设：三姐是懂煲汤、接地气、为街坊着想的广东阿姐

## 输出格式
请严格按JSON格式返回（不要markdown代码块）：
{{
  "title": "视频标题（用于封面，15字以内，有吸引力）",
  "hook": "开头钩子（3秒，一句话抓住注意力）",
  "body": "口播正文（30-35秒，分2-3小段）",
  "cta": "结尾行动号召（引导点赞收藏评论到店）",
  "full_script": "完整口播文案（钩子+正文+CTA，可直接读稿）",
  "hashtags": ["话题标签1", "话题标签2", ...],
  "scene_notes": ["分镜1：画面建议", "分镜2：画面建议", ...]
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
    """根据脚本生成各平台发布文案。"""
    title = script.get("title", "")
    full_script = script.get("full_script", "")
    hashtags = script.get("hashtags", [])
    tags_str = " ".join(hashtags) if hashtags else ""

    posts = {}
    for platform, config in PLATFORMS.items():
        platform_tags = " ".join(config["hashtags"][:4])
        all_tags = f"{tags_str} {platform_tags}".strip()

        if platform == "小红书":
            posts[platform] = {
                "title": f"{title}\n\n{full_script[:300]}...\n\n📍{SHOP_LOCATION}\n💰人均15-25蚊\n\n{all_tags}",
                "note": "小红书正文支持长文案，已自动截取脚本前300字作为正文"
            }
        elif platform == "美团/大众点评":
            posts[platform] = {
                "title": f"{title} | {SHOP_NAME}",
                "note": "美团以图片+短文案为主，建议配4-6张汤品实拍图上传",
                "tags": all_tags,
            }
        else:
            posts[platform] = {
                "title": f"{title}\n\n{all_tags}",
                "note": f"建议发布时段：{' / '.join(config['best_times'])}",
            }

    return posts


def _fallback_script(topic_info: dict) -> dict:
    soup_name = topic_info.get("main_soup", "老火靓汤")
    soup_info = next((s for s in SOUP_MENU if s["name"] == soup_name), None)
    soup_price = soup_info["price"] if soup_info else "?"
    soup_effect = soup_info["effect"] if soup_info else "?"

    return {
        "title": f"东凤街坊都话正！{soup_name}{soup_price}蚊",
        "hook": f"喂！你仲未饮过{soup_name}？我问你，{soup_price}蚊喺东凤可以做啲乜？",
        "body": f"我呢度{soup_name}，{soup_effect}，足料足火候。每朝凌晨起身开火，瓦罐慢炖几个钟，一滴味精都唔落。饮过嘅街坊都话：比阿妈煲嘅仲正！",
        "cta": f"三姐老火靓汤，东凤镇等你。钟意饮汤嘅朋友，点赞收藏，带朋友一齐嚟！",
        "full_script": "",
        "hashtags": ["#东凤美食", "#老火靓汤", "#中山探店", f"#{soup_name}"],
        "scene_notes": [
            "画面1：瓦罐汤热气腾腾特写（实拍素材）",
            "画面2：三姐舀汤动作（实拍素材）",
            "画面3：后厨凌晨煲汤（实拍素材）",
            "画面4：食客喝汤满足表情（实拍素材）",
            "画面5：门头招牌+Google地图定位截图",
        ],
    }
