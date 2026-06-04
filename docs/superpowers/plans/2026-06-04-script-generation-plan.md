# 口播文案自动生成 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在两个每日抓取系统中新增口播脚本自动生成，从 AI 分析中提取话题建议，生成 60-90 秒口播文案，独立推送到 Jacky 微信。

**Architecture:** 新建 `shared/script_writer.py` 共享模块（提取→生成→格式化→推送），两个 agent 的 `main.py` 各加 5 行调用代码。模块纯函数设计，API 密钥通过参数传入。

**Tech Stack:** Python 3.10+, requests, DeepSeek API, PushPlus

**Spec:** [2026-06-04-script-generation-design.md](../specs/2026-06-04-script-generation-design.md)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `shared/__init__.py` | Create | Python package marker |
| `shared/script_writer.py` | Create | Extract suggestions, generate scripts via DeepSeek, format & push via PushPlus |
| `zs-property-agent/main.py` | Modify | Add 5-line call after `analyze()` |
| `kol-watcher-agent/main.py` | Modify | Add 5-line call in `run_daily()` |

---

### Task 1: Create `shared/__init__.py`

**Files:**
- Create: `d:\房产个人IP香港\shared\__init__.py`

- [ ] **Step 1: Create empty init file**

```python
# shared package
```

- [ ] **Step 2: Commit**

```bash
git add shared/__init__.py
git commit -m "feat: add shared package init"
```

---

### Task 2: Write tests for `_extract_topic_suggestions`

**Files:**
- Create: `d:\房产个人IP香港\shared\test_script_writer.py`

- [ ] **Step 1: Write test file with test cases**

```python
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd "d:/房产个人IP香港/shared" && python -m pytest test_script_writer.py -v
```
Expected: FAIL — `ModuleNotFoundError: No module named 'shared.script_writer'`

- [ ] **Step 3: Commit**

```bash
git add shared/test_script_writer.py
git commit -m "test: add failing tests for script_writer extraction and formatting"
```

---

### Task 3: Implement `_extract_topic_suggestions` and `format_scripts_for_push`

**Files:**
- Create: `d:\房产个人IP香港\shared\script_writer.py`

- [ ] **Step 1: Create script_writer.py with pure functions**

```python
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


# === Pure Functions (testable without API) ===

def _extract_topic_suggestions(analysis_text: str) -> list[str]:
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


def format_scripts_for_push(scripts: list[dict], date_str: str = "") -> str:
    """Format scripts as PushPlus-compatible markdown."""
    if not date_str:
        date_str = datetime.now().strftime("%m/%d")

    lines = [f"🎙 **Jacky今日口播** | {date_str}", ""]

    for i, script in enumerate(scripts, 1):
        title = script.get("title", f"选题{i}")
        hook = script.get("hook", "")
        body = script.get("body", "")
        cta = script.get("cta", "")
        full = script.get("full_script", "")

        lines.append(f"**【选题{i}】{title}**")
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

        if i < len(scripts):
            lines.append("---")
            lines.append("")

    lines.append("")
    lines.append("> 🤖 由Jacky AI助手自动生成 | 直接读稿即可录制")

    return "\n".join(lines)


# === API-dependent Functions ===

def generate_scripts(
    suggestions: list[str],
    deepseek_api_key: str,
    deepseek_base_url: str = "https://api.deepseek.com",
    deepseek_model: str = "deepseek-chat",
    timeout: int = 60,
) -> list[dict]:
    """Call DeepSeek API to generate spoken scripts from topic suggestions.

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
    if not suggestions or not deepseek_api_key:
        return []

    user_message = "基于以下话题建议，生成60-90秒口播脚本：\n\n"
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
                    {"role": "system", "content": JACKY_SYSTEM_PROMPT},
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

        # Parse JSON from response (handle markdown code block wrapping)
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        result = json.loads(text)
        return result.get("scripts", [])

    except (requests.RequestException, json.JSONDecodeError, KeyError) as e:
        print(f"[script_writer] generate_scripts failed: {e}")
        return []


def push_scripts(
    content: str,
    pushplus_token: str,
    pushplus_url: str = "https://www.pushplus.plus/send",
    timeout: int = 15,
) -> bool:
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
    analysis_text: str,
    deepseek_api_key: str,
    pushplus_token: str,
    deepseek_base_url: str = "https://api.deepseek.com",
    deepseek_model: str = "deepseek-chat",
) -> bool:
    """Extract suggestions from analysis, generate scripts, and push to WeChat.

    This is the single entry point called by both agents.

    Args:
        analysis_text: Full AI analysis markdown from the agent.
        deepseek_api_key: DeepSeek API key.
        pushplus_token: PushPlus token for WeChat push.
        deepseek_base_url: API base URL (default DeepSeek).
        deepseek_model: Model name (default deepseek-chat).

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

    print(f"[script_writer] extracted {len(suggestions)} topic suggestions")

    # Step 2: Generate scripts via DeepSeek
    scripts = generate_scripts(
        suggestions,
        deepseek_api_key,
        deepseek_base_url,
        deepseek_model,
    )

    if not scripts:
        # Fallback: push raw suggestions so user at least sees the topics
        print("[script_writer] script generation returned empty, pushing raw suggestions as fallback")
        fallback = f"🎙 **Jacky今日口播** | {datetime.now().strftime('%m/%d')}\n\n⚠️ AI脚本生成暂不可用，以下是今日话题建议原文：\n\n{analysis_text}"
        push_scripts(fallback, pushplus_token)
        return False

    print(f"[script_writer] generated {len(scripts)} scripts")

    # Step 3: Format and push
    content = format_scripts_for_push(scripts)
    return push_scripts(content, pushplus_token)
```

- [ ] **Step 2: Run the extraction tests**

```bash
cd "d:/房产个人IP香港/shared" && python -m pytest test_script_writer.py::test_extract_zs_property_suggestions test_script_writer.py::test_extract_kol_watcher_suggestions test_script_writer.py::test_extract_no_suggestions test_script_writer.py::test_extract_empty_section -v
```
Expected: 4 PASS

- [ ] **Step 3: Commit**

```bash
git add shared/script_writer.py
git commit -m "feat: add shared script_writer module with extraction and formatting"
```

---

### Task 4: Write and run format tests

**Files:**
- Modify: `d:\房产个人IP香港\shared\test_script_writer.py`

- [ ] **Step 1: Add format test to the test file**

```python
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
```

- [ ] **Step 2: Run the format test**

```bash
cd "d:/房产个人IP香港/shared" && python -m pytest test_script_writer.py::test_format_scripts_for_push -v
```
Expected: PASS

- [ ] **Step 3: Run all tests together**

```bash
cd "d:/房产个人IP香港/shared" && python -m pytest test_script_writer.py -v
```
Expected: 5 PASS

- [ ] **Step 4: Commit**

```bash
git add shared/test_script_writer.py
git commit -m "test: add format_scripts_for_push test"
```

---

### Task 5: Integrate into `zs-property-agent/main.py`

**Files:**
- Modify: `d:\房产个人IP香港\zs-property-agent\main.py`

- [ ] **Step 1: Read current main.py to locate exact insertion point**

The insertion point is after `ai_analysis = analyze(results)` (around line 87) and before `report = build_report(...)` (around line 93).

- [ ] **Step 2: Add sys.path setup and config import at the top of main.py**

After the existing imports (line 21), add the project root to `sys.path` and import config values:

```python
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL, PUSHPLUS_TOKEN
```

- [ ] **Step 3: Add script generation call after analyze()**

After the existing block:
```python
    # AI analysis
    print("[main] running AI analysis...")
    ai_analysis = analyze(results)
    if ai_analysis:
        print(f"[main] AI analysis: {len(ai_analysis)} chars")
    else:
        print("[main] AI analysis skipped (no API key or failed)")
```

Add:
```python
    # Generate spoken scripts from topic suggestions
    print("[main] generating spoken scripts...")
    try:
        from shared.script_writer import generate_and_push
        generate_and_push(
            analysis_text=ai_analysis or "",
            deepseek_api_key=DEEPSEEK_API_KEY,
            pushplus_token=PUSHPLUS_TOKEN,
            deepseek_base_url=DEEPSEEK_BASE_URL,
            deepseek_model=DEEPSEEK_MODEL,
        )
    except Exception as e:
        print(f"[main] script generation failed (non-fatal): {e}")
```

- [ ] **Step 4: Verify the file is valid Python**

```bash
cd "d:/房产个人IP香港/zs-property-agent" && python -c "import ast; ast.parse(open('main.py', encoding='utf-8').read()); print('Syntax OK')"
```
Expected: `Syntax OK`

- [ ] **Step 5: Commit**

```bash
git add zs-property-agent/main.py
git commit -m "feat: integrate script generation into zs-property-agent"
```

---

### Task 6: Integrate into `kol-watcher-agent/main.py`

**Files:**
- Modify: `d:\房产个人IP香港\kol-watcher-agent\main.py`

- [ ] **Step 1: Add sys.path setup and expand config import at the top of main.py**

Add after the existing imports (line 3-4, after `import os`):

```python
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
```

Extend the existing config import (line 9-11) to include API keys:

```python
from config import (
    HISTORY_FILE, OUTPUT_DIR, Platform,
    DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL, PUSHPLUS_TOKEN,
)
```

- [ ] **Step 2: Add script generation call in run_daily()**

In the `run_daily()` function, after:
```python
    print(f"[main] analyzing {len(items)} items...")
    analysis = analyze_daily(items)
```

Add:
```python
    # Generate spoken scripts from topic suggestions
    print("[main] generating spoken scripts...")
    try:
        from shared.script_writer import generate_and_push
        generate_and_push(
            analysis_text=analysis or "",
            deepseek_api_key=DEEPSEEK_API_KEY,
            pushplus_token=PUSHPLUS_TOKEN,
            deepseek_base_url=DEEPSEEK_BASE_URL,
            deepseek_model=DEEPSEEK_MODEL,
        )
    except Exception as e:
        print(f"[main] script generation failed (non-fatal): {e}")
```

- [ ] **Step 3: Verify the file is valid Python**

```bash
cd "d:/房产个人IP香港/kol-watcher-agent" && python -c "import ast; ast.parse(open('main.py', encoding='utf-8').read()); print('Syntax OK')"
```
Expected: `Syntax OK`

- [ ] **Step 4: Commit**

```bash
git add kol-watcher-agent/main.py
git commit -m "feat: integrate script generation into kol-watcher-agent"
```

---

### Task 7: End-to-end dry-run verification

- [ ] **Step 1: Test shared module import works from zs-property-agent context**

```bash
cd "d:/房产个人IP香港/zs-property-agent" && python -c "
import sys, os
sys.path.insert(0, os.path.dirname(os.getcwd()))
from shared.script_writer import _extract_topic_suggestions, format_scripts_for_push, generate_and_push
print('Import OK')
print('Functions:', _extract_topic_suggestions, format_scripts_for_push, generate_and_push)
"
```
Expected: `Import OK` with function references

- [ ] **Step 2: Test shared module import works from kol-watcher-agent context**

```bash
cd "d:/房产个人IP香港/kol-watcher-agent" && python -c "
import sys, os
sys.path.insert(0, os.path.dirname(os.getcwd()))
from shared.script_writer import _extract_topic_suggestions, format_scripts_for_push, generate_and_push
print('Import OK')
"
```
Expected: `Import OK`

- [ ] **Step 3: Test extraction with real-world AI analysis sample**

```bash
cd "d:/房产个人IP香港" && python -c "
import sys
sys.path.insert(0, '.')
from shared.script_writer import _extract_topic_suggestions

# Simulated real AI output from zs-property-agent
sample = '''
## 💡 Jacky今日话题建议

1. **中山二手楼成交量连升三个月，现在是入市时机吗？**
   切入角度：数据分析+实地调研，对比各区成交数据
   目标观众：观望中的香港买家

2. **港人在中山买楼，这五个隐藏成本你一定要知**
   切入角度：经验分享，税费+装修+管理费真实计算
   目标观众：首次在中山买楼的港人

3. **深中通道通車近兩年，沿線哪個區最值得買？**
   切入角度：实地考察沿线各片区，对比呎价和生活配套
   目标观众：预算有限但想上车的港人
'''

suggestions = _extract_topic_suggestions(sample)
print(f'Extracted {len(suggestions)} suggestions:')
for i, s in enumerate(suggestions, 1):
    print(f'  {i}. {s[:80]}...')
assert len(suggestions) == 3, f'Expected 3, got {len(suggestions)}'
print('PASS')
"
```
Expected: `Extracted 3 suggestions: ... PASS`

- [ ] **Step 4: Commit if any fixes needed, or mark verification complete**

---

## Completion Checklist

- [ ] All tests pass (`pytest shared/test_script_writer.py -v` → 5 PASS)
- [ ] `shared/script_writer.py` imports correctly from both agent directories
- [ ] Both `main.py` files have valid Python syntax
- [ ] Script generation is wrapped in try/except — non-fatal on failure
- [ ] Existing report generation and push are not affected
