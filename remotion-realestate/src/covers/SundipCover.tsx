// remotion-realestate/src/covers/SundipCover.tsx
// 笋盘速报 — 数字炸弹布局，适用于楼盘讲解封面

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS, SIZES } from '../design-system/tokens';
import { SeriesBadge, GoldLine, BrandBar, CoverGradient, SERIES_COLORS } from './shared';
import type { SundipCoverProps } from './types';

export const SundipCover: React.FC<SundipCoverProps> = ({
  series,
  episodeNumber,
  highlightNumber,
  highlightUnit = '万',
  highlightLabel,
  propertyName,
  tags,
}) => {
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

      {/* ❷ 核心数字区 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: `0 ${SIZES.spacing.xl}px`,
        }}
      >
        {/* 大数字 */}
        <div style={{ textAlign: 'center', lineHeight: 1 }}>
          <span
            style={{
              fontFamily: FONTS.display,
              fontSize: SIZES.hero,
              color: COLORS.text,
              fontWeight: 700,
            }}
          >
            {highlightNumber}
          </span>
          <span
            style={{
              fontFamily: FONTS.display,
              fontSize: 44,
              color: COLORS.text,
              marginLeft: 4,
            }}
          >
            {highlightUnit}
          </span>
        </div>

        {/* 短描述 */}
        <div
          style={{
            fontSize: 24,
            color: SERIES_COLORS[series],
            marginTop: SIZES.spacing.xs,
          }}
        >
          {highlightLabel}
        </div>

        <GoldLine />

        {/* 楼盘名 */}
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 36,
            color: COLORS.text,
            textAlign: 'center',
            fontWeight: 700,
          }}
        >
          {propertyName}
        </div>
      </div>

      {/* ❸ 卖点标签 */}
      {tags.length > 0 && (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 10,
          padding: '0 48px 16px',
          flexWrap: 'wrap',
        }}
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            style={{
              backgroundColor: COLORS.backgroundElevated,
              color: COLORS.textSecondary,
              padding: '6px 18px',
              borderRadius: SIZES.radius.sm,
              fontSize: 18,
              fontFamily: FONTS.text,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
      )}

      {/* ❹ 品牌条 */}
      <BrandBar />
    </AbsoluteFill>
  );
};
