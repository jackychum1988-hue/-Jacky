// remotion-realestate/src/covers/OpinionCover.tsx
// Jacky观点 — 人物+金句布局，适用于口播观点封面

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS } from '../design-system/tokens';
import { SeriesBadge, GoldLine, BrandBar, CoverGradient, SERIES_COLORS } from './shared';
import type { OpinionCoverProps } from './types';

export const OpinionCover: React.FC<OpinionCoverProps> = ({
  series,
  episodeNumber,
  title,
  hook,
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

      {/* ❷ 人物头像占位 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 40,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            backgroundColor: COLORS.backgroundElevated,
            border: `3px solid ${color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* 头像占位 — 实际使用时替换为 Jacky 照片 */}
          <span
            style={{
              fontSize: 28,
              color: color,
              fontFamily: FONTS.display,
              fontWeight: 700,
            }}
          >
            Jacky
          </span>
        </div>
      </div>

      {/* ❸ 观点标题区 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 64px',
        }}
      >
        <h1
          style={{
            fontFamily: FONTS.display,
            fontSize: 48,
            color: COLORS.text,
            textAlign: 'center',
            lineHeight: 1.3,
            fontWeight: 700,
            margin: 0,
          }}
        >
          {title}
        </h1>
        <GoldLine />
        <p
          style={{
            fontSize: 22,
            color: COLORS.textSecondary,
            textAlign: 'center',
            margin: 0,
          }}
        >
          {hook}
        </p>
      </div>

      {/* ❹ 品牌条 */}
      <BrandBar />
    </AbsoluteFill>
  );
};
