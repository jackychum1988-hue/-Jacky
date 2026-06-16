// remotion-realestate/src/covers/OpinionCover.tsx
// Jacky观点 — 透明底 + 砸脸大字 / 叠加视频不挡人物

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS, SIZES } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { OpinionCoverProps } from './types';

const SHADOW = '0 3px 20px rgba(0,0,0,0.95)';
const SHADOW_LIGHT = '0 2px 14px rgba(0,0,0,0.8)';

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
        backgroundColor: 'transparent',
        fontFamily: FONTS.text,
        overflow: 'hidden',
      }}
    >
      {/* 右上角大光环 */}
      <div
        style={{
          position: 'absolute',
          top: '4%',
          right: '3%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}35 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 左边缘色条 */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: 0,
          width: 8,
          height: '30%',
          background: color,
          pointerEvents: 'none',
        }}
      />

      {/* 底部渐变色带 */}
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
            gap: 10,
            marginBottom: SIZES.spacing.xl,
          }}
        >
          <div style={{ width: 32, height: 3, background: color }} />
          <span style={{ color, fontSize: 24, fontWeight: 700, letterSpacing: '0.1em', textShadow: SHADOW_LIGHT }}>
            港人置业必看
          </span>
        </div>

        {/* 主标题 — 砸脸大字 */}
        <h1
          style={{
            fontFamily: FONTS.display,
            fontSize: 88,
            color: COLORS.text,
            lineHeight: 1.1,
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.01em',
            maxWidth: '92%',
            textShadow: SHADOW,
          }}
        >
          {title.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              <span style={{ display: 'block' }}>
                {line}
              </span>
            </React.Fragment>
          ))}
        </h1>

        {/* 分隔区 */}
        <div style={{ height: SIZES.spacing.xl }} />

        {/* 钩子文案 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: SIZES.spacing.md }}>
          <div
            style={{
              width: 5,
              height: 60,
              background: COLORS.primary,
              borderRadius: 2,
              flexShrink: 0,
              marginTop: 4,
            }}
          />
          <p
            style={{
              fontSize: 36,
              color: COLORS.text,
              fontWeight: 600,
              lineHeight: 1.35,
              margin: 0,
              maxWidth: '82%',
              textShadow: SHADOW,
            }}
          >
            {hook}
          </p>
        </div>
      </div>

      <BrandBar />
    </AbsoluteFill>
  );
};
