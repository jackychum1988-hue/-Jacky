// remotion-realestate/src/covers/SundipCover.tsx
// 笋盘速报 — 顶部价格 + 底部标签 / 中间透明 / 电光橙

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONTS } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { SundipCoverProps } from './types';

const SHADOW = '0 4px 24px rgba(0,0,0,0.95)';

export const SundipCover: React.FC<SundipCoverProps> = ({
  series,
  episodeNumber,
  highlightNumber,
  highlightUnit = '万',
  highlightLabel,
  propertyName,
  tags,
}) => {
  const color = SERIES_COLORS[series];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        fontFamily: FONTS.text,
      }}
    >
      {/* ====== 顶部区域 ====== */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
        {/* 顶部双色条 */}
        <div style={{ height: 4, background: color }} />
        <div style={{ height: 2, background: `${color}50` }} />

        <div style={{ padding: '28px 64px 0' }}>
          {/* 系列标签 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 6, height: 28, background: color, borderRadius: 3 }} />
            <SeriesBadge series={series} episodeNumber={episodeNumber} />
          </div>

          {/* 超大价格 — 左对齐 */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: 170,
                color: '#FFFFFF',
                fontWeight: 800,
                lineHeight: 1,
                textShadow: SHADOW,
              }}
            >
              {highlightNumber}
            </span>
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: 72,
                color,
                fontWeight: 800,
                textShadow: SHADOW,
              }}
            >
              {highlightUnit}
            </span>
          </div>

          {/* 楼盘名 */}
          <div style={{ fontSize: 48, color: '#FFFFFF', fontWeight: 700, marginTop: 8, textShadow: SHADOW }}>
            {propertyName}
          </div>
        </div>
      </div>

      {/* ====== 底部区域 ====== */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
        <div style={{ padding: '0 64px 0' }}>
          {/* 描述 + 标签 — 右对齐 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  width: '100%',
                  height: 3,
                  background: `linear-gradient(90deg, transparent, ${color})`,
                  marginBottom: 16,
                }}
              />
              <div style={{ fontSize: 34, color, fontWeight: 700, textShadow: SHADOW, marginBottom: 16 }}>
                {highlightLabel}
              </div>
              {tags.length > 0 && (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '8px 20px',
                        border: `2px solid #FFFFFF50`,
                        borderRadius: 24,
                        color: '#FFFFFF',
                        fontSize: 20,
                        fontWeight: 600,
                        textShadow: SHADOW,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, transparent)` }} />
        <BrandBar />
      </div>
    </AbsoluteFill>
  );
};
