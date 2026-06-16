// remotion-realestate/src/covers/OpinionCover.tsx
// Jacky观点 — 砸脸大字杂志风 / 高对比撞色 / 左对齐留白排版

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS, SIZES } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
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
        overflow: 'hidden',
      }}
    >
      {/* 背景氛围 — 大色块撞色 */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          right: -60,
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 左上角色块装饰 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 8,
          height: '35%',
          background: color,
          pointerEvents: 'none',
        }}
      />

      {/* 底部色块条 */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color}, ${COLORS.primary})`,
          pointerEvents: 'none',
        }}
      />

      {/* 系列标签 */}
      <SeriesBadge series={series} episodeNumber={episodeNumber} />

      {/* 主内容 — 左对齐大字 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: `0 ${SIZES.spacing.xxxl}px 0 80px`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* 顶部小标签 */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: SIZES.spacing.xl,
          }}
        >
          <div style={{ width: 24, height: 2, background: color }} />
          <span style={{ color, fontSize: SIZES.caption, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            港人置业必看
          </span>
        </div>

        {/* 主标题 — 砸脸大字 */}
        <h1
          style={{
            fontFamily: FONTS.display,
            fontSize: 72,
            color: COLORS.text,
            lineHeight: 1.15,
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.01em',
            maxWidth: '90%',
          }}
        >
          {title.split('\n').map((line, i, arr) => (
            <React.Fragment key={i}>
              <span style={{ display: 'block' }}>
                {line}
              </span>
            </React.Fragment>
          ))}
        </h1>

        {/* 分隔区 */}
        <div style={{ height: SIZES.spacing.xl }} />

        {/* 钩子文案 — 高亮色底 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: SIZES.spacing.md }}>
          <div
            style={{
              width: 4,
              height: 48,
              background: COLORS.primary,
              borderRadius: 2,
              flexShrink: 0,
              marginTop: 4,
            }}
          />
          <p
            style={{
              fontSize: 28,
              color: COLORS.text,
              fontWeight: 600,
              lineHeight: 1.4,
              margin: 0,
              maxWidth: '80%',
            }}
          >
            {hook}
          </p>
        </div>
      </div>

      {/* 品牌条 */}
      <BrandBar />
    </AbsoluteFill>
  );
};
