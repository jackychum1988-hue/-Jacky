// GenerationCard — 代际对比卡 (v1)
// 结构: 标签 → SVG水平时间线 → 横向代际卡片（点+卡片）
// 适用于: 产品迭代、住宅代际演进、技术版本对比

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, enFontSize, idleFloat } from './animation';

interface GenerationItem {
  name: string;
  year?: string;
  features: string[];
  enName?: string;
  highlight?: boolean;
}

interface GenerationCardProps extends OverlayElementBase {
  label?: string;
  generations: GenerationItem[];
  color?: string;
  disableBreathing?: boolean;
}

export const GenerationCard: React.FC<GenerationCardProps> = ({
  label,
  generations,
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

  // ── Label: 0-12f ──
  const labelOpacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelExit = isExiting ? interpolate(exitP, [0.5, 0.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // ── Timeline line: 8-20f draw from left ──
  const lineSpring = spring({ frame: Math.max(0, localFrame - 8), fps, config: { damping: 20, stiffness: 80, mass: 1.0 } });
  const lineProgress = isExiting ? interpolate(exitP, [0, 0.5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(lineSpring, [0, 1], [0, 1]);

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
        padding: '36px 40px 32px 48px',
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

        {/* Generations — horizontal row with timeline connection */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, position: 'relative' }}>
          {/* Horizontal timeline line (absolute behind cards) */}
          <div style={{
            position: 'absolute',
            top: 15, left: '5%', right: '5%',
            height: 2,
            background: `linear-gradient(to right, ${hexToRgba(color, 0.5)}, ${color}, ${hexToRgba(color, 0.5)})`,
            transform: `scaleX(${lineProgress})`,
            transformOrigin: 'left',
          }} />

          {generations.map((gen, gi) => {
            const itemDelay = 10 + gi * 10;
            const itemFrame = Math.max(0, localFrame - itemDelay);
            const itemSpring = spring({ frame: itemFrame, fps, config: { damping: 24, stiffness: 75, mass: 1.2 } });
            const itemOpacity = isExiting
              ? interpolate(exitP, [(generations.length - 1 - gi) * 0.05, (generations.length - 1 - gi) * 0.05 + 0.2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : interpolate(itemSpring, [0, 1], [0, 1]);
            const itemScale = isExiting
              ? interpolate(exitP, [(generations.length - 1 - gi) * 0.04, (generations.length - 1 - gi) * 0.04 + 0.15], [1, 0.9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : interpolate(itemSpring, [0, 1], [0.92, 1]);
            const cardScale = gen.highlight ? itemScale * 1.08 : itemScale;

            return (
              <div key={gi} style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                opacity: itemOpacity,
                transform: `scale(${cardScale})`,
                zIndex: gen.highlight ? 2 : 1,
              }}>
                {/* Timeline dot */}
                <div style={{
                  width: 16, height: 16,
                  borderRadius: '50%',
                  backgroundColor: gen.highlight ? color : hexToRgba(color, 0.4),
                  border: `2px solid ${gen.highlight ? C.text : hexToRgba(color, 0.3)}`,
                  boxShadow: gen.highlight ? `0 0 16px ${hexToRgba(color, 0.6)}, 0 0 32px ${hexToRgba(color, 0.2)}` : `0 0 8px ${hexToRgba(color, 0.2)}`,
                  marginBottom: 12,
                  zIndex: 3,
                }} />

                {/* Card */}
                <div style={{
                  width: '100%',
                  padding: '12px 10px',
                  backgroundColor: gen.highlight ? hexToRgba(color, 0.12) : 'rgba(255,255,255,0.03)',
                  borderRadius: RADIUS.panel,
                  border: `1.5px solid ${gen.highlight ? hexToRgba(color, 0.4) : hexToRgba(color, 0.15)}`,
                  textAlign: 'center',
                }}>
                  {/* Year */}
                  {gen.year && (
                    <p style={{
                      fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
                      fontFamily: F.mono, margin: '0 0 6px 0', letterSpacing: '0.05em',
                    }}>
                      {gen.year}
                    </p>
                  )}
                  {/* Name */}
                  <p style={{
                    fontSize: 22, fontWeight: 800, color: gen.highlight ? color : C.text,
                    fontFamily: F.display, margin: '0 0 8px 0', lineHeight: 1.2,
                    textShadow: gen.highlight ? `0 0 12px ${hexToRgba(color, 0.3)}` : textDepth(0.15),
                  }}>
                    {gen.name}
                  </p>
                  {gen.enName && (
                    <p style={{ fontSize: enFontSize(22), fontWeight: 400, color: 'rgba(255,255,255,0.5)', fontFamily: F.text, letterSpacing: '0.1em', margin: '0 0 6px 0' }}>
                      {gen.enName}
                    </p>
                  )}
                  {/* Features */}
                  {gen.features.map((f, fi) => {
                    const fDelay = itemDelay + 6 + fi * 4;
                    const fFrame = Math.max(0, localFrame - fDelay);
                    const fOpacity = interpolate(fFrame, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                    return (
                      <p key={fi} style={{
                        fontSize: 16, fontWeight: 400, color: C.textSecondary,
                        fontFamily: F.text, margin: '2px 0', lineHeight: 1.3, opacity: fOpacity,
                      }}>
                        {f}
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
