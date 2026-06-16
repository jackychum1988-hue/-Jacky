"""Script-to-PipOverlay-Timeline mapper.

Converts generated spoken scripts (from script_writer.py) into
PipOverlay-compatible timeline JSON for remotion-realestate rendering.

Timeline JSON spec: PipOverlaySchema in remotion-realestate/src/scenes/PipOverlay.tsx
Element types: overlayComponentMap in remotion-realestate/src/components/overlay/index.ts

All Position9 values from remotion-realestate/src/components/overlay/animation.ts
All AnimationType values from remotion-realestate/src/components/overlay/animation.ts
All component prop interfaces match the TypeScript definitions in each overlay/*.tsx file.
"""

import json
import os
import re
from datetime import datetime
from functools import lru_cache

# ---------------------------------------------------------------------------
# Card sequence per content tier
# ---------------------------------------------------------------------------

TIER_CARD_SEQUENCE = {
    "viral": ["HookCard", "CTACard"],
    "flash": ["HookCard", "DataPanel", "PriceRevealCard", "CTACard"],
    "deep": [
        "HookCard",
        "DataComparisonCard",
        "ChecklistCard",
        "WarningCard",
        "TimelineCard",
        "CTACard",
    ],
}

# ---------------------------------------------------------------------------
# Per-card-type configuration tables
# ---------------------------------------------------------------------------

# Frame duration per card type (at 30fps)
CARD_DURATION_MAP = {
    "HookCard": 180,             # 6s
    "CTACard": 210,              # 7s
    "DataPanel": 240,            # 8s
    "PriceRevealCard": 240,      # 8s
    "DataComparisonCard": 360,   # 12s
    "ChecklistCard": 300,        # 10s
    "WarningCard": 240,          # 8s
    "TimelineCard": 360,         # 12s
}

# Card positions — must be valid Position9 values:
#   top-left | top-center | top-right
# | center-left | center | center-right
# | bottom-left | bottom-center | bottom-right
# | safe-top
CARD_POSITIONS = {
    "HookCard": "safe-top",
    "CTACard": "bottom-center",
    "DataPanel": "center",
    "PriceRevealCard": "center",
    "DataComparisonCard": "center",
    "ChecklistCard": "center",
    "WarningCard": "center",
    "TimelineCard": "center",
}

# Card accent colours (matches zhuzige V palette)
CARD_COLORS = [
    "#1A56DB",   # deep-blue
    "#F5A623",   # amber
    "#10B981",   # emerald
    "#FF4136",   # red
    "#8B5CF6",   # violet
    "#06B6D4",   # cyan
]

# Card entry animation — must be valid AnimationType values:
#   fade | slideUp | slideDown | slideLeft | slideRight | scale | spring | typewriter
CARD_ANIMATION = {
    "HookCard": "spring",
    "CTACard": "slideUp",
    "DataPanel": "slideLeft",
    "PriceRevealCard": "spring",
    "DataComparisonCard": "slideLeft",
    "ChecklistCard": "slideUp",
    "WarningCard": "fade",
    "TimelineCard": "slideUp",
}

# ---------------------------------------------------------------------------
# Default / fallback display strings
# ---------------------------------------------------------------------------

DEFAULTS = {
    "hook_label": "中山置业",
    "cta_headline": "有兴趣即刻PM我",
    "cta_contact": "PM",
    "cta_tags": ["#港人中山置业", "#避坑清单", "#中山买楼"],
    "datapanel_title": "数据面板",
    "price_tag": "笋盘速报",
    "price_label": "总价",
    "price_unit": "起",
    "price_fallback": "200万",
    "comparison_label": "深度拆解",
    "comparison_left_label": "项目A",
    "comparison_right_label": "项目B",
    "comparison_value": "待定",
    "comparison_delta": "详情PM",
    "checklist_title": "核心要点",
    "checklist_fallback": "待补充",
    "warning_title": "避坑提醒",
    "warning_desc": "购买前请仔细核实相关信息",
    "timeline_title": "流程步骤",
    "timeline_step_label": "步骤1",
    "no_number_sentinel": "--",
}

# ---------------------------------------------------------------------------
# Pre-compiled regex patterns (module-level to avoid re-compilation per call)
# ---------------------------------------------------------------------------

_RE_CN_ORDINAL = re.compile(r'(?:第[一二三四五六七八九十]+[，,、]?\s*)')
_RE_CN_BULLET  = re.compile(r'(?:[一二三四五六七八九十]+[、．.,])\s*')
_RE_NUMERIC    = re.compile(r'\d+[\.\)、]\s*')
_RE_CHINESE_NUMBER = re.compile(r'(\d[\d,.-]*(?:万|亿|千|蚊|元|%|平)?)')


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _truncate(text: str, max_len: int) -> str:
    """Truncate text to max_len chars, appending an ellipsis if cut."""
    if len(text) <= max_len:
        return text
    return text[:max_len] + "…"


@lru_cache(maxsize=8)
def _split_numbered_body(body: str) -> tuple:
    """Split a Chinese body string into items/steps by numbered markers.

    Matches patterns like:
        第一，... 第二，... 第三，...
        1. ... 2. ... 3. ...
        一、... 二、... 三、...

    Returns a tuple of item strings (hashable, for lru_cache).
    """
    if not body:
        return ()

    # Try Chinese ordinal markers: 第一，/ 第二，/ etc.
    cn_ordinal = [s.strip() for s in _RE_CN_ORDINAL.split(body) if s.strip()]
    if len(cn_ordinal) >= 2:
        return tuple(cn_ordinal)

    # Try Chinese bullet: 一、/ 二、/ etc.
    cn_bullet = [s.strip() for s in _RE_CN_BULLET.split(body) if s.strip()]
    if len(cn_bullet) >= 2:
        return tuple(cn_bullet)

    # Try numeric: 1. / 2. / etc.
    num = [s.strip() for s in _RE_NUMERIC.split(body) if s.strip()]
    if len(num) >= 2:
        return tuple(num)

    # Fallback: return the whole body as a single item
    return (body.strip(),)


def _extract_number(body: str) -> str:
    """Attempt to extract a numeric value from a body string.

    Used by DataPanel and PriceRevealCard to populate numeric fields.
    Returns a placeholder if no number found.
    """
    if not body:
        return DEFAULTS["no_number_sentinel"]
    m = _RE_CHINESE_NUMBER.search(body)
    if m:
        return m.group(1)
    return DEFAULTS["no_number_sentinel"]


# ---------------------------------------------------------------------------
# Element builder
# ---------------------------------------------------------------------------

def _build_element(
    card_type: str,
    enter_at: int,
    exit_at: int,
    script: dict,
    color: str,
) -> dict:
    """Build a single PipOverlay element dict from card type and script data.

    Every prop name and type matches the TypeScript component interface in
    remotion-realestate/src/components/overlay/<CardType>.tsx.

    Args:
        card_type: Component name string (e.g. "HookCard").
        enter_at: Frame at which the element starts appearing.
        exit_at: Frame at which the element starts exiting.
        script: Script dict with title/hook/body/cta/full_script.
        color: Accent colour hex string.

    Returns:
        Element dict compatible with PipOverlaySchema.elementSchema.
    """
    title = script.get("title", "")
    hook = script.get("hook", "")
    body = script.get("body", "")
    cta = script.get("cta", "")

    props: dict = {"color": color}

    # --- HookCard ---
    # Interface: { label, headline, enText?, icon?, color?, subline? }
    if card_type == "HookCard":
        props.update({
            "label": title[:8] if title else DEFAULTS["hook_label"],
            "headline": hook or title,
            "icon": "alert",
        })
        if body:
            props["subline"] = _truncate(body, 60)

    # --- CTACard ---
    # Interface: { icon?, headline, enHeadline?, contact, enLabel?, color?, tags? }
    elif card_type == "CTACard":
        props.update({
            "headline": cta or DEFAULTS["cta_headline"],
            "contact": DEFAULTS["cta_contact"],
            "tags": DEFAULTS["cta_tags"],
        })

    # --- DataPanel ---
    # Interface: { title, value, subtitle?, color? }
    elif card_type == "DataPanel":
        props.update({
            "title": title or DEFAULTS["datapanel_title"],
            "value": _extract_number(body),
        })
        if body:
            props["subtitle"] = _truncate(body, 40)

    # --- PriceRevealCard ---
    # Interface: { tag, subtitle, priceLabel, priceValue, priceUnit, enTag?, enSubtitle?, color? }
    elif card_type == "PriceRevealCard":
        num_value = _extract_number(body)
        props.update({
            "tag": DEFAULTS["price_tag"],
            "subtitle": hook or title,
            "priceLabel": DEFAULTS["price_label"],
            "priceValue": num_value if num_value != DEFAULTS["no_number_sentinel"] else DEFAULTS["price_fallback"],
            "priceUnit": DEFAULTS["price_unit"],
        })

    # --- DataComparisonCard ---
    # Interface: { label?, icon?, leftLabel, leftValue, leftUnit?, rightLabel, rightValue,
    #              rightUnit?, centerLabel?, centerValue?, centerUnit?, enLeftLabel?,
    #              enCenterLabel?, enRightLabel?, delta?, enDelta?, color? }
    elif card_type == "DataComparisonCard":
        props.update({
            "label": DEFAULTS["comparison_label"],
            "leftLabel": DEFAULTS["comparison_left_label"],
            "leftValue": DEFAULTS["comparison_value"],
            "rightLabel": DEFAULTS["comparison_right_label"],
            "rightValue": DEFAULTS["comparison_value"],
            "delta": DEFAULTS["comparison_delta"],
            "icon": "chart",
        })

    # --- ChecklistCard ---
    # Interface: { label?, title?, enTitle?, items: [{label, enLabel?}], color? }
    elif card_type == "ChecklistCard":
        items_raw = _split_numbered_body(body)
        items = [{"label": _truncate(raw, 40)} for raw in items_raw[:5]]
        if not items:
            items = [{"label": _truncate(body, 40) if body else DEFAULTS["checklist_fallback"]}]
        props.update({
            "title": title or DEFAULTS["checklist_title"],
            "items": items,
        })

    # --- WarningCard ---
    # Interface: { label?, n, title, desc, enTitle?, enDesc?, icon?, color?, bullets? }
    elif card_type == "WarningCard":
        # Compute display number: position of WarningCard in deep sequence + 1
        deep_seq = TIER_CARD_SEQUENCE["deep"]
        n_value = deep_seq.index("WarningCard") + 1 if "WarningCard" in deep_seq else 1
        bullets = [_truncate(b, 60) for b in _split_numbered_body(body)[:3]]
        props.update({
            "n": n_value,
            "title": DEFAULTS["warning_title"],
            "desc": _truncate(body, 100) if body else DEFAULTS["warning_desc"],
            "icon": "alert",
            "bullets": bullets,
        })

    # --- TimelineCard ---
    # Interface: { title?, enTitle?, steps: [{label, enLabel?, desc?, enDesc?}], color? }
    elif card_type == "TimelineCard":
        steps_raw = _split_numbered_body(body)
        steps = []
        for i, raw in enumerate(steps_raw[:6]):
            steps.append({
                "label": f"步骤{i + 1}",
                "desc": _truncate(raw, 60),
            })
        if not steps:
            steps = [{"label": DEFAULTS["timeline_step_label"], "desc": _truncate(body, 60) if body else DEFAULTS["checklist_fallback"]}]
        props.update({
            "title": title or "流程步骤",
            "steps": steps,
        })

    return {
        "type": card_type,
        "enterAt": enter_at,
        "exitAt": exit_at,
        "animation": CARD_ANIMATION.get(card_type, "spring"),
        "position": CARD_POSITIONS.get(card_type, "center"),
        "offset": {"x": 0, "y": 0},
        "props": props,
    }


# ---------------------------------------------------------------------------
# Main API
# ---------------------------------------------------------------------------

def build_timeline(script: dict, tier: str = "deep", fps: int = 30) -> dict:
    """Convert a script dict into a PipOverlay-compatible timeline JSON.

    Args:
        script: Script dict with title/hook/body/cta/full_script.
        tier: Content tier — 'viral' (15-25s), 'flash' (30-45s), 'deep' (60-90s).
        fps: Frames per second (default 30).

    Returns:
        Timeline dict compatible with PipOverlaySchema:
            { width, height, fps, durationInFrames, elements: [...] }

        Each element has: type, enterAt, exitAt, animation, position, offset?, props.
    """
    card_sequence = TIER_CARD_SEQUENCE.get(tier, TIER_CARD_SEQUENCE["deep"])

    elements = []
    current_frame = 0
    # Gap between cards (1s = 30 frames) — gives clean separation
    gap = 30

    for i, card_type in enumerate(card_sequence):
        card_duration = CARD_DURATION_MAP.get(card_type, 240)
        enter_at = current_frame
        exit_at = current_frame + card_duration
        is_last = i == len(card_sequence) - 1

        # Last card (always CTA) gets a small hold at the end
        if is_last:
            exit_at = current_frame + card_duration + gap

        color = CARD_COLORS[i % len(CARD_COLORS)]
        element = _build_element(card_type, enter_at, exit_at, script, color)
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
    """Save timeline dict as a JSON file.

    Args:
        timeline: Timeline dict from build_timeline().
        output_path: Absolute or relative file path.

    Returns:
        The output path (for chaining).
    """
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(timeline, f, ensure_ascii=False, indent=2)
    return output_path


def script_to_timeline_json(
    script: dict,
    tier: str = "deep",
    output_dir: str = "remotion-realestate/config/timelines",
) -> str:
    """Full convenience pipeline: script -> timeline build -> save JSON.

    Args:
        script: Script dict from script_writer.py.
        tier: Content tier.
        output_dir: Directory to save the timeline JSON file.
                    Defaults to remotion-realestate/config/timelines/.

    Returns:
        Absolute path to the saved timeline JSON file.
    """
    os.makedirs(output_dir, exist_ok=True)

    timeline = build_timeline(script, tier=tier)
    date_str = datetime.now().strftime("%Y%m%d")
    title_slug = (
        script.get("title", "untitled")[:20]
        .replace(" ", "-")
        .replace("/", "-")
        .replace("\\", "-")
    )
    filename = f"{date_str}-{tier}-{title_slug}.json"
    output_path = os.path.join(output_dir, filename)

    return save_timeline(timeline, output_path)
