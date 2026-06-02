// HookCard — TwoLineCard 模式 (zhuzige)
// 彩色小标签 + 纯白大字冲击 + 英文对照
// 复用: Hook / Pivot 两个场景

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, V, C, F, textGlow, breathingScale, OverlayElementBase } from './animation';
import { ICON_MAP } from './iconMap';
import { ColoredAmbience } from './ColoredAmbience';

// 标题逐词延迟：每个词延迟 staggerFrames 帧（3-5帧），增加戏剧张力
const STAGGER_FRAMES = 4;

interface HookCardProps extends OverlayElementBase {
  label: string;
  headline: string;
  enText?: string;
  icon?: string;
  color?: string;
  subline?: string;
}

export const HookCard: React.FC<HookCardProps> = ({
  label,
  headline,
  enText,
  icon,
  color = V[2],
  subline,
  enterAt,
  exitAt,
  animation,
  position,
  offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });

  if (!anim.isVisible) return null;

  const posStyle = positionToStyle(position, offset);

  const springIn = spring({
    frame: frame - enterAt,
    fps,
    config: { damping: 30, stiffness: 70, mass: 1.3 },
  });
  const scale = interpolate(springIn, [0, 1], [0.95, 1]);
  const opacity = interpolate(springIn, [0, 1], [0, 1]);

  const headlineDelay = spring({
    frame: frame - enterAt - 12,
    fps,
    config: { damping: 28, stiffness: 70, mass: 1.3 },
  });

  // 动态字间距：入场时从宽松→正常（"呼吸"感）
  const dynamicLetterSpacing = interpolate(headlineDelay, [0, 1], [0.04, -0.02]);
  // label letterSpacing 同理
  const labelLetterSpacing = interpolate(springIn, [0, 1], [0.12, 0.08]);

  // 逐词延迟：拆分 headline，每个词 stagger 3-5 帧
  const words = headline.split(' ');

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: posStyle.display,
        justifyContent: posStyle.justifyContent,
        alignItems: posStyle.alignItems,
        padding: posStyle.padding,
        transform: posStyle.transform,
        pointerEvents: 'none',
      }}
    >
      <div style={{ opacity: anim.opacity * opacity, transform: `scale(${scale})` }}>
        <ColoredAmbience color={color} />
        {icon && ICON_MAP[icon] && (
          <div style={{ marginBottom: 16 }}>
            {React.createElement(ICON_MAP[icon], { size: 56, color, strokeWidth: 2 })}
          </div>
        )}
        <p
          style={{
            fontSize: 36,
            fontWeight: 600,
            color,
            fontFamily: F.text,
            letterSpacing: `${labelLetterSpacing.toFixed(3)}em`,
            lineHeight: 1.3,
            textShadow: textGlow(color, 0.3),  margin: '0 0 12px 0',
          }}
        >
          {label}
        </p>
        <h1
          style={{
            fontSize: 88,
            fontWeight: 800,
            color: C.text,
            fontFamily: F.display,
            letterSpacing: `${dynamicLetterSpacing.toFixed(3)}em`,
            lineHeight: 1.15,
            opacity: headlineDelay,
            transform: `scale(${(0.95 + headlineDelay * 0.05) * breathingScale(frame)})`,
            textShadow: textGlow(color, 0.5),
            margin: 0,
          }}
        >
          {words.map((word, wi) => {
            const wordFrame = frame - enterAt - 12 - wi * STAGGER_FRAMES;
            const wordOpacity = interpolate(wordFrame, [0, 8], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <span key={wi} style={{ opacity: wordOpacity, display: 'inline-block' }}>
                {word}
                {wi < words.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </h1>
        {enText && (
          <p
            style={{
              fontSize: 22,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.6)',
              fontFamily: F.text,
              letterSpacing: '0.1em',
              lineHeight: 1.2,
              margin: '12px 0 0 0',
              opacity: headlineDelay,
            }}
          >
            {enText}
          </p>
        )}
        {subline && (
          <p
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: C.textSecondary,
              fontFamily: F.text,
              lineHeight: 1.4,
              margin: '16px 0 0 0',
              opacity: headlineDelay,
              maxWidth: 700,
            }}
          >
            {subline}
          </p>
        )}
      </div>
    </div>
  );
};
