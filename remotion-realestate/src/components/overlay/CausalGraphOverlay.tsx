// CausalGraphOverlay — 因果关系图 (v1 overlay adapter)
// SVG: 节点圆形布局 + 彩色连线(按类型着色)
// 简化自 new/CausalGraph，去粒子背景，适配透明叠加

import React, { useRef } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, enFontSize, idleFloat } from './animation';

interface CausalNode {
  id: string;
  label: string;
  color?: string;
}

interface CausalEdge {
  from: string;
  to: string;
  label: string;
  type?: 'cause' | 'fix' | 'leadsTo' | 'related';
}

interface CausalGraphOverlayProps extends OverlayElementBase {
  label?: string;
  nodes: CausalNode[];
  edges: CausalEdge[];
  color?: string;
  disableBreathing?: boolean;
}

const EDGE_COLORS: Record<string, string> = {
  cause: '#FF4136',
  fix: '#10B981',
  leadsTo: '#F5A623',
  related: '#06B6D4',
};

const NODE_COLORS = ['#FF4136', '#1A56DB', '#10B981', '#F5A623', '#8B5CF6', '#06B6D4'];

export const CausalGraphOverlay: React.FC<CausalGraphOverlayProps> = ({
  label,
  nodes,
  edges,
  color = '#FF4136',
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
  const SVG_W = 440, SVG_H = 400, CX = 220, CY = 200, RADIUS_CIRCLE = 150;

  // ── Label: 0-12f ──
  const labelOpacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelExit = isExiting ? interpolate(exitP, [0.5, 0.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // ── Idle float ──
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.4, 0.022);

  // Auto-position nodes in a circle
  const nodePositions = nodes.map((_, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    return {
      x: CX + RADIUS_CIRCLE * Math.cos(angle),
      y: CY + RADIUS_CIRCLE * Math.sin(angle),
    };
  });

  const nodeMap = new Map(nodes.map((n, i) => [n.id, { node: n, pos: nodePositions[i], index: i }]));

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
            <defs>
              {edges.map((_, ei) => (
                <linearGradient key={ei} id={`cg-edge-${uid}-${ei}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="50%" stopColor={EDGE_COLORS[_.type || 'related'] || 'rgba(255,255,255,0.4)'} />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              ))}
            </defs>

            {/* Edges */}
            {edges.map((edge, ei) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);
              if (!from || !to) return null;

              const edgeDelay = 16 + ei * 8;
              const edgeFrame = Math.max(0, localFrame - edgeDelay);
              const edgeProgress = isExiting
                ? interpolate(exitP, [(edges.length - 1 - ei) * 0.03, (edges.length - 1 - ei) * 0.03 + 0.15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : interpolate(edgeFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

              const dx = to.pos.x - from.pos.x;
              const dy = to.pos.y - from.pos.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const mx = (from.pos.x + to.pos.x) / 2;
              const my = (from.pos.y + to.pos.y) / 2;

              const eColor = EDGE_COLORS[edge.type || 'related'] || 'rgba(255,255,255,0.4)';

              return (
                <g key={ei} opacity={edgeProgress}>
                  <line x1={from.pos.x} y1={from.pos.y} x2={to.pos.x} y2={to.pos.y}
                    stroke={hexToRgba(eColor, 0.5)} strokeWidth={2}
                    strokeDasharray={dist} strokeDashoffset={(1 - edgeProgress) * dist}
                  />
                  {/* Arrow at midpoint */}
                  {edgeProgress > 0.6 && (
                    <text x={mx} y={my - 10} fill={eColor} fontSize={18} fontWeight={600}
                      fontFamily={F.text} textAnchor="middle">
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node, ni) => {
              const np = nodePositions[ni];
              const nodeDelay = 6 + ni * 10;
              const nodeFrame = Math.max(0, localFrame - nodeDelay);
              const nodeSpring = spring({ frame: nodeFrame, fps, config: { damping: 24, stiffness: 75, mass: 1.2 } });
              const nodeScale = isExiting
                ? interpolate(exitP, [(nodes.length - 1 - ni) * 0.04, (nodes.length - 1 - ni) * 0.04 + 0.2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : interpolate(nodeSpring, [0, 1], [0, 1]);
              const nColor = node.color || NODE_COLORS[ni % NODE_COLORS.length];
              const nodeR = 36;

              return (
                <g key={ni} transform={`translate(${np.x}, ${np.y}) scale(${nodeScale})`} opacity={nodeSpring}>
                  <circle cx={0} cy={0} r={nodeR}
                    fill={hexToRgba(nColor, 0.15)}
                    stroke={nColor} strokeWidth={2.5}
                  />
                  <text x={0} y={-4} fill={C.text} fontSize={20} fontWeight={700}
                    fontFamily={F.text} textAnchor="middle">
                    {node.label.length > 6 ? node.label.slice(0, 6) + '…' : node.label}
                  </text>
                  {node.label.length > 6 && (
                    <text x={0} y={18} fill={C.textSecondary} fontSize={14} fontWeight={500}
                      fontFamily={F.text} textAnchor="middle">
                      {node.label.slice(6)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
