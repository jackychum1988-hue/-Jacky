"""模块3: Jacky生态枢纽 — 深度版↔口播版文案互转"""

import os
from datetime import datetime
from openai import OpenAI
from config import (
    DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL,
    DEEPSEEK_MODEL,
    TEMPERATURE_WORKSHOP,
    MAX_TOKENS,
)
from knowledge import HUB_CONVERSION_PROMPT

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")


def convert_to_jacky_style(article_path: str) -> str:
    """将公众号深度文章转换为Jacky口播文案"""
    with open(article_path, "r", encoding="utf-8") as f:
        article_content = f.read()

    client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)

    system_prompt = HUB_CONVERSION_PROMPT.format(article_content=article_content)

    print("[hub] 转换公众号文章 -> Jacky口播版...")

    response = client.chat.completions.create(
        model=DEEPSEEK_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "请将上述文章转换为Jacky口播文案"},
        ],
        temperature=TEMPERATURE_WORKSHOP,
        max_tokens=MAX_TOKENS,
    )

    script = response.choices[0].message.content

    # 保存输出
    base = os.path.splitext(os.path.basename(article_path))[0]
    output_path = os.path.join(OUTPUT_DIR, f"{base}-Jacky口播版.md")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(f"# Jacky口播版\n\n")
        f.write(f"生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
        f.write("---\n\n")
        f.write(script)
        f.write("\n\n---\n")
        f.write(f"> 来源文章: {os.path.basename(article_path)}\n")

    print(f"[hub] Jacky口播版已保存: {output_path}")
    return output_path


def generate_cross_promo(community: str = "", article_title: str = "") -> str:
    """生成双号互推文案"""
    lines = []
    lines.append("## 双号互推文案")
    lines.append("")
    lines.append("### 中山壹号墅 → Jacky 导流")
    lines.append("")
    lines.append("> 想了解更多中山买楼实操干货？关注我另一个号「港人中山置业通Jacky」，")
    lines.append("> 帮香港朋友避坑拆真相。私信我「中山」，获取中山置业分析表。")
    lines.append("")
    lines.append("### Jacky → 中山壹号墅 导流")
    lines.append("")
    lines.append("> 如果你对中山豪宅有兴趣，欢迎关注我嘅高端号「中山壹号墅」。")
    if community:
        lines.append(f"> 我啱啱去咗{community}探盘，篇深度分析好快出。")
    lines.append("> 搜索「中山壹号墅」公众号即可关注。")
    lines.append("")

    return "\n".join(lines)
