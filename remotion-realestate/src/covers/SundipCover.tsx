// remotion-realestate/src/covers/SundipCover.tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONTS } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { SundipCoverProps } from './types';
const SHADOW = '0 8px 36px rgba(0,0,0,0.95)';

export const SundipCover: React.FC<SundipCoverProps> = ({ series, episodeNumber, highlightNumber, highlightUnit = '万', highlightLabel, propertyName, tags }) => {
  const color = SERIES_COLORS[series];
  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', fontFamily: FONTS.text }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
        <div style={{ height: 6, background: color }} />
        <div style={{ padding: '44px 60px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ width: 10, height: 42, background: color, borderRadius: 5 }} />
            <SeriesBadge series={series} episodeNumber={episodeNumber} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <span style={{ fontFamily: FONTS.display, fontSize: 260, color: '#FFFFFF', fontWeight: 800, lineHeight: 0.92, textShadow: SHADOW }}>{highlightNumber}</span>
            <span style={{ fontFamily: FONTS.display, fontSize: 100, color, fontWeight: 800, textShadow: SHADOW }}>{highlightUnit}</span>
          </div>
          <div style={{ fontSize: 72, color: '#FFFFFF', fontWeight: 700, marginTop: 8, textShadow: SHADOW }}>{propertyName}</div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
        <div style={{ padding: '0 60px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ width: '100%', height: 5, background: `linear-gradient(90deg, transparent, ${color})`, marginBottom: 24 }} />
              <div style={{ fontSize: 52, color, fontWeight: 700, textShadow: SHADOW, marginBottom: 20 }}>{highlightLabel}</div>
              {tags.length > 0 && (
                <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {tags.map((tag, i) => (
                    <span key={i} style={{ padding: '12px 28px', border: '3px solid #FFFFFF50', borderRadius: 30, color: '#FFFFFF', fontSize: 30, fontWeight: 600, textShadow: SHADOW }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ height: 5, background: `linear-gradient(90deg, ${color}, transparent)` }} />
        <BrandBar />
      </div>
    </AbsoluteFill>
  );
};
