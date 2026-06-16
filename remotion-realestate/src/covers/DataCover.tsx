// remotion-realestate/src/covers/DataCover.tsx
// 数据拆解 — 砸脸对比卡 / 高对比撞色排版

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS, SIZES } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { DataCoverProps } from './types';

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
        backgroundColor: COLORS.background,
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
          width: 300,
          height: 300,
          background: `radial-gradient(circle at 100% 0%, ${color}30 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 左边缘色条 */}
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
            gap: 8,
            marginBottom: SIZES.spacing.lg,
          }}
        >
          <div style={{ width: 24, height: 2, background: color }} />
          <span style={{ color, fontSize: SIZES.caption, fontWeight: 700, letterSpacing: '0.1em' }}>
            数据对比
          </span>
        </div>

        {/* 标题 */}
        <h1
          style={{
            fontFamily: FONTS.display,
            fontSize: 64,
            color: COLORS.text,
            lineHeight: 1.15,
            fontWeight: 700,
            margin: 0,
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
            gap: SIZES.spacing.md,
            marginTop: SIZES.spacing.xl,
          }}
        >
          {/* 左侧卡片 */}
          <div
            style={{
              flex: 1,
              background: COLORS.backgroundElevated,
              borderRadius: SIZES.radius.lg,
              padding: `${SIZES.spacing.md}px ${SIZES.spacing.lg}px`,
              borderLeft: `4px solid ${COLORS.error}`,
            }}
          >
            <div style={{ fontSize: SIZES.caption, color: COLORS.textTertiary, marginBottom: 4 }}>
              {leftLabel}
            </div>
            <div style={{ fontFamily: FONTS.display, fontSize: 44, color: COLORS.text, fontWeight: 700 }}>
              {leftValue}
            </div>
            {leftSub && (
              <div style={{ fontSize: SIZES.caption, color: COLORS.textTertiary, marginTop: 2 }}>
                {leftSub}
              </div>
            )}
          </div>

          {/* VS 标签 */}
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: SIZES.h4,
              color,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            VS
          </div>

          {/* 右侧卡片 */}
          <div
            style={{
              flex: 1,
              background: COLORS.backgroundElevated,
              borderRadius: SIZES.radius.lg,
              padding: `${SIZES.spacing.md}px ${SIZES.spacing.lg}px`,
              borderLeft: `4px solid ${color}`,
            }}
          >
            <div style={{ fontSize: SIZES.caption, color: COLORS.textTertiary, marginBottom: 4 }}>
              {rightLabel}
            </div>
            <div style={{ fontFamily: FONTS.display, fontSize: 44, color: COLORS.text, fontWeight: 700 }}>
              {rightValue}
            </div>
            {rightSub && (
              <div style={{ fontSize: SIZES.caption, color: COLORS.textTertiary, marginTop: 2 }}>
                {rightSub}
              </div>
            )}
          </div>
        </div>

        {/* 底部洞察 */}
        <div
          style={{
            marginTop: SIZES.spacing.lg,
            padding: `${SIZES.spacing.sm}px 0`,
            display: 'flex',
            alignItems: 'center',
            gap: SIZES.spacing.sm,
          }}
        >
          <div style={{ width: 4, height: 24, background: COLORS.primary, borderRadius: 2, flexShrink: 0 }} />
          <span style={{ fontSize: SIZES.body, color: COLORS.text, fontWeight: 600 }}>
            {insight}
          </span>
        </div>
      </div>

      <BrandBar />
    </AbsoluteFill>
  );
};
