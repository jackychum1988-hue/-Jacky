// TeardownCard — 精装拆解卡 (v1)
// 递递归树: 每层缩进40px, 名称+品牌+等级标签
// 适用于: 精装标准拆解、产品成分分析、配置清单

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, enFontSize, idleFloat } from './animation';

interface TeardownComponent {
  name: string;
  brand?: string;
  grade?: string; // "A" | "B" | "C" etc.
  subComponents?: TeardownComponent[];
  enName?: string;
}

interface TeardownCardProps extends OverlayElementBase {
  label?: string;
  product: string;
  components: TeardownComponent[];
  color?: string;
  disableBreathing?: boolean;
}

function gradeColor(g: string): string {
  const upper = g.toUpperCase();
  if (upper === 'A' || upper === 'S') return '#10B981';
  if (upper === 'B') return '#F5A623';
  if (upper === 'C') return '#FF4136';
  return '#06B6D4';
}

// Flat list builder from recursive tree
interface FlatItem {
  component: TeardownComponent;
  depth: number;
  parentIndex: number;
}

function flattenTree(components: TeardownComponent[], depth: number = 0, parentIndex: number = -1): FlatItem[] {
  const result: FlatItem[] = [];
  components.forEach((c, i) => {
    const idx = result.length;
    result.push({ component: c, depth, parentIndex });
    if (c.subComponents && c.subComponents.length > 0) {
      result.push(...flattenTree(c.subComponents, depth + 1, idx));
    }
  });
  return result;
}

export const TeardownCard: React.FC<TeardownCardProps> = ({
  label,
  product,
  components,
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

  const flatItems = flattenTree(components);

  // ── Label + product: 0-12f ──
  const headerOpacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const headerExit = isExiting ? interpolate(exitP, [0.5, 0.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

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
        padding: '36px 40px 28px 48px',
        backgroundColor: 'rgba(10,8,6,0.55)',
        borderRadius: 18,
        border: `1.5px solid ${hexToRgba(color, 0.45)}`,
        boxShadow: `0 0 32px ${hexToRgba(color, 0.18)}, 0 0 72px ${hexToRgba(color, 0.06)}, inset 0 1px 0 ${hexToRgba(color, 0.15)}, inset 0 -1px 0 rgba(0,0,0,0.3)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 9, bottom: 9, width: 5, borderRadius: '0 9px 9px 0', backgroundColor: color, boxShadow: `0 0 8px ${hexToRgba(color, 0.5)}` }} />

        {/* Header: label + product */}
        <div style={{ opacity: headerOpacity * headerExit, marginBottom: 18 }}>
          {label && (
            <p style={{ fontSize: 28, fontWeight: 600, color, fontFamily: F.text, letterSpacing: '0.08em', textShadow: textDepth(0.3), margin: '0 0 4px 0' }}>
              {label}
            </p>
          )}
          <p style={{ fontSize: 36, fontWeight: 800, color: C.text, fontFamily: F.display, margin: 0, lineHeight: 1.2, textShadow: textDepth(0.3) }}>
            {product}
          </p>
        </div>

        {/* Tree items */}
        <div style={{ position: 'relative' }}>
          {/* Vertical connector lines (parent tree) */}
          {flatItems.map((fi, idx) => {
            if (fi.depth === 0) return null;
            // Find depth=0 ancestors to draw connector
            let ancestorIdx = fi.parentIndex;
            while (ancestorIdx >= 0 && flatItems[ancestorIdx]?.depth >= fi.depth) {
              ancestorIdx = flatItems[ancestorIdx].parentIndex;
            }
            const lineDelay = 8 + fi.depth * 10 + idx * 6;
            const lineFrame = Math.max(0, localFrame - lineDelay);
            const lineOpacity = interpolate(lineFrame, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div key={`line-${idx}`} style={{
                position: 'absolute',
                left: fi.depth * 40 + 12,
                top: 0,
                width: 2,
                height: 24,
                backgroundColor: 'rgba(255,255,255,0.08)',
                opacity: lineOpacity,
              }} />
            );
          })}

          {flatItems.map((fi, idx) => {
            const itemDelay = 8 + fi.depth * 10 + idx * 6;
            const itemFrame = Math.max(0, localFrame - itemDelay);
            const itemSpring = spring({ frame: itemFrame, fps, config: { damping: 22, stiffness: 85, mass: 1.1 } });
            const itemOpacity = isExiting
              ? interpolate(exitP, [(flatItems.length - 1 - idx) * 0.03, (flatItems.length - 1 - idx) * 0.03 + 0.12], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : interpolate(itemSpring, [0, 1], [0, 1]);
            const itemX = isExiting
              ? interpolate(exitP, [(flatItems.length - 1 - idx) * 0.02, (flatItems.length - 1 - idx) * 0.02 + 0.12], [0, -20], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : interpolate(itemSpring, [0, 1], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

            // Grade badge pop
            const gradeDelay = itemDelay + 4;
            const gradeFrame = Math.max(0, localFrame - gradeDelay);
            const gradeSpring = spring({ frame: gradeFrame, fps, config: { damping: 14, stiffness: 120, mass: 0.7 } });
            const gradeScale = gradeSpring > 1 ? 1 + (gradeSpring - 1) * 0.3 : gradeSpring;

            return (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginLeft: fi.depth * 40,
                marginBottom: fi.depth > 0 || idx === flatItems.length - 1 ? 8 : 8,
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
              }}>
                {/* Horizontal connector for sub-items */}
                {fi.depth > 0 && (
                  <div style={{
                    width: 16, height: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    flexShrink: 0,
                  }} />
                )}

                {/* Name */}
                <span style={{
                  fontSize: fi.depth === 0 ? 26 : 22,
                  fontWeight: fi.depth === 0 ? 700 : 500,
                  color: fi.depth === 0 ? C.text : C.textSecondary,
                  fontFamily: F.text,
                  lineHeight: 1.3,
                  flex: 1,
                }}>
                  {fi.component.name}
                </span>

                {/* English name */}
                {fi.component.enName && (
                  <span style={{
                    fontSize: 16, fontWeight: 400,
                    color: 'rgba(255,255,255,0.35)',
                    fontFamily: F.text, letterSpacing: '0.1em',
                  }}>
                    {fi.component.enName}
                  </span>
                )}

                {/* Brand */}
                {fi.component.brand && (
                  <span style={{
                    fontSize: 20, fontWeight: 400,
                    color: 'rgba(255,255,255,0.45)',
                    fontFamily: F.text,
                  }}>
                    {fi.component.brand}
                  </span>
                )}

                {/* Grade badge */}
                {fi.component.grade && (() => {
                  const gColor = gradeColor(fi.component.grade);
                  return (
                    <span style={{
                      fontSize: 18, fontWeight: 700,
                      color: gColor, fontFamily: F.mono,
                      padding: '3px 10px',
                      backgroundColor: hexToRgba(gColor, 0.12),
                      borderRadius: RADIUS.tag,
                      border: `1px solid ${hexToRgba(gColor, 0.3)}`,
                      transform: `scale(${gradeScale})`,
                      display: 'inline-block',
                      minWidth: 28, textAlign: 'center',
                    }}>
                      {fi.component.grade}
                    </span>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
