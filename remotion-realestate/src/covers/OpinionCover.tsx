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
        <div style={{ padding: '50px 60px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ width: 10, height: 42, background: color, borderRadius: 5 }} />
            <SeriesBadge series={series} episodeNumber={episodeNumber} />
          </div>
          <h1 style={{ fontFamily: FONTS.display, fontSize: 130, color: '#FFFFFF', lineHeight: 1.02, fontWeight: 900, margin: 0, textShadow: SHADOW, letterSpacing: '-0.04em' }}>
            {(() => {
              const lines = title.split('\n');
              const lastIdx = lines.length - 1;
              return lines.map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  <span style={{ color: i === lastIdx ? color : '#FFFFFF' }}>{line}</span>
                </React.Fragment>
              ));
            })()}
          </h1>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
            <div style={{ maxWidth: '78%' }}>
              <div style={{ width: '100%', height: 5, background: `linear-gradient(90deg, transparent, ${color})`, marginBottom: 24 }} />
              {/* Hook divider with glow dot */}
              <div
                style={{
                  position: 'relative',
                  width: '55%',
                  height: 3,
                  background: `linear-gradient(90deg, transparent, ${color}55)`,
                  marginBottom: 24,
                  marginLeft: 'auto',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 18px ${color}99, 0 0 36px ${color}44`,
                  }}
                />
              </div>
              <p style={{ fontSize: 60, color, fontWeight: 900, lineHeight: 1.2, margin: 0, textAlign: 'right', textShadow: SHADOW }}>{hook}</p>
            </div>
          </div>
        </div>
        <div style={{ height: 5, background: `linear-gradient(90deg, ${color}, transparent)` }} />
        <BrandBar />
      </div>
    </AbsoluteFill>
  );
};
