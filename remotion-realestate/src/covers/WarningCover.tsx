// remotion-realestate/src/covers/WarningCover.tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONTS } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { WarningCoverProps } from './types';
const SHADOW = '0 8px 36px rgba(0,0,0,0.95)';

export const WarningCover: React.FC<WarningCoverProps> = ({ series, episodeNumber, title, items }) => {
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
          <h1 style={{ fontFamily: FONTS.display, fontSize: 124, color: '#FFFFFF', lineHeight: 1.04, fontWeight: 900, margin: 0, textShadow: SHADOW, letterSpacing: '-0.03em' }}>
            {title.split('\n').map((line, i) => (<React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>))}
          </h1>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
        <div style={{ padding: '0 60px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <div>
              <div style={{ width: '100%', height: 5, background: `linear-gradient(90deg, transparent, ${color})`, marginBottom: 28 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-end' }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, flexDirection: 'row-reverse' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#FFFFFF', fontSize: 30, fontWeight: 900 }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: 48, color: '#FFFFFF', fontWeight: 900, textShadow: SHADOW }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: 5, background: `linear-gradient(90deg, ${color}, transparent)` }} />
        <BrandBar />
      </div>
    </AbsoluteFill>
  );
};
