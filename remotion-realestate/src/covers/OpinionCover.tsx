// remotion-realestate/src/covers/OpinionCover.tsx
// Jacky观点 — 顶部标题 + 底部钩子 / 中间透明 / 霓虹绿

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONTS } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { OpinionCoverProps } from './types';

const SHADOW = '0 4px 24px rgba(0,0,0,0.95)';

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
      }}
    >
      {/* ====== 顶部区域 ====== */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
        {/* 顶部色条 */}
        <div style={{ height: 4, background: color, marginBottom: 0 }} />

        <div style={{ padding: '32px 64px 0' }}>
          {/* 系列标签 + 装饰线 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 6, height: 28, background: color, borderRadius: 3 }} />
            <SeriesBadge series={series} episodeNumber={episodeNumber} />
          </div>

          {/* 砸脸标题 — 左对齐 */}
          <h1
            style={{
              fontFamily: FONTS.display,
              fontSize: 90,
              color: '#FFFFFF',
              lineHeight: 1.08,
              fontWeight: 800,
              margin: 0,
              textShadow: SHADOW,
              letterSpacing: '-0.02em',
            }}
          >
            {title.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </h1>
        </div>
      </div>

      {/* ====== 底部区域 ====== */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
        <div style={{ padding: '0 64px 0' }}>
          {/* 钩子文字 — 右对齐 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <div style={{ maxWidth: '70%' }}>
              <div
                style={{
                  width: '100%',
                  height: 3,
                  background: `linear-gradient(90deg, transparent, ${color})`,
                  marginBottom: 16,
                }}
              />
              <p
                style={{
                  fontSize: 38,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  lineHeight: 1.3,
                  margin: 0,
                  textAlign: 'right',
                  textShadow: SHADOW,
                }}
              >
                {hook}
              </p>
            </div>
          </div>
        </div>

        {/* 底部分隔色条 */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, transparent)` }} />
        <BrandBar />
      </div>
    </AbsoluteFill>
  );
};
