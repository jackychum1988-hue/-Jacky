// remotion-realestate/src/covers/WarningCover.tsx
// 避坑指南 — 透明底 + 编号列表 / 叠加视频不挡人物

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS, SIZES } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { WarningCoverProps } from './types';

const SHADOW = '0 2px 16px rgba(0,0,0,0.9)';
const SHADOW_LIGHT = '0 2px 10px rgba(0,0,0,0.75)';

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
        backgroundColor: 'transparent',
        fontFamily: FONTS.text,
        overflow: 'hidden',
      }}
    >
      {/* 右上角光环 */}
      <div
        style={{
          position: 'absolute',
          top: '4%',
          right: '3%',
          width: 340,
          height: 340,
          borderRadius: '50%',
          border: `1px solid ${color}35`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '8%',
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}25 0%, transparent 60%)`,
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
          borderWidth: '100px 100px 0 0',
          borderColor: `${color}20 transparent transparent transparent`,
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
          height: 3,
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
          <span style={{ color, fontSize: SIZES.caption, fontWeight: 700, letterSpacing: '0.1em', textShadow: SHADOW_LIGHT }}>
            避坑必读
          </span>
        </div>

        {/* 警告标题 */}
        <h1
          style={{
            fontFamily: FONTS.display,
            fontSize: 68,
            color: COLORS.text,
            lineHeight: 1.15,
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
              <span style={{ fontSize: 26, color: COLORS.text, fontWeight: 600, textShadow: SHADOW }}>
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
