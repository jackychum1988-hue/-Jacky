// remotion-realestate/src/covers/DataCover.tsx
// 数据拆解 — 透明底 + 砸脸对比卡 / 叠加视频不挡人物

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS, SIZES } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { DataCoverProps } from './types';

const SHADOW = '0 3px 20px rgba(0,0,0,0.95)';
const SHADOW_LIGHT = '0 2px 14px rgba(0,0,0,0.8)';
const CARD_BG = 'rgba(26, 24, 21, 0.55)';

export const DataCover: React.FC<DataCoverProps> = ({
  series,
  episodeNumber,
  title,
  leftLabel,
  leftValue,
  leftSub,
  rightLabel,
  rightValue,
  rightSub,
  insight,
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
      {/* 右上角色块 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 340,
          height: 340,
          background: `radial-gradient(circle at 100% 0%, ${color}35 0%, transparent 70%)`,
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
          height: '25%',
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
            marginBottom: SIZES.spacing.lg,
          }}
        >
          <div style={{ width: 32, height: 3, background: color }} />
          <span style={{ color, fontSize: 24, fontWeight: 700, letterSpacing: '0.1em', textShadow: SHADOW_LIGHT }}>
            数据对比
          </span>
        </div>

        {/* 标题 */}
        <h1
          style={{
            fontFamily: FONTS.display,
            fontSize: 80,
            color: COLORS.text,
            lineHeight: 1.12,
            fontWeight: 700,
            margin: 0,
            textShadow: SHADOW,
          }}
        >
          {title.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </h1>

        {/* VS 对比区 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SIZES.spacing.lg,
            marginTop: SIZES.spacing.xl,
          }}
        >
          {/* 左侧卡片 */}
          <div
            style={{
              flex: 1,
              background: CARD_BG,
              borderRadius: SIZES.radius.lg,
              padding: `${SIZES.spacing.lg}px ${SIZES.spacing.xl}px`,
              borderLeft: `5px solid ${COLORS.error}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ fontSize: 22, color: COLORS.textTertiary, marginBottom: 6, textShadow: SHADOW_LIGHT }}>
              {leftLabel}
            </div>
            <div style={{ fontFamily: FONTS.display, fontSize: 56, color: COLORS.text, fontWeight: 700, textShadow: SHADOW }}>
              {leftValue}
            </div>
            {leftSub && (
              <div style={{ fontSize: 22, color: COLORS.textTertiary, marginTop: 4, textShadow: SHADOW_LIGHT }}>
                {leftSub}
              </div>
            )}
          </div>

          {/* VS 标签 */}
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 44,
              color,
              fontWeight: 700,
              flexShrink: 0,
              textShadow: SHADOW,
            }}
          >
            VS
          </div>

          {/* 右侧卡片 */}
          <div
            style={{
              flex: 1,
              background: CARD_BG,
              borderRadius: SIZES.radius.lg,
              padding: `${SIZES.spacing.lg}px ${SIZES.spacing.xl}px`,
              borderLeft: `5px solid ${color}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ fontSize: 22, color: COLORS.textTertiary, marginBottom: 6, textShadow: SHADOW_LIGHT }}>
              {rightLabel}
            </div>
            <div style={{ fontFamily: FONTS.display, fontSize: 56, color: COLORS.text, fontWeight: 700, textShadow: SHADOW }}>
              {rightValue}
            </div>
            {rightSub && (
              <div style={{ fontSize: 22, color: COLORS.textTertiary, marginTop: 4, textShadow: SHADOW_LIGHT }}>
                {rightSub}
              </div>
            )}
          </div>
        </div>

        {/* 底部洞察 */}
        <div
          style={{
            marginTop: SIZES.spacing.xl,
            padding: `${SIZES.spacing.sm}px 0`,
            display: 'flex',
            alignItems: 'center',
            gap: SIZES.spacing.md,
          }}
        >
          <div style={{ width: 5, height: 32, background: COLORS.primary, borderRadius: 2, flexShrink: 0 }} />
          <span style={{ fontSize: 32, color: COLORS.text, fontWeight: 600, textShadow: SHADOW }}>
            {insight}
          </span>
        </div>
      </div>

      <BrandBar />
    </AbsoluteFill>
  );
};
