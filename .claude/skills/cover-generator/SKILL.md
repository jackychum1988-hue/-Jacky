---
name: cover-generator
description: Use when the user asks to generate a video cover (封面) for 视频号 or 小红书 — produces transparent RGBA PNG with neon XXL frame layout (top title + transparent middle for talking-head + bottom info), 900 weight, dual-platform 3:4 ratio
---

# Cover Generator

Generate transparent-background video cover PNGs for 视频号/小红书 using the Jacky real estate IP cover system.

## Specs

| Property | Value |
|----------|-------|
| Size | 1242×1656 (3:4) |
| Format | PNG RGBA (transparent) |
| Platforms | 小红书原生 + 视频号通用（居中适配） |
| Font | Georgia (title) / PingFang SC (body) |
| Color | #FFFFFF white text, heavy `textShadow` |
| Weight | **900** (max CSS) |
| Shadow | `0 8px 36px rgba(0,0,0,0.95)` |

## Quick Reference

| Series | Still ID | Best for | Neon Color | Title Size |
|--------|----------|----------|------------|------------|
| 🔥 笋盘速报 | `CoverSundip` | 楼盘讲解、价格冲击 | 电光橙 #FF6B35 | 260px (price) |
| 📊 数据拆解 | `CoverData` | 市场分析、港中对比 | 霓虹青 #00D4FF | 120px |
| 💡 Jacky观点 | `CoverOpinion` | 口播观点、经验分享 | 荧光绿 #39FF14 | 130px |
| ⚠️ 避坑指南 | `CoverWarning` | 法律风险、买房陷阱 | 电光粉 #FF3366 | 124px |

## Layout

```
┌──────────────────────────┐
│ ████ 6px neon top bar    │
│ ▌ 10px accent strip      │
│ SeriesBadge               │  ← top zone: headline
│                           │
│ 120-260px TITLE (900 wt)  │
│                           │
│                           │
│   (transparent middle)    │  ← middle zone: talking-head video visible
│                           │
│                           │
│             ╮gradient line│
│    info/hook/tags ╯      │  ← bottom zone: right-aligned
│ ████ 5px accent bar       │
│        BrandBar            │
└──────────────────────────┘
```

## Workflow

### Step 1: Pick series by content type

- **楼盘价格/笋盘/户型** → `CoverSundip`
- **数据对比/市场分析/VS** → `CoverData`  
- **观点输出/个人见解/经验** → `CoverOpinion`
- **风险警告/避坑/法律** → `CoverWarning`

### Step 2: Write text content

Rules for text at these sizes:
- **Title per line:** ≤8 characters (130px will overflow beyond)
- **Total title lines:** 2-3 max
- **Hook/insight:** one punchy sentence, Cantonese or Mandarin
- **Tags:** 2-4 keywords, ≤6 chars each

### Step 3: Compose props

**CoverSundip:**
```json
{"series":"sundip","episodeNumber":N,"highlightNumber":"21.8","highlightUnit":"万","highlightLabel":"首付上车中山","propertyName":"港航汇·三房","tags":["近港珠澳大桥","精装修","送家电"]}
```

**CoverData:**
```json
{"series":"data","episodeNumber":N,"title":"香港 vs 中山\\n买楼成本大对比","leftLabel":"香港","leftValue":"$800万","leftSub":"200呎·纳米楼","rightLabel":"中山","rightValue":"$80万","rightSub":"900呎·三房","insight":"港人每月悭供款 $12,000"}
```

**CoverOpinion:**
```json
{"series":"opinion","episodeNumber":N,"title":"港人买中山楼\\n最易中嘅3个伏","hook":"第一个你可能已经踩咗..."}
```

**CoverWarning:**
```json
{"series":"warning","episodeNumber":N,"title":"买卖合同\\n3大陷阱","items":["公摊面积模糊","交付标准缩水","违约责任不对等"]}
```

### Step 4: Render

```bash
cd remotion-realestate
npx remotion still <StillID> "out/cover-<slug>.png" --props='<JSON>'
```

Props JSON must be valid escaped JSON. Use single quotes around the whole `--props='...'` value.

### Step 5: Verify

```bash
file out/cover-<slug>.png
# Expected: PNG image data, 1242 x 1656, 8-bit/color RGBA
```

### Step 6: Report

Tell user: output path, series, colors, text content, dimensions.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Title line >8 chars | Split across more lines with `\\n` |
| Props JSON broken | Use single quotes: `--props='{"key":"val"}'` |
| Wrong Still ID | Double-check Quick Reference table |
| Not in remotion-realestate dir | `cd remotion-realestate` first |
| Wrong series for content | Check Step 1 mapping |
