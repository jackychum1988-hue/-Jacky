// remotion-realestate/src/covers/DataCover.tsx
// 数据拆解 — 顶部标题 + 底部对比 / 中间透明 / 霓虹青

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONTS } from '../design-system/tokens';
import { SeriesBadge, BrandBar, SERIES_COLORS } from './shared';
import type { DataCoverProps } from './types';

const SHADOW = '0 4px 24px rgba(0,0,0,0.95)';

export const DataCover: React.FC<DataCoverProps> = ({
  series,
  episodeNumber,
  title,
  leftLabel,
  leftValue,
  leftSub,
  rightLabel,
  rightValue,
  rightSub,
  insight,
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

          {/* 标题 — 左对齐 */}
          <h1
            style={{
              fontFamily: FONTS.display,
              fontSize: 84,
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
          {/* 对比卡 + 洞察 — 右对齐 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  width: '100%',
                  height: 3,
                  background: `linear-gradient(90deg, transparent, ${color})`,
                  marginBottom: 20,
                }}
              />

              {/* 对比数值行 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'flex-end', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 20, color: '#FFFFFF80', marginBottom: 4, textShadow: SHADOW }}>{leftLabel}</div>
                  <div style={{ fontFamily: FONTS.display, fontSize: 52, color: '#FF4444', fontWeight: 700, textShadow: SHADOW }}>{leftValue}</div>
                  {leftSub && <div style={{ fontSize: 18, color: '#FFFFFF60', textShadow: SHADOW }}>{leftSub}</div>}
                </div>
                <div style={{ fontFamily: FONTS.display, fontSize: 36, color, fontWeight: 800, textShadow: SHADOW }}>VS</div>
                <div>
                  <div style={{ fontSize: 20, color: '#FFFFFF80', marginBottom: 4, textShadow: SHADOW }}>{rightLabel}</div>
                  <div style={{ fontFamily: FONTS.display, fontSize: 52, color, fontWeight: 700, textShadow: SHADOW }}>{rightValue}</div>
                  {rightSub && <div style={{ fontSize: 18, color: '#FFFFFF60', textShadow: SHADOW }}>{rightSub}</div>}
                </div>
              </div>

              {/* 洞察 */}
              <div style={{ fontSize: 28, color: '#FFFFFF', fontWeight: 600, textShadow: SHADOW }}>
                {insight}
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
