#!/usr/bin/env python3
"""
批量生成中山楼盘 AI 建筑外观图
使用火山方舟 Ark API (豆包 Seedream 4.0 文生图)
需要环境变量: JIMENG_API_KEY (ARK_API_KEY)
"""
import os
import sys
import time
import json
import base64
import requests
from pathlib import Path
from dotenv import load_dotenv

# 加载 .env（从 sanjie-soup-agent 目录或当前目录）
load_dotenv(Path(__file__).parent.parent.parent / "sanjie-soup-agent" / ".env")
load_dotenv()

API_KEY = os.getenv("JIMENG_API_KEY") or os.getenv("ARK_API_KEY")
if not API_KEY:
    print("ERROR: JIMENG_API_KEY or ARK_API_KEY not found in environment")
    sys.exit(1)

# 火山方舟 Ark API 配置
ARK_BASE = "https://ark.cn-beijing.volces.com/api/v3"
MODEL_ID = "doubao-seedream-4.0"  # 豆包文生图 4.0

OUTPUT_DIR = Path(__file__).parent.parent / "public" / "project-images"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 38 个项目列表
PROJECTS = [
    # === 1-18 原有 18 个项目 ===
    ("江山和鸣", "石岐", "四代宅·使用率145%"),
    ("保利琅悦", "東區", "四代奢宅標杆"),
    ("囍滙·Central Peak", "東區", "豪宅·203-316㎡"),
    ("御宸", "石岐", "四代宅·容積率1.99"),
    ("建华龙湖·香山颂", "石岐", "2025銷冠·四代宅"),
    ("遠洋天著", "南區", "鴻蒙智慧大平層"),
    ("中山108天寓", "東區", "住宅+公寓"),
    ("華潤仁恒公園四季2期", "西區", "住宅·95-142㎡"),
    ("幸福匯", "西區", "岐江現房"),
    ("展睿·江樾灣", "石岐", "現房·性價比之王"),
    ("錦繡海灣城", "翠亨", "濱海萬畝大盤"),
    ("華發觀山水", "三鄉", "山景大盤"),
    ("佳境康城", "坦洲", "港資住宅"),
    ("錦繡國際花城", "坦洲", "湖景住宅"),
    ("雅居樂·萬象郡", "三鄉", "成熟社區"),
    ("中澳春城", "坦洲", "坦洲熱搜TOP1"),
    ("港航匯", "市區", "精裝公寓·21.8萬起"),
    ("海雅繽紛城", "南頭", "商辦綜合體"),
    # === 19-38 新增 20 个项目 ===
    ("保利香山瑧悦府", "東區", "保利高端·紫馬嶺"),
    ("朗詩金鐘湖壹號", "東區", "金鐘湖科技住宅"),
    ("華發學府壹號", "石岐", "學府旁·已交房"),
    ("金鷹半山花園", "石岐", "總部經濟區高端住宅"),
    ("華立富華薈", "西區", "富華道·65-107平"),
    ("懿臻山", "南區", "高端住宅·13k-17k/平"),
    ("碧桂園·鳳凰城", "南區", "大型生態社區·8k/平"),
    ("招商臻灣府", "翠亨", "深中通道·79-119平"),
    ("中山粵海城", "翠亨", "一線臨海現房"),
    ("中興智慧城·懿禧府", "翠亨", "地鐵上蓋·馬鞍島"),
    ("保利天匯·熙岸", "翠亨", "復式高使用率107%"),
    ("雅居樂灣際壹號", "翠亨", "灣區綜合體"),
    ("御峰香林", "火炬", "低密改善·高得房率"),
    ("火炬建發·望江台", "火炬", "一線江景·7.2k起"),
    ("東方名都", "火炬", "東南亞園林·無邊泳池"),
    ("逸駿半島", "坦洲", "近珠海50米·60萬平"),
    ("優越香格里", "坦洲", "大型成熟社區"),
    ("保利·和光塵樾", "古鎮", "保利高端·14.5k/平"),
    ("星晨·君悅灣", "港口", "近市區·8k/平"),
    ("鉑灣半島", "南頭", "濱水住宅·2026交房"),
]


def generate_image(project_name: str, district: str, tag: str) -> str | None:
    """
    调用火山方舟 Ark API 生成建筑外观图
    返回 base64 解码后的图片二进制数据，失败返回 None
    """
    prompt = (
        f"中山市{district}区楼盘「{project_name}」建筑外观效果图，"
        f"现代住宅高层，玻璃幕墙，高品质，阳光明媚，"
        f"专业建筑摄影，超广角，4K高清，写实风格，无文字无水印"
    )

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }

    payload = {
        "model": MODEL_ID,
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024",
        "response_format": "b64_json",
    }

    try:
        resp = requests.post(
            f"{ARK_BASE}/images/generations",
            headers=headers,
            json=payload,
            timeout=120,
        )
        resp.raise_for_status()
        data = resp.json()
        # Ark API 返回格式: {"data": [{"b64_json": "..."}]}
        if "data" in data and len(data["data"]) > 0:
            b64 = data["data"][0].get("b64_json", "")
            if b64:
                return base64.b64decode(b64)
        print(f"  Unexpected response: {json.dumps(data, ensure_ascii=False)[:200]}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"  API error: {e}")
        return None


def sanitize_filename(name: str) -> str:
    """清理文件名"""
    return name.replace("·", "-").replace(" ", "-").replace("/", "-").replace("\\", "-")


def main():
    total = len(PROJECTS)
    success = 0
    failed = []

    for i, (name, district, tag) in enumerate(PROJECTS):
        filename = f"{i+1:02d}_{sanitize_filename(name)}.png"
        filepath = OUTPUT_DIR / filename

        if filepath.exists():
            print(f"[{i+1}/{total}] {name} — already exists, skipped")
            success += 1
            continue

        print(f"[{i+1}/{total}] {name} ({district}) — generating...")
        img_data = generate_image(name, district, tag)

        if img_data:
            filepath.write_bytes(img_data)
            print(f"  Saved: {filepath}")
            success += 1
        else:
            print(f"  FAILED: {name}")
            failed.append(name)

        # API 限速：每 2 秒一张
        if i < total - 1:
            time.sleep(2)

    print(f"\nDone. {success}/{total} succeeded.")
    if failed:
        print(f"Failed ({len(failed)}):")
        for f in failed:
            print(f"  - {f}")

    # 生成映射 JSON 供 TypeScript 使用
    mapping = {}
    for i, (name, district, tag) in enumerate(PROJECTS):
        filename = f"{i+1:02d}_{sanitize_filename(name)}.png"
        mapping[name] = f"/project-images/{filename}"

    mapping_path = OUTPUT_DIR.parent / "project-image-map.json"
    mapping_path.write_text(json.dumps(mapping, ensure_ascii=False, indent=2))
    print(f"Mapping saved to {mapping_path}")


if __name__ == "__main__":
    main()
