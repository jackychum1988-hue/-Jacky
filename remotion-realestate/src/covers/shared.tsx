// remotion-realestate/src/covers/shared.tsx
// 四系列共享子组件 — SeriesBadge, BrandBar, GoldLine, CoverGradient

import React from 'react';
import { COLORS, FONTS, SIZES } from '../design-system/tokens';
import { SeriesType } from './types';

// ====== 系列名称映射（纯中文，无 emoji） ======

export const SERIES_LABELS: Record<SeriesType, string> = {
  sundip: '笋盘速报',
  data: '数据拆解',
  opinion: 'Jacky观点',
  warning: '避坑指南',
};

// ====== 系列辨识色映射 — 复用 COLORS token ======

export const SERIES_COLORS: Record<SeriesType, string> = {
  sundip: COLORS.warning,
  data: COLORS.info,
  opinion: COLORS.success,
  warning: COLORS.error,
};

// ====== 辅助函数 ======

/** 根据背景色相对亮度选取高对比文字色 */
function getSeriesTextColor(bgColor: string): string {
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? COLORS.background : COLORS.text;
}

// ====== SeriesBadge — 左上角系列标签 ======

export const SeriesBadge: React.FC<{
  series: SeriesType;
  episodeNumber: number;
}> = ({ series, episodeNumber }) => {
  const color = SERIES_COLORS[series];
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: `${SIZES.spacing.md}px ${SIZES.spacing.lg}px 0 ${SIZES.spacing.lg}px`,
      }}
    >
      <div
        style={{
          backgroundColor: color,
          color: getSeriesTextColor(color),
          padding: `${SIZES.spacing.xs}px ${SIZES.spacing.sm}px`,
          borderRadius: SIZES.radius.xl,
          fontSize: SIZES.body,
          fontFamily: FONTS.text,
          fontWeight: 700,
        }}
      >
        {SERIES_LABELS[series]}
      </div>
      <div
        style={{
          color,
          fontSize: SIZES.caption,
          fontFamily: FONTS.text,
        }}
      >
        EP.{episodeNumber}
      </div>
    </div>
  );
};

// ====== GoldLine — 金色分隔线 ======

export const GoldLine: React.FC<{ width?: number }> = ({ width = 60 }) => (
  <div
    style={{
      width,
      height: 2,
      background: `linear-gradient(90deg, transparent, ${COLORS.primary}, transparent)`,
      margin: `${SIZES.spacing.sm}px auto`,
    }}
  />
);

// ====== BrandBar — 底部品牌条 ======

export const BrandBar: React.FC = () => (
  <div
    style={{
      borderTop: `1px solid ${COLORS.backgroundElevated}`,
      paddingTop: SIZES.spacing.sm,
      paddingBottom: SIZES.spacing.md,
      textAlign: 'center' as const,
    }}
  >
    <span
      style={{
        fontSize: SIZES.small,
        fontFamily: FONTS.text,
        color: COLORS.textTertiary,
      }}
    >
      港人中山置業通 · Jacky
    </span>
  </div>
);

// ====== CoverGradient — 系列辨识色背景渐变 ======

export const CoverGradient: React.FC<{ series: SeriesType }> = ({ series }) => {
  const color = SERIES_COLORS[series];
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(160deg, ${color}22 0%, ${COLORS.background} 50%)`,
        pointerEvents: 'none' as const,
      }}
    />
  );
};
