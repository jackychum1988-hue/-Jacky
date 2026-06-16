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
# Frame duration per card type (at 30fps)
# ---------------------------------------------------------------------------

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

# ---------------------------------------------------------------------------
# Card positions (must be valid Position9 values)
#   Position9 = top-left | top-center | top-right
#             | center-left | center | center-right
#             | bottom-left | bottom-center | bottom-right
#             | safe-top
# ---------------------------------------------------------------------------

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

# ---------------------------------------------------------------------------
# Card accent colours (matches zhuzige V palette + gold accent)
# ---------------------------------------------------------------------------

CARD_COLORS = [
    "#1A56DB",   # deep-blue
    "#F5A623",   # amber
    "#10B981",   # emerald
    "#FF4136",   # red
    "#8B5CF6",   # violet
    "#06B6D4",   # cyan
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _split_numbered_body(body: str) -> list[str]:
    """Split a Chinese body string into items/steps by numbered markers.

    Matches patterns like:
        第一，... 第二，... 第三，...
        1. ... 2. ... 3. ...
        一、... 二、... 三、...
    Returns a list of item strings, stripping the marker prefix.
    """
    if not body:
        return [body] if body else []

    # Try Chinese ordinal markers: 第一，/ 第二，/ etc.
    cn_ordinal = re.split(r'(?:第[一二三四五六七八九十]+[，,、]?\s*)', body)
    cn_ordinal = [s.strip() for s in cn_ordinal if s.strip()]
    if len(cn_ordinal) >= 2:
        return cn_ordinal

    # Try Chinese bullet: 一、/ 二、/ etc.
    cn_bullet = re.split(r'(?:[一二三四五六七八九十]+[、．.,])\s*', body)
    cn_bullet = [s.strip() for s in cn_bullet if s.strip()]
    if len(cn_bullet) >= 2:
        return cn_bullet

    # Try numeric: 1. / 2. / etc.
    num = re.split(r'\d+[\.\)、]\s*', body)
    num = [s.strip() for s in num if s.strip()]
    if len(num) >= 2:
        return num

    # Fallback: return the whole body as a single item
    return [body.strip()]


def _extract_number(body: str) -> str:
    """Attempt to extract a numeric value from a body string.

    Used by DataPanel to populate the 'value' field.
    Returns a placeholder if no number found.
    """
    if not body:
        return "--"
    # Match patterns like "1.2万", "200万", "47万", "涨咗2000蚊"
    m = re.search(r'(\d[\d,.]*(?:万|亿|千|蚊|元|%|平)?)', body)
    if m:
        return m.group(1)
    return "--"


# ---------------------------------------------------------------------------
# Element builder
# ---------------------------------------------------------------------------

def _build_element(
    card_type: str,
    enter_at: int,
    exit_at: int,
    script: dict,
    color: str,
    index: int,
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
        index: Zero-based index in the card sequence (for colour cycling).

    Returns:
        Element dict compatible with PipOverlaySchema.elementSchema.
    """
    title = script.get("title", "")
    hook = script.get("hook", "")
    body = script.get("body", "")
    cta = script.get("cta", "")
    full_script = script.get("full_script", "")

    props: dict = {"color": color}
    animation = "spring"  # default

    # --- HookCard ---
    # Interface: { label, headline, enText?, icon?, color?, subline? }
    if card_type == "HookCard":
        props.update({
            "label": title[:8] if title else "中山置业",
            "headline": hook or title,
            "icon": "alert",
        })
        # Only add subline if body is short enough to read alongside headline
        if body and len(body) <= 60:
            props["subline"] = body
        elif body:
            props["subline"] = body[:60]
        animation = "spring"

    # --- CTACard ---
    # Interface: { icon?, headline, enHeadline?, contact, enLabel?, color?, tags? }
    elif card_type == "CTACard":
        props.update({
            "headline": cta or "有兴趣即刻PM我",
            "contact": "PM",
            "tags": ["#港人中山置业", "#避坑清单", "#中山买楼"],
        })
        animation = "slideUp"

    # --- DataPanel ---
    # Interface: { title, value, subtitle?, color? }
    elif card_type == "DataPanel":
        props.update({
            "title": title or "数据面板",
            "value": _extract_number(body),
        })
        if body:
            subtitle = body[:40]
            if len(body) > 40:
                subtitle += "…"
            props["subtitle"] = subtitle
        animation = "slideLeft"

    # --- PriceRevealCard ---
    # Interface: { tag, subtitle, priceLabel, priceValue, priceUnit, enTag?, enSubtitle?, color? }
    elif card_type == "PriceRevealCard":
        props.update({
            "tag": "笋盘速报",
            "subtitle": hook or title,
            "priceLabel": "总价",
            "priceValue": _extract_number(body) if _extract_number(body) != "--" else "200万",
            "priceUnit": "起",
        })
        animation = "spring"

    # --- DataComparisonCard ---
    # Interface: { label?, icon?, leftLabel, leftValue, leftUnit?, rightLabel, rightValue,
    #              rightUnit?, centerLabel?, centerValue?, centerUnit?, enLeftLabel?,
    #              enCenterLabel?, enRightLabel?, delta?, enDelta?, color? }
    elif card_type == "DataComparisonCard":
        props.update({
            "label": "深度拆解",
            "leftLabel": "项目A",
            "leftValue": "待定",
            "rightLabel": "项目B",
            "rightValue": "待定",
            "delta": "详情PM",
            "icon": "chart",
        })
        animation = "slideLeft"

    # --- ChecklistCard ---
    # Interface: { label?, title?, enTitle?, items: [{label, enLabel?}], color? }
    elif card_type == "ChecklistCard":
        items_raw = _split_numbered_body(body)
        # Take at most 5 items, each truncated to 40 chars
        items = []
        for raw in items_raw[:5]:
            item_label = raw[:40]
            if len(raw) > 40:
                item_label += "…"
            items.append({"label": item_label})
        if not items:
            items = [{"label": body[:40] if body else "待补充"}]
        props.update({
            "title": title or "核心要点",
            "items": items,
        })
        animation = "slideUp"

    # --- WarningCard ---
    # Interface: { label?, n, title, desc, enTitle?, enDesc?, icon?, color?, bullets? }
    elif card_type == "WarningCard":
        bullets = _split_numbered_body(body)
        # Limit bullets and truncate each
        bullets = [b[:60] for b in bullets[:3]]
        props.update({
            "n": index + 1,
            "title": "避坑提醒",
            "desc": body[:100] if body else "购买前请仔细核实相关信息",
            "icon": "alert",
            "bullets": bullets,
        })
        animation = "fade"

    # --- TimelineCard ---
    # Interface: { title?, enTitle?, steps: [{label, enLabel?, desc?, enDesc?}], color? }
    elif card_type == "TimelineCard":
        steps_raw = _split_numbered_body(body)
        steps = []
        for i, raw in enumerate(steps_raw[:6]):
            step_label = f"步骤{i + 1}"
            step_desc = raw[:60]
            if len(raw) > 60:
                step_desc += "…"
            steps.append({"label": step_label, "desc": step_desc})
        if not steps:
            steps = [{"label": "步骤1", "desc": body[:60] if body else "待补充"}]
        props.update({
            "title": title or "流程步骤",
            "steps": steps,
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
    output_dir: str = "config/timelines",
) -> str:
    """Full convenience pipeline: script -> timeline build -> save JSON.

    Args:
        script: Script dict from script_writer.py.
        tier: Content tier.
        output_dir: Directory to save the timeline JSON file.

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
