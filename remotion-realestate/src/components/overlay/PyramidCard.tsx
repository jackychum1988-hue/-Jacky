// PyramidCard — 金字塔层级卡 (v1)
// 结构: 标签 → 居中栈（底层最宽→顶层最窄）
// 适用于: 需求层次、优先级排序、投资金字塔

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, enFontSize, idleFloat } from './animation';

interface PyramidLevel {
  label: string;
  value: string;
  enLabel?: string;
  color?: string;
}

interface PyramidCardProps extends OverlayElementBase {
  label?: string;
  levels: PyramidLevel[];
  color?: string;
  disableBreathing?: boolean;
}

export const PyramidCard: React.FC<PyramidCardProps> = ({
  label,
  levels,
  color = '#F5A623',
  disableBreathing = false,
  enterAt, exitAt, animation, position, offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });
  if (!anim.isVisible) return null;

  const posStyle = positionToStyle(position, offset);
  const localFrame = Math.max(0, frame - enterAt);
  const isExiting = anim.phase === 'exit';
  const exitP = anim.phaseProgress;

  // ── Label: 0-12f ──
  const labelOpacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelExit = isExiting ? interpolate(exitP, [0.5, 0.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // ── Idle float ──
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.4, 0.022);

  // Levels render bottom-to-top (widest first)
  const reversed = [...levels].reverse();

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: posStyle.display, justifyContent: posStyle.justifyContent,
      alignItems: posStyle.alignItems, padding: posStyle.padding,
      transform: posStyle.transform, pointerEvents: 'none', overflow: 'hidden',
    }}>
      <div style={{
        opacity: anim.opacity,
        transform: `translateY(${floatY}px)`,
        maxWidth: posStyle.maxWidth ?? 880,
        width: '100%',
        padding: '36px 44px 32px 52px',
        backgroundColor: 'rgba(10,8,6,0.55)',
        borderRadius: 18,
        border: `1.5px solid ${hexToRgba(color, 0.45)}`,
        boxShadow: `0 0 32px ${hexToRgba(color, 0.18)}, 0 0 72px ${hexToRgba(color, 0.06)}, inset 0 1px 0 ${hexToRgba(color, 0.15)}, inset 0 -1px 0 rgba(0,0,0,0.3)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 9, bottom: 9, width: 5, borderRadius: '0 9px 9px 0', backgroundColor: color, boxShadow: `0 0 8px ${hexToRgba(color, 0.5)}` }} />

        {label && (
          <p style={{ fontSize: 36, fontWeight: 600, color, fontFamily: F.text, letterSpacing: '0.08em', textShadow: textDepth(0.3), margin: '0 0 24px 0', textAlign: 'center', opacity: labelOpacity * labelExit }}>
            {label}
          </p>
        )}

        {/* Pyramid levels — bottom to top */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {reversed.map((level, ri) => {
            // ri=0 is the bottom (widest), ri=last is the top (narrowest)
            const topIndex = levels.length - 1 - ri; // original index (0=top, last=bottom)
            const itemDelay = 8 + topIndex * 8; // bottom enters first
            const itemFrame = Math.max(0, localFrame - itemDelay);
            const itemSpring = spring({ frame: itemFrame, fps, config: { damping: 22, stiffness: 85, mass: 1.1 } });
            const itemOpacity = isExiting
              ? interpolate(exitP, [ri * 0.05, ri * 0.05 + 0.2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : interpolate(itemSpring, [0, 1], [0, 1]);
            const slideY = isExiting
              ? interpolate(exitP, [ri * 0.04, ri * 0.04 + 0.18], [0, -20], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : interpolate(itemSpring, [0, 1], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

            // Width: bottom 100%, each level up reduces by 60/(N-1)%
            const widthPct = levels.length <= 1 ? 100 : 100 - topIndex * (55 / (levels.length - 1));
            const lvlColor = level.color || color;

            return (
              <div key={ri} style={{
                width: `${widthPct}%`,
                opacity: itemOpacity,
                transform: `translateY(${slideY}px)`,
                marginBottom: 0,
              }}>
                <div style={{
                  padding: '14px 20px',
                  backgroundColor: hexToRgba(lvlColor, 0.1 + topIndex * 0.05),
                  border: `1.5px solid ${hexToRgba(lvlColor, 0.3 + topIndex * 0.1)}`,
                  borderTop: ri === 0 ? `1.5px solid ${hexToRgba(lvlColor, 0.4)}` : 'none',
                  textAlign: 'center',
                  position: 'relative',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 12 }}>
                    <span style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: lvlColor,
                      fontFamily: F.text,
                      textShadow: `0 0 12px ${hexToRgba(lvlColor, 0.3)}`,
                    }}>
                      {level.label}
                    </span>
                    <span style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: C.textSecondary,
                      fontFamily: F.mono,
                    }}>
                      {level.value}
                    </span>
                  </div>
                  {level.enLabel && (
                    <p style={{
                      fontSize: enFontSize(26), fontWeight: 400,
                      color: 'rgba(255,255,255,0.45)', fontFamily: F.text,
                      letterSpacing: '0.1em', margin: '4px 0 0 0',
                    }}>
                      {level.enLabel}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
