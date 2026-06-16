// remotion-realestate/src/covers/DataCover.tsx
// 数据拆解 — 顶部标题 + 底部对比 / 中间透明 / 霓虹青

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONTS } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { DataCoverProps } from './types';

const SHADOW = '0 6px 30px rgba(0,0,0,0.95)';

export const DataCover: React.FC<DataCoverProps> = ({
  series, episodeNumber, title, leftLabel, leftValue, leftSub,
  rightLabel, rightValue, rightSub, insight,
}) => {
  const color = SERIES_COLORS[series];

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', fontFamily: FONTS.text }}>

      {/* ====== 顶部 ====== */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
        <div style={{ height: 5, background: color }} />
        <div style={{ padding: '40px 60px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <div style={{ width: 8, height: 36, background: color, borderRadius: 4 }} />
            <SeriesBadge series={series} episodeNumber={episodeNumber} />
          </div>
          <h1 style={{
            fontFamily: FONTS.display, fontSize: 100, color: '#FFFFFF', lineHeight: 1.05,
            fontWeight: 800, margin: 0, textShadow: SHADOW, letterSpacing: '-0.02em',
          }}>
            {title.split('\n').map((line, i) => (
              <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>
            ))}
          </h1>
        </div>
      </div>

      {/* ====== 底部 ====== */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
        <div style={{ padding: '0 60px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ width: '100%', height: 4, background: `linear-gradient(90deg, transparent, ${color})`, marginBottom: 24 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'flex-end', marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 24, color: '#FFFFFF80', marginBottom: 4, textShadow: SHADOW }}>{leftLabel}</div>
                  <div style={{ fontFamily: FONTS.display, fontSize: 64, color: '#FF4444', fontWeight: 700, textShadow: SHADOW }}>{leftValue}</div>
                  {leftSub && <div style={{ fontSize: 22, color: '#FFFFFF60', textShadow: SHADOW }}>{leftSub}</div>}
                </div>
                <div style={{ fontFamily: FONTS.display, fontSize: 44, color, fontWeight: 800, textShadow: SHADOW }}>VS</div>
                <div>
                  <div style={{ fontSize: 24, color: '#FFFFFF80', marginBottom: 4, textShadow: SHADOW }}>{rightLabel}</div>
                  <div style={{ fontFamily: FONTS.display, fontSize: 64, color, fontWeight: 700, textShadow: SHADOW }}>{rightValue}</div>
                  {rightSub && <div style={{ fontSize: 22, color: '#FFFFFF60', textShadow: SHADOW }}>{rightSub}</div>}
                </div>
              </div>
              <div style={{ fontSize: 36, color: '#FFFFFF', fontWeight: 600, textShadow: SHADOW }}>
                {insight}
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${color}, transparent)` }} />
        <BrandBar />
      </div>

    </AbsoluteFill>
  );
};
