import requests
from datetime import datetime
from config import PUSHPLUS_TOKEN, PUSHPLUS_URL, REQUEST_TIMEOUT, SHOP_NAME


def build_review_package(
    topic_info: dict,
    script: dict,
    platform_posts: dict,
    video_result: dict,
) -> str:
    """构建抖音视频审核包Markdown文本。"""
    today = datetime.now().strftime("%Y-%m-%d")
    title = script.get("title", "")
    full_script = script.get("full_script", "")
    hashtags = " ".join(script.get("hashtags", []))
    hook = script.get("hook", "")
    interaction = script.get("interaction", "")
    cta = script.get("cta", "")

    lines = [
        f"🎥 {SHOP_NAME} | {today} 抖音视频审核包",
        "",
        "---",
        "",
        f"## 今日主题",
        f"- **类型**：{topic_info.get('topic_type', '')}",
        f"- **主打汤品**：{topic_info.get('main_soup', '')}",
        f"- **切入角度**：{topic_info.get('angle', '')}",
        f"- **选题理由**：{topic_info.get('reason', '')}",
        f"- **目标人群**：{topic_info.get('target_audience', '')}",
        "",
        "---",
        "",
        "## 视频标题",
        title,
        "",
        "## 脚本结构",
        f"- **开场白**：饮汤啦！我系东凤三姐～",
        f"- **钩子（1.5s）**：{hook}",
        f"- **互动钩子**：{interaction}",
        f"- **CTA**：{cta}",
        "",
        "## 完整口播文案",
        full_script,
        "",
        "## 话题标签",
        hashtags,
        "",
        "---",
        "",
        "## 抖音发布信息",
    ]

    douyin_post = platform_posts.get("抖音", {})
    if douyin_post:
        lines.append(f"**发布标题**：{douyin_post.get('title', '')}")
        note = douyin_post.get("note", "")
        if note:
            lines.append(f"\n> {note}")

    lines.extend([
        "",
        "## 视频制作",
        f"- 制作指导：{video_result.get('production_guide', '未生成')}",
        f"- 制作包：{video_result.get('video_path', '未生成')}",
        "",
        "## 推荐发布时间",
        "今日 11:30-12:00 或 17:30-18:00（抖音流量高峰期）",
        "",
        "## 发布后操作",
        "- [ ] 发布后1小时内三姐本人在评论区互动回复",
        "- [ ] 置顶一条引导评论（如：你今日饮咗汤未？）",
        "- [ ] 发布后2小时查看完播率和互动数据",
        "",
        "---",
        "",
        "> 🤖 三姐老火靓汤AI智能体自动生成",
        "> 审核通过后请手动发布至抖音",
    ])

    return "\n".join(lines)


def push_to_wechat(content: str) -> dict:
    """通过PushPlus推送到微信审核。"""
    if not PUSHPLUS_TOKEN:
        print("[推送] PUSHPLUS_TOKEN 未配置，跳过推送")
        return {"code": -1, "msg": "PUSHPLUS_TOKEN not configured"}

    today = datetime.now().strftime("%m/%d")
    title = f"🎥 {SHOP_NAME}抖音视频审核 | {today}"

    payload = {
        "token": PUSHPLUS_TOKEN,
        "title": title,
        "content": content,
        "template": "markdown",
        "channel": "wechat",
    }

    try:
        resp = requests.post(PUSHPLUS_URL, json=payload, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        result = resp.json()
        print(f"[推送] PushPlus返回: {result}")
        return result
    except requests.RequestException as e:
        print(f"[推送] 失败: {e}")
        return {"code": -1, "msg": str(e)}
