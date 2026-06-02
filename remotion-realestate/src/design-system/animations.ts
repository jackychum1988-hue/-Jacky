// 动画预设和工具函数 - 房产视频专用
// 更优雅、更从容的动画节奏

import { spring, interpolate, Easing } from 'remotion';

// Spring 动画预设 - 偏优雅稳重
export const SPRING_PRESETS = {
  // 平滑无弹跳 - 适合稳重内容
  smooth: { damping: 200, stiffness: 100 },

  // 快速响应 - 适合 UI 元素入场
  snappy: { damping: 20, stiffness: 200 },

  // 轻微弹性 - 适合标题等主要内容
  bouncy: { damping: 15, stiffness: 120 },

  // 厚重感 - 适合大面积元素（楼盘名称、大图）
  heavy: { damping: 18, stiffness: 70, mass: 2.5 },

  // 奢华弹性 - 适合价格数字、关键卖点
  luxury: { damping: 12, stiffness: 90, mass: 1.5 },

  // 轻柔 - 适合文字段落
  gentle: { damping: 30, stiffness: 80 },
};

// Easing 预设
export const EASING_PRESETS = {
  linear: Easing.linear,
  easeIn: Easing.in(Easing.quad),
  easeOut: Easing.out(Easing.quad),
  easeInOut: Easing.inOut(Easing.quad),
  easeOutBack: Easing.out(Easing.back(1.7)),
  easeOutExpo: Easing.out(Easing.exp),
};

// 入场动画工具函数
export const entranceAnimations = {
  // 淡入
  fade: (frame: number, duration: number) =>
    interpolate(frame, [0, duration], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),

  // 从下方浮入（适合房产信息展示）
  slideUp: (frame: number, duration: number, distance: number = 30) => ({
    opacity: interpolate(frame, [0, duration * 0.5], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    translateY: interpolate(frame, [0, duration], [distance, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: EASING_PRESETS.easeOutBack,
    }),
  }),

  // 从左侧滑入
  slideLeft: (frame: number, duration: number, distance: number = 30) => ({
    opacity: interpolate(frame, [0, duration * 0.5], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    translateX: interpolate(frame, [0, duration], [-distance, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: EASING_PRESETS.easeOutBack,
    }),
  }),

  // 缩放淡入（适合户型图、效果图）
  scale: (frame: number, duration: number) => ({
    opacity: interpolate(frame, [0, duration * 0.5], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    scale: interpolate(frame, [0, duration], [0.85, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: EASING_PRESETS.easeOutBack,
    }),
  }),

  // 打字机效果
  typewriter: (frame: number, speed: number, totalChars: number) => {
    const charsToShow = Math.min(Math.floor(frame / speed), totalChars);
    return charsToShow;
  },
};

// 使用 spring 的入场动画
export const springEntrance = {
  // 弹性缩放
  bounceScale: (frame: number, fps: number, delay: number = 0) =>
    spring({
      frame: frame - delay,
      fps,
      config: SPRING_PRESETS.bouncy,
    }),

  // 平滑缩放
  smoothScale: (frame: number, fps: number, delay: number = 0) =>
    spring({
      frame: frame - delay,
      fps,
      config: SPRING_PRESETS.smooth,
    }),

  // 厚重入场（适合楼盘大标题）
  heavyScale: (frame: number, fps: number, delay: number = 0) =>
    spring({
      frame: frame - delay,
      fps,
      config: SPRING_PRESETS.heavy,
    }),

  // 奢华入场（适合价格/核心卖点）
  luxuryScale: (frame: number, fps: number, delay: number = 0) =>
    spring({
      frame: frame - delay,
      fps,
      config: SPRING_PRESETS.luxury,
    }),
};

// 装饰动画
export const decorativeAnimations = {
  // 线条宽度展开
  lineExpand: (frame: number, duration: number, maxWidth: number) =>
    interpolate(frame, [0, duration], [0, maxWidth], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: EASING_PRESETS.easeOutExpo,
    }),

  // 金光扫过效果
  goldSweep: (frame: number, duration: number, width: number) => {
    const progress = interpolate(frame, [0, duration], [-0.2, 1.2], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return progress * width;
  },

  // 呼吸效果（用于装饰元素）
  breathe: (frame: number, fps: number) => {
    const cycle = (frame / fps) % 3; // 3秒一个周期（更慢更优雅）
    return interpolate(cycle, [0, 1.5, 3], [1, 1.03, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  },

  // 数字滚动缓动（适合价格展示）
  numberEase: (frame: number, from: number, to: number, duration: number) => {
    const progress = interpolate(frame, [0, duration], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    });
    return from + (to - from) * progress;
  },
};
