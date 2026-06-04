# 口播文案自动生成 — 设计规格

**日期**: 2026-06-04  
**状态**: 待审批  
**关联系统**: `zs-property-agent`, `kol-watcher-agent`

## 目标

每日数据抓取完成后，自动基于 AI 分析输出的「话题建议」生成 60-90 秒口播文案（180-270 字），通过 PushPlus 微信推送给 Jacky，让 Jacky 直接打开就能录制视频。

## 范围

- 覆盖两个系统：`zs-property-agent`（中山房产日报）和 `kol-watcher-agent`（KOL 竞品快讯）
- 只处理「话题建议」类内容，不处理纯数据摘要
- 每个话题建议生成一条独立脚本

## 架构

```
shared/
  └─ script_writer.py          ← 新增：共享脚本生成模块

zs-property-agent/
  └─ main.py                   ← 修改：分析后调用 generate_and_push()

kol-watcher-agent/
  └─ main.py                   ← 修改：分析后调用 generate_and_push()
```

### 模块职责

**`shared/script_writer.py`**：
- `extract_topic_suggestions(analysis_text: str) -> list[str]` — 从 AI 分析中提取「话题建议」段落
- `generate_scripts(suggestions: list[str], persona: str, context: dict) -> list[dict]` — 调用 DeepSeek 生成口播脚本
- `format_scripts_for_push(scripts: list[dict]) -> str` — 格式化为 PushPlus Markdown
- `generate_and_push(analysis_text: str, persona: str, context: dict) -> bool` — 一站式：提取→生成→推送

## 脚本格式

每条脚本输出 JSON：

```json
{
  "title": "视频标题（15字以内，有冲击力）",
  "hook": "前5秒钩子句（12字以内）",
  "body": "正文（2-3个要点，180-200字）",
  "cta": "结尾引导关注+互动（15-25字）",
  "full_script": "完整口播文案（可直接读稿，60-90秒）"
}
```

## Jacky 人设 Prompt

两个系统共用 Jacky 人设：

- **身份**：港人中山置业通 Jacky，香港人在中山做房产经纪
- **内容支柱**：
  - 带客看房纪实（50%）— 实地睇楼、成交故事、客户反馈
  - 专业知识/港中对比（30%）— 按揭、税费、政策、港中生活对比
  - 售后日常/个人生活（20%）— 代客收楼、装修、中山生活日常
- **语言风格**：粤语/香港用词（買樓、上車、筍盤、呎價、按揭、首期、供款），但普通话也能懂
- **语气**：真实、接地气、不浮夸、像跟朋友聊天
- **禁忌**：不炒作深中通道通车（已通车近2年不是新闻）、不夸大承诺、不说绝对化用语

## AI Prompt 设计

### System Prompt 要点

1. 身份设定（Jacky 人设）
2. 时长约束（60-90秒，180-270字）
3. 结构要求（钩子→正文→CTA）
4. 语言要求（粤语用词+普通话可懂）
5. 合规检查（无绝对化、无功效承诺、无诱导互动）
6. 输出 JSON 格式

### 两个系统的 Prompt 差异

| | zs-property-agent | kol-watcher-agent |
|---|---|---|
| 输入来源 | 中山+香港+财经新闻 | 竞品 KOL 内容分析 |
| 脚本侧重 | 新闻事件解读、市场分析 | 差异化观点、竞品对比 |
| 时效性 | 当日新闻驱动 | 趋势观察驱动 |

## 推送格式

```
🎙 Jacky今日口播 | MM/DD

【选题1】<标题>
🎣 钩子：<hook>
📖 正文：<body>
🎯 结尾：<cta>

━━━━━━━━━━━━━━━━━━
📝 完整读稿：
<full_script>

---

【选题2】<标题>
...
```

每条脚本独立推送，与数据报告分开。

## 集成点

### zs-property-agent/main.py 修改

在 `analyze()` 之后、`build_report()` 之前插入：

```python
from shared.script_writer import generate_and_push as generate_scripts

# 现有：ai_analysis = analyze(results)
# 新增：生成并推送口播脚本
generate_scripts(
    analysis_text=ai_analysis,
    persona="zs-property",
    context={"date": datetime.now().strftime("%m/%d")}
)
```

### kol-watcher-agent/main.py 修改

在 `analyze_daily()` 之后插入：

```python
from shared.script_writer import generate_and_push as generate_scripts

# 现有：analysis = analyze_daily(items)
# 新增：生成并推送口播脚本
generate_scripts(
    analysis_text=analysis,
    persona="kol-watcher",
    context={"date": datetime.now().strftime("%m/%d"), "item_count": len(items)}
)
```

## 错误处理

- DeepSeek API 不可用时：推送降级提示「今日脚本生成暂不可用」，不阻断数据报告
- 分析中无话题建议时：跳过脚本生成，不推送空内容
- JSON 解析失败时：将原始文本作为脚本文本推送，标注「AI 原始输出」

## 技术要求

- **Python 导入路径**：`shared/` 位于项目根目录，两个 agent 在子目录中。需要在各 agent 的 `main.py` 中将项目根目录加入 `sys.path`（如未加入），或使用 `sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))`
- **API 密钥**：复用各 agent 已有的 `DEEPSEEK_API_KEY` 和 `PUSHPLUS_TOKEN` 配置
- **Python 版本**：3.10+（使用 `str | None` 等新语法需确认兼容，保守使用 `Optional[str]`）

## 文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `shared/script_writer.py` | 新增 | 共享脚本生成模块 |
| `shared/__init__.py` | 新增 | Python 包初始化 |
| `zs-property-agent/main.py` | 修改 | 集成脚本生成 |
| `kol-watcher-agent/main.py` | 修改 | 集成脚本生成 |

## 不做的

- 不修改现有 AI 分析 prompt（保持分析质量不变）
- 不改变现有报告推送格式
- 不实现视频自动生成（只到文案层）
- 不支持 sanjie-soup-agent（已有自己的 script_writer.py）
