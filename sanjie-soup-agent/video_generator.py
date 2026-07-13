import os
import json
from datetime import datetime
from config import ASSETS_DIR, OUTPUT_DIR, JIMENG_API_KEY, VOLCANO_TTS_KEY


def generate_video(script: dict, topic_info: dict) -> dict:
    """基于实拍素材 + AI增强生成视频制作指导。"""
    today = datetime.now().strftime("%Y%m%d")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    result = {"status": "pending_api", "video_path": "", "production_guide": "", "scene_plan": ""}

    assets = _scan_assets()
    guide = _build_production_guide(script, topic_info, assets)
    guide_path = os.path.join(OUTPUT_DIR, f"{today}_制作指导.md")
    with open(guide_path, "w", encoding="utf-8") as f:
        f.write(guide)
    result["production_guide"] = guide_path

    if JIMENG_API_KEY:
        result["status"] = "ai_api_configured_but_not_implemented"

    script_path = os.path.join(OUTPUT_DIR, f"{today}_脚本.json")
    with open(script_path, "w", encoding="utf-8") as f:
        json.dump(script, f, ensure_ascii=False, indent=2)

    package = {"date": today, "script": script, "topic": topic_info, "available_assets": assets}
    package_path = os.path.join(OUTPUT_DIR, f"{today}_制作包.json")
    with open(package_path, "w", encoding="utf-8") as f:
        json.dump(package, f, ensure_ascii=False, indent=2)

    result["video_path"] = package_path
    return result


def _scan_assets() -> list[str]:
    if not os.path.isdir(ASSETS_DIR):
        return []
    assets = []
    for f in sorted(os.listdir(ASSETS_DIR)):
        if f.lower().endswith((".mp4", ".mov", ".jpg", ".jpeg", ".png")):
            assets.append(f)
    return assets


def _build_production_guide(script: dict, topic_info: dict, assets: list[str]) -> str:
    scene_notes = script.get("scene_notes", [])
    full_script = script.get("full_script", "")
    title = script.get("title", "")

    asset_list = "\n".join(f"- {a}" for a in assets) if assets else "- 暂无素材，请放入 assets/ 文件夹"

    lines = [
        f"# 三姐老火靓汤 视频制作指导",
        f"",
        f"## 基本信息",
        f"- 日期：{datetime.now().strftime('%Y-%m-%d')}",
        f"- 主题：{title}",
        f"- 类型：{topic_info.get('topic_type', '')}",
        f"- 主打：{topic_info.get('main_soup', '')}",
        f"",
        f"## 口播文案（普通话配音用）",
        f"```",
        full_script or "（脚本生成中...）",
        f"```",
        f"",
        f"## 分镜建议",
    ]

    for i, note in enumerate(scene_notes, 1):
        lines.append(f"{i}. {note}")

    lines.extend([
        "",
        "## 可用素材池",
        asset_list,
        "",
        "## 品牌模板（每条视频固定套用）",
        "",
        "### 片头（0-3秒）",
        "- 品牌logo居中弹出 + 「三姐老火靓汤」黄色大字动画",
        "- 背景：瓦罐汤热气实拍虚化",
        "- 音效：轻快「叮」一声",
        "",
        "### 片尾（最后3秒）",
        "- 门头招牌实拍 + 地址「中山东凤镇」+ 营业时间",
        "- 引导动画：点赞❤收藏⭐关注➕ 图标依次弹出",
        "- 固定文案：「真材实料老火汤，健康实惠每一天」",
        "",
        "## 字幕规范",
        "- 字体：黄色粗体+黑色描边（抖音高辨识度风格）",
        "- 大小：关键句（价格/功效/技巧）放大1.5倍+红色强调",
        "- 位置：屏幕中下部，避免遮挡人脸和汤品",
        "- 语言：普通话口播配简体中文字幕",
        "",
        "## 制作步骤",
        "1. 打开剪映，新建项目（竖屏9:16）",
        "2. 套入品牌片头模板（3秒）",
        "3. 按分镜顺序排列实拍素材片段，确保画面与口播内容一一对应",
        "4. 使用普通话配音朗读口播文案（推荐火山引擎TTS或剪映内置朗读），语速略快有节奏",
        "5. 添加字幕：自动识别→切换为黄色描边字体→手动把价格和功效句标红加粗",
        "6. 关键句添加音效强调（「叮」「啪」等短音效）",
        "7. BGM：固定使用1-2首轻快国风背景音乐，音量30%不盖人声",
        "8. 在卖点展示帧添加大字浮层：价格 + 功效标签",
        "9. 在经验分享帧添加「💡三姐小技巧」浮层标注",
        "10. 套入品牌片尾模板（3秒）",
        "11. 导出：1080x1920（竖屏9:16），30fps，码率≥10Mbps",
        "",
        "## 🚨 发布前审核清单（防止限流）",
        "- [ ] 标题无违禁词：治好/第一/独家/保证/减肥/补肾壮阳 等",
        "- [ ] 文案无医疗声称：只能说「喝完舒服」「味道好」，不能说「能治病」「能补肾」",
        "- [ ] 价格真实不夸大：只写「XX元一碗」，不写「原价XX现价XX」「亏本卖」",
        "- [ ] 标签全部内容相关：不蹭无关热点标签",
        "- [ ] 画面操作卫生：厨房操作戴手套/口罩/围裙，操作台干净整洁",
        "- [ ] 无诱导互动：不出现「转发抽奖」「点赞送XX」",
        "- [ ] 无绝对化用语：无「最好吃」「第一汤」「全网独家」",
        "",
        "## 抖音发布清单",
        "- [ ] 标题15字以内，含emoji，体现卖点或经验",
        "- [ ] 添加门店定位「三姐老火靓汤」",
        "- [ ] 话题标签5-10个，全部与内容相关",
        "- [ ] 上传高清封面（选汤品特写帧或钩子画面帧）",
        "- [ ] 发布时间：11:30-12:30 或 17:30-18:30",
        "- [ ] 发布后1小时内三姐回复评论区",
    ])

    return "\n".join(lines)
