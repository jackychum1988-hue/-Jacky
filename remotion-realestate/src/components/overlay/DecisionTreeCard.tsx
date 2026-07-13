// DecisionTreeCard — 决策树卡 (v1)
// 结构: 根问题 → 分支节点(条件+结果) → 子分支递归
// 适用于: 买房决策树、产品选择指南、条件分支推荐

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, enFontSize, idleFloat } from './animation';

interface DecisionBranch {
  condition: string;
  result: string;
  subBranches?: DecisionBranch[];
}

interface DecisionTreeCardProps extends OverlayElementBase {
  question: string;
  branches: DecisionBranch[];
  color?: string;
  disableBreathing?: boolean;
}

// Recursive branch renderer — renders one level of the tree
const BranchLevel: React.FC<{
  branches: DecisionBranch[];
  color: string;
  localFrame: number;
  fps: number;
  depth: number;
  isExiting: boolean;
  exitP: number;
  siblingIndex: number;
}> = ({ branches, color, localFrame, fps, depth, isExiting, exitP, siblingIndex }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginLeft: depth * 36, marginTop: 8 }}>
      {branches.map((b, bi) => {
        const nodeDelay = 8 + depth * 12 + (siblingIndex + bi) * 10;
        const nodeFrame = Math.max(0, localFrame - nodeDelay);
        const nodeSpring = spring({ frame: nodeFrame, fps, config: { damping: 24, stiffness: 75, mass: 1.2 } });
        const nodeOpacity = isExiting
          ? interpolate(exitP, [0.05 + (branches.length - 1 - bi) * 0.04, 0.2 + (branches.length - 1 - bi) * 0.04], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          : interpolate(nodeSpring, [0, 1], [0, 1]);
        const nodeX = isExiting
          ? interpolate(exitP, [(branches.length - 1 - bi) * 0.03, (branches.length - 1 - bi) * 0.03 + 0.15], [0, 20], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          : interpolate(nodeSpring, [0, 1], [-20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

        // Connector line (draws down from parent)
        const lineDelay = nodeDelay;
        const lineFrame = Math.max(0, localFrame - lineDelay);
        const lineProgress = isExiting
          ? interpolate(exitP, [0, 0.3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          : interpolate(lineFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

        return (
          <div key={bi}>
            {/* Vertical connector line from parent */}
            <div style={{
              width: 2, height: 16,
              marginLeft: 14,
              backgroundColor: hexToRgba(color, 0.25),
              transform: `scaleY(${lineProgress})`,
              transformOrigin: 'top',
            }} />

            {/* Node row: condition tag → arrow → result */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              opacity: nodeOpacity, transform: `translateX(${nodeX}px)`,
              flexWrap: 'wrap',
            }}>
              {/* Horizontal connector */}
              <div style={{
                width: 20, height: 2,
                backgroundColor: hexToRgba(color, 0.3),
                flexShrink: 0,
              }} />

              {/* Condition (rounded tag) */}
              <span style={{
                fontSize: 26, fontWeight: 700, color,
                fontFamily: F.text, lineHeight: 1.3,
                padding: '8px 18px',
                backgroundColor: hexToRgba(color, 0.12),
                borderRadius: RADIUS.tag,
                border: `1.5px solid ${hexToRgba(color, 0.35)}`,
                whiteSpace: 'nowrap',
                textShadow: `0 0 12px ${hexToRgba(color, 0.3)}`,
              }}>
                {b.condition}
              </span>

              {/* Arrow */}
              <span style={{ fontSize: 22, color: hexToRgba(color, 0.5), fontFamily: F.mono, flexShrink: 0 }}>
                →
              </span>

              {/* Result */}
              <span style={{
                fontSize: 28, fontWeight: 600, color: C.text,
                fontFamily: F.text, lineHeight: 1.3,
                textShadow: textDepth(0.2),
              }}>
                {b.result}
              </span>
            </div>

            {/* Sub-branches (recursive) */}
            {b.subBranches && b.subBranches.length > 0 && (
              <BranchLevel
                branches={b.subBranches}
                color={color}
                localFrame={localFrame}
                fps={fps}
                depth={depth + 1}
                isExiting={isExiting}
                exitP={exitP}
                siblingIndex={bi}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const DecisionTreeCard: React.FC<DecisionTreeCardProps> = ({
  question,
  branches,
  color = '#10B981',
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

  // ── Question: 0-12f ──
  const qSpring = spring({ frame: Math.max(0, localFrame - 0), fps, config: { damping: 26, stiffness: 70, mass: 1.3 } });
  const qOpacity = isExiting ? interpolate(exitP, [0.4, 0.8], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(qSpring, [0, 1], [0, 1]);
  const qSpacing = isExiting ? interpolate(exitP, [0.1, 0.6], [-0.005, 0.06], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(qSpring, [0, 1], [0.06, -0.005]);

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
        padding: '36px 44px 32px 52px',
        backgroundColor: 'rgba(10,8,6,0.55)',
        borderRadius: 18,
        border: `1.5px solid ${hexToRgba(color, 0.45)}`,
        boxShadow: `0 0 32px ${hexToRgba(color, 0.18)}, 0 0 72px ${hexToRgba(color, 0.06)}, inset 0 1px 0 ${hexToRgba(color, 0.15)}, inset 0 -1px 0 rgba(0,0,0,0.3)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 9, bottom: 9, width: 5, borderRadius: '0 9px 9px 0', backgroundColor: color, boxShadow: `0 0 8px ${hexToRgba(color, 0.5)}` }} />

        {/* Root question */}
        <div style={{
          opacity: qOpacity,
          letterSpacing: `${qSpacing.toFixed(3)}em`,
          marginBottom: 8,
        }}>
          <p style={{
            fontSize: 36, fontWeight: 800, color: C.text,
            fontFamily: F.display, margin: 0, lineHeight: 1.25,
            textShadow: textDepth(0.3),
          }}>
            {question}
          </p>
        </div>

        {/* Tree branches */}
        <BranchLevel
          branches={branches}
          color={color}
          localFrame={localFrame}
          fps={fps}
          depth={0}
          isExiting={isExiting}
          exitP={exitP}
          siblingIndex={0}
        />
      </div>
    </div>
  );
};
