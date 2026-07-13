import json
from config import (
    DEEPSEEK_API_KEY, deepseek_chat,
    SOUP_MENU, SNACK_MENU, DRINK_MENU, SOUP_HOOK_MAP,
    SHOP_NAME, SHOP_LOCATION, SHOP_SLOGAN, SHOP_PERSONA,
    PLATFORMS,
)


def build_script(topic_info: dict, recent_titles: list[str] | None = None) -> dict:
    """调用 DeepSeek API 生成完整普通话口播脚本和分镜。"""
    if not DEEPSEEK_API_KEY:
        return _fallback_script(topic_info)

    soup_name = topic_info.get("main_soup", "")
    angle = topic_info.get("angle", "")
    topic_type = topic_info.get("topic_type", "")

    soup_info = next((s for s in SOUP_MENU if s["name"] == soup_name), None)
    soup_price = soup_info["price"] if soup_info else "?"
    soup_effect = soup_info["effect"] if soup_info else "?"

    cheap_snacks = [s for s in SNACK_MENU if s["price"] <= 6]
    cheap_drinks = [d for d in DRINK_MENU if d["price"] <= 4]
    combo_snack = cheap_snacks[0]["name"] if cheap_snacks else "小笼包"
    combo_drink = cheap_drinks[0]["name"] if cheap_drinks else "豆奶"
    combo_price = soup_price + (cheap_snacks[0]["price"] if cheap_snacks else 6) + (cheap_drinks[0]["price"] if cheap_drinks else 3)

    exclusion_block = ""
    if recent_titles:
        exclusion_block = "## ⚠ 15天内已发布的标题（严禁重复使用）\n" + "\n".join(
            f"- {t}" for t in recent_titles
        ) + "\n请确保今日标题与以上完全不同。\n\n"

    hook_info = SOUP_HOOK_MAP.get(soup_name, {})
    hook_angle = hook_info.get("hook_angle", "")
    hook_visual = hook_info.get("visual", "")
    hook_sample = hook_info.get("sample_hook", "")
    selling_point = hook_info.get("selling_point", "")
    experience_tip = hook_info.get("experience_tip", "")

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

## 💰 今日核心卖点
{selling_point}

## 📖 今日经验分享
{experience_tip}

---

## 🔴 内容铁律

### 铁律一：前3秒必须有「痛点/好奇/反常识」
❌ 严禁用「大家好我是三姐」「今天给大家介绍...」「来喝汤啦～」开头！
✅ 前3秒必须是：制作过程动作特写 + 一句让人停下来看的话
   - 痛点型：「为什么你在家煲的汤总是不够鲜？」
   - 好奇型：「这个东西九成人都会扔掉，其实它才是宝贝！」
   - 反常识型：「市面上七成花旗参都是假的，教你一眼分辨」

### 铁律二：每条视频必须输出「卖点 + 经验」
- 卖点：这碗汤好在哪？食材怎么挑的？为什么值这个价？——让观众想来喝
- 经验：三姐煲了十几年总结的技巧、踩过的坑——让观众学到东西
- 卖点和经验要自然地穿插在内容里，不要生硬分段

### 铁律三：口播 + 画面必须一一对应
格式：
```
【口播】猪肺一定要灌水冲到水清，很多人这一步偷懒，结果汤又腥又浑
【画面】猪肺在水龙头下灌水冲洗特写，水从浑浊变清澈
```
❌ 严禁「口播讲功效、画面拍门头」的脱节

---

## 🔤 语言要求（最重要！）
- **必须用自然口语化的普通话！**
- 可以带一点广东味（比如「靓汤」「好正」），但全国观众要能听懂
- ❌ 绝对禁止粤语方言词汇：唔、系、咗、嚟、嘅、佢、冇、乜、嘢、蚊（指钱）、咁样
- ✅ 普通话结尾：「喝好汤，来东凤找三姐～」
- ✅ 普通话互动：「你平时在家会煲汤吗？有什么独家秘诀，评论区告诉我～」

---

## 🚨 抖音审核红线（绝对禁止！违反必限流）

### 禁止使用的词语（违禁词表）
❌ 医疗声称：治、疗、药、医、疗效、根治、治愈、康复、疗程
❌ 绝对化用语：最好、第一、独家、唯一、全网、全国第一、最正宗
❌ 功效承诺：保证、一定、肯定能、包你、喝了就、能减肥、能治病
❌ 虚假夸大：胜过XX、比XX强、秒杀、吊打、完爆
❌ 诱导互动：不转不是XX、转发有好运、评论抽奖、点赞送XX、必须关注
❌ 低俗擦边：任何与性暗示相关的词汇
❌ 封建迷信：改运、风水、辟邪、驱魔

### 功效描述的正确方式
❌ 「这碗汤能补肾」→ 医疗声称，违规
✅ 「这碗汤喝完暖暖的，很舒服」→ 个人感受，合规

❌ 「花旗参补血养颜效果一流」→ 功效承诺，违规
✅ 「花旗参味道很香，汤色特别漂亮」→ 描述食材和观感，合规

❌ 「喝了这个汤保证不上火」→ 保证性声称，违规
✅ 「天气热的时候喝一碗，感觉整个人都清爽了」→ 个人体验，合规

❌ 「男人过了40岁一定要喝，补肾壮阳」→ 医疗+性别歧视，严重违规
✅ 「这碗汤用料很足，很多老顾客专门来喝」→ 顾客口碑，合规

### 价格表述规则
❌ 「原价XX现价XX」「史上最低」「亏本卖」
✅ 直接说「XX元一碗」，不对比不夸大

### 标签/话题规则
❌ 用与内容无关的热门标签蹭流量
❌ 用品牌名称做标签（如 #肯德基）
✅ 用内容相关的标签（如 #煲汤 #中山美食）

### 必须标注
- 如果是明显的推广内容，标题需体现真实分享而非硬广
- 展示食品制作过程时，操作要干净卫生（抖音会审核厨房卫生）

---

## 📐 视频结构（20-35秒）

第1帧（0-1.5s）：制作过程动作特写 + 大字标题（钩子句，12字以内，黄字黑边）
第2帧（1.5-5s）：三姐画外音念钩子文案，画面继续展示制作过程
第3帧（5-18s）：制作穿插讲解——边展示操作边分享经验，每5秒切换画面
第4帧（18-25s）：成品汤品特写 + 大字浮层「仅售{soup_price}元」+ 功效标签 + 食材品质展示
第5帧（25-28s）：互动钩子——抛一个跟经验相关的问题引导评论
第6帧（28-35s）：三姐出镜/门头 + 「喝好汤，来东凤找三姐～」+ 点赞收藏关注引导

## 基本要求
- 时长：20-35秒
- 语言：**自然口语化普通话**（重要！不要粤语！）
- 节奏：每5-8秒一个信息点，紧凑不拖沓
- 关键信息（价格、功效）自然提及至少2次
- 结尾互动：「你平时在家会煲汤吗？有什么独家秘诀，评论区告诉我～」

## 输出格式
返回 JSON（不要 markdown 代码块）：
{{
  "title": "视频标题（封面用，15字以内，含emoji，有冲击力）",
  "hook": "钩子句（前1.5秒大字标题，12字以内，痛点/好奇/反常识）",
  "hook_voiceover": "钩子画外音（三姐念钩子的完整普通话句子）",
  "body": "制作穿插文案（每段标注[口播]+[画面]，2-3个步骤，卖点+经验自然穿插）",
  "interaction": "互动问题（引导评论区讨论）",
  "cta": "结尾CTA（含「喝好汤，来东凤找三姐～」+行动号召+互动提问）",
  "full_script": "完整口播文案（钩子+穿插讲解+互动+CTA，可直接读稿）",
  "hashtags": ["标签1", "标签2", ...],
  "scene_notes": ["分镜1：动作描述+字幕内容", "分镜2：动作描述+字幕内容", ...]
}}"""

    try:
        text = deepseek_chat(prompt, max_tokens=1200, temperature=0.9)
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
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
    """离线脚本：普通话版本。"""
    soup_name = topic_info.get("main_soup", "老火靓汤")
    soup_info = next((s for s in SOUP_MENU if s["name"] == soup_name), None)
    soup_price = soup_info["price"] if soup_info else "?"
    soup_effect = soup_info["effect"] if soup_info else "?"

    hook_info = SOUP_HOOK_MAP.get(soup_name, {})
    sample_hook = hook_info.get("sample_hook", f"在家煲{soup_name}，为什么不如店里的好喝？")
    hook_visual = hook_info.get("visual", f"{soup_name}制作过程特写")
    selling_pt = hook_info.get("selling_point", f"{soup_name}，{soup_effect}，{soup_price}元")
    exp_tip = hook_info.get("experience_tip", f"三姐分享{soup_name}的独家技巧")

    title = f"🔥{soup_name}{soup_price}元！{soup_effect}的秘密"

    return {
        "title": title,
        "hook": sample_hook,
        "hook_voiceover": sample_hook,
        "body": f"【口播】很多人问我：为什么在家煲的{soup_name}不如店里的好喝？\n【画面】{hook_visual}\n\n【口播】{exp_tip}\n【画面】三姐操作步骤特写\n\n【口播】{selling_pt}。{soup_price}元一碗，真材实料看得到。\n【画面】瓦罐热气腾腾+成品汤品特写+价格浮层「仅售{soup_price}元」",
        "interaction": f"你平时在家会煲{soup_name}吗？有什么独门技巧？评论区告诉我～",
        "cta": f"喝好汤，来东凤找三姐～觉得有用的话，点赞收藏，带朋友一起来喝！你最爱喝什么汤？评论区告诉我～",
        "full_script": f"很多人问我：为什么在家煲的{soup_name}不如店里的好喝？\n\n{exp_tip}\n\n{selling_pt}。{soup_price}元一碗，真材实料看得到。\n\n你平时在家会煲{soup_name}吗？有什么独门技巧？评论区告诉我～\n\n喝好汤，来东凤找三姐～觉得有用的话，点赞收藏！",
        "hashtags": ["#东凤美食", "#老火靓汤", "#中山探店", f"#{soup_name}", "#三姐煲汤", "#煲汤教程"],
        "scene_notes": [
            f"分镜1（0-1.5s）：{hook_visual} + 大字标题「{sample_hook}」黄字黑边",
            f"分镜2（1.5-5s）：继续{hook_visual}，三姐画外音念钩子文案",
            f"分镜3（5-18s）：后厨煲汤过程快放 + 操作步骤特写 + 瓦罐慢炖",
            f"分镜4（18-25s）：成品汤品特写 + 大字浮层「仅售{soup_price}元」+「{soup_effect}」功效标签",
            "分镜5（25-28s）：三姐出镜/手持汤碗微笑 - 互动提问",
            "分镜6（28-35s）：片尾：门头招牌+地址定位+营业时间+点赞收藏关注动画+「喝好汤，来东凤找三姐～」",
        ],
    }
