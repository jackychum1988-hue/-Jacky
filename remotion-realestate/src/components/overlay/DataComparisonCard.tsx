// DataComparisonCard — 左右分栏数值对比卡 (zhuzige)
// 左侧数值 | 差值高亮 | 右侧数值
// 复用: 数据对比场景 ("中山均價 vs 香港均價")

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, hexToRgba, textGlow, enFontSize, OverlayElementBase } from './animation';
import { ColoredAmbience } from './ColoredAmbience';

interface DataComparisonCardProps extends OverlayElementBase {
  label?: string;
  leftLabel: string;
  leftValue: string;
  leftUnit?: string;
  rightLabel: string;
  rightValue: string;
  rightUnit?: string;
  enLeftLabel?: string;
  enRightLabel?: string;
  delta?: string;
  enDelta?: string;
  color?: string;
}

export const DataComparisonCard: React.FC<DataComparisonCardProps> = ({
  label, leftLabel, leftValue, leftUnit,
  rightLabel, rightValue, rightUnit,
  enLeftLabel, enRightLabel,
  delta, enDelta,
  color = '#F5A623',
  enterAt, exitAt, animation, position, offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });

  if (!anim.isVisible) return null;

  const posStyle = positionToStyle(position, offset);
  const localFrame = Math.max(0, frame - enterAt);

  const leftSpring = spring({ frame: localFrame, fps, config: { damping: 18, stiffness: 90, mass: 1.0 } });
  const rightSpring = spring({ frame: Math.max(0, localFrame - 10), fps, config: { damping: 16, stiffness: 100, mass: 0.8 } });
  const deltaSpring = spring({ frame: Math.max(0, localFrame - 20), fps, config: { damping: 14, stiffness: 110, mass: 0.7 } });

  const leftX = interpolate(leftSpring, [0, 1], [-80, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rightX = interpolate(rightSpring, [0, 1], [80, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const enSize = enFontSize(28);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: posStyle.display, justifyContent: posStyle.justifyContent,
      alignItems: posStyle.alignItems, padding: posStyle.padding,
      transform: posStyle.transform, pointerEvents: 'none',
    }}>
      <div style={{ opacity: anim.opacity, maxWidth: 900 }}>
        <ColoredAmbience color={color} />
        {/* Label: 彩色小字标注 */}
        {label && (
          <p style={{
            fontSize: 36, fontWeight: 600, color, fontFamily: F.text,
            letterSpacing: '0.08em', lineHeight: 1.3,
            textShadow: textGlow(color, 0.3), margin: '0 0 20px 0',
            textAlign: 'center',
          }}>
            {label}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        {/* 左侧数值 */}
        <div style={{ transform: `translateX(${leftX}px)`, textAlign: 'center', flex: 1 }}>
          <p style={{ fontSize: 28, fontWeight: 600, color: C.textSecondary, fontFamily: F.text, margin: '0 0 8px 0' }}>{leftLabel}</p>
          {enLeftLabel && <p style={{ fontSize: enSize, fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '0 0 12px 0' }}>{enLeftLabel}</p>}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontSize: 64, fontWeight: 900, color: C.text, fontFamily: F.mono, textShadow: `0 0 24px ${hexToRgba(color, 0.35)}` }}>{leftValue}</span>
            {leftUnit && <span style={{ fontSize: 32, fontWeight: 600, color: C.textSecondary, fontFamily: F.text }}>{leftUnit}</span>}
          </div>
        </div>

        {/* 差值高亮 */}
        {delta && (
          <div style={{
            transform: `scale(${0.6 + deltaSpring * 0.4})`,
            opacity: deltaSpring,
            padding: '16px 24px',
            backgroundColor: hexToRgba(color, 0.18),
            borderRadius: 12,
            border: `1.5px solid ${hexToRgba(color, 0.5)}`,
            boxShadow: `0 0 24px ${hexToRgba(color, 0.25)}`,
            textAlign: 'center',
            flexShrink: 0,
          }}>
            <p style={{ fontSize: 36, fontWeight: 800, color, fontFamily: F.display, margin: 0, lineHeight: 1.2 }}>{delta}</p>
            {enDelta && <p style={{ fontSize: enFontSize(36), fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '4px 0 0 0' }}>{enDelta}</p>}
          </div>
        )}

        {/* 右侧数值 */}
        <div style={{ transform: `translateX(${rightX}px)`, textAlign: 'center', flex: 1 }}>
          <p style={{ fontSize: 28, fontWeight: 600, color: C.textSecondary, fontFamily: F.text, margin: '0 0 8px 0' }}>{rightLabel}</p>
          {enRightLabel && <p style={{ fontSize: enSize, fontWeight: 400, color: 'rgba(255,255,255,0.6)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '0 0 12px 0' }}>{enRightLabel}</p>}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontSize: 64, fontWeight: 900, color: C.text, fontFamily: F.mono, textShadow: `0 0 24px ${hexToRgba(color, 0.35)}` }}>{rightValue}</span>
            {rightUnit && <span style={{ fontSize: 32, fontWeight: 600, color: C.textSecondary, fontFamily: F.text }}>{rightUnit}</span>}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
