// remotion-realestate/src/covers/shared.tsx
// 四系列共享子组件 — SeriesBadge, BrandBar, GoldLine, CoverGradient

import React from 'react';
import { COLORS, FONTS } from '../design-system/tokens';
import { SeriesType, SERIES_LABELS, SERIES_COLORS } from './types';

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
        padding: '24px 32px 0 32px',
      }}
    >
      <div
        style={{
          backgroundColor: color,
          color: series === 'warning' ? COLORS.text : COLORS.background,
          padding: '6px 16px',
          borderRadius: 20,
          fontSize: 18,
          fontFamily: FONTS.text,
          fontWeight: 700,
        }}
      >
        {SERIES_LABELS[series]}
      </div>
      <div
        style={{
          color: color,
          fontSize: 16,
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
      margin: '16px auto',
    }}
  />
);

// ====== BrandBar — 底部品牌条 ======

export const BrandBar: React.FC = () => (
  <div
    style={{
      borderTop: `1px solid ${COLORS.backgroundElevated}`,
      paddingTop: 12,
      paddingBottom: 24,
      textAlign: 'center' as const,
    }}
  >
    <span
      style={{
        fontSize: 14,
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
