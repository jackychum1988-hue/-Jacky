# Monetization Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立港人中山置业IP全链路变现漏斗——从内容生产到私域成交的完整闭环

**Architecture:** 分4个Phase实施。Phase 1 补齐代码层缺口（三层级脚本生成 + Timeline JSON映射），Phase 2-4 为流程执行（信息图制作、话术模板落地、数据追踪）。代码改动集中在 `shared/script_writer.py` 和新增 `shared/timeline_builder.py`，不改动 remotion-realestate 渲染管线。

**Tech Stack:** Python (shared模块), DeepSeek API, Remotion PipOverlay, baoyu-infographic skill

**Spec:** `docs/superpowers/specs/2026-06-16-monetization-funnel-design.md`

---

## File Structure

```
shared/
├── script_writer.py          # [修改] 新增三层级脚本生成支持
├── timeline_builder.py       # [新建] 脚本→PipOverlay Timeline JSON 映射
├── test_timeline_builder.py  # [新建] timeline_builder 测试
└── test_script_writer.py     # [修改] 新增三层级测试用例

config/
└── pm_response_template.md   # [新建] PM 回复话术模板（参考文件）

data/
└── funnel_tracker.csv        # [新建] 每周漏斗数据追踪表

docs/superpowers/assets/
├── avoid-pitfalls-checklist.png   # [生成] 避坑清单信息图
└── price-comparison-table.png     # [生成] 楼价对比表信息图
```

---

## Phase 1: 代码补齐（三层级脚本 + Timeline映射）

### Task 1: 添加三层级脚本生成支持到 shared/script_writer.py

**Files:**
- Modify: `shared/script_writer.py`
- Modify: `shared/test_script_writer.py`

**背景**: 当前 `JACKY_SYSTEM_PROMPT` 只支持 60-90s 脚本（深度拆解）。需要新增 15-25s（引流轰炸）和 30-45s（笋盘速报）两种模式。

- [ ] **Step 1: 写失败测试 — 三层级 prompt 生成**

在 `shared/test_script_writer.py` 追加：

```python
from shared.script_writer import build_tier_prompt, TIER_PROMPTS


def test_build_tier_prompt_viral():
    """引流轰炸 tier: 15-25s, strong hook, instant CTA."""
    prompt = build_tier_prompt("viral")
    assert "15-25秒" in prompt
    assert "HOOK" in prompt
    assert "CTA" in prompt
    assert "严禁" in prompt


def test_build_tier_prompt_flash():
    """笋盘速报 tier: 30-45s, data-focused."""
    prompt = build_tier_prompt("flash")
    assert "30-45秒" in prompt
    assert "数据" in prompt or "数字" in prompt
    assert "价格" in prompt


def test_build_tier_prompt_deep():
    """深度拆解 tier: 60-90s, comprehensive — default tier."""
    prompt = build_tier_prompt("deep")
    assert "60-90秒" in prompt


def test_build_tier_prompt_unknown_falls_back_to_deep():
    """Unknown tier falls back to deep."""
    prompt = build_tier_prompt("unknown")
    assert "60-90秒" in prompt


def test_tier_prompts_are_distinct():
    """All three tiers produce different prompts."""
    viral = build_tier_prompt("viral")
    flash = build_tier_prompt("flash")
    deep = build_tier_prompt("deep")
    assert viral != flash
    assert flash != deep
    assert viral != deep
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd d:/房产个人IP香港 && python -m pytest shared/test_script_writer.py::test_build_tier_prompt_viral shared/test_script_writer.py::test_build_tier_prompt_flash shared/test_script_writer.py::test_build_tier_prompt_deep shared/test_script_writer.py::test_build_tier_prompt_unknown_falls_back_to_deep shared/test_script_writer.py::test_tier_prompts_are_distinct -v
```

Expected: 5 FAIL (函数未定义)

- [ ] **Step 3: 实现 build_tier_prompt() 和 TIER_PROMPTS**

在 `shared/script_writer.py` 的 `JACKY_SYSTEM_PROMPT` 之后、`_extract_topic_suggestions` 之前插入：

```python
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
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd d:/房产个人IP香港 && python -m pytest shared/test_script_writer.py -v
```

Expected: ALL PASS (原有7个 + 新增5个 = 12个)

- [ ] **Step 5: Commit**

```bash
git add shared/script_writer.py shared/test_script_writer.py
git commit -m "feat: add 3-tier script generation (viral/flash/deep) to shared/script_writer"
```

---

### Task 2: 新建 shared/timeline_builder.py — 脚本到 PipOverlay Timeline JSON 映射

**Files:**
- Create: `shared/timeline_builder.py`
- Create: `shared/test_timeline_builder.py`

**背景**: 当前脚本生成后推送到微信（PushPlus），需要手动创建 PipOverlay timeline JSON 才能渲染。本模块将脚本自动映射为 timeline JSON，打通"脚本→渲染"链路。

- [ ] **Step 1: 写失败测试**

创建 `shared/test_timeline_builder.py`：

```python
"""Tests for shared/timeline_builder.py."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.timeline_builder import (
    build_timeline,
    TIER_CARD_SEQUENCE,
    CARD_DURATION_MAP,
)


def test_build_timeline_viral():
    """引流轰炸: HookCard → CTACard, 15-25s total."""
    script = {
        "title": "中山这个盘港人买完亏47万",
        "hook": "港人买中山房3年亏47万",
        "body": "今日同你拆解点解会咁，3个致命错误。",
        "cta": "有兴趣即刻PM我，免费领避坑清单",
        "full_script": "港人买中山房3年亏47万...",
    }
    timeline = build_timeline(script, tier="viral")
    assert "elements" in timeline
    assert len(timeline["elements"]) >= 2  # at least HookCard + CTACard
    types = [e["type"] for e in timeline["elements"]]
    assert "HookCard" in types
    assert "CTACard" in types
    # Duration should be 15-25s
    frames = timeline["durationInFrames"]
    assert 450 <= frames <= 750  # 15*30 to 25*30


def test_build_timeline_flash():
    """笋盘速报: HookCard → DataPanel → PriceRevealCard → CTACard."""
    script = {
        "title": "深中通道通车后这个盘涨了",
        "hook": "通车后涨咗2000蚊一平",
        "body": "第一，三乡呢个盘由1.2万涨到1.4万。第二，周边配套齐全。第三，总价200万唔使。",
        "cta": "有兴趣即刻PM我，免费领避坑清单",
        "full_script": "通车后涨咗2000蚊一平...",
    }
    timeline = build_timeline(script, tier="flash")
    types = [e["type"] for e in timeline["elements"]]
    assert "HookCard" in types
    assert "CTACard" in types
    # 30-45s
    frames = timeline["durationInFrames"]
    assert 900 <= frames <= 1350


def test_build_timeline_deep():
    """深度拆解: HookCard → DataComparison → Checklist → WarningCard → Timeline → CTACard."""
    script = {
        "title": "中山楼盘全拆解华发观山水",
        "hook": "200万在中山能买什么楼盘",
        "body": "今日同大家深度拆解华发观山水。第一，区位分析三乡板块价值。第二，户型详解三房两厅。第三，价格对比同区楼盘。第四，配套实测学校商场医院。第五，港人买楼注意事项。",
        "cta": "有兴趣即刻PM我，免费领避坑清单",
        "full_script": "200万在中山能买什么楼盘...",
    }
    timeline = build_timeline(script, tier="deep")
    types = [e["type"] for e in timeline["elements"]]
    assert "HookCard" in types
    assert "DataComparisonCard" in types
    assert "ChecklistCard" in types
    assert "CTACard" in types
    frames = timeline["durationInFrames"]
    assert 1800 <= frames <= 2700  # 60-90s


def test_build_timeline_uses_safe_positions():
    """All elements use safe positioning (safe-top, safe-bottom, etc.)."""
    script = {
        "title": "test",
        "hook": "test hook 12char",
        "body": "test body content",
        "cta": "test CTA",
        "full_script": "test full",
    }
    for tier in ["viral", "flash", "deep"]:
        timeline = build_timeline(script, tier=tier)
        for el in timeline["elements"]:
            assert el["position"] in {
                "safe-top", "safe-bottom", "center",
                "top-center", "bottom-center",
            }, f"Position {el['position']} not safe for PIP overlay"


def test_build_timeline_interleaves_elements():
    """Elements have staggered enterAt/exitAt (no two enter at same frame)."""
    script = {
        "title": "test",
        "hook": "test hook",
        "body": "test body long enough to fill 3 cards",
        "cta": "test CTA",
        "full_script": "test full",
    }
    timeline = build_timeline(script, tier="deep")
    enter_frames = [e["enterAt"] for e in timeline["elements"]]
    # Each card should enter after the previous one
    for i in range(1, len(enter_frames)):
        assert enter_frames[i] > enter_frames[i-1], \
            f"Element {i} enters at {enter_frames[i]}, not after element {i-1} at {enter_frames[i-1]}"


def test_tier_card_sequence_is_defined():
    """All three tiers have defined card sequences."""
    assert "viral" in TIER_CARD_SEQUENCE
    assert "flash" in TIER_CARD_SEQUENCE
    assert "deep" in TIER_CARD_SEQUENCE
    assert len(TIER_CARD_SEQUENCE["viral"]) >= 2
    assert len(TIER_CARD_SEQUENCE["flash"]) >= 3
    assert len(TIER_CARD_SEQUENCE["deep"]) >= 4
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd d:/房产个人IP香港 && python -m pytest shared/test_timeline_builder.py -v
```

Expected: ALL FAIL (模块不存在)

- [ ] **Step 3: 实现 timeline_builder.py**

创建 `shared/timeline_builder.py`：

```python
"""Script-to-PipOverlay-Timeline mapper.

Converts generated spoken scripts (from script_writer.py) into
PipOverlay-compatible timeline JSON for remotion-realestate rendering.

Timeline JSON spec: see remotion-realestate/src/scenes/PipOverlay.tsx
Element types: see remotion-realestate/src/components/overlay/index.ts
"""

import json
from datetime import datetime

# Card sequence per tier (matches spec section 二)
TIER_CARD_SEQUENCE = {
    "viral": ["HookCard", "CTACard"],
    "flash": ["HookCard", "DataPanel", "PriceRevealCard", "CTACard"],
    "deep": ["HookCard", "DataComparisonCard", "ChecklistCard", "WarningCard", "TimelineCard", "CTACard"],
}

# Approximate frame duration per card type
CARD_DURATION_MAP = {
    "HookCard": 120,          # 4s
    "CTACard": 150,           # 5s
    "DataPanel": 180,         # 6s
    "PriceRevealCard": 150,   # 5s
    "DataComparisonCard": 240, # 8s
    "ChecklistCard": 210,     # 7s
    "WarningCard": 180,       # 6s
    "TimelineCard": 240,      # 8s
}

# Card position defaults for PIP overlay (竖屏 1080x1920)
CARD_POSITIONS = {
    "HookCard": "safe-top",
    "CTACard": "safe-bottom",
    "DataPanel": "center",
    "PriceRevealCard": "center",
    "DataComparisonCard": "center",
    "ChecklistCard": "center",
    "WarningCard": "center",
    "TimelineCard": "center",
}

# 6-color cycle for cards
CARD_COLORS = ["#1A56DB", "#C8A052", "#10B981", "#FF4136", "#8B5CF6", "#F5A623"]


def _build_element(card_type: str, enter_at: int, exit_at: int, script: dict, color: str, index: int) -> dict:
    """Build a single PipOverlay element from card type and script data."""
    props = {
        "color": color,
    }

    if card_type == "HookCard":
        props.update({
            "label": script.get("title", "")[:8],
            "headline": script.get("hook", ""),
            "subline": script.get("body", "")[:60] if len(script.get("body", "")) > 60 else script.get("body", ""),
            "icon": "alert",
        })
        animation = "spring"
    elif card_type == "CTACard":
        props.update({
            "headline": script.get("cta", "有兴趣即刻PM我"),
            "ctaContact": "PM",
            "ctaTags": "#港人中山置业 #避坑清单 #中山买楼",
        })
        animation = "slideUp"
    elif card_type == "DataPanel":
        props.update({
            "title": script.get("title", ""),
            "body": script.get("body", ""),
            "icon": "chart",
        })
        animation = "slideLeft"
    elif card_type == "PriceRevealCard":
        props.update({
            "label": "笋盘速报",
            "headline": script.get("hook", ""),
            "subtext": script.get("body", "")[:80],
        })
        animation = "spring"
    elif card_type == "DataComparisonCard":
        props.update({
            "label": "深度拆解",
            "headline": script.get("title", ""),
            "body": script.get("body", ""),
            "icon": "chart",
        })
        animation = "slideLeft"
    elif card_type == "ChecklistCard":
        props.update({
            "title": script.get("title", ""),
            "body": script.get("body", ""),
            "icon": "check",
        })
        animation = "slideUp"
    elif card_type == "WarningCard":
        props.update({
            "title": "避坑提醒",
            "body": script.get("body", "")[:100],
            "icon": "alert",
        })
        animation = "fadeIn"
    elif card_type == "TimelineCard":
        props.update({
            "title": script.get("title", ""),
            "body": script.get("body", ""),
        })
        animation = "slideUp"

    return {
        "type": card_type,
        "enterAt": enter_at,
        "exitAt": exit_at,
        "animation": animation,
        "position": CARD_POSITIONS.get(card_type, "center"),
        "offset": {"x": 0, "y": 0},
        "props": props,
    }


def build_timeline(script: dict, tier: str = "deep", fps: int = 30) -> dict:
    """Convert a script dict into a PipOverlay timeline JSON.

    Args:
        script: Script dict with title/hook/body/cta/full_script.
        tier: Content tier ('viral', 'flash', 'deep').
        fps: Frames per second (default 30).

    Returns:
        Timeline dict compatible with PipOverlaySchema.
    """
    card_sequence = TIER_CARD_SEQUENCE.get(tier, TIER_CARD_SEQUENCE["deep"])

    elements = []
    current_frame = 0
    # Gap between cards (0.5s = 15 frames)
    gap = 15

    for i, card_type in enumerate(card_sequence):
        card_duration = CARD_DURATION_MAP.get(card_type, 180)
        enter_at = current_frame
        exit_at = current_frame + card_duration
        is_last = (i == len(card_sequence) - 1)

        # Last card (CTA) stays until end
        if is_last:
            exit_at = current_frame + card_duration + gap

        color = CARD_COLORS[i % len(CARD_COLORS)]
        element = _build_element(card_type, enter_at, exit_at, script, color, i)
        elements.append(element)

        current_frame = exit_at + gap

    total_frames = elements[-1]["exitAt"] if elements else 150

    return {
        "width": 1080,
        "height": 1920,
        "fps": fps,
        "durationInFrames": total_frames,
        "elements": elements,
    }


def save_timeline(timeline: dict, output_path: str) -> str:
    """Save timeline dict as JSON file.

    Args:
        timeline: Timeline dict from build_timeline().
        output_path: File path to write JSON.

    Returns:
        The output path (for chaining).
    """
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(timeline, f, ensure_ascii=False, indent=2)
    return output_path


def script_to_timeline_json(script: dict, tier: str, output_dir: str = "config/timelines") -> str:
    """Full pipeline: script → timeline build → save JSON.

    Args:
        script: Script dict.
        tier: Content tier.
        output_dir: Directory to save timeline JSON.

    Returns:
        Path to saved timeline JSON file.
    """
    import os
    os.makedirs(output_dir, exist_ok=True)

    timeline = build_timeline(script, tier=tier)
    date_str = datetime.now().strftime("%Y%m%d")
    title_slug = script.get("title", "untitled")[:20].replace(" ", "-").replace("/", "-")
    filename = f"{date_str}-{tier}-{title_slug}.json"
    output_path = os.path.join(output_dir, filename)

    return save_timeline(timeline, output_path)
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd d:/房产个人IP香港 && python -m pytest shared/test_timeline_builder.py -v
```

Expected: ALL PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add shared/timeline_builder.py shared/test_timeline_builder.py
git commit -m "feat: add script-to-PipOverlay-timeline mapper (shared/timeline_builder)"
```

---

### Task 3: 端到端验证 — 生成一条脚本 → 构建 Timeline → 渲染

**Files:**
- Create: `scripts/generate_and_render.py`（CLI 工具脚本）

**背景**: 验证整条链路能跑通——从选题到渲染输出。

- [ ] **Step 1: 创建 CLI 脚本**

创建 `scripts/generate_and_render.py`：

```python
#!/usr/bin/env python3
"""End-to-end script generation + timeline build + render command.

Usage: python scripts/generate_and_render.py <tier> "<topic>"

Example: python scripts/generate_and_render.py viral "中山买错房亏47万"
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.script_writer import generate_scripts_for_tier, TIER_PROMPTS
from shared.timeline_builder import script_to_timeline_json
import os as _os


def main():
    if len(sys.argv) < 3:
        print("Usage: python scripts/generate_and_render.py <viral|flash|deep> <topic>")
        print("Example: python scripts/generate_and_render.py viral '中山买错房亏47万'")
        sys.exit(1)

    tier = sys.argv[1]
    topic = sys.argv[2]

    if tier not in TIER_PROMPTS:
        print(f"Unknown tier: {tier}. Use: viral, flash, deep")
        sys.exit(1)

    api_key = _os.environ.get("DEEPSEEK_API_KEY", "")
    if not api_key:
        print("DEEPSEEK_API_KEY not set. Using config...")
        # Try loading from config
        try:
            from sanjie_soup_agent.config import DEEPSEEK_API_KEY
            api_key = DEEPSEEK_API_KEY
        except ImportError:
            pass

    if not api_key:
        print("ERROR: DEEPSEEK_API_KEY not found. Set env var or configure in sanjie-soup-agent/config.py")
        sys.exit(1)

    # Step 1: Generate script
    print(f"\n📝 Generating {tier} script for: {topic}")
    suggestions = [topic]
    scripts = generate_scripts_for_tier(suggestions, tier, api_key)

    if not scripts:
        print("❌ Script generation failed")
        sys.exit(1)

    script = scripts[0]
    print(f"   Title: {script.get('title', 'N/A')}")
    print(f"   Hook: {script.get('hook', 'N/A')}")
    print(f"   Full script length: {len(script.get('full_script', ''))} chars")

    # Step 2: Build timeline JSON
    print(f"\n🎬 Building timeline JSON...")
    timeline_path = script_to_timeline_json(script, tier=tier)
    print(f"   Saved: {timeline_path}")

    # Step 3: Print render command
    print(f"\n🎥 To render, run:")
    render_cmd = f"cd remotion-realestate && npx tsx scripts/render_pip.ts ../{timeline_path} out/{tier}-{_os.path.basename(timeline_path).replace('.json', '.mov')}"
    print(f"   {render_cmd}")

    print(f"\n✅ Done! Script + Timeline generated.")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Commit**

```bash
git add scripts/generate_and_render.py
git commit -m "feat: add e2e script-generation + timeline CLI tool"
```

---

## Phase 2: 信息图物料制作（第1周执行）

### Task 4: 制作第一份诱饵 —《2026港人中山买房避坑清单》

**工具**: `baoyu-infographic` 技能
**用途**: PM 回复时发送的免费诱饵物料

- [ ] **Step 1: 准备信息图内容**

内容结构（4个板块，纵向信息图）：

```
标题：2026港人中山買樓避坑清單
副标题：Jacky实地睇楼3年总结 · 帮过百位港人上车 · 避开5大陷阱悭几十万

板块1️⃣ — 陷阱一：雙合同
  图标：⚠️ 文件
  描述：sales叫你签两份合同，一份购房一份装修。睇落悭税，实际总价一样。
  避坑：坚持睇「总代价」！所有收费写喺一份合同，唔好分开签。

板块2️⃣ — 陷阱二：税费计漏
  图标：💰 计算器
  描述：契税3%冇得分期，增值稅、個人所得稅⋯项项都係钱！
  避坑：签约前用「总价÷0.97」估算实际成本，预留10%额外资金。

板块3️⃣ — 陷阱三：爛尾樓
  图标：🏗️ 停工
  描述：平货未必好货！发展商资金链断裂，交唔到楼，你供楼佢冇楼交。
  避坑：查发展商背景+五证齐全+实地睇施工进度+问业主口碑。

板块4️⃣ — 陷阱四：配套夸大
  图标：🗺️ 地图
  描述：「地铁上盖」= 规划中？「名校学区」= 未挂牌？实地验证！
  避坑：自己开车兜一圈，实测超市/医院/学校距离，唔好信sales张图。

板块5️⃣ — 陷阱五：按揭陷阱
  图标：🏦 银行
  描述：港人按揭政策时时变，利率、成数、审批要求同香港完全唔同。
  避坑：先问银行预审批，清楚自己budget，唔好签完约先发现借唔到。

底部CTA：
  「睇完清单仲有疑问？即刻PM Jacky，帮您一对一分析！」
  「实地睇楼 · 按揭计算 · 税费精算 · 全程跟进」
```

- [ ] **Step 2: 使用 baoyu-infographic 生成信息图**

调用 baoyu-infographic 技能，传入上述内容结构。

- [ ] **Step 3: 保存到 docs/superpowers/assets/**

```bash
# 生成后保存
cp <generated-image> docs/superpowers/assets/avoid-pitfalls-checklist.png
git add docs/superpowers/assets/avoid-pitfalls-checklist.png
git commit -m "feat: add 避坑清单 infographic lead magnet"
```

### Task 5: 制作第二份诱饵 —《中山各区真实楼价对比表》

**工具**: `baoyu-infographic` 技能

- [ ] **Step 1: 准备数据内容**

```
标题：中山各區真實樓價對比（2026年6月）
副标题：港币计价 · 110㎡单位参考 · Jacky实地调研

对比表：
| 区域 | 均价(港币/呎) | 110㎡总价(港币) | 到深中通道 | 适合人群 |
|------|--------------|----------------|-----------|---------|
| 东区 | HK$1,800 | HK$215万 | 25分钟 | 家庭自住、学区需求 |
| 石岐 | HK$1,500 | HK$178万 | 30分钟 | 预算有限、老城区便利 |
| 西区 | HK$1,350 | HK$160万 | 35分钟 | 投资收租、性价比 |
| 火炬开发区 | HK$1,650 | HK$195万 | 15分钟 | 深中通道概念、升值潜力 |
| 三乡 | HK$1,050 | HK$125万 | 40分钟 | 低密度度假、别墅选择 |
| 坦洲 | HK$1,200 | HK$142万 | 20分钟 | 珠海概念、价格洼地 |
| 港口 | HK$1,100 | HK$130万 | 45分钟 | 预算最低、上车首选 |

数据来源：安居客、房天下、实地调研（2026年6月）
备注：实际成交价可能浮动±10%，以楼盘现场报价为准
```

- [ ] **Step 2: 使用 baoyu-infographic 生成**

- [ ] **Step 3: 保存并提交**

```bash
cp <generated-image> docs/superpowers/assets/price-comparison-table.png
git add docs/superpowers/assets/price-comparison-table.png
git commit -m "feat: add 中山楼价对比表 infographic lead magnet"
```

---

## Phase 3: 私域话术 & 数据追踪（第1周执行）

### Task 6: 落地 PM 回复话术模板

**Files:**
- Create: `config/pm_response_template.md`

- [ ] **Step 1: 创建话术模板文件**

创建 `config/pm_response_template.md`：

```markdown
# PM 回复话术模板

## 第一轮：即时回复（收到PM后5分钟内）

```
你好！我係 Jacky，專幫港人喺中山置業。呢份係《2026港人中山買樓避坑清單》，涵蓋：
✅ 港人最常中招嘅5個買樓陷阱
✅ 中山各區真實樓價對比表
✅ 深中通道沿線樓盤升值潛力排名

[发送图片: avoid-pitfalls-checklist.png]

另外想了解下，你嘅預算同目標區域係？等我可以俾啲針對性建議🙏
```

## 第二轮：需求反问（对方回复预算/区域后）

```
明白！[预算]喺[区域]可以睇到唔错嘅楼盘。
你主要係自住定投资？想睇新楼定二手？
了解多啲我可以帮你筛走唔合适嘅盘，慳时间👍
```

## 第三轮：推荐楼盘+视频（确认需求后）

```
根据你嘅需求，推荐你睇呢个盘：[楼盘名]
我之前实地拍过一条拆解片，你可以睇下先👇
[发送视频链接]

有兴趣嘅话我可以帮你约现场睇楼，视频带看都得～
```

## 第四轮：推进约看（对方看完视频后）

```
觉得点样？呢个盘而家仲有几套好楼层。
如果你想实地睇，我今个星期[三/六]都得闲。
或者我先帮你计一计按揭+税费，等你心中有数？
```

## 微信群发模板（温+冷客户，每周三）

```
🏠 今周中山笋盘速报：
[楼盘名] — [价格] — [亮点一句话]
有兴趣了解PM我，帮您详细拆解～
```

## 意向标签体系（微信标签）

| 标签 | 含义 | 判断标准 |
|------|------|----------|
| 🔥意向-热 | 准备睇楼 | 问了具体楼盘/价格/流程/约时间 |
| 🟡意向-温 | 有兴趣但不急 | 领了清单，说"谢谢""睇睇先" |
| 🔵意向-冷 | 只是路过 | 领了清单没回复，或只是say hi |
| ⭐已成交 | 已买楼 | 完成交易 |
| ❌已流失 | 明确不买 | 说"暂时不考虑" |
```

- [ ] **Step 2: Commit**

```bash
git add config/pm_response_template.md
git commit -m "docs: add PM response templates and WeChat tag system"
```

### Task 7: 建立每周数据追踪表

**Files:**
- Create: `data/funnel_tracker.csv`

- [ ] **Step 1: 创建追踪表**

创建 `data/funnel_tracker.csv`：

```csv
周次,日期,视频数,总播放,PM咨询数,发送清单数,热意向数,温意向数,冷意向数,约看房数,成交数,备注
W25,2026-06-16,,,,,,,,,,
```

- [ ] **Step 2: Commit**

```bash
git add data/funnel_tracker.csv
git commit -m "docs: add weekly funnel data tracker"
```

---

## Phase 4: 第一周执行 — 正式跑起来

### Task 8: 执行第1周 Day 1-7（按设计 spec 路线图）

以下是第1周的逐日执行清单（流程层面，按 spec 第五块执行）：

- [ ] **Day 1**: 制作避坑清单信息图（Task 4）
- [ ] **Day 2**: 写定 PM 话术模板 + 设置微信意向标签（Task 6）
- [ ] **Day 3**: 用 `generate_scripts_for_tier(suggestions, "viral", api_key)` 批量生成5条引流轰炸脚本
- [ ] **Day 4**: 录制2条引流视频 + 用 `build_timeline()` 生成 timeline JSON + 渲染
- [ ] **Day 5**: 发布视频 + 启用新话术回复 PM
- [ ] **Day 6**: 制作楼价对比表信息图（Task 5）
- [ ] **Day 7**: 整理本周 PM 数据，打标签分层，填入 `funnel_tracker.csv`

---

## 验证清单

- [ ] `shared/test_script_writer.py` 12 个测试全过
- [ ] `shared/test_timeline_builder.py` 6 个测试全过
- [ ] `python scripts/generate_and_render.py viral "测试选题"` 能生成 script + timeline JSON
- [ ] 生成的 timeline JSON 能被 `npx tsx scripts/render_pip.ts <timeline.json>` 成功渲染
- [ ] 两份信息图物料已生成并保存
- [ ] PM 话术模板文件已创建
- [ ] 数据追踪表已建立
