// remotion-realestate/src/covers/OpinionCover.tsx
// Jacky观点 — 顶部标题 + 底部钩子 / 中间透明 / 荧光绿

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONTS } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { OpinionCoverProps } from './types';

const SHADOW = '0 6px 30px rgba(0,0,0,0.95)';

export const OpinionCover: React.FC<OpinionCoverProps> = ({
  series,
  episodeNumber,
  title,
  hook,
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
            fontFamily: FONTS.display, fontSize: 110, color: '#FFFFFF', lineHeight: 1.05,
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            <div style={{ maxWidth: '75%' }}>
              <div style={{ width: '100%', height: 4, background: `linear-gradient(90deg, transparent, ${color})`, marginBottom: 20 }} />
              <p style={{
                fontSize: 48, color: '#FFFFFF', fontWeight: 700, lineHeight: 1.25,
                margin: 0, textAlign: 'right', textShadow: SHADOW,
              }}>
                {hook}
              </p>
            </div>
          </div>
        </div>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${color}, transparent)` }} />
        <BrandBar />
      </div>

    </AbsoluteFill>
  );
};
