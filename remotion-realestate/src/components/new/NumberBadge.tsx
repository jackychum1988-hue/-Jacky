// NumberBadge — 編號徽章 + 標籤
// 用於知識卡片左上角：圓角方塊數字 + 右側類別標籤
// 自帶 spring 彈性入場（可設 delay）

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const F = {
  display: '-apple-system, BlinkMacSystemFont, "Inter", "Noto Sans SC", sans-serif',
  text: '-apple-system, BlinkMacSystemFont, "Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
};

type NumberBadgeProps = {
  number: number;
  color: string;
  label?: string;
  delay?: number;
  size?: number;
  fontSize?: number;
};

export const NumberBadge: React.FC<NumberBadgeProps> = ({
  number,
  color,
  label,
  delay = 6,
  size = 72,
  fontSize = 40,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numScale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 110, mass: 0.7 },
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div
        style={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: size / 4,
          backgroundColor: 'transparent',
          border: `1px solid ${hexToRgba(color, 0.25)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize,
          fontWeight: 700,
          color,
          fontFamily: F.display,
          transform: `scale(${0.5 + numScale * 0.5})`,
        }}
      >
        {number}
      </div>
      {label && (
        <span
          style={{
            fontSize: 28,
            color,
            fontFamily: F.text,
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
            textShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
