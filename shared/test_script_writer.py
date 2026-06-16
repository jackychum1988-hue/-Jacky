"""Tests for shared/script_writer.py — pure functions only (no API calls)."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.script_writer import _extract_topic_suggestions, format_scripts_for_push


def test_extract_zs_property_suggestions():
    """Extract from zs-property-agent style '💡 Jacky今日话题建议' section."""
    analysis = """
## 📊 今日市场速览
中山楼市今日平稳。

## 💡 Jacky今日话题建议
1. **深中通道开通两年，中山楼价到底涨了多少？**
   切入角度：用数据说话，对比开通前后各片区呎价变化

2. **港人在中山买二手楼，三大陷阱千万别踩**
   切入角度：经验分享，真实案例

## 🏛 政策与城建
"""
    result = _extract_topic_suggestions(analysis)
    assert len(result) == 2
    assert "深中通道" in result[0]
    assert "二手楼" in result[1]


def test_extract_kol_watcher_suggestions():
    """Extract from kol-watcher-agent style '差异化选题建议' section."""
    analysis = """
## 话题风向
今日最热：二手笋盘、港车北上

## 差异化选题建议
1. **标题：中山三乡200万唔使买到三层别墅？实地睇真D**
   切入角度：带客实地看房纪实，展示真实成交价
   与竞品的差异：竞品只讲价格，Jacky展示实际居住体验

2. **标题：港人中山买楼按揭最新攻略2026**
   切入角度：专业知识对比港中按揭利率
   与竞品的差异：竞品讲政策条文，Jacky用真实案例计算供款

## 下周预测
"""
    result = _extract_topic_suggestions(analysis)
    assert len(result) == 2
    assert "三乡" in result[0]
    assert "按揭" in result[1]


def test_extract_no_suggestions():
    """Return empty list when no topic section found."""
    analysis = "## 今日市场速览\n今日暂无数据。"
    result = _extract_topic_suggestions(analysis)
    assert result == []


def test_extract_empty_section():
    """Return empty list when section exists but is empty."""
    analysis = "## 💡 Jacky今日话题建议\n\n## 其他内容"
    result = _extract_topic_suggestions(analysis)
    assert result == []


def test_format_scripts_for_push():
    """Format scripts into PushPlus markdown with all sections."""
    scripts = [
        {
            "title": "中山三乡别墅200万？实地睇楼",
            "hook": "200万在中山能买什么？",
            "body": "今日带大家来三乡看一套三层别墅。第一，200万港币唔使，呎价低过香港公屋。第二，附近有高速直通深中通道，去深圳只需40分钟。第三，周边配套齐全，商场学校医院都有。",
            "cta": "你会考虑在中山买别墅吗？评论区告诉我～",
            "full_script": "200万在中山能买什么？今日带大家来三乡看一套三层别墅...",
        },
        {
            "title": "港人中山按揭最新攻略",
            "hook": "港人在中山买楼按揭有新变化",
            "body": "最近银行对港人按揭政策有调整。首先是首付比例，其次是利率优惠，最后是要准备的资料清单。",
            "cta": "有问题评论区问我，帮到你嘅话点赞关注～",
            "full_script": "港人在中山买楼按揭有新变化...",
        },
    ]

    result = format_scripts_for_push(scripts, date_str="06/04")

    assert "🎙 **Jacky今日口播** | 06/04" in result
    assert "**【选题1】**" in result
    assert "**【选题2】**" in result
    assert "🎣 钩子：" in result
    assert "📖 正文：" in result
    assert "🎯 结尾：" in result
    assert "📝 **完整读稿：**" in result
    assert "三乡" in result
    assert "按揭" in result
    assert "---" in result  # separator between scripts


def test_extract_none_input():
    """Return empty list when analysis_text is None."""
    result = _extract_topic_suggestions(None)
    assert result == []


def test_format_scripts_for_push_empty():
    """Format empty scripts list returns just the header."""
    result = format_scripts_for_push([], date_str="06/04")
    assert "🎙 **Jacky今日口播** | 06/04" in result
    assert "**【选题" not in result  # no topic entries


# === Tiered Prompt Tests ===

from shared.script_writer import build_tier_prompt, TIER_PROMPTS


def test_build_tier_prompt_viral():
    """引流轰炸 tier: 15-25s, strong hook, instant CTA."""
    prompt = build_tier_prompt("viral")
    assert "15-25秒" in prompt
    assert "钩子" in prompt
    assert "CTA" in prompt
    assert "严禁" in prompt


def test_build_tier_prompt_flash():
    """笋盘速报 tier: 30-45s, data-focused."""
    prompt = build_tier_prompt("flash")
    assert "30-45秒" in prompt
    assert ("数据" in prompt or "数字" in prompt)
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
