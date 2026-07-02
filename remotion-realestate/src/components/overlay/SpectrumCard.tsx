// SpectrumCard — 频谱区间卡 (v1)
// 结构: 标签 → 水平渐变色条 → 定位标记点(圆圈+标签)
// 适用于: 预算区间带、风险频谱、价格分布、价值区间

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, enFontSize, idleFloat } from './animation';

interface SpectrumMarker {
  position: number; // 0-100
  label: string;
  enLabel?: string;
  color?: string;
}

interface SpectrumCardProps extends OverlayElementBase {
  label?: string;
  rangeStart: string;
  rangeEnd: string;
  markers: SpectrumMarker[];
  color?: string;
  /** Disable Apple-style idle breathing/float when true */
  disableBreathing?: boolean;
}

export const SpectrumCard: React.FC<SpectrumCardProps> = ({
  label,
  rangeStart,
  rangeEnd,
  markers,
  color = '#8B5CF6',
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

  // ── Spectrum bar: 6-20f draw from left ──
  const barSpring = spring({ frame: Math.max(0, localFrame - 6), fps, config: { damping: 20, stiffness: 80, mass: 1.0 } });
  const barWidth = isExiting
    ? interpolate(exitP, [0, 0.5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(barSpring, [0, 1], [0, 100]);

  // ── Range labels: 10-22f ──
  const rangeOpacity = interpolate(localFrame, [10, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rangeExit = isExiting ? interpolate(exitP, [0.3, 0.6], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // ── Idle float ──
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.4, 0.022);

  // Remove markers that don't have valid positions
  const validMarkers = markers.filter(m => m.position >= 0 && m.position <= 100);

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
        padding: '36px 44px 40px 52px',
        backgroundColor: 'rgba(10,8,6,0.55)',
        borderRadius: 18,
        border: `1.5px solid ${hexToRgba(color, 0.45)}`,
        boxShadow: `
          0 0 32px ${hexToRgba(color, 0.18)},
          0 0 72px ${hexToRgba(color, 0.06)},
          inset 0 1px 0 ${hexToRgba(color, 0.15)},
          inset 0 -1px 0 rgba(0,0,0,0.3)
        `,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Left accent bar */}
        <div style={{
          position: 'absolute',
          left: 0, top: 9, bottom: 9,
          width: 5, borderRadius: '0 9px 9px 0',
          backgroundColor: color,
          boxShadow: `0 0 8px ${hexToRgba(color, 0.5)}, 0 0 18px ${hexToRgba(color, 0.2)}`,
        }} />

        {/* Label */}
        {label && (
          <p style={{
            fontSize: 36, fontWeight: 600, color, fontFamily: F.text,
            letterSpacing: '0.08em', lineHeight: 1.3,
            textShadow: textDepth(0.3), margin: '0 0 24px 0',
            opacity: labelOpacity * labelExit,
          }}>
            {label}
          </p>
        )}

        {/* Spectrum bar container */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          {/* Gradient bar */}
          <div style={{
            width: `${barWidth}%`,
            height: 16,
            borderRadius: 8,
            background: `linear-gradient(to right, ${hexToRgba(color, 0.3)}, ${color}, ${hexToRgba(color, 0.3)})`,
            boxShadow: `0 0 16px ${hexToRgba(color, 0.3)}`,
            transition: 'none',
          }} />

          {/* Marker dots + labels */}
          {validMarkers.map((m, mi) => {
            const markerDelay = 12 + mi * 8;
            const markerFrame = Math.max(0, localFrame - markerDelay);
            const markerSpring = spring({ frame: markerFrame, fps, config: { damping: 14, stiffness: 120, mass: 0.7 } });
            const markerScale = isExiting
              ? interpolate(exitP, [(validMarkers.length - 1 - mi) * 0.05, (validMarkers.length - 1 - mi) * 0.05 + 0.2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : interpolate(markerSpring, [0, 1], [0, 1.15]);
            const markerFinalScale = isExiting ? markerScale : (markerScale > 1 ? 1 + (markerScale - 1) * 0.25 : markerScale);
            const markerOpacity = isExiting
              ? interpolate(exitP, [(validMarkers.length - 1 - mi) * 0.04, (validMarkers.length - 1 - mi) * 0.04 + 0.12], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : interpolate(markerSpring, [0, 1], [0, 1]);

            const mColor = m.color || color;

            return (
              <div key={mi} style={{
                position: 'absolute',
                left: `${m.position}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                {/* Dot */}
                <div style={{
                  width: 14, height: 14,
                  borderRadius: '50%',
                  backgroundColor: mColor,
                  boxShadow: `0 0 12px ${hexToRgba(mColor, 0.7)}, 0 0 24px ${hexToRgba(mColor, 0.3)}`,
                  transform: `scale(${markerFinalScale})`,
                  opacity: markerOpacity,
                  marginBottom: 8,
                }} />
                {/* Label below dot */}
                <div style={{
                  opacity: markerOpacity,
                  textAlign: 'center',
                  marginTop: 4,
                }}>
                  <p style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: mColor,
                    fontFamily: F.text,
                    margin: 0,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    textShadow: `0 0 12px ${hexToRgba(mColor, 0.4)}`,
                  }}>
                    {m.label}
                  </p>
                  {m.enLabel && (
                    <p style={{
                      fontSize: enFontSize(24),
                      fontWeight: 400,
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: F.text,
                      letterSpacing: '0.1em',
                      margin: '2px 0 0 0',
                      whiteSpace: 'nowrap',
                    }}>
                      {m.enLabel}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Range labels */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          opacity: rangeOpacity * rangeExit,
          marginTop: 8,
        }}>
          <span style={{ fontSize: 22, fontWeight: 500, color: 'rgba(255,255,255,0.4)', fontFamily: F.mono }}>
            {rangeStart}
          </span>
          <span style={{ fontSize: 22, fontWeight: 500, color: 'rgba(255,255,255,0.4)', fontFamily: F.mono }}>
            {rangeEnd}
          </span>
        </div>
      </div>
    </div>
  );
};
