// HookCard — TwoLineCard 模式 (zhuzige)
// 彩色小标签 + 纯白大字冲击 + 英文对照
// 复用: Hook / Pivot 两个场景

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, V, C, F, textDepth, breathingScale, idleFloat, hexToRgba, OverlayElementBase, splitByHighlights, HighlightWord, EmphasisLevel, EMPHASIS_CONFIGS, popScaleValue, reservedPadding } from './animation';
import { ICON_MAP } from './iconMap';

// 标题逐词延迟：每个词延迟 staggerFrames 帧（3-5帧），增加戏剧张力
const STAGGER_FRAMES = 4;

interface HookCardProps extends OverlayElementBase {
  label: string;
  headline: string;
  enText?: string;
  icon?: string;
  color?: string;
  subline?: string;
  /** Override word stagger delay (default 4 frames). Higher = slower reveal. */
  staggerFrames?: number;
  /** When set, split subline by this separator and stagger each segment. */
  sublineSeparator?: string;
  /** Keywords to highlight with kinetic pop animation (scale + color change) */
  highlights?: HighlightWord[];
}

export const HookCard: React.FC<HookCardProps> = ({
  label,
  headline,
  enText,
  icon,
  color = V[2],
  subline,
  staggerFrames = STAGGER_FRAMES,
  sublineSeparator,
  highlights,
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
  const isExiting = anim.phase === 'exit';
  const exitP = anim.phaseProgress;

  const springIn = spring({
    frame: frame - enterAt,
    fps,
    config: { damping: 30, stiffness: 70, mass: 1.3 },
  });
  const scale = isExiting
    ? interpolate(exitP, [0, 1], [1, 0.95], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(springIn, [0, 1], [0.95, 1]);
  const opacity = isExiting
    ? interpolate(exitP, [0.3, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(springIn, [0, 1], [0, 1]);

  // Icon bounce — enters with overshoot, exits with shrink
  const iconSpring = spring({
    frame: Math.max(0, frame - enterAt - 2),
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.7 },
  });
  const iconScale = isExiting
    ? interpolate(exitP, [0, 0.4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(iconSpring, [0, 1], [0, 1.2]);
  const iconFinalScale = iconScale > 1 ? 1 + (iconScale - 1) * 0.3 : iconScale;

  const headlineDelay = spring({
    frame: Math.max(0, frame - enterAt - 12),
    fps,
    config: { damping: 28, stiffness: 70, mass: 1.3 },
  });

  // 动态字间距：入场时从宽松→正常（"呼吸"感）→ exit: tighten back
  const dynamicLetterSpacing = isExiting
    ? interpolate(exitP, [0.1, 0.6], [-0.02, 0.04], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(headlineDelay, [0, 1], [0.04, -0.02]);
  // label letterSpacing 同理
  const labelLetterSpacing = isExiting
    ? interpolate(exitP, [0.1, 0.5], [0.08, 0.12], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(springIn, [0, 1], [0.12, 0.08]);

  // Kinetic typography: split headline by highlights for keyword pop
  // Defaults driven by emphasis level (pop/pulse/stamp) from EMPHASIS_CONFIGS

  const headlineSegments = highlights && highlights.length > 0
    ? splitByHighlights(headline, highlights)
    : null;

  // Pre-compute word offsets per segment for stagger timing
  let wordOffset = 0;
  const segWordOffsets = headlineSegments
    ? headlineSegments.map(seg => {
        const o = wordOffset;
        wordOffset += seg.text.split(' ').filter(Boolean).length;
        return o;
      })
    : null;
  const totalWords = wordOffset;

  // Idle breathing
  const floatY = idleFloat(frame, 1.5, 0.022);
  const labelBreath = breathingScale(frame);

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
        overflow: 'hidden',
      }}
    >
      <div style={{ opacity: anim.opacity * opacity, transform: `scale(${scale}) translateY(${floatY}px)`, maxWidth: posStyle.maxWidth, width: '100%' }}>
        {icon && ICON_MAP[icon] && (
          <div style={{
            marginBottom: 16,
            opacity: isExiting ? interpolate(exitP, [0, 0.4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : iconSpring,
            transform: `scale(${iconFinalScale})`,
          }}>
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
            textShadow: textDepth(0.3),  margin: '0 0 12px 0',
            transform: `scale(${labelBreath})`,
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
            lineHeight: 1.05,
            opacity: isExiting ? interpolate(exitP, [0.15, 0.55], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : headlineDelay,
            transform: `scale(${(0.95 + headlineDelay * 0.05) * breathingScale(frame)})`,
            textShadow: textDepth(0.5),
            margin: 0,
          }}
        >
          {headlineSegments ? (
            // Highlight-based kinetic typography
            headlineSegments.map((seg, si) => {
              const segWords = seg.text.split(' ').filter(Boolean);
              const wordIdx = segWordOffsets![si];

              if (seg.highlight) {
                // Emphasis-driven kinetic pop
                const emphasis = EMPHASIS_CONFIGS[seg.highlight.emphasis ?? 'pop'];
                const hScale = seg.highlight.scale ?? emphasis.scale;
                const hDelay = seg.highlight.delay ?? 14;
                const hColor = seg.highlight.color || color;

                const popFrame = Math.max(0, frame - enterAt - 12 - wordIdx * staggerFrames - hDelay);
                const popSpring = spring({ frame: popFrame, fps, config: emphasis.spring });
                const popScale = popScaleValue(popSpring, hScale);

                // stamp: fontWeight snaps to emphasis.weight (900) during spring overshoot
                const hWeight = emphasis.weight != null
                  ? popSpring > 1 ? emphasis.weight : 800
                  : undefined;

                // pulse: sin-based glow breathing instead of scale pop
                const breathingGlow = emphasis === EMPHASIS_CONFIGS.pulse
                  ? emphasis.glow * (1 + Math.sin(frame * 0.06) * 0.3)
                  : emphasis.glow;

                // Opacity enter: appears with its stagger position
                const segFrame = Math.max(0, frame - enterAt - 12 - wordIdx * staggerFrames);
                const segOpacityEnter = interpolate(segFrame, [0, 8], [0, 1], {
                  extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                });
                // Exit: reverse stagger
                const revSegIdx = headlineSegments.length - 1 - si;
                const segOpacityExit = isExiting
                  ? interpolate(exitP, [revSegIdx * 0.04, revSegIdx * 0.04 + 0.15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                  : 1;
                const segOpacity = isExiting ? segOpacityEnter * segOpacityExit : segOpacityEnter;

                // Exit: scale back to 1, lose glow
                const exitPopScale = isExiting
                  ? interpolate(exitP, [revSegIdx * 0.04, revSegIdx * 0.04 + 0.15], [popScale, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                  : popScale;

                return (
                  <span key={si} style={{
                    opacity: segOpacity,
                    color: hColor,
                    transform: `scale(${exitPopScale})`,
                    display: 'inline-block',
                    padding: reservedPadding(hScale),
                    fontWeight: hWeight ?? undefined,
                    textShadow: `${textDepth(0.5)}, 0 0 24px ${hexToRgba(hColor, 0.45 * breathingGlow * (isExiting ? 1 - exitP : 1))}`,
                  }}>
                    {seg.text}
                    {si < headlineSegments.length - 1 && !headlineSegments[si + 1].text.startsWith(' ') ? ' ' : ''}
                  </span>
                );
              }

              // Normal segment — word-by-word stagger
              return segWords.map((w, wi) => {
                const wordFrame = Math.max(0, frame - enterAt - 12 - (wordIdx + wi) * staggerFrames);
                const wordOpacityEnter = interpolate(wordFrame, [0, 8], [0, 1], {
                  extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                });
                const revWi = totalWords - 1 - (wordIdx + wi);
                const wordOpacityExit = isExiting
                  ? interpolate(exitP, [revWi * 0.04, revWi * 0.04 + 0.15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                  : 1;
                const wordOpacity = isExiting ? wordOpacityEnter * wordOpacityExit : wordOpacityEnter;
                return (
                  <span key={`${si}-${wi}`} style={{ opacity: wordOpacity, display: 'inline-block', color: C.textSecondary }}>
                    {w}
                    {wi < segWords.length - 1 ? ' ' : ''}
                  </span>
                );
              });
            })
          ) : (
            // Original word stagger (no highlights)
            (() => {
              const words = headline.split(' ');
              return words.map((word, wi) => {
                const wordFrame = frame - enterAt - 12 - wi * staggerFrames;
                const wordOpacityEnter = interpolate(wordFrame, [0, 8], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                const revWi = words.length - 1 - wi;
                const wordOpacityExit = isExiting
                  ? interpolate(exitP, [revWi * 0.04, revWi * 0.04 + 0.15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                  : 1;
                const wordOpacity = isExiting ? wordOpacityEnter * wordOpacityExit : wordOpacityEnter;
                return (
                  <span key={wi} style={{ opacity: wordOpacity, display: 'inline-block' }}>
                    {word}
                    {wi < words.length - 1 ? ' ' : ''}
                  </span>
                );
              });
            })()
          )}
        </h1>
        {enText && (
          <p
            style={{
              fontSize: 24,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.5)',
              fontFamily: F.text,
              letterSpacing: '0.1em',
              lineHeight: 1.2,
              margin: '12px 0 0 0',
              opacity: isExiting ? interpolate(exitP, [0, 0.3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : headlineDelay,
            }}
          >
            {enText}
          </p>
        )}
        {subline && (() => {
          const sublineBaseStyle: React.CSSProperties = {
            fontSize: 28,
            fontWeight: 500,
            color: C.textSecondary,
            fontFamily: F.text,
            lineHeight: 1.4,
            margin: '16px 0 0 0',
            maxWidth: 700,
            transform: `scale(${breathingScale(frame)})`,
          };
          // Staggered segments by separator (e.g. "+" for cost breakdown)
          if (sublineSeparator) {
            const segments = subline.split(sublineSeparator).map(s => s.trim());
            return (
              <p style={sublineBaseStyle}>
                {segments.map((seg, si) => {
                  const segFrame = Math.max(0, frame - enterAt - 16 - si * 8);
                  const segOpacityEnter = interpolate(segFrame, [0, 12], [0, 1], {
                    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                  });
                  const revSi = segments.length - 1 - si;
                  const segOpacityExit = isExiting
                    ? interpolate(exitP, [revSi * 0.03, revSi * 0.03 + 0.12], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                    : 1;
                  const segOpacity = isExiting ? segOpacityEnter * segOpacityExit : segOpacityEnter;
                  return (
                    <React.Fragment key={si}>
                      <span style={{ opacity: segOpacity }}>{seg}</span>
                      {si < segments.length - 1 ? ` ${sublineSeparator} ` : ''}
                    </React.Fragment>
                  );
                })}
              </p>
            );
          }
          // Default: single paragraph fade
          return (
            <p style={{
              ...sublineBaseStyle,
              opacity: isExiting ? interpolate(exitP, [0, 0.25], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : headlineDelay,
            }}>
              {subline}
            </p>
          );
        })()}
      </div>
    </div>
  );
};
