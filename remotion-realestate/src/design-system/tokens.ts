// 设计系统 - 房产视频专用设计 Tokens
// 暖色调 + 大地色，适合香港/大湾区房产内容

export const COLORS = {
  // 主色调 - 奢华金
  primary: '#C8A052',
  primaryDark: '#9B7B3A',
  primaryLight: '#E0C878',

  // 背景色 - 暖黑而非纯黑
  background: '#1A1815',
  backgroundElevated: '#2C2822',
  backgroundSecondary: '#3D3830',

  // 文字色 - 暖白
  text: '#F5F0E8',
  textSecondary: '#B5A898',
  textTertiary: '#7A7065',

  // 系统色 - 大地暖色系
  success: '#7B9B6A',
  warning: '#D4875E',
  error: '#C4554D',
  info: '#6B9EB3',

  // 大地色扩展色板（保持与原色名兼容）
  extended: {
    // 原色名（组件引用）
    orange: '#D4875E',
    yellow: '#D4983C',
    green: '#7B9B6A',
    teal: '#6B9EB3',
    cyan: '#6B9EB3',
    blue: '#6B8FA3',
    indigo: '#5B6E8A',
    purple: '#8B7E9B',
    pink: '#C47A6A',
    red: '#C4554D',
    // 大地色名（推荐使用）
    terracotta: '#D4875E',
    clay: '#C67B5C',
    sand: '#D4C5A9',
    olive: '#8A9A6B',
    gold: '#C8A052',
    bronze: '#A8885A',
    copper: '#B8744A',
    rose: '#C47A6A',
    sage: '#9BAF8A',
    forest: '#6B8B6A',
    dusk: '#8B7E9B',
    ocean: '#6B8FA3',
    pearl: '#E8DFD2',
    mahogany: '#8B5E3C',
    amber: '#D4983C',
    moss: '#7A8B62',
  },

  // 渐变
  gradient: {
    // 暖金渐变 (主渐变)
    primary: ['#C8A052', '#D4875E'],
    // 日落渐变 (适合开场/结尾)
    sunset: ['#D4875E', '#C4554D'],
    // 大地渐变 (适合自然/园林)
    earth: ['#8A9A6B', '#6B8B6A'],
    // 光晕渐变
    glow: ['rgba(200, 160, 82, 0.25)', 'rgba(200, 160, 82, 0)'],
    // 奢华金渐变
    luxury: ['#C8A052', '#E0C878', '#C8A052'],
  },
};

export const FONTS = {
  // 标题字体 - 衬线体传递奢华感
  display: 'Georgia, "Noto Serif SC", "STSong", "SimSun", serif',
  // 正文字体 - 无衬线保证清晰度
  text: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif',
  // 数字/价格字体 - 等宽
  mono: '"SF Mono", "Fira Code", "JetBrains Mono", Monaco, Consolas, monospace',
};

export const SIZES = {
  // 标题字号 - 视频大屏冲击力
  hero: 120,
  h1: 88,
  h2: 56,
  h3: 40,
  h4: 28,
  body: 20,
  caption: 16,
  small: 14,

  // 间距
  spacing: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
    xxl: 64,
    xxxl: 96,
  },

  // 圆角 - 房产风格偏圆润
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },
};

// 动画时长（帧数，基于 30fps）
export const DURATIONS = {
  fast: 10,
  normal: 20,
  slow: 30,
  slower: 45,
  slowest: 60,
};

// 延迟（用于列表项错开动画）
export const STAGGER = {
  fast: 5,
  normal: 8,
  slow: 12,
};
