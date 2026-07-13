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
| 📊 数据拆解 | `CoverData` | 市场分析、港中对比 | 电光橙 #FF6B35 | 156px |
| 💡 Jacky观点 | `CoverOpinion` | 口播观点、经验分享 | 荧光绿 #39FF14 | 130px |
| ⚠️ 避坑指南 | `CoverWarning` | 法律风险、买房陷阱 | 电光粉 #FF3366 | 164px |

### V4 Unified Standard (all series)

| Rule | Value | Applies to |
|------|-------|------------|
| **fontWeight** | `900` only — no 600/700/800 anywhere | All 4 |
| **letterSpacing** | `-0.04em` on all text | All 4 |
| **lineHeight** | `1.02` (title), `1.2` (body) | All 4 |
| **SHADOW** | `0 8px 36px rgba(0,0,0,0.95)` | All 4 |
| **Top fade-out** | 48px gradient `transparent → color+5%` | All 4 |
| **Last-line color** | Title final line = series neon color | Data/Opinion/Warning |
| **No EP number** | SeriesBadge shows label only | All 4 |
| **Right-aligned bottom** | All bottom zone content flush right | All 4 |
| **6px top bar + 10px accent** | `height: 6, background: color` + `10×42px` strip | All 4 |
| **Gradient lines** | Top: `transparent → color`, Bottom: `color → transparent` | All 4 |

## Layout

```
┌──────────────────────────┐
│ ████ 6px neon top bar    │  ← all 4 series
│ ▌ 10px accent strip      │
│ SeriesBadge (no EP)       │
│                           │
│ 130-260px TITLE (900 wt)  │  last line = neon color
│ ░░░░ 48px fade-out ░░░░  │  smooth → transparent
│                           │
│ ▌ faint spine (Warning)   │  ← talking-head visible
│   (transparent middle)    │
│                           │
│             ╮gradient line│
│  ┌─ Warning ─────────────────────────┐
│  │ 「hook」60px → divider → ①②③ 72px │
│  └───────────────────────────────────┘
│  ┌─ Data ────────────────────────────┐
│  │ Labels 52px → 青132 VS 橙132 → Insight 72px │
│  └───────────────────────────────────┘
│  ┌─ Opinion ─────────────────────────┐
│  │          hook 56px right-aligned  │
│  └───────────────────────────────────┘
│  ┌─ Sundip ──────────────────────────┐
│  │  highlight 56px → tags 32px       │
│  └───────────────────────────────────┘
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
- **Title per line:** ≤7 at 164px (Warning), ≤7 at 156px (Data), ≤7 at 260px (Sundip), ≤8 at 130px (Opinion)
- **Total title lines:** 2-3 max
- **Last line** of Warning/Opinion/Data titles renders in the **series neon color** (auto) — the punch line pops
- **Hook (Warning):** one punchy sentence, 「」 auto-wrapped, 60px
- **Hook (Opinion):** one curiosity-driving sentence, 56px
- **Items (Warning):** 3-5 items, 72px, ≤8 chars each
- **VS values (Data):** 132px, ≤4 chars each — left 青 #00D4FF, right 橙 #FF6B35
- **VS labels (Data):** 52px, short labels
- **VS sub (Data):** 40px, one line each
- **VS badge (Data):** 80px, centered between values
- **Insight (Data):** 72px, 900wt — 与 Warning items 同级
- **Price (Sundip):** 260px number + 100px unit, electric orange
- **Property name (Sundip):** 72px, 900wt, -0.04em
- **Highlight label (Sundip):** 56px, orange, right-aligned
- **Tags (Sundip):** 32px, 900wt, white border badges

### Step 3: Compose props

**CoverSundip:**
```json
{"series":"sundip","episodeNumber":N,"highlightNumber":"21.8","highlightUnit":"万","highlightLabel":"首付上车中山","propertyName":"港航汇·三房","tags":["近港珠澳大桥","精装修","送家电"]}
```

**CoverData:**
```json
{"series":"data","episodeNumber":N,"title":"中山最好卖嘅楼\\n系四代住宅","leftLabel":"普通住宅","leftValue":"120万","leftSub":"100㎡·实得80㎡","rightLabel":"四代宅","rightValue":"180万","rightSub":"100㎡·实得145㎡","insight":"计返实用面积，单价其实差唔多"}
```

DataCover color notes:
- `leftValue` and its label/sub are always **青 #00D4FF** (cool, contrasts with series orange)
- `rightValue` and VS badge are **series color** 橙 #FF6B35
- Insight is white 72px — one line summary

**CoverOpinion:**
```json
{"series":"opinion","episodeNumber":N,"title":"港人买中山楼\\n最易中嘅3个伏","hook":"第一个你可能已经踩咗..."}
```

**CoverWarning:**
```json
{"series":"warning","episodeNumber":N,"title":"Sales冇讲嘅\\n深中城际真相","hook":"你供完楼，条虚线都未变实线","items":["连批都未批","最快要等十年","城际唔系地铁"]}
```

Warning props notes:
- `title`: first lines = topic setup (white), **last line** = punch/reveal (neon series color)
- `hook`: **optional** emotional punchline, rendered in series color with 「」 brackets above items. Omit for straight factual warnings
- `items`: 3-5 items, ≤8 chars each, opinionated Cantonese tone recommended

### Unified treatments (all series)

- **Top-zone fade-out**: 48px gradient `transparent → color+5%` below title, smoothing transition to transparent middle
- **Last-line coloring**: Warning/Opinion/Data titles auto-color the last line in the series neon color
- **Neon glow**: Warning item badges have `boxShadow: 0 0 18px color60, 0 0 36px color27`
- **Left spine**: Warning has a 2px faint vertical connector at x=60 bridging top and bottom zones

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
| Warning title line >7 chars | Split — at 164px only 7 chars fit per line |
| Data title line >7 chars | Split — at 156px only 7 chars fit per line |
| Opinion title line >8 chars | Split — at 130px only 8 chars fit per line |
| Data VS left/right colors too close | Left must be 青 #00D4FF, right 橙 #FF6B35 — never both warm |
| Props JSON broken | Use single quotes: `--props='{"key":"val"}'` |
| Wrong Still ID | Double-check Quick Reference table |
| Not in remotion-realestate dir | `cd remotion-realestate` first |
| Wrong series for content | Check Step 1 mapping |
| Warning without hook when script has emotional punchline | Extract the best gut-punch line from script, wrapped in 「」 |
| Items too "news headline" tone | Rewrite in Jacky voice: opinionated, Cantonese, short |
| Text too small to read on phone | 156-164px title / 72px body minimum — don't go smaller |
