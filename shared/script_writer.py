"""Shared spoken-script generation module for zs-property-agent and kol-watcher-agent.

Takes AI analysis text, extracts topic suggestions, generates 60-90 second
spoken scripts via DeepSeek, and pushes them to WeChat via PushPlus.
"""
import json
import re
import requests
from datetime import datetime


# === Jacky Persona System Prompt ===

JACKY_SYSTEM_PROMPT = """你是"港人中山置业通Jacky"的口播脚本撰写师。

## Jacky人设
- 身份：香港人在中山做房产经纪，帮港人买楼上车
- 风格：真实接地气，像跟朋友聊天，不浮夸不硬销
- 用词：粤语/香港用语（買樓、上車、筍盤、呎價、按揭、首期、供款），但整体普通话可懂
- 内容支柱：带客看房纪实50% / 专业知识港中对比30% / 售后日常20%
- 禁忌：不炒作深中通道通车（已通车近2年不是新闻）

## 脚本要求
- 时长：60-90秒（180-270字）
- 结构：钩子(0-5秒) → 正文(5-75秒) → CTA(75-90秒)
- 钩子必须是痛点/好奇/反常识/数字冲击，严禁"大家好我是Jacky""今天跟大家分享"开头
- 正文2-3个要点，每个60-80字，具体有料，有数据有案例
- CTA引导评论互动，问一个跟内容相关的问题

## 合规红线（抖音审核，违反必限流）
- ❌ 绝对化用语：最好、第一、独家、唯一、全网
- ❌ 功效承诺：保证、一定、肯定能、包你、买了就
- ❌ 虚假夸大：秒杀、吊打、完爆、胜过
- ❌ 诱导互动：不转不是XX、转发有好运、评论抽奖
- ❌ 封建迷信：风水、改运、辟邪
- ✅ 用个人感受代替承诺：「我觉得」「实地看过之后」「很多客户反馈」

## 输出格式
严格返回JSON（不要markdown代码块）：
{
  "scripts": [
    {
      "title": "视频标题（15字以内，有冲击力）",
      "hook": "前5秒钩子（12字以内）",
      "body": "正文（2-3个要点，180-200字）",
      "cta": "结尾CTA+互动引导（15-25字）",
      "full_script": "完整口播文案（可直接读稿，60-90秒）"
    }
  ]
}"""


# === Tiered Script Prompts ===

TIER_PROMPTS = {
    "viral": """你是"港人中山置业通Jacky"的口播脚本撰写师，今日任务是写一条**15-25秒引流轰炸**短视频脚本。

## Jacky人设
- 身份：香港人在中山做房产经纪，帮港人买楼上车
- 风格：真实接地气，像跟朋友聊天，不浮夸不硬销
- 用词：粤语/香港用语，但整体普通话可懂

## 引流轰炸脚本要求（15-25秒）
- 只有一个目的：让观众停下来 → 产生好奇 → PM你
- 结构：钩子(0-3秒) → 冲击信息(3-18秒) → CTA(18-25秒)
- 钩子必须极其有力：恐惧/反常识/数字冲击，严禁"大家好我是Jacky"开头
- 只讲1个爆点，不展开，不解释，制造悬念
- CTA直接有力："有兴趣即刻PM我，免费领《2026港人中山买房避坑清单》"

## 合规红线
- ❌ 绝对化用语：最好、第一、独家、唯一
- ❌ 功效承诺：保证、一定、肯定能
- ❌ 虚假夸大：秒杀、吊打、完爆
- ❌ 诱导互动：不转不是XX、转发有好运
- ❌ 不能说"微信""加好友"，用"PM我"

## 输出格式
严格返回JSON（不要markdown代码块）：
{
  "scripts": [
    {
      "title": "视频标题（15字以内，冲击力强）",
      "hook": "前3秒钩子（12字以内，恐惧/反常识/数字）",
      "body": "冲击信息（1个爆点，30-40字，制造悬念）",
      "cta": "CTA（15字以内，引导PM）",
      "full_script": "完整口播文案（可直接读稿，15-25秒）"
    }
  ]
}""",

    "flash": """你是"港人中山置业通Jacky"的口播脚本撰写师，今日任务是写一条**30-45秒笋盘速报**短视频脚本。

## Jacky人设
- 身份：香港人在中山做房产经纪，帮港人买楼上车
- 风格：真实接地气，像跟朋友聊天，不浮夸不硬销
- 用词：粤语/香港用语，但整体普通话可懂

## 笋盘速报脚本要求（30-45秒）
- 目的：展示"货源"，建立专业感，让观众觉得你掌握一手信息
- 结构：钩子(0-3秒) → 数据展示(3-35秒) → CTA(35-45秒)
- 钩子：价格锚点/稀缺感，直接亮数字
- 正文：3个数据点，每个都有具体数字支撑，不空泛
- 要有"限时感"——这个价格/优惠不是永远的
- CTA："有兴趣即刻PM我，免费领《2026港人中山买房避坑清单》"

## 合规红线
- ❌ 绝对化用语：最好、第一、独家、唯一
- ❌ 功效承诺：保证、一定、肯定能
- ❌ 虚假夸大：秒杀、吊打、完爆
- ❌ 伪造稀缺："仅剩3套""最后一天"（除非真实）
- ❌ 不能说"微信""加好友"，用"PM我"

## 输出格式
严格返回JSON（不要markdown代码块）：
{
  "scripts": [
    {
      "title": "视频标题（15字以内，含价格/数字）",
      "hook": "前3秒钩子（12字以内，价格锚点）",
      "body": "正文（3个数据点，每个30-40字，有具体数字）",
      "cta": "CTA（15字以内，引导PM领清单）",
      "full_script": "完整口播文案（可直接读稿，30-45秒）"
    }
  ]
}""",

    "deep": JACKY_SYSTEM_PROMPT,  # 复用现有 60-90s prompt
}


def build_tier_prompt(tier: str) -> str:
    """Return the system prompt for a given content tier.

    Args:
        tier: One of 'viral' (引流轰炸 15-25s), 'flash' (笋盘速报 30-45s),
              'deep' (深度拆解 60-90s, default).

    Returns:
        System prompt string for the tier.
    """
    return TIER_PROMPTS.get(tier, TIER_PROMPTS["deep"])


# === Pure Functions (testable without API) ===

def _extract_topic_suggestions(analysis_text):
    """Extract topic suggestions from AI analysis markdown.

    Supports multiple section naming conventions from both agents:
    - '💡 Jacky今日话题建议'
    - '差异化选题建议'
    - '## 话题建议'
    - '## 选题建议'

    Returns list of suggestion strings, one per topic.
    """
    if not analysis_text:
        return []

    patterns = [
        r'💡\s*Jacky今日话题建议\n(.*?)(?=\n##|\n---|\Z)',
        r'差异化选题建议\n(.*?)(?=\n##|\n---|\Z)',
        r'#+\s*话题建议\n(.*?)(?=\n##|\n---|\Z)',
        r'#+\s*选题建议\n(.*?)(?=\n##|\n---|\Z)',
    ]

    section_text = ""
    for pattern in patterns:
        match = re.search(pattern, analysis_text, re.DOTALL)
        if match:
            section_text = match.group(1).strip()
            if section_text:
                break

    if not section_text:
        return []

    # Split into individual suggestions
    suggestions = []
    lines = section_text.split('\n')
    current = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if current:
                suggestions.append('\n'.join(current))
                current = []
            continue
        # New suggestion starts with number, bullet, or bold
        if re.match(r'^(\d+[\.\、\)]|[-*•]|\*\*)', stripped):
            if current:
                suggestions.append('\n'.join(current))
            current = [stripped]
        elif current:
            current.append(stripped)

    if current:
        suggestions.append('\n'.join(current))

    return suggestions


def generate_scripts_for_tier(
    suggestions,
    tier: str,
    deepseek_api_key,
    deepseek_base_url="https://api.deepseek.com",
    deepseek_model="deepseek-chat",
    timeout=60,
):
    """Generate scripts for a specific content tier.

    Args:
        suggestions: List of topic suggestion strings.
        tier: Content tier ('viral', 'flash', 'deep').
        deepseek_api_key: DeepSeek API key.
        deepseek_base_url: API base URL.
        deepseek_model: Model name.
        timeout: Request timeout in seconds.

    Returns:
        List of script dicts, each with title/hook/body/cta/full_script.
    """
    if not suggestions or not deepseek_api_key:
        return []

    system_prompt = build_tier_prompt(tier)

    user_message = "基于以下话题建议，生成口播脚本：\n\n"
    for i, s in enumerate(suggestions, 1):
        user_message += f"【选题{i}】\n{s}\n\n"

    try:
        resp = requests.post(
            f"{deepseek_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {deepseek_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": deepseek_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                "temperature": 0.8,
                "max_tokens": 2000,
            },
            timeout=timeout,
        )
        resp.raise_for_status()
        data = resp.json()
        text = data["choices"][0]["message"]["content"]

        m = re.search(r'```(?:json)?\s*\n?(.*?)```', text, re.DOTALL)
        if m:
            text = m.group(1).strip()
        result = json.loads(text)
        return result.get("scripts", [])

    except (requests.RequestException, json.JSONDecodeError, KeyError) as e:
        print(f"[script_writer] generate_scripts_for_tier({tier}) failed: {e}")
        return []


def format_scripts_for_push(scripts, date_str=""):
    """Format scripts as PushPlus-compatible markdown."""
    if not date_str:
        date_str = datetime.now().strftime("%m/%d")

    title_line = f"🎙 **Jacky今日口播** | {date_str}"
    lines = [title_line, ""]

    for i, script in enumerate(scripts):
        title = script.get("title", f"选题{i+1}")
        hook = script.get("hook", "")
        body = script.get("body", "")
        cta = script.get("cta", "")
        full = script.get("full_script", "")

        lines.append(f"**【选题{i+1}】**{title}")
        lines.append("")
        lines.append(f"🎣 钩子：{hook}")
        lines.append(f"📖 正文：{body}")
        lines.append(f"🎯 结尾：{cta}")
        lines.append("")
        lines.append("━━━━━━━━━━━━━━━━━━")
        lines.append("📝 **完整读稿：**")
        lines.append("")
        lines.append(full)
        lines.append("")

        if i < len(scripts) - 1:
            lines.append("---")
            lines.append("")

    lines.append("")
    lines.append("> 🤖 由Jacky AI助手自动生成 | 直接读稿即可录制")

    return "\n".join(lines)


# === API-dependent Functions ===

def generate_scripts(
    suggestions,
    deepseek_api_key,
    deepseek_base_url="https://api.deepseek.com",
    deepseek_model="deepseek-chat",
    timeout=60,
):
    """Call DeepSeek API to generate 60-90s spoken scripts from topic suggestions.

    Delegates to generate_scripts_for_tier with tier='deep'.

    Args:
        suggestions: List of topic suggestion strings extracted from analysis.
        deepseek_api_key: DeepSeek API key.
        deepseek_base_url: API base URL.
        deepseek_model: Model name.
        timeout: Request timeout in seconds.

    Returns:
        List of script dicts, each with title/hook/body/cta/full_script.
        Empty list on failure.
    """
    return generate_scripts_for_tier(
        suggestions,
        tier="deep",
        deepseek_api_key=deepseek_api_key,
        deepseek_base_url=deepseek_base_url,
        deepseek_model=deepseek_model,
        timeout=timeout,
    )


def push_scripts(
    content,
    pushplus_token,
    pushplus_url="https://www.pushplus.plus/send",
    timeout=15,
):
    """Push formatted scripts to WeChat via PushPlus.

    Returns True if push succeeded (code == 200), False otherwise.
    """
    if not pushplus_token:
        print("[script_writer] PUSHPLUS_TOKEN not configured, skip push")
        return False

    today = datetime.now().strftime("%m/%d")
    payload = {
        "token": pushplus_token,
        "title": f"🎙 Jacky今日口播 | {today}",
        "content": content,
        "template": "markdown",
        "channel": "wechat",
    }

    try:
        resp = requests.post(pushplus_url, json=payload, timeout=timeout)
        resp.raise_for_status()
        result = resp.json()
        code = result.get("code")
        print(f"[script_writer] push result: code={code}")
        return code == 200
    except requests.RequestException as e:
        print(f"[script_writer] push failed: {e}")
        return False


# === One-stop Entry Point ===

def generate_and_push(
    analysis_text,
    deepseek_api_key,
    pushplus_token,
    deepseek_base_url="https://api.deepseek.com",
    deepseek_model="deepseek-chat",
    tier="deep",
):
    """Extract suggestions from analysis, generate scripts, and push to WeChat.

    This is the single entry point called by both agents.

    Args:
        analysis_text: Full AI analysis markdown from the agent.
        deepseek_api_key: DeepSeek API key.
        pushplus_token: PushPlus token for WeChat push.
        deepseek_base_url: API base URL (default DeepSeek).
        deepseek_model: Model name (default deepseek-chat).
        tier: Content tier — 'viral' (引流轰炸), 'flash' (笋盘速报),
              'deep' (深度拆解, default).

    Returns:
        True if scripts were generated and pushed successfully.
    """
    if not analysis_text:
        print("[script_writer] no analysis text, skipping")
        return False

    # Step 1: Extract topic suggestions
    suggestions = _extract_topic_suggestions(analysis_text)
    if not suggestions:
        print("[script_writer] no topic suggestions found in analysis, skipping")
        return False

    print(f"[script_writer] extracted {len(suggestions)} topic suggestions (tier={tier})")

    # Step 2: Generate scripts via DeepSeek
    scripts = generate_scripts_for_tier(
        suggestions,
        tier,
        deepseek_api_key,
        deepseek_base_url,
        deepseek_model,
    )

    if not scripts:
        # Fallback: push a short notice (not the full analysis text)
        print("[script_writer] script generation returned empty, pushing short fallback notice")
        suggestions_text = "\n".join(f"- {s[:80]}..." for s in suggestions[:3])
        fallback = f"🎙 **Jacky今日口播** | {datetime.now().strftime('%m/%d')}\n\n⚠️ AI脚本生成暂不可用。今日话题建议已附在数据报告中，以下是建议摘要：\n\n{suggestions_text}"
        push_scripts(fallback, pushplus_token)
        return False

    print(f"[script_writer] generated {len(scripts)} scripts")

    # Step 3: Format and push
    content = format_scripts_for_push(scripts)
    return push_scripts(content, pushplus_token)
