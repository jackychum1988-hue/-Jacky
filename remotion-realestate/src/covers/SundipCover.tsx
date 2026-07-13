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
      {/* ====== CENTER AMBIENT GLOW ====== */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse 50% 30% at 50% 55%, ${color}0d 0%, transparent 65%)`,
          zIndex: 0,
          pointerEvents: 'none' as const,
        }}
      />

      {/* ====== MIDDLE CONNECTOR: subtle left spine ====== */}
      <div
        style={{
          position: 'absolute',
          top: '34%',
          bottom: '30%',
          left: 60,
          width: 2,
          background: `linear-gradient(180deg, ${color}00 0%, ${color}1a 25%, ${color}1a 75%, ${color}00 100%)`,
          zIndex: 0,
          pointerEvents: 'none' as const,
        }}
      />

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
        <div style={{ height: 6, background: color }} />
        <div style={{ padding: '44px 60px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ width: 10, height: 42, background: color, borderRadius: 5 }} />
            <SeriesBadge series={series} episodeNumber={episodeNumber} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <span style={{ fontFamily: FONTS.display, fontSize: 260, color: '#FFFFFF', fontWeight: 900, lineHeight: 0.92, textShadow: SHADOW }}>{highlightNumber}</span>
            <span style={{ fontFamily: FONTS.display, fontSize: 100, color, fontWeight: 900, textShadow: SHADOW }}>{highlightUnit}</span>
          </div>
          <div style={{ fontSize: 72, color: '#FFFFFF', fontWeight: 900, marginTop: 8, textShadow: SHADOW, letterSpacing: '-0.04em' }}>{propertyName}</div>
        </div>
        {/* Top zone fade-out */}
        <div style={{
          height: 48,
          marginTop: 36,
          background: `linear-gradient(180deg, transparent 0%, ${color}0d 100%)`,
          pointerEvents: 'none' as const,
        }} />
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
        {/* Bottom zone fade-in — mirror of top fade-out */}
        <div style={{
          height: 48,
          marginBottom: 12,
          background: `linear-gradient(180deg, transparent 0%, ${color}0d 100%)`,
          pointerEvents: 'none' as const,
        }} />
        <div style={{ padding: '0 60px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ width: '100%', height: 5, background: `linear-gradient(90deg, transparent, ${color})`, marginBottom: 24 }} />
              <div style={{ fontSize: 56, color, fontWeight: 900, textShadow: SHADOW, letterSpacing: '-0.04em', marginBottom: 20 }}>{highlightLabel}</div>
              {tags.length > 0 && (
                <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {tags.map((tag, i) => (
                    <span key={i} style={{ padding: '14px 32px', border: '3px solid #FFFFFF50', borderRadius: 30, color: '#FFFFFF', fontSize: 38, fontWeight: 900, textShadow: SHADOW }}>{tag}</span>
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
