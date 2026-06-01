import { interpolate, Easing } from 'remotion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Position9 =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export type AnimationType =
  | 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight'
  | 'scale' | 'spring' | 'typewriter';

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
// positionToStyle
// ---------------------------------------------------------------------------

const POSITION_STYLE_MAP: Record<
  Position9,
  { justifyContent: string; alignItems: string; padding: string }
> = {
  'top-left':     { justifyContent: 'flex-start', alignItems: 'flex-start', padding: '60px 0 0 60px' },
  'top-center':   { justifyContent: 'flex-start', alignItems: 'center',     padding: '60px 0 0 0' },
  'top-right':    { justifyContent: 'flex-start', alignItems: 'flex-end',   padding: '60px 60px 0 0' },
  'center-left':  { justifyContent: 'center',     alignItems: 'flex-start', padding: '0 0 0 60px' },
  center:         { justifyContent: 'center',     alignItems: 'center',     padding: '0' },
  'center-right': { justifyContent: 'center',     alignItems: 'flex-end',   padding: '0 60px 0 0' },
  'bottom-left':  { justifyContent: 'flex-end',   alignItems: 'flex-start', padding: '0 0 60px 60px' },
  'bottom-center':{ justifyContent: 'flex-end',   alignItems: 'center',     padding: '0 0 60px 0' },
  'bottom-right': { justifyContent: 'flex-end',   alignItems: 'flex-end',   padding: '0 60px 60px 0' },
};

export interface PositionStyle {
  display: 'flex';
  justifyContent: string;
  alignItems: string;
  padding: string;
  transform: string;
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
  };
}

// ---------------------------------------------------------------------------
// useOverlayAnimation
// ---------------------------------------------------------------------------

export interface AnimationResult {
  opacity: number;
  transform: string;
  isVisible: boolean;
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
    return { opacity: 0, transform: 'none', isVisible: false };
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

    return { opacity, transform, isVisible: true };
  }

  // Exit phase
  if (timing.exitAt > 0 && frame >= exitStart) {
    const progress = (frame - exitStart) / exitDurationFrames;
    const exitEasing = Easing.in(Easing.quad);

    const opacity = interpolate(progress, [0, 1], [1, 0], {
      extrapolateRight: 'clamp',
    });

    const transform = getExitTransform(timing.animation, progress, exitEasing);

    return { opacity, transform, isVisible: true };
  }

  // Idle phase
  return { opacity: 1, transform: 'none', isVisible: true };
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
