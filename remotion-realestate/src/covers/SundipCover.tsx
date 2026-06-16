// remotion-realestate/src/covers/SundipCover.tsx
// 笋盘速报 — 透明底 + 砸脸大字 / 叠加视频不挡人物

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS, SIZES } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { SundipCoverProps } from './types';

const SHADOW = '0 2px 16px rgba(0,0,0,0.9)';
const SHADOW_LIGHT = '0 2px 10px rgba(0,0,0,0.75)';

export const SundipCover: React.FC<SundipCoverProps> = ({
  series,
  episodeNumber,
  highlightNumber,
  highlightUnit = '万',
  highlightLabel,
  propertyName,
  tags,
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
      {/* 右上角色块装饰 */}
      <div
        style={{
          position: 'absolute',
          top: '6%',
          right: '5%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}40 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 左边缘色条 */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: 0,
          width: 6,
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
          height: 3,
          background: `linear-gradient(90deg, ${color}, ${COLORS.primary})`,
          pointerEvents: 'none',
        }}
      />

      <SeriesBadge series={series} episodeNumber={episodeNumber} />

      {/* 主内容区 */}
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
        {/* 小标签 */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: SIZES.spacing.lg,
          }}
        >
          <div style={{ width: 24, height: 2, background: color }} />
          <span style={{ color, fontSize: SIZES.caption, fontWeight: 700, letterSpacing: '0.1em', textShadow: SHADOW_LIGHT }}>
            笋盘推荐
          </span>
        </div>

        {/* 超大数字 */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span
            style={{
              fontFamily: FONTS.display,
              fontSize: 140,
              color: COLORS.text,
              fontWeight: 700,
              lineHeight: 1,
              textShadow: SHADOW,
            }}
          >
            {highlightNumber}
          </span>
          <span
            style={{
              fontFamily: FONTS.display,
              fontSize: 56,
              color: color,
              fontWeight: 700,
              textShadow: SHADOW_LIGHT,
            }}
          >
            {highlightUnit}
          </span>
        </div>

        {/* 价格描述 */}
        <div style={{ fontSize: 28, color, marginTop: SIZES.spacing.xs, fontWeight: 600, textShadow: SHADOW_LIGHT }}>
          {highlightLabel}
        </div>

        {/* 楼盘名 */}
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 44,
            color: COLORS.text,
            fontWeight: 700,
            marginTop: SIZES.spacing.md,
            textShadow: SHADOW,
          }}
        >
          {propertyName}
        </div>

        {/* 卖点标签 */}
        {tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: SIZES.spacing.sm,
              marginTop: SIZES.spacing.lg,
              flexWrap: 'wrap',
            }}
          >
            {tags.map((tag, i) => (
              <span
                key={i}
                style={{
                  padding: `${SIZES.spacing.xs}px ${SIZES.spacing.md}px`,
                  border: `1px solid ${COLORS.primary}60`,
                  borderRadius: SIZES.radius.xl,
                  color: COLORS.primary,
                  fontSize: SIZES.caption,
                  fontFamily: FONTS.text,
                  textShadow: SHADOW_LIGHT,
                  backdropFilter: 'blur(4px)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <BrandBar />
    </AbsoluteFill>
  );
};
