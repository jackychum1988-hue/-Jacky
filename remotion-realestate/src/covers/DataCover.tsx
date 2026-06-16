// remotion-realestate/src/covers/DataCover.tsx
// 数据拆解 — 对比卡片布局，适用于市场分析封面

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, FONTS } from '../design-system/tokens';
import { SeriesBadge, GoldLine, BrandBar, CoverGradient, SERIES_COLORS } from './shared';
import type { DataCoverProps } from './types';

const ComparisonCard: React.FC<{
  label: string;
  value: string;
  sub?: string;
  accentColor: string;
}> = ({ label, value, sub, accentColor }) => (
  <div
    style={{
      backgroundColor: COLORS.backgroundElevated,
      borderRadius: 16,
      padding: '24px 20px',
      textAlign: 'center',
      minWidth: 200,
    }}
  >
    <div style={{ fontSize: 18, color: accentColor, marginBottom: 8 }}>{label}</div>
    <div
      style={{
        fontFamily: FONTS.display,
        fontSize: 48,
        color: COLORS.text,
        fontWeight: 700,
      }}
    >
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: 16, color: COLORS.textTertiary, marginTop: 4 }}>{sub}</div>
    )}
  </div>
);

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
        backgroundColor: COLORS.background,
        fontFamily: FONTS.text,
      }}
    >
      <CoverGradient series={series} />

      {/* ❶ 系列标签 */}
      <SeriesBadge series={series} episodeNumber={episodeNumber} />

      {/* ❷ 钩子标题 */}
      <div style={{ padding: '32px 48px 0', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: FONTS.display,
            fontSize: 44,
            color: COLORS.text,
            lineHeight: 1.3,
            fontWeight: 700,
            margin: 0,
          }}
        >
          {title}
        </h1>
        <GoldLine />
      </div>

      {/* ❸ 数据对比区 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          padding: '0 48px',
        }}
      >
        <ComparisonCard
          label={leftLabel}
          value={leftValue}
          sub={leftSub}
          accentColor="#C4554D"
        />
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 28,
            color: color,
            fontWeight: 700,
          }}
        >
          VS
        </div>
        <ComparisonCard
          label={rightLabel}
          value={rightValue}
          sub={rightSub}
          accentColor={color}
        />
      </div>

      {/* ❹ 核心洞察 */}
      <div
        style={{
          margin: '0 48px 16px',
          padding: '16px 24px',
          backgroundColor: COLORS.backgroundElevated,
          borderRadius: 12,
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: 18, color: COLORS.textSecondary }}>
          💡 {insight}
        </span>
      </div>

      {/* ❺ 品牌条 */}
      <BrandBar />
    </AbsoluteFill>
  );
};
