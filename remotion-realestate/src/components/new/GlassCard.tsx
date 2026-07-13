// GlassCard — 柱子哥風格卡片容器
// 暖黑半透明底 + 左側色條光流 + 光折射邊框 + 彈性入場動畫
// transparentBg 模式: 完全透明底（畫中畫疊加只顯示內容文字）
// showOuterGlow: 控制外擴散光暈（單卡片開、連續卡片關）

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from 'remotion';

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

type GlassCardProps = {
  color: string;
  borderWidth?: number;
  padding?: string;
  borderRadius?: number;
  maxWidth?: number;
  showLeftBar?: boolean;
  glowIntensity?: number;
  bgAlpha?: number;
  transparentBg?: boolean;
  showOuterGlow?: boolean;      // 外擴散光暈（單卡 true / 連續卡 false）
  /** Skip internal entry animation — caller controls all motion (prevents double-animation with component-level springs) */
  disableEntryAnimation?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const GlassCard: React.FC<GlassCardProps> = ({
  color,
  borderWidth = 1.5,
  padding = '48px 52px',
  borderRadius = 16,
  maxWidth = 880,
  showLeftBar = true,
  glowIntensity = 1,
  bgAlpha = 0.48,
  transparentBg = false,
  showOuterGlow = true,
  disableEntryAnimation = false,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // When caller controls animation, render at full opacity with no transform
  const cardOpacity = disableEntryAnimation
    ? 1
    : interpolate(frame, [0, 16], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.quad),
      });
  const cardY = disableEntryAnimation
    ? 0
    : interpolate(frame, [0, 20], [50, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.back(1.3)),
      });
  const cardScaleVal = disableEntryAnimation
    ? 1
    : 0.92 + spring({ frame, fps, config: { damping: 18, stiffness: 85, mass: 1.2 } }) * 0.08;

  const g = glowIntensity;

  // 邊框光流：光點從頂部流向底部循環
  const flowY = ((frame * 1.5) % 100);

  // 透明底模式：完全透明（畫中畫疊加，只顯示內容文字，無任何邊框/光暈/色底）
  const bgColor = transparentBg
    ? 'transparent'
    : `rgba(14,12,10,${bgAlpha})`;

  const glowSpread = transparentBg ? 0 : 1.0;
  const glowAlphaMult = transparentBg ? 0 : 1.0;
  const effectiveBorderWidth = transparentBg ? 0 : borderWidth;
  const borderAlpha = transparentBg ? 0 : 0.42 * g;

  const boxShadow = transparentBg
    ? 'none'
    : [
        `0 0 ${24 * g}px ${hexToRgba(color, 0.28 * g)}`,
        `0 0 ${60 * g}px ${hexToRgba(color, 0.10 * g)}`,
        `inset 0 1px 0 ${hexToRgba(color, 0.18 * g)}`,
        `inset 0 -1px 0 rgba(0,0,0,0.35)`,
        `0 0 0 1px ${hexToRgba(color, 0.12 * g)}`,
      ].join(',\n');

  // 透明底模式：左側色條也隱藏（簡潔透明純文字）
  const effectiveShowLeftBar = transparentBg ? false : showLeftBar;

  return (
    <div
      style={{
        position: 'relative',
        width: 'fit-content',
        minWidth: 320,
        maxWidth,
        padding,
        backgroundColor: bgColor,
        borderRadius,
        boxShadow,
        border: effectiveBorderWidth > 0 ? `${effectiveBorderWidth}px solid ${hexToRgba(color, borderAlpha)}` : 'none',
        opacity: cardOpacity,
        transform: `translateY(${cardY}px) scale(${cardScaleVal})`,
        ...style,
      }}
    >
      {/* 左側色條 + 光流動畫（透明底模式隱藏） */}
      {effectiveShowLeftBar && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: borderRadius / 2,
            bottom: borderRadius / 2,
            width: 8,
            borderRadius: `0 ${borderRadius / 2}px ${borderRadius / 2}px 0`,
            backgroundColor: color,
            boxShadow: `
              0 0 6px ${hexToRgba(color, 0.5 * g)},
              0 0 14px ${hexToRgba(color, 0.2 * g)}
            `,
            overflow: 'hidden',
          }}
        >
          {/* 光流掃描線 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(
                to bottom,
                transparent ${flowY - 18}%,
                ${hexToRgba('#FFFFFF', 0.55)} ${flowY}%,
                transparent ${flowY + 18}%
              )`,
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
};
