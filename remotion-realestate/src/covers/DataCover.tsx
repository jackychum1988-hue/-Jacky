// remotion-realestate/src/covers/DataCover.tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONTS } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { DataCoverProps } from './types';
const SHADOW = '0 8px 36px rgba(0,0,0,0.95)';

export const DataCover: React.FC<DataCoverProps> = ({ series, episodeNumber, title, leftLabel, leftValue, leftSub, rightLabel, rightValue, rightSub, insight }) => {
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
          <h1 style={{ fontFamily: FONTS.display, fontSize: 120, color: '#FFFFFF', lineHeight: 1.04, fontWeight: 800, margin: 0, textShadow: SHADOW, letterSpacing: '-0.03em' }}>
            {title.split('\n').map((line, i) => (<React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>))}
          </h1>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
        <div style={{ padding: '0 60px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ width: '100%', height: 5, background: `linear-gradient(90deg, transparent, ${color})`, marginBottom: 28 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 28, justifyContent: 'flex-end', marginBottom: 22 }}>
                <div>
                  <div style={{ fontSize: 28, color: '#FFFFFF80', marginBottom: 6, textShadow: SHADOW }}>{leftLabel}</div>
                  <div style={{ fontFamily: FONTS.display, fontSize: 76, color: '#FF4444', fontWeight: 700, textShadow: SHADOW }}>{leftValue}</div>
                  {leftSub && <div style={{ fontSize: 26, color: '#FFFFFF60', textShadow: SHADOW }}>{leftSub}</div>}
                </div>
                <div style={{ fontFamily: FONTS.display, fontSize: 52, color, fontWeight: 800, textShadow: SHADOW }}>VS</div>
                <div>
                  <div style={{ fontSize: 28, color: '#FFFFFF80', marginBottom: 6, textShadow: SHADOW }}>{rightLabel}</div>
                  <div style={{ fontFamily: FONTS.display, fontSize: 76, color, fontWeight: 700, textShadow: SHADOW }}>{rightValue}</div>
                  {rightSub && <div style={{ fontSize: 26, color: '#FFFFFF60', textShadow: SHADOW }}>{rightSub}</div>}
                </div>
              </div>
              <div style={{ fontSize: 44, color: '#FFFFFF', fontWeight: 600, textShadow: SHADOW }}>{insight}</div>
            </div>
          </div>
        </div>
        <div style={{ height: 5, background: `linear-gradient(90deg, ${color}, transparent)` }} />
        <BrandBar />
      </div>
    </AbsoluteFill>
  );
};
