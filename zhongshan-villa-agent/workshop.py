"""模块2: 内容工坊 — 基于DeepSeek API生成公众号初稿"""

import os
from datetime import datetime
from openai import OpenAI
from config import (
    DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL,
    DEEPSEEK_MODEL,
    TEMPERATURE_WORKSHOP,
    MAX_TOKENS,
    CONTENT_PILLARS,
    FORBIDDEN_WORDS,
    PREMIUM_KEYWORDS,
)
from knowledge import (
    COMMUNITY_PROFILES,
    WORKSHOP_SYSTEM_PROMPT,
    PILLAR_TEMPLATES,
)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")


def generate_article(
    pillar: int,
    community: str = "",
    topic: str = "",
) -> str:
    """生成公众号文章初稿"""
    client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)

    pillar_info = CONTENT_PILLARS.get(pillar)
    if not pillar_info:
        raise ValueError(f"未知的内容支柱: {pillar}，可选值: 1-4")

    # 构建知识上下文
    community_knowledge = ""
    if community and community in COMMUNITY_PROFILES:
        profile = COMMUNITY_PROFILES[community]
        community_knowledge = f"""
楼盘名称：{community}
位置：{profile['location']}
开发商：{profile['developer']}
年代：{profile['era']}
类型：{profile['types']}
面积区间：{profile['area_range']}
参考价格：{profile['price_range']}
核心卖点：{', '.join(profile['selling_points'])}
不足之处：{', '.join(profile['weaknesses'])}
目标买家：{profile['buyer_profile']}
"""

    # 构建模板提示词
    pillar_template = PILLAR_TEMPLATES.get(pillar, "")
    if pillar == 2:
        pillar_template = pillar_template.format(topic=topic or "别墅生活方式")
    elif pillar == 1:
        pillar_template = pillar_template.format(community=community or "目标楼盘")

    # 构建完整系统提示词
    system_prompt = WORKSHOP_SYSTEM_PROMPT.format(
        forbidden_words="\n".join(f"- {w}" for w in FORBIDDEN_WORDS),
        premium_keywords=", ".join(PREMIUM_KEYWORDS),
        pillar_template=pillar_template,
        community_knowledge=community_knowledge,
        target_length=pillar_info["target_length"],
    )

    user_message = f"请为「中山壹号墅」公众号撰写一篇{pillar_info['name']}类文章。"
    if community:
        user_message += f" 目标楼盘：{community}。"
    if topic:
        user_message += f" 主题：{topic}。"

    print(f"[workshop] 调用DeepSeek生成{pillar_info['name']}文章...")

    response = client.chat.completions.create(
        model=DEEPSEEK_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        temperature=TEMPERATURE_WORKSHOP,
        max_tokens=MAX_TOKENS,
    )

    article = response.choices[0].message.content
    return article


def generate_video_script(article: str) -> str:
    """基于文章生成视频口播脚本（中山壹号墅版）"""
    client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)

    system_prompt = """你是一位短视频内容专家。将以下公众号文章改编为「中山壹号墅」的60秒短视频口播脚本。

要求：
- 粤语口语，保持豪宅品味调性
- 开头3秒打痛点/好奇心
- 中间45秒讲核心内容
- 最后10秒Jacky观点 + 引导关注
- 提供分镜建议（画面方向、字幕重点、BGM建议）
"""

    print("[workshop] 生成分镜脚本...")

    response = client.chat.completions.create(
        model=DEEPSEEK_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"文章内容：\n\n{article}"},
        ],
        temperature=TEMPERATURE_WORKSHOP,
        max_tokens=MAX_TOKENS,
    )

    return response.choices[0].message.content


def save_output(article: str, script: str, pillar: int, community: str = "") -> str:
    """保存生成的内容到 output 目录"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    date_str = datetime.now().strftime("%Y-%m-%d")
    pillar_name = CONTENT_PILLARS.get(pillar, {}).get("name", "unknown")
    slug = community.replace(" ", "") if community else pillar_name
    filename = f"{date_str}-{slug}-{pillar_name}.md"
    filepath = os.path.join(OUTPUT_DIR, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(f"# {pillar_name} | {community or '生活方式'}\n\n")
        f.write(f"生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
        f.write("---\n\n")
        f.write("## 公众号文章初稿\n\n")
        f.write(article)
        f.write("\n\n---\n\n")
        f.write("## 视频口播脚本\n\n")
        f.write(script)
        f.write("\n\n---\n")
        f.write("> ⚠️ AI初稿，需人工润色后发布\n")

    print(f"[workshop] 内容已保存: {filepath}")
    return filepath
