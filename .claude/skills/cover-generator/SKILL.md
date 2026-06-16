---
name: cover-generator
description: Use when the user asks to generate a video cover (封面) for 视频号 or 小红书 — produces transparent PNG overlay with neon大字 frame layout (top title + bottom info + transparent middle for talking-head video)
---

# Cover Generator

Generate transparent-background video cover PNGs for 视频号/小红书 using the Jacky real estate IP cover system.

## Quick Reference

| Series | Still ID | Best for | Neon Color |
|--------|----------|----------|------------|
| 🔥 笋盘速报 | `CoverSundip` | 楼盘讲解、价格冲击 | 电光橙 #FF6B35 |
| 📊 数据拆解 | `CoverData` | 市场分析、港中对比 | 霓虹青 #00D4FF |
| 💡 Jacky观点 | `CoverOpinion` | 口播观点、经验分享 | 荧光绿 #39FF14 |
| ⚠️ 避坑指南 | `CoverWarning` | 法律风险、买房陷阱 | 电光粉 #FF3366 |

## Layout

```
┌──────────────────────┐
│ ██ 顶部霓虹色条        │
│ ▌系列标签              │
│ 砸脸大标题 (100-130px)  │  ← 顶部 25%：标题区
│                       │
│    （透明中间区域）     │  ← 中间 50%：视频人物
│                       │
│          ╮渐变线       │
│    信息/钩子/标签 ╯   │  ← 底部 25%：右对齐
│ ██ 底部色带            │
└──────────────────────┘
```

- Output: 1242×1656 PNG (RGBA transparent)
- Fonts: Georgia (title) + PingFang SC (body), white #FFFFFF with heavy text-shadow

## Workflow

### Step 1: Determine content and series

Ask yourself what the content is about, then pick the series:

- **楼盘价格/笋盘** → `CoverSundip`
- **数据对比/市场分析** → `CoverData`
- **观点输出/个人见解** → `CoverOpinion`
- **风险警告/避坑教育** → `CoverWarning`

### Step 2: Compose props from the content

Each series needs specific props. Generate the text content based on the topic:

**CoverSundip props:**
```json
{
  "series": "sundip",
  "episodeNumber": <number>,
  "highlightNumber": "<price number>",
  "highlightUnit": "万",
  "highlightLabel": "<short label>",
  "propertyName": "<property name>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"]
}
```

**CoverData props:**
```json
{
  "series": "data",
  "episodeNumber": <number>,
  "title": "<comparison title, use \\n for line breaks>",
  "leftLabel": "<left side label>",
  "leftValue": "<left value>",
  "leftSub": "<left subtitle>",
  "rightLabel": "<right side label>",
  "rightValue": "<right value>",
  "rightSub": "<right subtitle>",
  "insight": "<key insight text>"
}
```

**CoverOpinion props:**
```json
{
  "series": "opinion",
  "episodeNumber": <number>,
  "title": "<opinion headline, use \\n for line breaks>",
  "hook": "<hook line to draw viewers in>"
}
```

**CoverWarning props:**
```json
{
  "series": "warning",
  "episodeNumber": <number>,
  "title": "<warning headline, use \\n for line breaks>",
  "items": ["<item1>", "<item2>", "<item3>"]
}
```

### Step 3: Render the cover

Run from `remotion-realestate/` directory:

```bash
cd remotion-realestate

npx remotion still <StillID> "out/cover-<topic-slug>.png" \
  --props='<JSON props from step 2>'
```

The `--props` value must be valid escaped JSON. In bash, escape double quotes: `--props='{"key":"value"}'`.

### Step 4: Verify output

```bash
ls -la out/cover-<topic-slug>.png
file out/cover-<topic-slug>.png
# Should show: PNG image data, 1242 x 1656, 8-bit/color RGBA
```

### Step 5: Present to user

Tell user the output path and describe what was generated: series, colors, text content, dimensions.

## Cover Text Guidelines

- **Title:** 8-15 characters per line, 2-3 lines max. Punchy, direct, "砸脸" style
- **Hook/Insight:** One sentence, conversational Cantonese or Mandarin, creates curiosity
- **Tags:** 2-4 short keywords, no more than 6 characters each
- **Episode number:** Use actual series count or reasonable estimate

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Props JSON not escaped for bash | Use single quotes around `--props='{...}'` |
| Wrong Still ID | Check exact ID in the Quick Reference table |
| Title too long (wraps badly at 130px) | Keep each line ≤8 characters |
| Forgetting to `cd remotion-realestate` first | Always run from the remotion-realestate directory |
| Using wrong series for content type | Check the series-content mapping in Quick Reference |

## File Organization

Generated covers go to:
```
remotion-realestate/out/cover-<topic-slug>.png
```

Suggested pattern for organizing:
```
image-cards/
├── sundip/     # 笋盘速报 covers
├── data/       # 数据拆解 covers
├── opinion/    # Jacky观点 covers
└── warning/    # 避坑指南 covers
```
