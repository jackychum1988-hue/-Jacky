// remotion-realestate/src/covers/SundipCover.tsx
// 笋盘速报 — 透明底 + 砸脸大字 / 叠加视频不挡人物

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS, SIZES } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { SundipCoverProps } from './types';

const SHADOW = '0 3px 20px rgba(0,0,0,0.95)';
const SHADOW_LIGHT = '0 2px 14px rgba(0,0,0,0.8)';

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
          width: 400,
          height: 400,
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
            gap: 10,
            marginBottom: SIZES.spacing.xl,
          }}
        >
          <div style={{ width: 32, height: 3, background: color }} />
          <span style={{ color, fontSize: 24, fontWeight: 700, letterSpacing: '0.1em', textShadow: SHADOW_LIGHT }}>
            笋盘推荐
          </span>
        </div>

        {/* 超大数字 */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span
            style={{
              fontFamily: FONTS.display,
              fontSize: 180,
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
              fontSize: 72,
              color: color,
              fontWeight: 700,
              textShadow: SHADOW_LIGHT,
            }}
          >
            {highlightUnit}
          </span>
        </div>

        {/* 价格描述 */}
        <div style={{ fontSize: 36, color, marginTop: SIZES.spacing.sm, fontWeight: 600, textShadow: SHADOW_LIGHT }}>
          {highlightLabel}
        </div>

        {/* 楼盘名 */}
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 56,
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
              gap: SIZES.spacing.md,
              marginTop: SIZES.spacing.xl,
              flexWrap: 'wrap',
            }}
          >
            {tags.map((tag, i) => (
              <span
                key={i}
                style={{
                  padding: `${SIZES.spacing.sm}px ${SIZES.spacing.lg}px`,
                  border: `2px solid ${COLORS.primary}60`,
                  borderRadius: SIZES.radius.xl,
                  color: COLORS.primary,
                  fontSize: 22,
                  fontFamily: FONTS.text,
                  fontWeight: 600,
                  textShadow: SHADOW_LIGHT,
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
