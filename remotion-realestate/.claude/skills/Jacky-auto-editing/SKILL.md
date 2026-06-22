---
name: Jacky-auto-editing
description: Use when generating zhuzige-style transparent overlay videos for 剪映画中画 — JSON-driven timeline, ProRes 4444 alpha, real estate voiceover cards with bilingual text
metadata:
  tags: remotion, overlay, alpha-channel, prores-4444, json-timeline, pip, zhuzige, vertical-video, jianying
---

# Jacky 自动剪辑 — 口播叠加视频自动生成（2026-06-22 sidaizhai-v1 + Apple v11 生产标准）

## Overview

JSON 时间线驱动的 Remotion 透明叠加视频生成系统。写一个 JSON 配置 → 一条命令渲染 ProRes 4444 alpha 视频 → 拖入剪映画中画（正常模式，Alpha 自动抠底）。

**核心理念**：文案决定时间轴 → 时间轴决定 JSON → JSON 决定渲染 → 输出直接可用。

## 渲染管线

```
JSON timeline → PipOverlay (Remotion) → ProRes 4444 yuva444p12le → 剪映画中画 (正常模式)
```

## 快速渲染

```bash
cd remotion-realestate
npx ts-node scripts/render_pip.ts config/your-timeline.json out/overlay.mov
```

输出：1080×1920 竖屏 ProRes 4444 MOV，带 Alpha 通道，无音频轨。

验证 Alpha 通道：
```bash
ffprobe -v quiet -show_streams out/overlay.mov | grep pix_fmt
# 必须输出: pix_fmt=yuva444p12le（或 yuva444p10le）

# 确认无音频轨（剪映兼容性）
ffprobe -v quiet -show_streams out/overlay.mov | grep -c "codec_type=audio"
# 必须输出: 0
```

## 关键文件

| 文件 | 用途 |
|------|------|
| `scripts/render_pip.ts` | CLI 渲染脚本（ProRes 4444 + 自动抑制 PCM 音频） |
| `src/scenes/PipOverlay.tsx` | JSON 驱动场景 + Zod schema |
| `src/components/overlay/animation.ts` | 动画引擎（V/C/F、positionToStyle、useOverlayAnimation、textDepth） |
| `src/components/overlay/index.ts` | 42 组件导出 + overlayComponentMap |
| `src/components/overlay/iconMap.ts` | 82 个 SVG 图标 |
| `src/Root.tsx` | PipOverlay Composition（1080×1920） |

---

## 配色系统

```tsx
const V = [
  '#FF4136', // 0: 烈焰红 — Climax / Warning1 / RevealMyth
  '#F5A623', // 1: 亮琥珀金 — Reveal / Benefit1 / CTA / DataComparison
  '#1A56DB', // 2: 深蓝 — Hook 默认 / QACard
  '#10B981', // 3: 翡翠绿 — Warning2 / Benefit2 / Checklist
  '#8B5CF6', // 4: 紫罗兰 — Warning3 / Benefit3 / RevealMyth 备选
  '#06B6D4', // 5: 青色 — Pivot 转场 / QACard 备选
];
```

**色彩流动规则**（避免相邻卡片同色）：
```
蓝 → 金 → 红 → 绿 → 紫 → 青 → 红 → 金
```

**文字颜色常量**：
```tsx
const C = {
  text: '#FFFFFF',           // 纯白 — 标题/主文字
  textSecondary: '#F5F0E8',  // 暖白 — 描述/条目
  textTertiary: '#C8BFA8',   // 灰 — 标签/tags
};
```

**字体栈**：
```tsx
const F = {
  display: '-apple-system, BlinkMacSystemFont, "Inter", "Noto Sans SC", sans-serif',  // 标题
  text: '-apple-system, BlinkMacSystemFont, "Inter", "PingFang SC", "Microsoft YaHei", sans-serif',  // 正文
  mono: '"SF Mono", "JetBrains Mono", "Fira Code", monospace',  // 数字/电话
};
```

---

## 字号层次（2026-06-19 统一版）

### 完整字号对照表

| 元素 | 字号 | 字重 | 颜色 | 说明 |
|------|------|------|------|------|
| **HookCard** | | | | |
| label | 36px | 600 | accent色 | letterSpacing 0.08em→0.12em 呼吸 |
| headline | 88px | 800 | 白色 | letterSpacing -0.02em→0.04em 呼吸, lineHeight 1.05 |
| enText | 24px | 400 | rgba(255,255,255,0.5) | letterSpacing 0.1em |
| subline | 28px | 500 | 暖白 #F5F0E8 | lineHeight 1.4 |
| icon | 56px | — | accent色 | strokeWidth 2 |
| **WarningCard** | | | | |
| label | 36px | 600 | accent色 | letterSpacing 0.08em |
| title | 44px | 800 | 白色 | letterSpacing -0.005em→0.06em 呼吸 |
| desc | 28px | 500 | 暖白 | lineHeight 1.5 |
| bullets | 24px | 400 | 暖白 | 编号圆圈 22px（accent底 0.18 + 13px数字accent色 800） |
| enTitle | 24px | 400 | rgba(255,255,255,0.5) | letterSpacing 0.1em |
| enDesc | 24px | 400 | rgba(255,255,255,0.5) | letterSpacing 0.1em |
| icon | 48px | — | accent色 | strokeWidth 2 |
| **QACard** | | | | |
| label | 36px | 600 | accent色 | letterSpacing 0.08em |
| Q/A 徽章 | 44px | 900 | accent色 | lineHeight 1 |
| question | **44px** | 700 | 白色 | lineHeight 1.4 |
| answer | **36px** | 500 | 白色 | lineHeight 1.55 |
| enQuestion | enFontSize(44)≈24px | 400 | rgba(255,255,255,0.5) | letterSpacing 0.1em |
| enAnswer | enFontSize(36)≈20px | 400 | rgba(255,255,255,0.5) | letterSpacing 0.1em |
| icon | 48px | — | accent色 | strokeWidth 2 |
| **ClimaxCard** | | | | |
| label | 36px | 600 | accent色 | letterSpacing 0.08em |
| text (PunchLineBox) | 68px | 700 | accent色 | letterSpacing -0.02em→0.08em 呼吸, 支持 `\n` 换行 |
| enText | 24px | 400 | rgba(255,255,255,0.5) | letterSpacing 0.1em, textAlign center |
| author | 22px | 400 | rgba(255,255,255,0.45) | letterSpacing 0.05em |
| icon | 48px | — | accent色 | strokeWidth 2 |
| **CTACard** | | | | |
| headline | 46px | 700 | 白色 | letterSpacing -0.02em→0.06em 呼吸 |
| enHeadline | 24px | 400 | rgba(255,255,255,0.5) | letterSpacing 0.1em |
| contact | 60px | 700 | 白色 mono | letterSpacing 0.05em, breathingScale localFrame |
| enLabel | 22px | 400 | rgba(255,255,255,0.5) | letterSpacing 0.1em |
| tags | 20px | 500 | 灰 #C8BFA8 | padding 8px 18px, borderRadius 8 |
| icon | 48px | — | accent色 | strokeWidth 2 |
| **DataComparisonCard** | | | | |
| label | 36px | 600 | accent色 | letterSpacing 0.08em, textAlign center |
| 数值 (2-way) | 64px | 900 | 白色 mono | textDepth(0.25) |
| 数值 (3-way) | 48px | 900 | 白色 mono | textDepth(0.25) |
| 标签 (2-way) | 28px | 600 | 暖白 | — |
| 标签 (3-way) | 24px | 600 | 暖白 | — |
| 单位 (2-way) | 24px | 600 | 暖白 | — |
| 单位 (3-way) | 20px | 600 | 暖白 | — |
| EN 标签 (统一) | 24px | 400 | rgba(255,255,255,0.5) | 固定，不跟随 EN_RATIO |
| delta | 28px | 800 | accent色 | 透明底胶囊，maxWidth 320 |
| EN delta | 20px | 400 | rgba(255,255,255,0.5) | — |
| icon | 48px | — | accent色 | strokeWidth 2 |
| **cardScale** | number? | 1 | ★ 整卡缩放，>1 时自动 `maxWidth/=cardScale` 确保不越安全区 |
| **ChecklistCard** | | | | |
| label | 36px | 600 | accent色 | letterSpacing 0.08em |
| title | 44px | 800 | accent色 | textDepth(0.25) |
| enTitle | enFontSize(44)≈24px | 400 | rgba(255,255,255,0.5) | letterSpacing 0.1em |
| items | 28px | 600 | 白色 | lineHeight 1.4, checkbox 36px |
| enLabel (item) | enFontSize(26)≈14px | 400 | rgba(255,255,255,0.5) | letterSpacing 0.1em |
| **RevealCard** | | | | |
| label | 36px | 600 | accent色 | letterSpacing 0.08em |
| number | 120px | 900 | accent色 mono | 彩色发光 textShadow |
| unit | 48px | 700 | 白色 display | — |
| sublabel | 36px | 500 | 暖白 | — |
| enLabel | 24px | 400 | rgba(255,255,255,0.5) | letterSpacing 0.1em |
| **RevealMythCard** | | | | |
| mythLabel | 28px | 600 | rgba(255,255,255,0.42) | letterSpacing 0.06em |
| myth | 36px | 700 | rgba(255,255,255,0.42) | lineHeight 1.3, 被红线划线 |
| truthLabel | 30px | 600 | accent色 | letterSpacing 0.08em |
| truth | 44px | 800 | accent色 | lineHeight 1.2 |
| enMyth | 24px | 400 | rgba(255,255,255,0.3) | letterSpacing 0.1em |
| enTruth | 24px | 400 | rgba(255,255,255,0.5) | letterSpacing 0.1em |
| **SplitSceneCard** | | | | |
| label | 36px | 600 | leftColor | letterSpacing 0.08em, textAlign center |
| 左右标题 | 32px | 700 | accent色 | textDepth(0.25), lineHeight 1.3 |
| 左右条目 | 28px | 500 | 暖白 #F5F0E8 | lineHeight 1.45 |
| EN 副标题 | 24px | 400 | rgba(255,255,255,0.5) | letterSpacing 0.1em |
| dividerLabel | 22px | 800 | 白色 mono | letterSpacing 0.12em |
| icon | 48px | — | leftColor | strokeWidth 2 |
| **BenefitCard** | | | | |
| title | 44px | 800 | accent色 | letterSpacing -0.5px, textDepth(0.5) |
| desc | 28px | 500 | 暖白 | lineHeight 1.55 |
| highlight | 56px | 900 | accent色 mono | 彩色发光 |
| enTitle | 24px | 400 | rgba(255,255,255,0.5) | letterSpacing 0.1em |
| enDesc | 24px | 400 | rgba(255,255,255,0.5) | letterSpacing 0.1em |
| icon | 48px | — | 白色 | strokeWidth 2 |
| **CalculationCard** | | | | |
| label | 36px | 600 | accent色 | letterSpacing 0.08em, textAlign center |
| item label | 28px | 500 | 暖白 | lineHeight 1.4 |
| item value | 36px | 800 | 白色 mono | textDepth(0.2) |
| totalLabel | 32px | 700 | accent色 | lineHeight 1.3 |
| totalValue | 48px | 900 | accent色 mono | textDepth(0.35) |
| enTotalLabel | 20px | 400 | rgba(255,255,255,0.5) | letterSpacing 0.1em |

### 英文规范

| 规格 | 值 |
|------|-----|
| 字号 | **24px** 统一（DataComparisonCard EN label/EN delta 20px 除外） |
| 颜色 | `rgba(255,255,255,0.5)` |
| 字重 | 400 |
| 字母间距 | `0.1em` |
| 行高 | 1.2 |
| 比例 | EN_RATIO = 0.55（`enFontSize(cnSize)` 工具函数） |

---

## 动画系统

### 动画类型（8 种）

| 类型 | 效果 | 适用场景 |
|------|------|---------|
| `spring` | 弹簧入场 + 缩放 | Hook, Climax, RevealMyth |
| `slideUp` | 下方滑入 50px | QACard, Checklist, CTA |
| `slideDown` | 上方滑入 50px | 备选 |
| `slideLeft` | 左侧滑入 50px | Warning, DataComparison |
| `slideRight` | 右侧滑入 50px | QACard, SplitScene 右面板 |
| `scale` | 缩放弹入 | PriceReveal |
| `fade` | 纯淡入淡出 | 过渡卡 |
| `typewriter` | 逐字显示 | 长文本 |

### 引擎参数

```tsx
ENTER_DURATION = 0.5s (15 frames)
EXIT_DURATION = 0.5s (15 frames)
SLIDE_DISTANCE = 50px

// 入场缓动
spring → Easing.out(Easing.back(1.7))
slide/fade/scale → Easing.out(Easing.back(1.2))

// 出场缓动
所有类型 → Easing.in(Easing.quad)
```

### Apple Spring 预设

| 用途 | damping | stiffness | mass | 特征 |
|------|---------|-----------|------|------|
| 卡片入场 | 30 | 65-70 | 1.3-1.5 | 慢呼吸，无过冲 |
| 标题淡入 | 26-28 | 70 | 1.3 | 轻柔入场 |
| 图标弹跳 | 14 | 120 | 0.7 | 快弹 overshoot |
| 数字滚动 | 10 | 80 | 0.6 | 快计数 |
| 分隔线展开 | 14 | 100 | 0.7 | 干脆展开 |
| 数字 settle | 12 | 150 | 0.4 | 计数落地回弹（1→1.03→1, ~14f） |

### Idle 呼吸系统 ★ v11（2026-06-22 Apple 风格融入）

核心理念：画面永远在呼吸，无一刻冻结。透明底 Alpha 安全（纯 transform，零色染）。

```ts
// Y轴微浮动 — 所有卡片 idle 期间缓慢上下漂浮
idleFloat(frame, amplitude?, period?)
// 数字 settle 回弹 — 模拟物理落地
settleBounce(localFrame, fps, settleAt)
```

各卡呼吸参数：HookCard 1.5px / RevealCard 1.8px + settle(28) / WarningCard 1.3px / QACard Q:1.2 A:1.0 独立相位 / DataComparisonCard 1.5px + settle(36) / TestimonialCard 1.4px / ClimaxCard 1.6px + label glow pulse / CTACard 1.2px

### 统一圆角 RADIUS

```ts
RADIUS = { card: 20, panel: 18, tag: 8, contact: 20 }
```
QACard A 边框→RADIUS.card / DataComparisonCard panel→RADIUS.panel / CTACard contact→RADIUS.contact

### 退出编排系统

`useOverlayAnimation` 返回值含 `phase` 和 `phaseProgress`：

```tsx
const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });
// anim.phase: 'enter' | 'idle' | 'exit'
// anim.phaseProgress: 0→1 within current phase

const isExiting = anim.phase === 'exit';
const exitP = anim.phaseProgress;
```

**退出规则**：子元素按入场序逆序退出。最后入场的先退。

---

## 定位系统

| position | 说明 |
|----------|------|
| `safe-center` | **竖屏首选** — 安全区内垂直+水平双居中，12% 上下均等边距 |
| `safe-top` | 安全区顶部对齐 — 12% 上边距 + 8% 左右，水平居中 |
| `top-left` / `top-center` / `top-right` | 60px 上边距 |
| `center-left` / `center` / `center-right` | 垂直居中 |
| `bottom-left` / `bottom-center` / `bottom-right` | 60px 下边距 |

```json
"position": "safe-center",
"offset": { "x": 0, "y": 0 }
```

### 视频号安全区 ★ v11

微信视频号竖屏 UI 叠加区域不能遮挡卡片内容。

```
SAFE_ZONE = { top: 120, bottom: 200, left: 60, right: 60 }
          → 可用宽度 960px, 可用高度 1600px
```

| 区域 | 像素 | UI 元素 |
|------|------|--------|
| 顶部 | 120px | 频道头像+名称+关注按钮 |
| 底部 | 200px | 点赞/评论/分享/收藏+进度条 |
| 左右 | 60px | 最小安全边距 |

posToStyle 自动返回 maxWidth/maxHeight；所有卡片 overflow:hidden；cardScale>1 时 maxWidth/=cardScale 确保 scale 后不越界。

---

## 核心工具函数

```tsx
// hex → rgba
hexToRgba('#FF4136', 0.5)  // → 'rgba(255,65,54,0.5)'

// 文字深度感（3层无色阴影 — 纯白高光+纯黑深度，Alpha纯净无光晕）
textDepth(0.3)   // label
textDepth(0.5)   // headline
textDepth(0.25)  // title
textDepth(0.2)   // desc
textDepth(0.4)   // CTA headline
textDepth(0.35)  // CTA contact

// 苹果呼吸感微缩放（5秒周期 ±0.8%）
breathingScale(frame)       // → 1 + sin(frame*0.035)*0.008

// 定位 → flexbox style
positionToStyle('safe-center', { x: 0, y: 0 })

// 英文字号
enFontSize(36)  // → 20 (36 × 0.55)
```

---

## 全部卡片组件 Props 速查（14 种核心 + 28 种辅助）

### HookCard（开场钩子 / 转折 — 无边框双行卡）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | string | — | 彩色标签 36px/600 |
| headline | string | — | 白色大字 88px/800（空格分词逐词 stagger） |
| enText | string? | — | 英文 24px |
| subline | string? | — | 副标题 28px/暖白 |
| sublineSeparator | string? | — | 拆分 subline 逐段 stagger（如 "+"） |
| staggerFrames | number? | 4 | 逐词延迟帧数 |
| highlights | HighlightWord[]? | — | ★ 关键词 kinetic pop 缩放+变色 |
| icon | string? | — | ICON_MAP key, 56px accent色 |
| color | string? | V[2] 蓝 | 标签颜色 |

**动效时序**：00f container spring → 02f icon bounce → 12f headline words stagger → +6f keyword pop

### WarningCard（警告/信息卡 — GlassCard + NumberBadge）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | string? | — | 彩色标注 36px/600 |
| n | number | — | NumberBadge 数字 |
| title | string | — | 白色标题 44px/800 |
| desc | string | — | 描述 28px/暖白 |
| enTitle | string? | — | 英文标题 24px |
| enDesc | string? | — | 英文描述 24px |
| bullets | string[]? | — | 编号子弹点列表（24px, 逆序退出） |
| highlights | HighlightWord[]? | — | ★ 标题关键词 pop 动画 |
| icon | string? | — | ICON_MAP key, 48px accent色 |
| color | string? | V[0] 红 | 卡片色 |

GlassCard 参数：`transparentBg`, `showOuterGlow=false`, `disableEntryAnimation`, maxWidth=880, padding="40px 48px 36px 56px"

**动效时序**：00f card slide-in → 04f icon rotate-in → 08f title letter-spacing → 16f desc fade → 20f+ bullets stagger

### QACard（问答卡）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | string? | — | 彩色标注 36px/600 |
| question | string | — | 问题 36px/700 |
| answer | string | — | 答案 28px/500 |
| enQuestion | string? | — | 英文问题 |
| enAnswer | string? | — | 英文答案 |
| questionHighlights | HighlightWord[]? | — | ★ Q 句关键词 pop 动画 |
| answerHighlights | HighlightWord[]? | — | ★ A 句关键词 pop 动画 |
| icon | string? | — | ICON_MAP key, 48px accent色 |
| color | string? | V[2] 蓝 | 卡片色 |

**动效时序**：00f Q slide-down → 20f A slide-down + 边框淡入

### ClimaxCard（高潮金句 — PunchLineBox）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | string? | — | 彩色标注 36px/600 |
| text | string | — | 金句 68px/700（支持 `\n` 换行） |
| enText | string? | — | 英文 24px |
| author | string? | — | 署名 22px/400（逆序先退） |
| highlight | string? | — | ⚠️ deprecated — 单高亮词（用 highlights 替代） |
| highlights | HighlightWord[]? | — | ★ 多关键词 kinetic pop 动画（scale:1.5, 弹簧更强） |
| icon | string? | — | ICON_MAP key, 48px accent色 |
| color | string? | V[0] 红 | 卡片色 |

**动效时序**：00f label fade → 04f icon bounce → 10f PunchLineBox + letter-spacing → 30f author slide-up

### CTACard（行动号召 — GlassCard + 联系卡）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| headline | string | — | 标题 46px/700 |
| enHeadline | string? | — | 英文标题 24px |
| contact | string | — | 电话号码 60px/700 mono |
| enLabel | string? | — | 联系标签 22px |
| tags | string[]? | — | 话题标签 20px |
| icon | string? | — | ICON_MAP key, 48px accent色 |
| color | string? | V[1] 金 | 卡片色 |

GlassCard 参数：`transparentBg`, `disableEntryAnimation`, padding="36px 48px"

**动效时序**：00f icon bounce → 08f title entrance → 20f contact card scale-in → 28f tags fade-in

### DataComparisonCard（数值对比卡 — 2-way / 3-way）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | string? | — | 彩色标注 36px/600 |
| leftLabel | string | — | 左标签 |
| leftValue | string | — | 左数值 ★ 支持范围值 "130-145"（跳过计数直接显示）/ 纯文字 / 小整数 ≤999 直接显示 |
| leftUnit | string? | — | 左单位 |
| rightLabel | string | — | 右标签 |
| rightValue | string | — | 右数值 ★ 同上 |
| rightUnit | string? | — | 右单位 |
| centerLabel | string? | — | 中间标签（提供后自动切换 3-way） |
| centerValue | string? | — | 中间数值 |
| centerUnit | string? | — | 中间单位 |
| delta | string? | — | 差值标记 28px |
| enLeftLabel | string? | — | 英文左标签 24px |
| enRightLabel | string? | — | 英文右标签 24px |
| enCenterLabel | string? | — | 英文中标签 24px |
| enDelta | string? | — | 英文差值 20px |
| icon | string? | — | ICON_MAP key, 48px accent色 |
| cardScale | number? | 1 | ★ 整卡缩放，>1 自动降容 `maxWidth/scale`，确保不越安全区 |
| color | string? | V[1] 金 | 卡片色 |

**动效时序**：00f icon bounce → 06f left slide-in → 10f counting starts → 14f divider draw → 16f/18f right/center slide-in → 26f delta bounce

### ChecklistCard（清单勾选卡）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | string? | — | 彩色标注 36px/600 |
| title | string? | — | 标题 44px/800 accent色 |
| enTitle | string? | — | 英文标题 |
| items | ChecklistItem[] | — | `{ label, enLabel? }` |
| color | string? | V[3] 绿 | 卡片色 |

**动效时序**：items 每 10f 一行 slide-in（translateX 30→0）→ checkmark draw 12f 后

### RevealCard（BigNumber 数字揭示）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | string | — | 标签 36px/600 |
| number | string | — | 超大数字 120px/900 |
| unit | string | — | 单位 48px/700 |
| sublabel | string? | — | 副标 36px/暖白 |
| enLabel | string? | — | 英文标签 24px |
| color | string? | V[1] 金 | 卡片色 |

### RevealMythCard（揭谎反转卡）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| myth | string | — | 销售话术（灰色 36px，被红线划线） |
| truth | string | — | 真相（accent色 44px，从下方弹入） |
| mythLabel | string? | — | 话术区标注 28px |
| truthLabel | string? | — | 真相区标注 30px |
| enMyth | string? | — | 英文话术 24px |
| enTruth | string? | — | 英文真相 24px |
| color | string? | V[0] 红 | 卡片色 |

**动效时序**：00f myth fade-in → 14f strikethrough → 16f X mark → 18f divider → 24f truth slam-in

### SplitSceneCard（左右分镜对比卡）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | string? | — | 彩色标注 36px/600（居中） |
| leftTitle | string | — | 左侧标题 32px/700 |
| leftItems | string[] | — | 左侧要点 28px/暖白（右对齐+row-reverse） |
| rightTitle | string | — | 右侧标题 32px/700 |
| rightItems | string[] | — | 右侧要点 28px/暖白（左对齐） |
| enLeftTitle | string? | — | 英文左标题 24px |
| enRightTitle | string? | — | 英文右标题 24px |
| leftColor | string? | V[2] 蓝 | 左侧色 |
| rightColor | string? | V[0] 红 | 右侧色 |
| dividerLabel | string? | — | 分隔线中央标注 22px/800 白色 |
| icon | string? | — | ICON_MAP key, 48px |

**动效时序**：00f icon → 04f left slide-in → 08f+ left items stagger → 10f divider draw → 16f right slide-in → 20f+ right items stagger → 22f divider label

### BenefitCard（好处卡 — GlassCard）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | — | 标题 44px/800 accent色 |
| desc | string | — | 描述 28px/暖白 |
| enTitle | string? | — | 英文标题 24px |
| enDesc | string? | — | 英文描述 24px |
| highlight | string? | — | 高亮数字 56px/900 accent色 |
| icon | string? | — | ICON_MAP key, 48px 白色 |
| color | string? | V[1] 金 | 卡片色 |

GlassCard 参数：`transparentBg`, `showOuterGlow=false`, `disableEntryAnimation`, maxWidth=880

### CalculationCard（逐项累加算账卡）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | string? | — | 彩色标注 36px/600 |
| items | CalcItem[] | — | `{ label, value, enLabel? }` 每行 |
| totalLabel | string | — | 总计标签 32px/700 accent色 |
| totalValue | string | — | 总计数值 48px/900 accent色 ★ 支持纯文字（如 "差唔多"），自动跳过计数 |
| enTotalLabel | string? | — | 英文总计标签 20px |
| icon | string? | — | ICON_MAP key, 48px |
| color | string? | V[1] 金 | 卡片色 |

**动效时序**：00f icon → 06f+ items 逐行 slide-in + 数字滚动（每行间隔 8f）→ divider draw → total spring bounce

### CountUpSummaryCard（累计汇总卡）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | string? | — | 彩色标注 36px/600 |
| items | SummaryItem[] | — | `{ label, value, enLabel? }` 明细行 |
| finalLabel | string | — | 汇总标签 34px accent色 |
| finalValue | string | — | 汇总值 56px accent色 |
| enFinalLabel | string? | — | 英文汇总标签 |
| icon | string? | — | ICON_MAP key, 48px |
| color | string? | V[1] 金 | 卡片色 |

---

## 其他辅助卡片（速查）

以下卡片完整可用，仅列出关键 props：

- **PriceRevealCard**: tag, subtitle, priceLabel, priceValue, priceUnit
- **StatCard**: stats[], columns, title, color
- **ProcessCard**: steps[], title, color
- **FeatureGrid**: items[], columns, title, color
- **EndCard**: channelName, subscribeText, qrLabel
- **AmenityCard**: amenities[], title, color
- **TimelineCard**: steps[], title, color
- **TestimonialCard** ★ v11: quote, enQuote?, name, enName?, role?, enRole?, color
  - 动效：大引号 scale-in → 6f quote slide-up + italic breathing → 16f 署名 slide-x + 左边框 draw-in
  - 引号 96px/900 accent 色 + 呼吸光晕（sin 调制 alpha）
  - idle: 1.4px 浮动 + quote breathingScale
  - 退出：quote→name 逆序（name 最后退）
- **LocationCard**: from, to, duration, via, color
- **AppleHeroCard / AppleFeatureCard / AppleMetricCard / AppleCTACard**: Apple 风格（单色克制，慢呼吸）
- **RankingBarChart**: title, items[], unit（排行榜柱状图）
- **TrendLineChart**: weeks[], prices[], title（趋势折线图）
- **RankingChangeList**: title, items[]（涨跌排名列表）
- **OverlayDataSourceCard**: 数据来源说明
- **OverlayComparisonCards**: 楼盘对比
- **TollCostComparison**: 过路费对比
- **DonutChart**: 环形图
- **NameBadgeCloud**: 名称标签云

---

## 时间轴 JSON 结构

```json
{
  "width": 1080,
  "height": 1920,
  "fps": 30,
  "durationInFrames": 3690,
  "elements": [
    {
      "type": "HookCard",
      "enterAt": 0,
      "exitAt": 210,
      "animation": "spring",
      "position": "safe-center",
      "offset": { "x": 0, "y": 0 },
      "props": {
        "label": "深中城际",
        "headline": "sales 话就快有地铁 真相 系点？",
        "enText": "Agent Says 'Metro Coming Soon' — What's the Truth?",
        "icon": "train",
        "color": "#1A56DB",
        "staggerFrames": 8
      }
    }
  ]
}
```

**必填字段**：type, enterAt, exitAt, animation, position, props
**可选字段**：offset（{x, y}，默认 0,0）

---

## 时间轴设计原则

### 帧数估算

| 卡片类型 | 典型时长 | 帧数 |
|---------|---------|------|
| HookCard | 5-8s | 150-240 |
| DataComparisonCard | 8-10s | 240-300 |
| CalculationCard (3-4行) | 7-9s | 210-270 |
| WarningCard (无 bullets) | 8-9s | 240-270 |
| WarningCard (含 bullets) | 9-10s | 270-300 |
| QACard | 8-9s | 240-270 |
| RevealMythCard | 5-7s | 150-210 |
| SplitSceneCard | 7-9s | 210-270 |
| RevealCard | 5-7s | 150-210 |
| ChecklistCard | 6-8s | 180-240 |
| ClimaxCard | 4-7s | 120-210 |
| CountUpSummaryCard | 6-8s | 180-240 |
| CTACard | ★ **≥2.5s** | **≥75** |
| 卡间呼吸空档 | 0.7-1s | 20-30 |
| 段落呼吸空档 | 1-1.5s | 30-50 |

### 设计规则

1. **总帧数** ≈ 口播时长(s) × 30fps
2. **卡间 gap**：前卡 exitAt 到后卡 enterAt = 20-60f（卡片类型越重磅，gap 越大）
3. **Climax 前 gap**：50-80f（情绪铺垫）
4. **CTA exitAt**：在总帧数前提前 30f 淡出
5. **动画入场时长**：0.5s = 15f
6. **同组卡片**：微重叠 8f，段落间完全断开
7. **相邻卡片**：类型不重复、动效不重复、颜色不重复

### 卡片序列设计模式

**教育型/避坑型（推荐 11-12 卡）**：
```
Hook(蓝) → QA(金) → Reveal(蓝) → Warning(红·第一) → QA(金·等几耐)
→ Warning(紫·第二) → Warning(青·第三) → SplitScene(蓝vs红)
→ RevealMyth(紫·揭谎) → Warning(绿·十年) → Climax(红) → CTA(金)
```

**销售型（11 卡）**：
```
Hook(蓝) → Reveal(金) → W1(红) → W2(绿) → W3(紫)
→ Pivot(青) → B1(金) → B2(绿) → B3(紫) → Climax(红) → CTA(金)
```

**动效交替示例**：
```
spring → slideUp → slideUp → slideLeft → slideRight → slideLeft → slideUp → slideRight → spring → slideUp → spring → slideUp
```

---

## 文案→卡片映射规则

分析口播文案，按以下规则拆成卡片序列：

| 文案段落 | 卡片类型 | 颜色 | 动效 |
|---------|---------|------|------|
| 开场钩子/悬念 | HookCard | 蓝 V[2] | spring |
| 睇楼场景/背景 | QACard | 金 V[1] | slideUp |
| 数据揭示/真相 | RevealCard | 蓝 V[2] | slideUp |
| 对比/数字PK | DataComparisonCard | 金 V[1] | slideLeft |
| 纵向累加/算账 | CalculationCard | 金 V[1] | slideUp |
| 论点警告/解释 | WarningCard | 红/紫/青/绿 | slideUp/slideLeft |
| 等几耐/原因 | QACard | 金 V[1] | slideRight |
| 左右分镜对比 | SplitSceneCard | 蓝(左)/红(右) | slideRight |
| 揭谎/反转 | RevealMythCard | 紫 V[4] | spring |
| 转折/悬念 | HookCard | 红 V[0] | spring |
| 结论/金句 | ClimaxCard | 红 V[0] | spring |
| 累计汇总 | CountUpSummaryCard | 金 V[1] | slideUp |
| 清单/步骤 | ChecklistCard | 绿 V[3] | slideUp |
| 行动号召 | CTACard | 金 V[1] | slideUp |

---

## 卡片序列设计总则

1. **11-12 卡**，总时长 90-130s
2. **相邻卡片类型不重复**、**相邻动效不重复**、**相邻颜色不重复**
3. **卡间呼吸空档 30f（1s）**，段落间 30-50f
4. **色彩流动**：蓝→金→蓝→红→金→紫→青→蓝+红→紫→绿→红→金
5. **动效交替**：spring → slideUp → slideUp → slideLeft → slideRight → slideLeft → slideUp → slideRight → spring → slideUp → spring → slideUp
6. **新卡优先**：对比用 SplitSceneCard，反转用 RevealMythCard，面积对比用 DataComparisonCard

---

## sidaizhai-v1 生产标准 ★ 2026-06-22 基准

以下标准基于「四代住宅」12 卡视频打磨成型，以后所有口播视频以此为基准。

### 完整 12 卡参考结构

| # | 类型 | 帧范围 | 时长 | 颜色 | 动效 | 高亮词 |
|---|------|--------|------|------|------|--------|
| 1 | HookCard | 0-240 | 8s | 🔵 蓝 V[2] | spring | 1词 stamp |
| 2 | RevealCard | 270-570 | 10s | 🔴 红 V[0] | slideUp | — |
| 3 | QACard | 600-960 | 12s | 🟢 绿 V[3] | slideUp | 1词 stamp |
| 4 | TestimonialCard | 990-1260 | 9s | 🟠 金 V[1] | slideRight | — |
| 5 | RevealCard | 1290-1590 | 10s | 🔴 红 V[0] | slideUp | — |
| 6 | DataComparisonCard | 1620-1950 | 11s | 🟣 紫 V[4] | slideLeft | — |
| 7 | RevealCard | 1980-2280 | 10s | 🟢 绿 V[3] | slideRight | — |
| 8 | RevealCard | 2310-2610 | 10s | 🟣 紫 V[4] | slideUp | — |
| 9 | DataComparisonCard | 2640-3000 | 12s | 🟠 金 V[1] | slideUp | — |
| 10 | WarningCard | 3030-3300 | 9s | 🔴 红 V[0] | slideLeft | 1词 stamp |
| 11 | ClimaxCard | 3330-3540 | 7s | 🔴 红 V[0] | spring | 1词 stamp |
| 12 | CTACard | 3570-3645 | 2.5s | 🟠 金 V[1] | slideUp | — |

**总帧数**：3660 / 30fps / 122s

### 色彩流动（12 卡）

```
蓝(Hook) → 红(Reveal) → 绿(QA) → 金(Testimonial) → 红(Reveal)
  ⇣ 30f
紫(DataComp) → 绿(Reveal) → 紫(Reveal)
  ⇣ 30f
金(DataComp 算账) → 红(Warning) → 红(Climax) → 金(CTA)
```

**规则**：相邻卡片不同色。Climax→Warning 同色（红）可接受（情绪递进）。

### 高亮规则（强制）

| 规则 | 值 |
|------|-----|
| 每卡高亮词数 | **≤1** |
| 每卡颜色数 | **≤3**（白主色 + accent + 1高亮色） |
| 高亮色来源 | **卡片 accent 色**（不引入新色） |
| emphasis | **stamp**（一卡一词场景） |
| 延迟 | Hook/Warning/QA = **14f**, Climax = **16f** |
| 非高亮文字 | `C.textSecondary` (#F5F0E8 暖白) |
| 间距系数 | reservedPadding 用 **0.55** |

### 卡片选用指南

| 场景 | 首选卡片 | 备选 |
|------|---------|------|
| 开场钩子/反直觉 | HookCard | — |
| 大数据揭示 | RevealCard | — |
| 一问一答/科普 | QACard | — |
| 客户故事/见证 | TestimonialCard | — |
| 两方数值PK | DataComparisonCard | SplitSceneCard |
| 面积/数量直观对比 | **DataComparisonCard** | ~~CalculationCard~~ |
| 纵向累加算账 | CalculationCard | — |
| 避坑警告/须知 | WarningCard | — |
| 金句收尾 | ClimaxCard | — |
| 行动号召 | CTACard | — |

### 关键数值规范

| 项目 | 值 |
|------|-----|
| 默认 position | **`safe-center`** — 安全区内垂直+水平双居中 |
| 卡片最大宽度 | **900px**（`posStyle.maxWidth` 自动计算） |
| CTACard 最低时长 | **75f (2.5s)** — 内容需逐层展开（icon→title→contact→tags），30f 以下一闪而过 |
| DataComparisonCard 放大 | `cardScale: 1.15-1.2`，>1 自动 `maxWidth/=cardScale` 防越界 |
| CalculationCard 文字 totalValue | `parseNum` 对 "差唔多" 等纯文字返回 NaN → 组件自动跳过计数直接显示原文 |
| QACard 字号 | Q: **44px** / A: **36px**（不再用旧的 36/28） |
| 统一圆角 | `RADIUS = { card: 20, panel: 18, contact: 20, tag: 8 }` |
| idle 浮动 | 每卡 Y 轴 1.0-1.8px sin 浮动（不同卡片不同相位，防同步共振） |
| 数字 settle | 计数完成 1→1.03→1 回弹（RevealCard settleAt=28, DataComparisonCard=36） |
| PCM 剥离 | 渲染后自动 `ffmpeg -c:v copy -an`，Windows 文件锁时 `-clean.mov` 可手动替换 |

### 卡间 timing 公式

```
gap = 30f (1s)  — 标准卡间呼吸
同段卡片 enterAt[n+1] = exitAt[n] + 30
exitEnd = exitAt + 15f (ENTER_DURATION)
→ 实际空白 = enterAt[n+1] - exitEnd = 15f (0.5s)
```

---

## 全部组件子元素动画时序

### HookCard
```
00f  container spring (scale 0.95→1)
02f  icon bounce (scale 0→1.2 overshoot dampened)
12f  headline words stagger (每词 4f, opacity 0→1)
16f+ subline stagger (如果用 sublineSeparator)
退出: words 逆序 → EN text → subline → icon → label → container
```

### WarningCard
```
00f  card slide-in (translateX 80→0, damping:30 stiffness:65 mass:1.5)
04f  icon rotate-in (-15°→0° + scale 0→1.15 overshoot)
08f  title letter-spacing 0.06em→-0.005em + opacity 0→1
16f  desc fade-in
20f+ bullets stagger (每6帧一条, 编号圆圈逐行淡入)
退出: bullets 逆序 → desc → title → icon → card
```

### QACard
```
00f  Q section slide-down (translateY 24→0)
20f  A section slide-down (translateY 20→0) + 边框淡入
退出: A 先退 → Q 后退 → label
```

### ClimaxCard
```
00f  label fade-in
04f  icon bounce
10f  PunchLineBox enter + letter-spacing 0.08em→-0.02em
30f  author slide-up (translateY 12→0) + fade-in
退出: author 先退 → EN text → PunchLineBox → icon → label
```

### CTACard
```
00f  icon bounce (scale 0→1.2 overshoot dampened)
08f  title entrance (letter-spacing 0.06em→-0.02em + opacity)
20f  contact card (scale 0.93→1 + opacity)
28f  tags fade-in (15 frames)
退出: tags 先退 → contact → title → icon
```

### TestimonialCard ★ v11
```
00f  大引号 scale-in (0.6→1, damping:26 stiffness:70) + glow 呼吸
06f  quote text slide-up (24→0) + italic breathingScale
10f  enQuote fade-in (同 Y)
16f  署名 slide-x (16→0) + opacity
18f  左边框 height draw-in (0→100%)
退出: quote → enQuote → 署名+边框 reverse
```

### DataComparisonCard
```
00f  icon bounce
06f  left panel slide-in (translateX -40→0)
10f  number counting starts + connector line draws
14f  divider draw (height 0→100%)
16f  right panel slide-in (translateX 40→0) [2-way]
18f  center panel scale-in [3-way]
26f  delta badge bounce (scale 0.6→1)
退出: delta → numbers → connectors → divider → right → left → icon → label
```

### ChecklistCard
```
00f+ items stagger (每 10f 一行, slide-in translateX 30→0)
12f+ checkmark draw (每行 item 入场后 12f)
退出: items 逆序滑出 (translateX 0→30)
```

### RevealMythCard
```
00f  myth fade-in (grey 36px)
14f  red strikethrough bar draws across myth text
16f  X mark appears (SVG cross, scale 0→1)
18f  divider draw (center→edges)
24f  truth SLAM-in (translateY 40→0 + scale 0.8→1)
退出: truth 先退 → divider → X mark → strikethrough → myth
```

### SplitSceneCard
```
00f  label + icon bounce (居中)
04f  left panel slide-in (translateX -100→0)
08f+ left items stagger (每 6f, row-reverse 圆点靠中线)
10f  divider draw (height 0→100%, 3px 双色渐变)
16f  right panel slide-in (translateX 100→0)
20f+ right items stagger (每 6f, 圆点靠中线)
22f  divider label fade-in
退出: right items → right panel → divider → left items → left panel → icon
```

### CalculationCard
```
00f  label + icon bounce
06f  item[0] slide-in + number count
14f  item[1] slide-in + number count
...  每行间隔 8f
22f+ divider draw (center→edges)
28f+ total line spring bounce + number count
退出: items 逆序滑出 → divider 收缩 → total 淡出
```

### CountUpSummaryCard
```
00f  label + icon bounce
10f  item[0] fade-in + number count
...  每行间隔 8f
20f+ divider draw
28f+ final line spring bounce (scale 0.85→1)
退出: items 逆序淡出 → divider 收缩 → final 淡出
```

---

## GlassCard 使用规范

```tsx
// 组件自身有入场动画 → 必须传 disableEntryAnimation
<GlassCard
  color={color}
  showLeftBar
  glowIntensity={0.2}
  transparentBg
  showOuterGlow={false}
  disableEntryAnimation    // ← 关键：避免双层动画
  padding="40px 48px 36px 56px"
  maxWidth={880}
>
```

**使用规则**：
- WarningCard / BenefitCard / CTACard：传 `disableEntryAnimation`（组件自有 slideX/staging）
- HookCard / ClimaxCard / QACard / RevealMythCard / SplitSceneCard：不使用 GlassCard 容器

---

## HookCard 高级特性

### 逐词延迟（word stagger）

headline 按空格拆分，每个词延迟 `staggerFrames`（默认 4）帧逐个出现。需要人工在词间加空格来分词：
```json
"headline": "sales 话就快有地铁 真相 系点？"
// 4个词: "sales" "话就快有地铁" "真相" "系点？"
```

退出时逆序：最后出现的词先消失。

### 副标题分段 stagger

```json
"subline": "管理费 3.5元/㎡ + 电费 阶梯计价 + 水费 3.8元/吨 + 车位 300元/月",
"sublineSeparator": "+"
// 4段逐段 fade-in，每段间隔 8f
```

---

## Kinetic Typography — Emphasis 三级重音系统 ★ v5（2026-06-22 生产标准）

**核心理念**：业界三技法融合——Scale Pop (110-130%) + Color/Weight Accent + Motion Punctuation。三种 emphasis 级别模拟标点节奏：pop(逗号·轻) / pulse(下划线·呼吸) / stamp(句号·重)。

### EmphasisLevel 类型

```ts
type EmphasisLevel = 'pop' | 'pulse' | 'stamp';

interface EmphasisConfig {
  scale: number;                                    // 峰值放大倍率
  spring: { damping: number; stiffness: number; mass: number };
  weight: number | null;                            // 峰值字重（null=不变）
  glow: number;                                     // 光晕倍率
}

const EMPHASIS_CONFIGS: Record<EmphasisLevel, EmphasisConfig> = {
  pop:   { scale: 1.18, spring: { damping: 14, stiffness: 120, mass: 0.50 }, weight: null, glow: 1.0 },
  pulse: { scale: 1.00, spring: { damping: 20, stiffness:  80, mass: 0.80 }, weight: null, glow: 1.5 },
  stamp: { scale: 1.22, spring: { damping: 10, stiffness: 140, mass: 0.45 }, weight: 900,  glow: 1.3 },
};
```

### 共享工具函数（animation.ts）

```ts
// 统一 popScale 计算 — 消除 4 卡重复代码
function popScaleValue(springVal: number, targetScale: number): number {
  return 1 + (springVal > 1 ? (1 + (springVal - 1) * 0.25) : springVal) * (targetScale - 1);
}

// 统一预留 padding — 防止高亮词与相邻文字碰撞
function reservedPadding(targetScale: number): string {
  return `0 ${Math.max(0, (targetScale - 1) * 0.55).toFixed(3)}em`;
}
```

### HighlightWord 类型（v5）

```ts
interface HighlightWord {
  word: string;              // 精确匹配子串（区分大小写）
  color?: string;            // 高亮色（默认用卡片 accent 色）
  scale?: number;            // 覆盖 emphasis 默认 scale
  delay?: number;            // 延迟帧数（默认 14f Hook/Warning/QA, 16f Climax）
  emphasis?: EmphasisLevel;  // 默认 'pop'
}
```

### 支持卡片 + 默认参数

| 卡片 | Prop | 默认 emphasis | 默认 scale | 默认 delay |
|------|------|-------------|-----------|-----------|
| HookCard | `highlights` | pop | 1.18 | 14f after stagger |
| WarningCard | `highlights` | pop | 1.18 | 14f after title entry |
| ClimaxCard | `highlights` | pop | 1.18 | 16f after box entry |
| QACard | `questionHighlights` | pop | 1.18 | 14f after Q entry |
| QACard | `answerHighlights` | pop | 1.18 | 14f after A entry |

### JSON 使用示例

```json
{
  "type": "HookCard",
  "props": {
    "label": "楼市真相",
    "headline": "最好卖嘅 唔系上车盘 系四代住宅",
    "color": "#1A56DB",
    "highlights": [
      { "word": "四代住宅", "color": "#1A56DB", "emphasis": "stamp" }
    ]
  }
}
```

**效果**：「最好卖嘅 唔系上车盘 系」逐词 stagger → 14 帧后「四代住宅」以 stamp 级别弹出：scale 1.22× + 字重 900 + 蓝色光晕，像句号一样定调。

### 生产标准（sidaizhai-v1）★ 强制

| 规则 | 说明 |
|------|------|
| **每卡 ≤1 高亮词** | 一张卡片只有一个重点关键词，聚焦视觉重心 |
| **每卡 ≤3 种颜色** | 白色（主文字）+ 卡片 accent（标签/图标）+ 1 高亮色 = ≤3 |
| **高亮色用卡片 accent** | `"color": "#1A56DB"` 与卡片 `"color"` 一致，不引入新色 |
| **emphasis 优先用 stamp** | 每卡仅 1 词 → 必须用力（stamp: 1.22× + 字重900 + glow 1.3） |
| **非高亮文字用暖白** | `C.textSecondary` (#F5F0E8)，让高亮词真正"浮出来" |
| **延迟至少 14f** | 卡片先稳定入场 → 观众看清楚 → 关键词再弹（14f ≈ 0.47s） |
| **退出逆序** | 高亮词先缩回 → 非高亮文字再退 → 维持层级感 |

### 设计原则

| 原则 | 说明 |
|------|------|
| 一卡一词 | 每张卡片只突出一个关键词。两个以上分散注意力 |
| 核心名词优先 | "四代住宅"、"空中庭院"、"挂个名" — 主题词 > 数字 > 情绪词 |
| 色不过界 | 高亮色 = 卡片 accent 色，不引入第 4 种颜色 |
| stamp 为主 | 一卡一词的场景 stamp 是最佳选择，pop/pulse 仅用于多词场景 |
| 先稳后弹 | delay 14-16f 让卡片先站稳，观众不觉得突兀 |

---

## 色彩流动规则

### 11 场景色彩流动
```
Hook(V[2]蓝) → Reveal(V[1]金) → W1(V[0]红) → W2(V[3]绿) → W3(V[4]紫)
→ Pivot(V[5]青) → B1(V[1]金) → B2(V[3]绿) → B3(V[4]紫) → Climax(V[0]红) → CTA(V[1]金)
```

### 实际 12 卡色彩参考
```
Hook(蓝) → QA(金) → Reveal(蓝) → Warning(红) → QA(金)
→ Warning(紫) → Warning(青) → SplitScene(蓝+红) → RevealMyth(紫) → Warning(绿) → Climax(红) → CTA(金)
```

---

## 输出验证清单

每次渲染完成后必须执行：

```bash
# 1. 确认文件存在且大小合理 (>100MB)
ls -lh out/overlay.mov

# 2. 确认 Alpha 通道
ffprobe -v quiet -show_streams out/overlay.mov | grep pix_fmt
# 必须: pix_fmt=yuva444p12le 或 yuva444p10le

# 3. 确认无音频轨（剪映兼容性）
ffprobe -v quiet -show_streams out/overlay.mov | grep -c "codec_type=audio"
# 必须: 0

# 4. 确认帧数
ffprobe -v quiet -show_streams out/overlay.mov | grep nb_frames
# 必须与 timeline durationInFrames 一致

# 5. 确认分辨率
ffprobe -v quiet -show_streams out/overlay.mov | grep -E "width|height"
# 必须: width=1080, height=1920
```

---

## 图标速查

路径：`src/components/overlay/iconMap.ts`（82 个 SVG 图标）

### 房产口播高频

| key | 图标 | 场景 |
|-----|------|------|
| `contract` | 合同+勾 | 双合同陷阱、购房合同 |
| `receipt` | 税单 | 契税、增值税 |
| `mortgage` | 房子+货币 | 按揭贷款、月供 |
| `waterDrop` | 水滴 | 水费、用水成本 |
| `powerMeter` | 电表+闪电 | 电费 |
| `gasStove` | 燃气灶 | 燃气费 |
| `hammer` | 锤子 | 装修成本 |
| `stamp` | 公章 | 法律效力 |
| `villa` | 别墅 | 别墅项目 |
| `train` | 列车 | 城际/地铁 |
| `car` | 汽车 | 通勤/自驾 |
| `clock` | 时钟 | 时间线/等待 |
| `document` | 文档 | 政策/规划 |
| `calendar` | 日历 | 时间/交楼 |

### 通用常用

`home`, `building`, `mapPin`, `currency`, `trending`, `alert`, `help`, `flame`, `key`, `bed`, `school`, `shopping`, `parking`, `waves`, `bus`, `calculator`, `percent`, `shield`, `hospital`, `park`, `pool`, `elevator`, `phone`, `creditCard`, `crown`, `diamond`, `sun`, `compass`, `palette`, `coffee`, `umbrella`, `share`

用法：`"icon": "contract"` → 组件自动从 ICON_MAP 查找
颜色：跟随卡片 accent 色（color prop），不统一白色
尺寸：HookCard 56px，其他 48px

---

## 禁止项（完整清单）

### Alpha 纯净性
- ❌ 任何彩色 textShadow/boxShadow/glow/渐变/粒子 → Alpha 色染
- ❌ radial-gradient 背景光晕 → 产生可见光圈
- ❌ 边框/光晕 alpha 正弦波脉动 → 闪烁光圈
- ❌ 彩色半透明叠加效果 → 透明底上产生污染

### 动效
- ❌ CSS @keyframes / Tailwind animate-* — 全部用 `useCurrentFrame()`
- ❌ 连续同类型卡片（>2张）
- ❌ 相邻相同入场动画
- ❌ 数字两段变速/错峰/弹跳 → 保持单一 spring
- ❌ GlassCard 不使用 `disableEntryAnimation` → 双层动画对角线轨迹

### 文字
- ❌ Emoji → 用 Icons.tsx SVG
- ❌ EN 文字非 `rgba(255,255,255,0.5)` 或字号不统一
- ❌ 子弹点用 `•` 或短线 → 必须用编号圆圈
- ❌ `textGlow(color, intensity)` 旧签名 → 使用 `textDepth(intensity)`

### 渲染
- ❌ ProRes 输出带 PCM 音频轨 → 剪映报文件损坏
- ❌ 输出 .webm 格式 → 剪映不支持
- ❌ `pixelFormat` 缺省 → Alpha 通道丢失

---

## 常见陷阱

### 1. PCM 音频污染
**症状**：剪映导入后提示"原文件损坏"

**原因**：Remotion 默认写入静音 PCM 音频轨到 ProRes MOV

**修复**：`render_pip.ts` 已修复 — 无 `--audio` 参数时不传 `audioCodec`，避免 PCM 写入
```tsx
...(hasAudio ? { audioCodec: 'aac' as const } : {}),
```

若已渲染文件含 PCM：`ffmpeg -i input.mov -c:v copy -an output.mov`

### 2. Alpha 通道丢失
**症状**：剪映导入后黑色背景不透明

**修复**：确保 `renderMedia` 包含：
```ts
codec: 'prores',
proResProfile: '4444',
pixelFormat: 'yuva444p10le',
```

### 3. Linter 破坏组件
**症状**：渲染后卡片在画面中央、黑底、字体巨大

**修复**：确认每个组件保留：
- `const posStyle = positionToStyle(position, offset)`
- `const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation })`
- 从 `./animation` 导入 `useOverlayAnimation, positionToStyle`

### 4. 字体/颜色错误
- 技能生成内容：深蓝 #3B82F6 / 背景 #0A0A0F / 文字 #FFFFFF
- 项目自定义组件（zhuzige overlay）：暖金大地色系 / 6色循环 V[]

### 5. 卡片越界超出视频号安全区 ★ v11
**症状**：卡片内容被视频号频道栏/互动按钮遮挡

**原因**：旧卡用 `safe-top`（顶部对齐），无 `overflow: hidden`，`cardScale > 1` 时放大越界

**修复**：
- 默认用 `"position": "safe-center"` — 垂直+水平双居中，上下均等 12% padding
- `posStyle.maxWidth` / `posStyle.maxHeight` 自动约束尺寸，所有容器 `overflow: hidden`
- `cardScale > 1` 自动执行 `maxWidth /= cardScale`，scale 后不越界
- `safe-top` 仅用于需要顶部对齐的特定卡片（HookCard 备选）

---

## 渲染命令参考

```bash
# 基础渲染（透明底，无音频）
cd remotion-realestate
npx ts-node scripts/render_pip.ts config/your-timeline.json out/your-video.mov

# 带配音渲染
npx ts-node scripts/render_pip.ts config/your-timeline.json out/your-video.mov --audio public/audio/voice.mp3

# 快速预览（WebM，体积小但剪映不兼容）
npx ts-node scripts/render_pip.ts config/your-timeline.json out/preview.webm
```
