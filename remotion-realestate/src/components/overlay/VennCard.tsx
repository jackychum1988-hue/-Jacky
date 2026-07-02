// VennCard — 韦恩交集图 (v1)
// SVG: 2-3个半透明重叠圆 + 区域标签
// 适用于: 概念交集、需求重叠分析、交集区域推荐

import React, { useRef } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, enFontSize, idleFloat } from './animation';

interface VennCircle {
  label: string;
  items: string[];
  enLabel?: string;
  color?: string;
}

interface VennIntersection {
  label: string;
  items: string[];
}

interface VennCardProps extends OverlayElementBase {
  label?: string;
  circles: VennCircle[]; // 2 or 3
  intersections?: VennIntersection[];
  color?: string;
  disableBreathing?: boolean;
}

export const VennCard: React.FC<VennCardProps> = ({
  label,
  circles,
  intersections,
  color = '#1A56DB',
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

  const uid = useRef(0).current++;
  const SVG_W = 420, SVG_H = 380;

  // Circle configurations
  const is3 = circles.length >= 3;
  const circleConfigs = is3
    ? [
      { cx: 130, cy: 230, r: 95 },  // bottom-left
      { cx: 290, cy: 230, r: 95 },  // bottom-right
      { cx: 210, cy: 130, r: 95 },  // top-center
    ]
    : [
      { cx: 140, cy: 190, r: 110 },
      { cx: 280, cy: 190, r: 110 },
    ];

  const circleColors = ['#FF4136', '#1A56DB', '#10B981'];

  // ── Label: 0-12f ──
  const labelOpacityVal = interpolate(localFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelExit = isExiting ? interpolate(exitP, [0.5, 0.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // ── Idle float ──
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.4, 0.022);

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
        padding: '36px 36px 28px 44px',
        backgroundColor: 'rgba(10,8,6,0.55)',
        borderRadius: 18,
        border: `1.5px solid ${hexToRgba(color, 0.45)}`,
        boxShadow: `0 0 32px ${hexToRgba(color, 0.18)}, 0 0 72px ${hexToRgba(color, 0.06)}, inset 0 1px 0 ${hexToRgba(color, 0.15)}, inset 0 -1px 0 rgba(0,0,0,0.3)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 9, bottom: 9, width: 5, borderRadius: '0 9px 9px 0', backgroundColor: color, boxShadow: `0 0 8px ${hexToRgba(color, 0.5)}` }} />

        {label && (
          <p style={{ fontSize: 36, fontWeight: 600, color, fontFamily: F.text, letterSpacing: '0.08em', textShadow: textDepth(0.3), margin: '0 0 16px 0', textAlign: 'center', opacity: labelOpacityVal * labelExit }}>
            {label}
          </p>
        )}

        {/* SVG circles + intersection labels */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
            <defs>
              {circles.map((_, ci) => {
                const c = circleConfigs[ci];
                if (!c) return null;
                return (
                  <filter key={ci} id={`venn-blur-${uid}-${ci}`}>
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
                  </filter>
                );
              })}
            </defs>

            {/* Circles */}
            {circles.map((circle, ci) => {
              const cfg = circleConfigs[ci];
              if (!cfg) return null;
              const cColor = circle.color || circleColors[ci % circleColors.length];
              const circleDelay = 6 + ci * 8;
              const circleFrame = Math.max(0, localFrame - circleDelay);
              const cs = spring({ frame: circleFrame, fps, config: { damping: 24, stiffness: 75, mass: 1.2 } });
              const circleScale = isExiting
                ? interpolate(exitP, [(circles.length - 1 - ci) * 0.05, (circles.length - 1 - ci) * 0.05 + 0.2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : interpolate(cs, [0, 1], [0, 1]);
              const circleOpacity = cs;

              return (
                <g key={ci} opacity={circleOpacity}>
                  <circle cx={cfg.cx} cy={cfg.cy} r={cfg.r * circleScale}
                    fill={hexToRgba(cColor, 0.12)}
                    stroke={cColor} strokeWidth={2.5} strokeOpacity={0.7}
                    filter={`url(#venn-blur-${uid}-${ci})`}
                  />
                  {/* Circle label */}
                  <text x={cfg.cx} y={cfg.cy - (is3 ? 8 : 0)}
                    fill={C.text} fontSize={26} fontWeight={800}
                    fontFamily={F.text} textAnchor="middle"
                    opacity={circleScale > 0.5 ? 1 : 0}
                  >
                    {circle.label}
                  </text>
                  {circle.enLabel && (
                    <text x={cfg.cx} y={cfg.cy + 18}
                      fill="rgba(255,255,255,0.5)" fontSize={18} fontWeight={400}
                      fontFamily={F.text} textAnchor="middle"
                      opacity={circleScale > 0.5 ? 1 : 0}
                    >
                      {circle.enLabel}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Intersection labels */}
            {intersections && intersections.map((ix, ixi) => {
              const ixDelay = 18 + ixi * 8;
              const ixFrame = Math.max(0, localFrame - ixDelay);
              const ixOpacity = interpolate(ixFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              // Intersection label at center of SVG
              const ixX = SVG_W / 2;
              const ixY = is3 ? 190 : 180;
              return (
                <text key={`ix-${ixi}`} x={ixX} y={ixY}
                  fill={color} fontSize={22} fontWeight={800}
                  fontFamily={F.text} textAnchor="middle"
                  opacity={ixOpacity}
                >
                  {ix.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Circle items below SVG */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12, flexWrap: 'wrap' }}>
          {circles.map((circle, ci) => {
            const cColor = circle.color || circleColors[ci % circleColors.length];
            return (
              <div key={ci} style={{ flex: 1, minWidth: 120, maxWidth: 220 }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: cColor, fontFamily: F.text, margin: '0 0 8px 0', textAlign: 'center' }}>
                  {circle.label}
                </p>
                {circle.items.map((item, ii) => {
                  const iDelay = 20 + ci * 6 + ii * 4;
                  const iFrame = Math.max(0, localFrame - iDelay);
                  const iOpacity = interpolate(iFrame, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                  return (
                    <p key={ii} style={{ fontSize: 18, color: C.textSecondary, fontFamily: F.text, margin: '3px 0', textAlign: 'center', opacity: iOpacity }}>
                      {item}
                    </p>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Intersection items */}
        {intersections && intersections.length > 0 && (
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            {intersections.map((ix, ixi) => {
              const ixDelay = 24 + ixi * 6;
              const ixFrame = Math.max(0, localFrame - ixDelay);
              const ixOpacity = interpolate(ixFrame, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              return (
                <div key={ixi} style={{ opacity: ixOpacity }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color, fontFamily: F.text, margin: '0 0 6px 0' }}>
                    ∩ {ix.label}
                  </p>
                  {ix.items.map((item, ii) => (
                    <p key={ii} style={{ fontSize: 18, color: C.textSecondary, fontFamily: F.text, margin: '2px 0' }}>
                      {item}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
