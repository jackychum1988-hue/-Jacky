// remotion-realestate/src/covers/OpinionCover.tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONTS } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { OpinionCoverProps } from './types';
const SHADOW = '0 8px 36px rgba(0,0,0,0.95)';

export const OpinionCover: React.FC<OpinionCoverProps> = ({ series, episodeNumber, title, hook }) => {
  const color = SERIES_COLORS[series];
  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', fontFamily: FONTS.text }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
        <div style={{ height: 6, background: color }} />
        <div style={{ padding: '50px 60px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ width: 10, height: 42, background: color, borderRadius: 5 }} />
            <SeriesBadge series={series} episodeNumber={episodeNumber} />
          </div>
          <h1 style={{ fontFamily: FONTS.display, fontSize: 130, color: '#FFFFFF', lineHeight: 1.04, fontWeight: 800, margin: 0, textShadow: SHADOW, letterSpacing: '-0.03em' }}>
            {title.split('\n').map((line, i) => (<React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>))}
          </h1>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
        <div style={{ padding: '0 60px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
            <div style={{ maxWidth: '78%' }}>
              <div style={{ width: '100%', height: 5, background: `linear-gradient(90deg, transparent, ${color})`, marginBottom: 24 }} />
              <p style={{ fontSize: 56, color: '#FFFFFF', fontWeight: 700, lineHeight: 1.2, margin: 0, textAlign: 'right', textShadow: SHADOW }}>{hook}</p>
            </div>
          </div>
        </div>
        <div style={{ height: 5, background: `linear-gradient(90deg, ${color}, transparent)` }} />
        <BrandBar />
      </div>
    </AbsoluteFill>
  );
};
