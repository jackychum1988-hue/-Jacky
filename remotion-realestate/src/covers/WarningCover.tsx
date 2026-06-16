// remotion-realestate/src/covers/WarningCover.tsx
// 避坑指南 — 警告列表布局，适用于警示教育封面

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS, SIZES } from '../design-system/tokens';
import { SeriesBadge, GoldLine, BrandBar, CoverGradient, SERIES_COLORS } from './shared';
import type { WarningCoverProps } from './types';

export const WarningCover: React.FC<WarningCoverProps> = ({
  series,
  episodeNumber,
  title,
  items,
}) => {
  const color = SERIES_COLORS[series];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: FONTS.text,
      }}
    >
      <CoverGradient series={series} />

      {/* ❶ 系列标签 */}
      <SeriesBadge series={series} episodeNumber={episodeNumber} />

      {/* ❷ 警告标题 */}
      <div
        style={{
          padding: `${SIZES.spacing.xl}px ${SIZES.spacing.xl}px 0`,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: FONTS.display,
            fontSize: SIZES.h2,
            color: COLORS.text,
            lineHeight: 1.3,
            fontWeight: 700,
            margin: 0,
          }}
        >
          {title}
        </h1>
        <GoldLine />
      </div>

      {/* ❸ 清单区 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: SIZES.spacing.sm,
          padding: `0 ${SIZES.spacing.xxxl}px`,
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: SIZES.spacing.sm,
              backgroundColor: COLORS.backgroundElevated,
              borderRadius: SIZES.radius.lg,
              padding: `${SIZES.spacing.md}px ${SIZES.spacing.lg}px`,
            }}
          >
            <span
              style={{
                fontSize: 32, // 32px for ✕ icon — no exact SIZES match (between h4=28 and h3=40)
                color: color,
                fontFamily: FONTS.display,
                fontWeight: 700,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ✕
            </span>
            <span
              style={{
                fontSize: SIZES.h4,
                color: COLORS.text,
                fontFamily: FONTS.text,
              }}
            >
              {item}
            </span>
          </div>
        ))}
      </div>

      {/* ❹ 品牌条 */}
      <BrandBar />
    </AbsoluteFill>
  );
};
