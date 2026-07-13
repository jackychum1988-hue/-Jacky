// DefinitionCard — 知识定义卡 (v1)
// 结构: 分类标签 → 大术语 + 图标 → 定义正文 → 英文对照
// 适用于: 术语解释、百科卡片、教育科普

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, enFontSize, idleFloat } from './animation';
import { ICON_MAP } from './iconMap';

interface DefinitionCardProps extends OverlayElementBase {
  term: string;
  definition: string;
  enTerm?: string;
  enDefinition?: string;
  icon?: string;
  category?: string;
  color?: string;
  /** Disable Apple-style idle breathing/float when true */
  disableBreathing?: boolean;
}

export const DefinitionCard: React.FC<DefinitionCardProps> = ({
  term,
  definition,
  enTerm,
  enDefinition,
  icon,
  category,
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

  // ── Category badge: 0-12f ──
  const catOpacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const catExit = isExiting ? interpolate(exitP, [0.6, 0.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // ── Icon bounce: 4-16f ──
  const iconSpring = spring({ frame: Math.max(0, localFrame - 4), fps, config: { damping: 14, stiffness: 120, mass: 0.7 } });
  const iconScale = isExiting ? interpolate(exitP, [0.2, 0.5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(iconSpring, [0, 1], [0, 1.12]);
  const iconFinalScale = isExiting ? iconScale : (iconScale > 1 ? 1 + (iconScale - 1) * 0.3 : iconScale);

  // ── Term: 6-20f letter-spacing settle ──
  const termSpring = spring({ frame: Math.max(0, localFrame - 6), fps, config: { damping: 26, stiffness: 70, mass: 1.3 } });
  const termOpacity = isExiting ? interpolate(exitP, [0.3, 0.7], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(termSpring, [0, 1], [0, 1]);
  const termSpacing = isExiting ? interpolate(exitP, [0.1, 0.6], [-0.005, 0.06], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(termSpring, [0, 1], [0.06, -0.005]);

  // ── Definition body: 12-28f ──
  const defOpacity = interpolate(localFrame, [12, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const defExit = isExiting ? interpolate(exitP, [0, 0.35], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // ── English: 16-32f ──
  const enOpacity = interpolate(localFrame, [16, 32], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const enExit = isExiting ? interpolate(exitP, [0, 0.25], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // ── Idle float ──
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.5, 0.022);

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

        {/* Category badge */}
        {category && (
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            backgroundColor: hexToRgba(color, 0.12),
            borderRadius: RADIUS.tag,
            border: `1px solid ${hexToRgba(color, 0.25)}`,
            marginBottom: 16,
            opacity: catOpacity * catExit,
          }}>
            <span style={{ fontSize: 22, fontWeight: 600, color, fontFamily: F.text, letterSpacing: '0.06em' }}>
              {category}
            </span>
          </div>
        )}

        {/* Icon + Term row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          {icon && ICON_MAP[icon] && (
            <div style={{
              opacity: iconSpring,
              transform: `scale(${iconFinalScale})`,
              flexShrink: 0,
            }}>
              {React.createElement(ICON_MAP[icon], { size: 52, color, strokeWidth: 2.5 })}
            </div>
          )}
          <h2 style={{
            fontSize: 48,
            fontWeight: 800,
            color,
            fontFamily: F.display,
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: `${termSpacing.toFixed(3)}em`,
            opacity: termOpacity,
            textShadow: `0 0 24px ${hexToRgba(color, 0.4)}`,
          }}>
            {term}
          </h2>
        </div>

        {/* English term */}
        {enTerm && (
          <p style={{
            fontSize: enFontSize(48),
            fontWeight: 400,
            color: 'rgba(255,255,255,0.5)',
            fontFamily: F.text,
            letterSpacing: '0.1em',
            margin: '0 0 16px 0',
            opacity: enOpacity * enExit,
            lineHeight: 1.2,
          }}>
            {enTerm}
          </p>
        )}

        {/* Definition body */}
        <div style={{ opacity: defOpacity * defExit }}>
          <p style={{
            fontSize: 28,
            fontWeight: 500,
            color: C.textSecondary,
            fontFamily: F.text,
            lineHeight: 1.6,
            margin: 0,
            textShadow: textDepth(0.15),
          }}>
            {definition}
          </p>
          {enDefinition && (
            <p style={{
              fontSize: enFontSize(28),
              fontWeight: 400,
              color: 'rgba(255,255,255,0.5)',
              fontFamily: F.text,
              letterSpacing: '0.1em',
              lineHeight: 1.4,
              margin: '10px 0 0 0',
            }}>
              {enDefinition}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
