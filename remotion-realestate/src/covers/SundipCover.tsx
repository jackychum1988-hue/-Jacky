// remotion-realestate/src/covers/SundipCover.tsx
// 笋盘速报 — 顶部价格 + 底部标签 / 中间透明 / 电光橙

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONTS } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { SundipCoverProps } from './types';

const SHADOW = '0 6px 30px rgba(0,0,0,0.95)';

export const SundipCover: React.FC<SundipCoverProps> = ({
  series, episodeNumber, highlightNumber, highlightUnit = '万',
  highlightLabel, propertyName, tags,
}) => {
  const color = SERIES_COLORS[series];

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', fontFamily: FONTS.text }}>

      {/* ====== 顶部 ====== */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
        <div style={{ height: 5, background: color }} />
        <div style={{ padding: '36px 60px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ width: 8, height: 36, background: color, borderRadius: 4 }} />
            <SeriesBadge series={series} episodeNumber={episodeNumber} />
          </div>
          {/* 超大价格 */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontFamily: FONTS.display, fontSize: 220, color: '#FFFFFF', fontWeight: 800, lineHeight: 0.95, textShadow: SHADOW }}>
              {highlightNumber}
            </span>
            <span style={{ fontFamily: FONTS.display, fontSize: 88, color, fontWeight: 800, textShadow: SHADOW }}>
              {highlightUnit}
            </span>
          </div>
          <div style={{ fontSize: 60, color: '#FFFFFF', fontWeight: 700, marginTop: 4, textShadow: SHADOW }}>
            {propertyName}
          </div>
        </div>
      </div>

      {/* ====== 底部 ====== */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
        <div style={{ padding: '0 60px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ width: '100%', height: 4, background: `linear-gradient(90deg, transparent, ${color})`, marginBottom: 20 }} />
              <div style={{ fontSize: 44, color, fontWeight: 700, textShadow: SHADOW, marginBottom: 18 }}>
                {highlightLabel}
              </div>
              {tags.length > 0 && (
                <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {tags.map((tag, i) => (
                    <span key={i} style={{
                      padding: '10px 24px', border: `2px solid #FFFFFF50`, borderRadius: 28,
                      color: '#FFFFFF', fontSize: 26, fontWeight: 600, textShadow: SHADOW,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${color}, transparent)` }} />
        <BrandBar />
      </div>

    </AbsoluteFill>
  );
};
