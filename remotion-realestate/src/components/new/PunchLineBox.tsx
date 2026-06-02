// PunchLineBox — 衝擊文字框（透明底版）
// 純文字 + 簡潔邊框，無色底無光暈，適合畫中畫疊加
// 彈跳入場動畫

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

const F = {
  display: '-apple-system, BlinkMacSystemFont, "Inter", "Noto Sans SC", sans-serif',
};

type PunchLineBoxProps = {
  children: React.ReactNode;
  color?: string;
  fontSize?: number;
  delay?: number;
};

export const PunchLineBox: React.FC<PunchLineBoxProps> = ({
  children,
  color = '#C0392B',
  fontSize = 72,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const itemFrame = Math.max(0, frame - delay);
  const opacity = interpolate(itemFrame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const y = interpolate(itemFrame, [0, 18], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 彈跳入場
  const boxScale = spring({
    frame: itemFrame,
    fps,
    config: { damping: 10, stiffness: 120, mass: 0.8 },
  });

  return (
    <div style={{ opacity, transform: `translateY(${y}px)` }}>
      <div
        style={{
          padding: '16px 36px',
          backgroundColor: 'transparent',
          borderRadius: 14,
          border: `1.5px solid ${color}`,
          transform: `scale(${0.5 + boxScale * 0.5})`,
        }}
      >
        <p
          style={{
            fontSize,
            fontWeight: 700,
            color,
            fontFamily: F.display,
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            margin: 0,
          }}
        >
          {children}
        </p>
      </div>
    </div>
  );
};
