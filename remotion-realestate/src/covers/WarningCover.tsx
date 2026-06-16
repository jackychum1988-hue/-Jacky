// remotion-realestate/src/covers/WarningCover.tsx
// 避坑指南 — 顶部警告 + 底部清单 / 中间透明 / 电光粉

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONTS } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { WarningCoverProps } from './types';

const SHADOW = '0 6px 30px rgba(0,0,0,0.95)';

export const WarningCover: React.FC<WarningCoverProps> = ({
  series, episodeNumber, title, items,
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
            fontFamily: FONTS.display, fontSize: 104, color: '#FFFFFF', lineHeight: 1.05,
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
            <div>
              <div style={{ width: '100%', height: 4, background: `linear-gradient(90deg, transparent, ${color})`, marginBottom: 24 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-end' }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, flexDirection: 'row-reverse' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 10, background: color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span style={{ color: '#FFFFFF', fontSize: 26, fontWeight: 800 }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: 40, color: '#FFFFFF', fontWeight: 700, textShadow: SHADOW }}>
                      {item}
                    </span>
                  </div>
                ))}
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
