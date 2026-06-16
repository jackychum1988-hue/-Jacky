// remotion-realestate/src/covers/WarningCover.tsx
// 避坑指南 — 砸脸警告列表 / 高对比撞色 / 左对齐留白

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS, SIZES } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
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
        overflow: 'hidden',
      }}
    >
      {/* 右上角几何装饰 */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          right: -60,
          width: 420,
          height: 420,
          borderRadius: '50%',
          border: `1px solid ${color}30`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '14%',
          right: 10,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}20 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 左上角色块 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: '120px 120px 0 0',
          borderColor: `${color}15 transparent transparent transparent`,
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
            避坑必读
          </span>
        </div>

        {/* 警告标题 — 砸脸大字 */}
        <h1
          style={{
            fontFamily: FONTS.display,
            fontSize: 68,
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

        {/* 编号清单 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: SIZES.spacing.sm,
            marginTop: SIZES.spacing.xl,
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: SIZES.spacing.md,
                padding: `${SIZES.spacing.sm}px 0`,
              }}
            >
              {/* 圆形编号 */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: `2px solid ${color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ color, fontSize: SIZES.caption, fontWeight: 700 }}>
                  {i + 1}
                </span>
              </div>
              <span style={{ fontSize: 26, color: COLORS.text, fontWeight: 600 }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      <BrandBar />
    </AbsoluteFill>
  );
};
