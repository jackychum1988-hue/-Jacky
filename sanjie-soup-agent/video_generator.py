import os
import json
from datetime import datetime
from config import ASSETS_DIR, OUTPUT_DIR, JIMENG_API_KEY, VOLCANO_TTS_KEY


def generate_video(script: dict, topic_info: dict) -> dict:
    """基于实拍素材 + AI增强生成视频。

    由于AI视频API（即梦/可灵）需要实际API对接，
    此模块当前输出视频制作指导文件，供人工/剪映操作。
    当配置了 JIMENG_API_KEY 后，可扩展为直接调用API生成。
    """
    today = datetime.now().strftime("%Y%m%d")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    result = {
        "status": "pending_api",
        "video_path": "",
        "production_guide": "",
        "scene_plan": "",
    }

    # 扫描可用素材
    assets = _scan_assets()

    # 生成视频制作指导
    guide = _build_production_guide(script, topic_info, assets)
    guide_path = os.path.join(OUTPUT_DIR, f"{today}_制作指导.md")
    with open(guide_path, "w", encoding="utf-8") as f:
        f.write(guide)
    result["production_guide"] = guide_path

    # 如果有即梦API，尝试生成AI画面片段
    if JIMENG_API_KEY:
        # TODO: 对接即梦/可灵API生成补位画面
        # 当前仅记录意图
        result["status"] = "ai_api_configured_but_not_implemented"

    # 保存脚本文本
    script_path = os.path.join(OUTPUT_DIR, f"{today}_脚本.json")
    with open(script_path, "w", encoding="utf-8") as f:
        json.dump(script, f, ensure_ascii=False, indent=2)

    # 保存视频制作包信息
    package = {
        "date": today,
        "script": script,
        "topic": topic_info,
        "available_assets": assets,
    }
    package_path = os.path.join(OUTPUT_DIR, f"{today}_制作包.json")
    with open(package_path, "w", encoding="utf-8") as f:
        json.dump(package, f, ensure_ascii=False, indent=2)

    result["video_path"] = package_path
    return result


def _scan_assets() -> list[str]:
    """扫描实拍素材池。"""
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
        f"## 口播文案（配音用）",
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
        "- 固定文案：「来喝汤！饮食即养生，汤中有乾坤」",
        "",
        "## 字幕规范",
        "- 字体：黄色粗体+黑色描边（抖音高辨识度风格）",
        "- 大小：关键句（价格/功效）放大1.5倍+红色强调",
        "- 位置：屏幕中下部，避免遮挡人脸和汤品",
        "- 双语：粤语口播配简体中文字幕",
        "",
        "## 制作步骤",
        "1. 打开剪映，新建项目（竖屏9:16）",
        "2. 套入品牌片头模板（3秒）",
        "3. 按分镜顺序排列实拍素材片段",
        "4. 使用粤语配音朗读口播文案（推荐火山引擎TTS或真人录音），语速略快有节奏",
        "5. 添加字幕：自动识别→切换为黄色描边字体→手动校对关键句加红",
        "6. 关键句添加音效强调（「叮」「啪」等短音效）",
        "7. BGM：固定使用1-2首轻快国风背景音乐，音量30%不盖人声",
        "8. 套入品牌片尾模板（3秒）",
        "9. 导出：1080x1920（竖屏9:16），30fps，码率≥10Mbps",
        "",
        "## 抖音发布清单",
        "- [ ] 标题15字以内，含emoji",
        "- [ ] 添加门店定位「三姐老火靓汤」",
        "- [ ] 话题标签5-8个",
        "- [ ] 上传高清封面（选汤品特写帧）",
        "- [ ] 发布时间：11:30-12:30 或 17:30-18:30",
        "- [ ] 发布后1小时内三姐回复评论区",
    ])

    return "\n".join(lines)
