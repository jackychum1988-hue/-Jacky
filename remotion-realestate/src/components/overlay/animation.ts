import { interpolate, Easing } from 'remotion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Position9 =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'safe-top'
  | 'safe-center';

export type AnimationType =
  | 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight'
  | 'scale' | 'spring' | 'typewriter';

// ---------------------------------------------------------------------------
// Kinetic Typography — Keyword Highlighting
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Emphasis Level System — kinetic typography punctuation metaphor
// pop = comma (light), pulse = underline (subtle), stamp = period (heavy)
// ---------------------------------------------------------------------------

export type EmphasisLevel = 'pop' | 'pulse' | 'stamp';

export interface EmphasisConfig {
  scale: number;
  spring: { damping: number; stiffness: number; mass: number };
  /** Peak font-weight during spring overshoot (null = unchanged) */
  weight: number | null;
  /** Glow alpha multiplier */
  glow: number;
}

export const EMPHASIS_CONFIGS: Record<EmphasisLevel, EmphasisConfig> = {
  pop: {
    scale: 1.18,
    spring: { damping: 14, stiffness: 120, mass: 0.50 },
    weight: null,
    glow: 1.0,
  },
  pulse: {
    scale: 1.0,
    spring: { damping: 20, stiffness: 80, mass: 0.80 },
    weight: null,
    glow: 1.5,
  },
  stamp: {
    scale: 1.22,
    spring: { damping: 10, stiffness: 140, mass: 0.45 },
    weight: 900,
    glow: 1.3,
  },
};

// ---------------------------------------------------------------------------
// Shared highlight utilities — eliminates duplication across 4 card components
// ---------------------------------------------------------------------------

/**
 * Compute the CSS scale() value from a Remotion spring output.
 * Dampens overshoot (spring > 1 → only 25% of excess applied) so the pop
 * feels crisp rather than floaty.
 */
export function popScaleValue(springVal: number, targetScale: number): number {
  return 1 + (springVal > 1 ? (1 + (springVal - 1) * 0.25) : springVal) * (targetScale - 1);
}

/**
 * Horizontal reserved-space padding so a scaled-up highlight word does not
 * collide with adjacent text. Uses the *target* scale (not the animated one)
 * so space is pre-allocated from the start and never shifts.
 */
export function reservedPadding(targetScale: number): string {
  return `0 ${Math.max(0, (targetScale - 1) * 0.55).toFixed(3)}em`;
}

// ---------------------------------------------------------------------------
// Kinetic Typography — Keyword Highlighting
// ---------------------------------------------------------------------------

/** A single keyword/phrase to highlight with pop animation within text */
export interface HighlightWord {
  /** Exact substring to match in the text (case-sensitive, multi-word OK) */
  word: string;
  /** Override accent color for this highlight (defaults to card color) */
  color?: string;
  /** Scale multiplier at peak of pop (overrides emphasis default) */
  scale?: number;
  /** Extra frame delay after the phrase would normally appear (default 6) */
  delay?: number;
  /** Emphasis level driving spring/weight/glow (default 'pop') */
  emphasis?: EmphasisLevel;
}

export interface TextSegment {
  text: string;
  highlight?: HighlightWord;
}

/**
 * Split text by highlight matches, returning segments.
 * Non-highlight segments render normally; highlight segments get kinetic pop.
 * Handles overlapping matches by taking the first-occurring one.
 */
export function splitByHighlights(text: string, highlights: HighlightWord[]): TextSegment[] {
  const matches = highlights
    .map(h => ({ ...h, index: text.indexOf(h.word) }))
    .filter(m => m.index >= 0)
    .sort((a, b) => a.index - b.index);

  const segments: TextSegment[] = [];
  let pos = 0;
  for (const m of matches) {
    if (m.index < pos) continue; // skip overlapping matches
    if (m.index > pos) {
      segments.push({ text: text.slice(pos, m.index) });
    }
    segments.push({ text: m.word, highlight: m });
    pos = m.index + m.word.length;
  }
  if (pos < text.length) {
    segments.push({ text: text.slice(pos) });
  }
  return segments;
}

export interface OverlayTiming {
  enterAt: number;
  exitAt: number;
  animation: AnimationType;
}

export interface OverlayElementBase {
  enterAt: number;
  exitAt: number;
  animation: AnimationType;
  position: Position9;
  offset?: { x: number; y: number };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ENTER_DURATION_SECONDS = 0.5;
const EXIT_DURATION_SECONDS = 0.5;
const SLIDE_DISTANCE_PX = 50;

// ---------------------------------------------------------------------------
// 微信视频号竖屏安全区 (1080×1920)
// ---------------------------------------------------------------------------

/**
 * 视频号竖屏 UI 叠加区域 (1080×1920)。
 * - 顶部 ~120px：频道头像、名称、关注按钮
 * - 底部 ~200px：点赞、评论、分享、收藏按钮 + 进度条
 * - 左右 ~60px：最小安全边距（按钮/弹窗不遮挡内容）
 *
 * 所有卡片内容必须在此安全区内渲染，不得越界。
 */
export const SAFE_ZONE = {
  top: 120,
  bottom: 200,
  left: 60,
  right: 60,
  /** 安全区可用宽度 */
  get width() { return 1080 - this.left - this.right; },
  /** 安全区可用高度 */
  get height() { return 1920 - this.top - this.bottom; },
} as const;

/** 卡片默认最大宽度（安全区内保留少量呼吸边距） */
export const SAFE_MAX_WIDTH = 880;
/** DataComparisonCard 等宽卡最大宽度 */
export const SAFE_MAX_WIDTH_WIDE = 900;

// ---------------------------------------------------------------------------
// positionToStyle
// ---------------------------------------------------------------------------

const POSITION_STYLE_MAP: Record<
  Position9,
  { justifyContent: string; alignItems: string; padding: string; maxWidth: number; maxHeight: number }
> = {
  'top-left':     { justifyContent: 'flex-start', alignItems: 'flex-start', padding: '60px 0 0 60px',  maxWidth: 960, maxHeight: 1660 },
  'top-center':   { justifyContent: 'flex-start', alignItems: 'center',     padding: '60px 0 0 0',      maxWidth: 960, maxHeight: 1660 },
  'top-right':    { justifyContent: 'flex-start', alignItems: 'flex-end',   padding: '60px 60px 0 0',   maxWidth: 960, maxHeight: 1660 },
  'center-left':  { justifyContent: 'center',     alignItems: 'flex-start', padding: '0 0 0 60px',      maxWidth: 960, maxHeight: 1920 },
  center:         { justifyContent: 'center',     alignItems: 'center',     padding: '0',               maxWidth: 960, maxHeight: 1920 },
  'center-right': { justifyContent: 'center',     alignItems: 'flex-end',   padding: '0 60px 0 0',     maxWidth: 960, maxHeight: 1920 },
  'bottom-left':  { justifyContent: 'flex-end',   alignItems: 'flex-start', padding: '0 0 60px 60px',   maxWidth: 960, maxHeight: 1660 },
  'bottom-center':{ justifyContent: 'flex-end',   alignItems: 'center',     padding: '0 0 60px 0',     maxWidth: 960, maxHeight: 1660 },
  'bottom-right': { justifyContent: 'flex-end',   alignItems: 'flex-end',   padding: '0 60px 60px 0',  maxWidth: 960, maxHeight: 1660 },
  // 视频号竖屏安全区：12% 上边距 (~130px, 刚过频道条), 8% 侧边距 (~86px)
  'safe-top':     { justifyContent: 'flex-start', alignItems: 'center',     padding: '12% 8% 0 8%',    maxWidth: 900, maxHeight: 1580 },
  // 视频号安全区居中：垂直+水平双居中，上下均等 12% padding (~130px) 避开频道栏和互动栏
  'safe-center':  { justifyContent: 'center',     alignItems: 'center',     padding: '12% 8%',         maxWidth: 900, maxHeight: 1600 },
};

export interface PositionStyle {
  display: 'flex';
  justifyContent: string;
  alignItems: string;
  padding: string;
  transform: string;
  /** 内容区最大宽度 (px)，已扣除安全边距 */
  maxWidth: number;
  /** 内容区最大高度 (px)，已扣除安全区顶部+底部 */
  maxHeight: number;
}

export function positionToStyle(
  position: Position9,
  offset?: { x: number; y: number },
): PositionStyle {
  const base = POSITION_STYLE_MAP[position];
  const x = offset?.x ?? 0;
  const y = offset?.y ?? 0;
  const offsetTransform =
    x !== 0 || y !== 0 ? `translate(${x}px, ${y}px)` : 'none';

  return {
    display: 'flex',
    justifyContent: base.justifyContent,
    alignItems: base.alignItems,
    padding: base.padding,
    transform: offsetTransform,
    maxWidth: base.maxWidth,
    maxHeight: base.maxHeight,
  };
}

// ---------------------------------------------------------------------------
// useOverlayAnimation
// ---------------------------------------------------------------------------

export type AnimationPhase = 'enter' | 'idle' | 'exit';

export interface AnimationResult {
  opacity: number;
  transform: string;
  isVisible: boolean;
  /** Current phase of the card lifecycle */
  phase: AnimationPhase;
  /** Progress within the current phase (0→1), 0 during idle */
  phaseProgress: number;
}

export function useOverlayAnimation(
  frame: number,
  fps: number,
  timing: OverlayTiming,
): AnimationResult {
  const enterDurationFrames = fps * ENTER_DURATION_SECONDS;
  const exitDurationFrames = fps * EXIT_DURATION_SECONDS;

  const enterStart = timing.enterAt;
  const enterEnd = enterStart + enterDurationFrames;
  const exitStart = timing.exitAt;
  const exitEnd = timing.exitAt > 0 ? exitStart + exitDurationFrames : Infinity;

  if (frame < enterStart || (timing.exitAt > 0 && frame >= exitEnd)) {
    return { opacity: 0, transform: 'none', isVisible: false, phase: 'exit', phaseProgress: 1 };
  }

  // Enter phase
  if (frame < enterEnd) {
    const progress = (frame - enterStart) / enterDurationFrames;
    const enterEasing =
      timing.animation === 'spring'
        ? Easing.out(Easing.back(1.7))
        : Easing.out(Easing.back(1.2));

    const opacity = interpolate(progress, [0, 1], [0, 1], {
      extrapolateRight: 'clamp',
    });

    const transform = getEnterTransform(timing.animation, progress, enterEasing);

    return { opacity, transform, isVisible: true, phase: 'enter', phaseProgress: progress };
  }

  // Exit phase
  if (timing.exitAt > 0 && frame >= exitStart) {
    const progress = (frame - exitStart) / exitDurationFrames;
    const exitEasing = Easing.in(Easing.quad);

    const opacity = interpolate(progress, [0, 1], [1, 0], {
      extrapolateRight: 'clamp',
    });

    const transform = getExitTransform(timing.animation, progress, exitEasing);

    return { opacity, transform, isVisible: true, phase: 'exit', phaseProgress: progress };
  }

  // Idle phase
  return { opacity: 1, transform: 'none', isVisible: true, phase: 'idle', phaseProgress: 0 };
}

// ---------------------------------------------------------------------------
// Transform helpers
// ---------------------------------------------------------------------------

function getEnterTransform(
  animation: AnimationType,
  progress: number,
  easing: (t: number) => number,
): string {
  const t = easing(progress);

  switch (animation) {
    case 'fade':
    case 'typewriter':
      return 'none';
    case 'slideUp':
      return `translateY(${(1 - t) * SLIDE_DISTANCE_PX}px)`;
    case 'slideDown':
      return `translateY(${-(1 - t) * SLIDE_DISTANCE_PX}px)`;
    case 'slideLeft':
      return `translateX(${(1 - t) * SLIDE_DISTANCE_PX}px)`;
    case 'slideRight':
      return `translateX(${-(1 - t) * SLIDE_DISTANCE_PX}px)`;
    case 'scale':
    case 'spring':
      return `scale(${interpolate(t, [0, 1], [0.85, 1])})`;
    default:
      return 'none';
  }
}

function getExitTransform(
  animation: AnimationType,
  progress: number,
  easing: (t: number) => number,
): string {
  const t = easing(progress);

  switch (animation) {
    case 'fade':
    case 'typewriter':
      return 'none';
    case 'slideUp':
      return `translateY(${-t * SLIDE_DISTANCE_PX}px)`;
    case 'slideDown':
      return `translateY(${t * SLIDE_DISTANCE_PX}px)`;
    case 'slideLeft':
      return `translateX(${-t * SLIDE_DISTANCE_PX}px)`;
    case 'slideRight':
      return `translateX(${t * SLIDE_DISTANCE_PX}px)`;
    case 'scale':
    case 'spring':
      return `scale(${interpolate(t, [0, 1], [1, 0.85])})`;
    default:
      return 'none';
  }
}

// ---------------------------------------------------------------------------
// useTypewriterProgress
// ---------------------------------------------------------------------------

export function useTypewriterProgress(
  frame: number,
  enterAt: number,
  textLength: number,
  speed: number = 2,
): number {
  const elapsed = frame - enterAt;
  if (elapsed <= 0) return 0;
  const chars = Math.floor(elapsed / speed);
  return Math.min(chars, textLength);
}

// ---------------------------------------------------------------------------
// hexToRgb
// ---------------------------------------------------------------------------

export const hexToRgb = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
};

export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// Subtle text depth — white highlight + black depth shadow only (no colored glow).
// v14 rule: all text shadows are colorless to avoid halo artifacts on transparent backgrounds.
export const textDepth = (intensity: number): string => {
  return [
    `0 0 1px rgba(255,255,255,${0.06 * intensity})`,
    `0 0 2px rgba(0,0,0,${0.20 * intensity})`,
    `0 1px 4px rgba(0,0,0,${0.12 * intensity})`,
  ].join(', ');
};

/** @deprecated Use textDepth(intensity) instead — the color parameter was never used. */
export const textGlow = (_color: string, intensity: number): string => textDepth(intensity);

// Subtle breathing scale (~5s cycle, ±0.8%)
export const breathingScale = (frame: number): number => {
  return 1 + Math.sin(frame * 0.035) * 0.008;
};

/**
 * Subtle Y-axis floating for idle-phase cards.
 * Keeps the frame alive instead of freezing completely — Apple-style "always breathing."
 *
 * @param frame   Absolute frame (not localFrame) for consistent phase across cards
 * @param amplitude  Float distance in px (default 2px — barely perceptible)
 * @param period     Sine speed (default 0.02 → ~5.2s cycle)
 */
export function idleFloat(frame: number, amplitude: number = 2, period: number = 0.02): number {
  return Math.sin(frame * period) * amplitude;
}

/**
 * Subtle scale settle-bounce when a number finishes counting.
 * Simulates physical "landing" — tiny overshoot 1→1.03→1 over ~12 frames.
 *
 * @param localFrame   Frames since card entered
 * @param fps          Video FPS
 * @param settleAt     Local frame when counting completes (default 28)
 */
export function settleBounce(
  localFrame: number,
  fps: number,
  settleAt: number = 28,
): { scale: number; active: boolean } {
  const settleFrame = Math.max(0, localFrame - settleAt);
  // Only active for ~14 frames after settle point
  const active = settleFrame >= 0 && settleFrame < 14;
  if (!active) return { scale: 1, active: false };
  // Micro spring: 0→1.03→1
  const t = settleFrame / 14;
  const overshoot = Math.sin(t * Math.PI) * 0.03 * Math.exp(-t * 3);
  return { scale: 1 + overshoot, active: true };
}

// Unified Apple-style border radii
export const RADIUS = {
  card: 20,    // Card containers, GlassCard
  panel: 18,   // Inner panels (DataComparisonCard)
  tag: 8,      // Small tags, delta badges
  contact: 20, // Contact card in CTA
} as const;

// zhuzige 6-color palette
export const V = [
  '#FF4136', // 0: red
  '#F5A623', // 1: amber
  '#1A56DB', // 2: deep-blue
  '#10B981', // 3: emerald
  '#8B5CF6', // 4: violet
  '#06B6D4', // 5: cyan
];

// Text colors for transparent overlay
export const C = {
  text: '#FFFFFF',
  textSecondary: '#F5F0E8',
  textTertiary: '#C8BFA8',
};

// English font-size ratio relative to Chinese
export const EN_RATIO = 0.55;
export const enFontSize = (cnSize: number) => Math.round(cnSize * EN_RATIO);

// Font stacks
export const F = {
  display: '-apple-system, BlinkMacSystemFont, "Inter", "Noto Sans SC", sans-serif',
  text: '-apple-system, BlinkMacSystemFont, "Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
  mono: '"SF Mono", "JetBrains Mono", "Fira Code", monospace',
};
