// remotion-realestate/src/covers/WarningCover.tsx
// 避坑指南 — 顶部警告 + 底部清单 / 中间透明 / 电光粉

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONTS } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { WarningCoverProps } from './types';

const SHADOW = '0 4px 24px rgba(0,0,0,0.95)';

export const WarningCover: React.FC<WarningCoverProps> = ({
  series,
  episodeNumber,
  title,
  items,
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
        <div style={{ height: 4, background: color }} />

        <div style={{ padding: '32px 64px 0' }}>
          {/* 系列标签 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 6, height: 28, background: color, borderRadius: 3 }} />
            <SeriesBadge series={series} episodeNumber={episodeNumber} />
          </div>

          {/* 警告标题 — 左对齐 */}
          <h1
            style={{
              fontFamily: FONTS.display,
              fontSize: 86,
              color: '#FFFFFF',
              lineHeight: 1.08,
              fontWeight: 800,
              margin: 0,
              textShadow: SHADOW,
              letterSpacing: '-0.02em',
            }}
          >
            {title.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </h1>
        </div>
      </div>

      {/* ====== 底部区域 ====== */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
        <div style={{ padding: '0 64px 0' }}>
          {/* 清单 — 右对齐 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <div>
              <div
                style={{
                  width: '100%',
                  height: 3,
                  background: `linear-gradient(90deg, transparent, ${color})`,
                  marginBottom: 20,
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, flexDirection: 'row-reverse' }}>
                    {/* 编号 — 色块 */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 800 }}>
                        {i + 1}
                      </span>
                    </div>
                    <span style={{ fontSize: 32, color: '#FFFFFF', fontWeight: 700, textShadow: SHADOW }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, transparent)` }} />
        <BrandBar />
      </div>
    </AbsoluteFill>
  );
};
