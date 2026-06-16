"""Tests for shared/timeline_builder.py."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.timeline_builder import (
    build_timeline,
    TIER_CARD_SEQUENCE,
    CARD_DURATION_MAP,
)

# Valid Position9 values from animation.ts
VALID_POSITIONS = {
    "top-left", "top-center", "top-right",
    "center-left", "center", "center-right",
    "bottom-left", "bottom-center", "bottom-right",
    "safe-top",
}

# Valid AnimationType values from animation.ts
VALID_ANIMATIONS = {
    "fade", "slideUp", "slideDown", "slideLeft", "slideRight",
    "scale", "spring", "typewriter",
}


def test_build_timeline_viral():
    """引流轰炸: HookCard -> CTACard, 15-25s total."""
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
    # Duration should be 15-25s (450-750 frames at 30fps)
    frames = timeline["durationInFrames"]
    assert 450 <= frames <= 750, f"Expected 450-750 frames, got {frames}"


def test_build_timeline_flash():
    """笋盘速报: HookCard -> DataPanel -> PriceRevealCard -> CTACard, 30-45s."""
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
    assert "DataPanel" in types
    assert "PriceRevealCard" in types
    assert "CTACard" in types
    # 30-45s (900-1350 frames at 30fps)
    frames = timeline["durationInFrames"]
    assert 900 <= frames <= 1350, f"Expected 900-1350 frames, got {frames}"


def test_build_timeline_deep():
    """深度拆解: HookCard -> DataComparison -> Checklist -> Warning -> Timeline -> CTA, 60-90s."""
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
    assert "WarningCard" in types
    assert "TimelineCard" in types
    assert "CTACard" in types
    frames = timeline["durationInFrames"]
    assert 1800 <= frames <= 2700, f"Expected 1800-2700 frames, got {frames}"


def test_build_timeline_uses_valid_positions():
    """All elements use positions from the Position9 type."""
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
            assert el["position"] in VALID_POSITIONS, \
                f"Position '{el['position']}' not in Position9 for tier={tier}"


def test_build_timeline_uses_valid_animations():
    """All elements use animations from the AnimationType union."""
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
            assert el["animation"] in VALID_ANIMATIONS, \
                f"Animation '{el['animation']}' not in AnimationType for tier={tier}"


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
        assert enter_frames[i] > enter_frames[i - 1], \
            f"Element {i} enters at {enter_frames[i]}, not after element {i-1} at {enter_frames[i-1]}"


def test_tier_card_sequence_is_defined():
    """All three tiers have defined card sequences."""
    assert "viral" in TIER_CARD_SEQUENCE
    assert "flash" in TIER_CARD_SEQUENCE
    assert "deep" in TIER_CARD_SEQUENCE
    assert len(TIER_CARD_SEQUENCE["viral"]) >= 2
    assert len(TIER_CARD_SEQUENCE["flash"]) >= 3
    assert len(TIER_CARD_SEQUENCE["deep"]) >= 4


def test_each_element_has_required_schema_fields():
    """Every element has the required PipOverlaySchema fields."""
    script = {
        "title": "test",
        "hook": "test hook",
        "body": "test body",
        "cta": "test CTA",
        "full_script": "test full",
    }
    required_element_fields = {"type", "enterAt", "exitAt", "animation", "position", "props"}
    required_timeline_fields = {"elements", "width", "height", "fps", "durationInFrames"}

    for tier in ["viral", "flash", "deep"]:
        timeline = build_timeline(script, tier=tier)
        # Top-level fields
        for field in required_timeline_fields:
            assert field in timeline, f"Missing top-level field '{field}' in tier={tier}"
        # Element fields
        for el in timeline["elements"]:
            for field in required_element_fields:
                assert field in el, f"Missing element field '{field}' in tier={tier}, type={el.get('type')}"
            # offset is optional but if present must have x,y
            if "offset" in el:
                assert "x" in el["offset"]
                assert "y" in el["offset"]


def test_ctacard_props_match_component_interface():
    """CTACard props must match the TypeScript CTACardProps interface."""
    script = {
        "title": "test",
        "hook": "test hook",
        "body": "test body",
        "cta": "PM我获取详细资料",
        "full_script": "test full",
    }
    for tier in ["viral", "flash", "deep"]:
        timeline = build_timeline(script, tier=tier)
        cta_elements = [e for e in timeline["elements"] if e["type"] == "CTACard"]
        assert len(cta_elements) == 1, f"Expected exactly 1 CTACard in tier={tier}"
        props = cta_elements[0]["props"]
        assert "headline" in props, f"CTACard missing 'headline' in tier={tier}"
        assert "contact" in props, f"CTACard missing 'contact' in tier={tier}"
        # tags must be a list if present
        if "tags" in props:
            assert isinstance(props["tags"], list), \
                f"CTACard 'tags' must be a list, got {type(props['tags'])}"


def test_hookcard_props_match_component_interface():
    """HookCard props must match the TypeScript HookCardProps interface."""
    script = {
        "title": "test title here",
        "hook": "test hook here",
        "body": "test body here",
        "cta": "test CTA",
        "full_script": "test full",
    }
    timeline = build_timeline(script, tier="viral")
    hook_elements = [e for e in timeline["elements"] if e["type"] == "HookCard"]
    assert len(hook_elements) == 1
    props = hook_elements[0]["props"]
    assert "label" in props, "HookCard missing 'label'"
    assert "headline" in props, "HookCard missing 'headline'"


def test_warningcard_props_match_component_interface():
    """WarningCard props must match the TypeScript WarningCardProps interface."""
    script = {
        "title": "test title",
        "hook": "test hook",
        "body": "test body content for warning",
        "cta": "test CTA",
        "full_script": "test full",
    }
    timeline = build_timeline(script, tier="deep")
    warning_elements = [e for e in timeline["elements"] if e["type"] == "WarningCard"]
    assert len(warning_elements) == 1
    props = warning_elements[0]["props"]
    assert "n" in props, "WarningCard missing 'n'"
    assert isinstance(props["n"], int), f"WarningCard 'n' must be int, got {type(props['n'])}"
    assert "title" in props, "WarningCard missing 'title'"
    assert "desc" in props, "WarningCard missing 'desc'"


def test_timelinecard_props_match_component_interface():
    """TimelineCard props must match the TypeScript TimelineCardProps interface."""
    script = {
        "title": "test title",
        "hook": "test hook",
        "body": "第一，step one。第二，step two。第三，step three。",
        "cta": "test CTA",
        "full_script": "test full",
    }
    timeline = build_timeline(script, tier="deep")
    tl_elements = [e for e in timeline["elements"] if e["type"] == "TimelineCard"]
    assert len(tl_elements) == 1
    props = tl_elements[0]["props"]
    assert "steps" in props, "TimelineCard missing 'steps'"
    assert isinstance(props["steps"], list), f"TimelineCard 'steps' must be list, got {type(props['steps'])}"
    assert len(props["steps"]) >= 1, "TimelineCard 'steps' must have at least 1 item"


def test_checklistcard_props_match_component_interface():
    """ChecklistCard props must match the TypeScript ChecklistCardProps interface."""
    script = {
        "title": "test title",
        "hook": "test hook",
        "body": "第一，item one。第二，item two。第三，item three。",
        "cta": "test CTA",
        "full_script": "test full",
    }
    timeline = build_timeline(script, tier="deep")
    cl_elements = [e for e in timeline["elements"] if e["type"] == "ChecklistCard"]
    assert len(cl_elements) == 1
    props = cl_elements[0]["props"]
    assert "items" in props, "ChecklistCard missing 'items'"
    assert isinstance(props["items"], list), f"ChecklistCard 'items' must be list, got {type(props['items'])}"
    assert len(props["items"]) >= 1, "ChecklistCard 'items' must have at least 1 item"
