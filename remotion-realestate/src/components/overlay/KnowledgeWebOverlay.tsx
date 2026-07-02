// KnowledgeWebOverlay — 知识网络图 (v1 overlay adapter)
// SVG: 中心节点 + 环绕节点(圆形) + SVG连线
// 简化自 new/KnowledgeWeb，去粒子背景，适配透明叠加

import React, { useRef } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, idleFloat } from './animation';

interface WebNode {
  id: string;
  label: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

interface WebConnection {
  from: string;
  to: string;
  label?: string;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

interface KnowledgeWebOverlayProps extends OverlayElementBase {
  label?: string;
  centerNode: WebNode;
  surroundingNodes: WebNode[];
  connections: WebConnection[];
  color?: string;
  disableBreathing?: boolean;
}

const NODE_COLORS = ['#FF4136', '#F5A623', '#10B981', '#06B6D4', '#8B5CF6', '#1A56DB'];

export const KnowledgeWebOverlay: React.FC<KnowledgeWebOverlayProps> = ({
  label,
  centerNode,
  surroundingNodes,
  connections,
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
  const SVG_W = 440, SVG_H = 420, CX = 220, CY = 210, ORBIT_R = 145;

  // ── Label: 0-12f ──
  const labelOpacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelExit = isExiting ? interpolate(exitP, [0.5, 0.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // ── Center node: 8-20f ──
  const centerSpring = spring({ frame: Math.max(0, localFrame - 8), fps, config: { damping: 24, stiffness: 75, mass: 1.2 } });
  const centerScale = isExiting ? interpolate(exitP, [0.2, 0.6], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(centerSpring, [0, 1], [0, 1]);

  // ── Idle float ──
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.4, 0.022);

  // Position surrounding nodes in circle
  const surrPositions = surroundingNodes.map((_, i) => {
    const angle = (i / surroundingNodes.length) * 2 * Math.PI - Math.PI / 2;
    return {
      x: CX + ORBIT_R * Math.cos(angle),
      y: CY + ORBIT_R * Math.sin(angle),
    };
  });

  const nodeMap = new Map<string, { pos: { x: number; y: number }; isCenter: boolean; index: number }>();
  nodeMap.set(centerNode.id, { pos: { x: CX, y: CY }, isCenter: true, index: -1 });
  surroundingNodes.forEach((n, i) => nodeMap.set(n.id, { pos: surrPositions[i], isCenter: false, index: i }));

  const dashMap: Record<string, string> = { solid: '', dashed: '6,4', dotted: '2,4' };

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
        padding: '36px 32px 28px 40px',
        backgroundColor: 'rgba(10,8,6,0.55)',
        borderRadius: 18,
        border: `1.5px solid ${hexToRgba(color, 0.45)}`,
        boxShadow: `0 0 32px ${hexToRgba(color, 0.18)}, 0 0 72px ${hexToRgba(color, 0.06)}, inset 0 1px 0 ${hexToRgba(color, 0.15)}, inset 0 -1px 0 rgba(0,0,0,0.3)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 9, bottom: 9, width: 5, borderRadius: '0 9px 9px 0', backgroundColor: color, boxShadow: `0 0 8px ${hexToRgba(color, 0.5)}` }} />

        {label && (
          <p style={{ fontSize: 36, fontWeight: 600, color, fontFamily: F.text, letterSpacing: '0.08em', textShadow: textDepth(0.3), margin: '0 0 12px 0', textAlign: 'center', opacity: labelOpacity * labelExit }}>
            {label}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
            {/* Connections — center-to-surrounding first, then inter-node */}
            {connections.map((conn, ci) => {
              const from = nodeMap.get(conn.from);
              const to = nodeMap.get(conn.to);
              if (!from || !to) return null;

              const isCenterConn = from.isCenter || to.isCenter;
              const connDelay = isCenterConn ? (14 + ci * 6) : (22 + ci * 10);
              const connFrame = Math.max(0, localFrame - connDelay);
              const connProgress = isExiting
                ? interpolate(exitP, [(connections.length - 1 - ci) * 0.03, (connections.length - 1 - ci) * 0.03 + 0.15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : interpolate(connFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

              const dx = to.pos.x - from.pos.x;
              const dy = to.pos.y - from.pos.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const mx = (from.pos.x + to.pos.x) / 2;
              const my = (from.pos.y + to.pos.y) / 2;
              const cColor = conn.color || 'rgba(255,255,255,0.3)';
              const dash = dashMap[conn.style || 'solid'];

              return (
                <g key={ci} opacity={connProgress}>
                  <line x1={from.pos.x} y1={from.pos.y} x2={to.pos.x} y2={to.pos.y}
                    stroke={hexToRgba(cColor, 0.4)} strokeWidth={isCenterConn ? 2 : 1.5}
                    strokeDasharray={dash ? dash : undefined}
                    strokeDashoffset={dash ? undefined : (1 - connProgress) * dist}
                  />
                  {conn.label && connProgress > 0.6 && (
                    <text x={mx} y={my - 8} fill="rgba(255,255,255,0.5)" fontSize={16} fontWeight={500}
                      fontFamily={F.text} textAnchor="middle">
                      {conn.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Center node */}
            <g transform={`translate(${CX}, ${CY}) scale(${centerScale})`} opacity={centerSpring}>
              <circle cx={0} cy={0} r={40}
                fill={hexToRgba(color, 0.2)}
                stroke={color} strokeWidth={3}
              />
              <text x={0} y={5} fill={C.text} fontSize={22} fontWeight={800}
                fontFamily={F.text} textAnchor="middle">
                {centerNode.label.length > 6 ? centerNode.label.slice(0, 6) + '…' : centerNode.label}
              </text>
            </g>

            {/* Surrounding nodes */}
            {surroundingNodes.map((sn, sni) => {
              const sp = surrPositions[sni];
              const nodeDelay = 18 + sni * 8;
              const nodeFrame = Math.max(0, localFrame - nodeDelay);
              const nodeSpring = spring({ frame: nodeFrame, fps, config: { damping: 24, stiffness: 75, mass: 1.2 } });
              const nodeScale = isExiting
                ? interpolate(exitP, [(surroundingNodes.length - 1 - sni) * 0.04, (surroundingNodes.length - 1 - sni) * 0.04 + 0.2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : interpolate(nodeSpring, [0, 1], [0, 1]);
              const nColor = sn.color || NODE_COLORS[sni % NODE_COLORS.length];
              const r = sn.size === 'large' ? 30 : sn.size === 'small' ? 20 : 25;

              return (
                <g key={sni} transform={`translate(${sp.x}, ${sp.y}) scale(${nodeScale})`} opacity={nodeSpring}>
                  <circle cx={0} cy={0} r={r}
                    fill={hexToRgba(nColor, 0.12)}
                    stroke={nColor} strokeWidth={2}
                  />
                  <text x={0} y={4} fill={C.textSecondary} fontSize={16} fontWeight={600}
                    fontFamily={F.text} textAnchor="middle">
                    {sn.label.length > 5 ? sn.label.slice(0, 5) + '…' : sn.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
