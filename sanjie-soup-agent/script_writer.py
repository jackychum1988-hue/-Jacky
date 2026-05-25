import json
from openai import OpenAI
from config import (
    DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL,
    SOUP_MENU, SNACK_MENU, DRINK_MENU, SOUP_HOOK_MAP,
    SHOP_NAME, SHOP_LOCATION, SHOP_SLOGAN, SHOP_PERSONA,
    PLATFORMS,
)


def build_script(topic_info: dict, recent_titles: list[str] | None = None) -> dict:
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

    # 近期标题排除
    exclusion_block = ""
    if recent_titles:
        exclusion_block = "## 15天内已发布的标题（严禁重复使用）\n" + "\n".join(
            f"- {t}" for t in recent_titles
        ) + "\n请确保今日标题与以上完全不同。\n\n"

    # 汤品专属钩子
    hook_info = SOUP_HOOK_MAP.get(soup_name, {})
    hook_angle = hook_info.get("hook_angle", "")
    hook_visual = hook_info.get("visual", "")
    hook_sample = hook_info.get("sample_hook", "")

    prompt = f"""你是{SHOP_NAME}（{SHOP_LOCATION}）的抖音短视频脚本撰写师。
{SHOP_PERSONA}

店铺标语：{SHOP_SLOGAN}

{exclusion_block}## 今日视频信息
- 选题类型：{topic_type}
- 主打汤品：{soup_name}（{soup_effect}，{soup_price}元）
- 切入角度：{angle}
- 推荐套餐：{soup_name}({soup_price}元)+{combo_snack}+{combo_drink}={combo_price}元
- 🎯 钩子方向：{hook_angle}
- 🎬 对应画面：{hook_visual}
- 📝 钩子参考句式：{hook_sample}

## 🔴 前三秒黄金法则（严格遵守）

⚠ **前三秒绝对不允许用「饮汤啦！我系东凤三姐～」开头！**

开场白移到 CTA 之前，用于收尾。前三秒必须直接进入画面+钩子：

```
第1帧(0-1.5s)：制作过程动作特写 + 大字标题（钩子句，黄字黑边）
第2帧(1.5-5s)：三姐画外音念钩子文案，画面继续展示制作过程
第3帧(5-18s)：制作穿插——边展示边讲解，每5秒切换一个画面步骤
第4帧(18-25s)：成品汤品特写 + 大字「仅售{soup_price}元」+ 功效标签浮层
第5帧(25-28s)：互动钩子——抛问题给观众
第6帧(28-35s)：三姐出镜/门头 + 「饮汤啦！我系东凤三姐～」+ 行动号召
```

## 钩子要求

- 必须围绕**该汤品的制作工艺/食材处理**展开，不能只讲价格
- 用「不...就...」「等于...」「你做错咗...」「...系假嘅！」句式制造紧迫感
- 钩子句 = 视频第一帧的大字标题，要简洁有力（12字以内）
- 钩子句必须和画面同步——嘴巴说「猪肺洗唔干净」，画面就要看到猪肺在冲洗

## 画面穿插要求（重点⚠）

每个口播段落必须标注对应的画面，格式：
```
【口播】猪肺一定要灌水冲到水清，冲唔干净等于饮污糟水
【画面】猪肺在水龙头下灌水冲洗特写，水从浑浊变清澈
```

文案和画面必须一一对应，不可出现「口播讲功效、画面拍门头」的脱节。

## 基本要求
- 时长：20-35秒（抖音黄金时长，不超35秒）
- 语言：粤语口播风格，接地气，有网感
- 节奏：每5-8秒一个信息转折
- 人设：三姐是懂煲汤、接地气、为街坊着想的广东阿姐
- 关键信息（价格、功效）重复强调至少两次
- 结尾固定互动：「你今日饮咗汤未？评论区话我知～」

## 输出格式
返回JSON（不要markdown代码块）：
{{
  "title": "视频标题（封面用，15字以内，含emoji，有冲击力）",
  "hook": "钩子句（前1.5秒大字标题，12字以内，制作工艺相关）",
  "hook_voiceover": "钩子画外音（三姐念钩子的完整句子，可与hook展开不同）",
  "body": "制作穿插文案（15-18秒，每段标注[口播]+[画面]，分2-3个步骤）",
  "interaction": "互动问题（抛给观众引发评论）",
  "cta": "结尾CTA（含「饮汤啦！我系东凤三姐～」+行动号召+固定互动）",
  "full_script": "完整口播文案（画外音钩子+穿插讲解+互动+CTA，可直接读稿）",
  "hashtags": ["标签1", "标签2", ...],
  "scene_notes": ["分镜1：动作描述+字幕内容", "分镜2：动作描述+字幕内容", ...]
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
    except Exception as e:
        print(f"  ❌ DeepSeek API脚本生成失败: {e}")
        import traceback
        traceback.print_exc()
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

    hook_info = SOUP_HOOK_MAP.get(soup_name, {})
    sample_hook = hook_info.get("sample_hook", f"喂！{soup_price}蚊喺东凤可以食到啲乜？")
    hook_visual = hook_info.get("visual", f"{soup_name}制作过程特写")

    opening = "饮汤啦！我系东凤三姐～"

    # 用钩子方向构造标题
    if hook_info.get("hook_angle"):
        title = f"⚠{hook_info['hook_angle']}做错咗？{soup_name}{soup_price}蚊"
    else:
        title = f"🔥东凤街坊都话正！{soup_name}{soup_price}蚊"

    return {
        "title": title,
        "hook": sample_hook,
        "hook_voiceover": sample_hook,
        "body": f"【口播】{sample_hook}\n【画面】{hook_visual}\n\n【口播】{soup_name}，{soup_effect}，我三姐每日凌晨起身开火，瓦罐慢炖几个钟，一滴味精都唔落。\n【画面】瓦罐热气腾腾+舀汤慢动作\n\n【口播】饮过嘅街坊都话：比阿妈煲嘅仲正！{soup_price}蚊搞掂！\n【画面】食客喝汤满足表情+价格大字浮层「仅售{soup_price}元」",
        "interaction": f"你哋识唔识{soup_name}点煲？留言话我知你嘅秘方！",
        "cta": f"{opening}\n钟意饮汤嘅朋友，点赞收藏，带朋友一齐嚟东凤揾三姐！你今日饮咗汤未？评论区话我知～",
        "full_script": f"{sample_hook}\n\n{soup_name}，{soup_effect}，我三姐每日凌晨起身开火，瓦罐慢炖几个钟，一滴味精都唔落。\n\n饮过嘅街坊都话：比阿妈煲嘅仲正！{soup_price}蚊搞掂！\n\n你哋识唔识{soup_name}点煲？留言话我知你嘅秘方！\n\n{opening}\n钟意饮汤嘅朋友，点赞收藏，带朋友一齐嚟东凤揾三姐！你今日饮咗汤未？评论区话我知～",
        "hashtags": ["#东凤美食", "#老火靓汤", "#中山探店", f"#{soup_name}", "#三姐煲汤"],
        "scene_notes": [
            f"分镜1（0-1.5s）：{hook_visual} + 大字标题「{sample_hook}」黄字黑边 - 画面钩子",
            f"分镜2（1.5-5s）：继续{hook_visual}，三姐画外音念钩子文案",
            f"分镜3（5-18s）：后厨煲汤过程快放 + 瓦罐特写 + 舀汤慢动作",
            f"分镜4（18-25s）：成品汤品特写 + 大字浮层「仅售{soup_price}元」+ 「{soup_effect}」功效标签",
            "分镜5（25-28s）：三姐出镜/手持汤碗微笑 - 互动提问",
            "分镜6（28-35s）：片尾：门头招牌+地址定位+营业时间+「点赞收藏」动画+开场白字幕「饮汤啦！我系东凤三姐～」",
        ],
    }
