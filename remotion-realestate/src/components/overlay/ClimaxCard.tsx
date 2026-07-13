// ClimaxCard — PunchLineBox 模式 (zhuzige)
// v10: 字间距从宽松→紧凑收束 + 署名延迟淡入 + 框体弹性入场
// 复用: Climax 场景

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, breathingScale, idleFloat, hexToRgba, OverlayElementBase, splitByHighlights, HighlightWord, EMPHASIS_CONFIGS, popScaleValue, reservedPadding } from './animation';
import { ICON_MAP } from './iconMap';
import { PunchLineBox } from '../new/PunchLineBox';

interface ClimaxCardProps extends OverlayElementBase {
  label?: string;
  icon?: string;
  text: string;
  enText?: string;
  color?: string;
  author?: string;
  /** Keywords to highlight with kinetic pop animation */
  highlights?: HighlightWord[];
  /** Disable Apple-style idle breathing/float when true */
  disableBreathing?: boolean;
}

export const ClimaxCard: React.FC<ClimaxCardProps> = ({
  label,
  icon,
  text,
  enText,
  color = '#C0392B',
  author,
  highlights,
  disableBreathing = false,
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
  const localFrame = Math.max(0, frame - enterAt);
  const isExiting = anim.phase === 'exit';
  const exitP = anim.phaseProgress;

  // Label spring — enters first, exits last
  const labelSpring = spring({
    frame: localFrame, fps,
    config: { damping: 28, stiffness: 70, mass: 1.3 },
  });
  const labelOpacity = isExiting
    ? interpolate(exitP, [0.5, 0.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : labelSpring;

  // Icon bounce — exit: shrink
  const iconSpring = spring({
    frame: Math.max(0, localFrame - 4), fps,
    config: { damping: 14, stiffness: 120, mass: 0.7 },
  });
  const iconScaleRaw = isExiting
    ? interpolate(exitP, [0.2, 0.6], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : Math.min(iconSpring > 1 ? 1 + (iconSpring - 1) * 0.3 : iconSpring, 1.15);

  // Text box spring — exit: scale down + fade
  const boxSpring = spring({
    frame: Math.max(0, localFrame - 10), fps,
    config: { damping: 20, stiffness: 80, mass: 1.2 },
  });
  const boxOpacity = isExiting
    ? interpolate(exitP, [0.15, 0.55], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : boxSpring;
  const boxScale = isExiting
    ? interpolate(exitP, [0, 0.5], [1, 0.95], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

  // Letter-spacing — exit: tighten back to wide
  const letterSpacing = isExiting
    ? interpolate(exitP, [0.1, 0.6], [-0.02, 0.08], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(boxSpring, [0, 1], [0.08, -0.02]);

  // Author — exits first (appears last, disappears first)
  const authorSpring = spring({
    frame: Math.max(0, localFrame - 30), fps,
    config: { damping: 30, stiffness: 65, mass: 1.5 },
  });
  const authorOpacity = isExiting
    ? interpolate(exitP, [0, 0.3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(authorSpring, [0, 1], [0, 1]);
  const authorY = isExiting
    ? interpolate(exitP, [0, 0.3], [0, 12], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(authorSpring, [0, 1], [12, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Color intensity pulse — now wired into PunchLineBox border glow
  const colorPulse = 1 + Math.sin(frame * 0.05) * 0.08;

  // Idle floating
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.6, 0.023);

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
      <div style={{
        opacity: anim.opacity,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        transform: `scale(${(disableBreathing ? 1 : breathingScale(frame)) * boxScale}) translateY(${floatY}px)`,
        alignItems: 'center',
        maxWidth: posStyle.maxWidth,
      }}>
        {/* Label with breathing color glow */}
        {label && (
          <p style={{
            fontSize: 36, fontWeight: 600, color, fontFamily: F.text,
            letterSpacing: '0.08em', lineHeight: 1.3,
            textShadow: `${textDepth(0.3)}, 0 0 ${Math.round(16 * colorPulse)}px ${hexToRgba(color, 0.3 * colorPulse)}`,
            margin: 0,
            opacity: labelOpacity,
          }}>
            {label}
          </p>
        )}

        {/* Icon with bounce */}
        {icon && ICON_MAP[icon] && (
          <div style={{
            opacity: isExiting ? interpolate(exitP, [0.2, 0.5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : iconSpring,
            transform: `scale(${iconScaleRaw})`,
          }}>
            {React.createElement(ICON_MAP[icon], { size: 56, color, strokeWidth: 2.5 })}
          </div>
        )}

        {/* PunchLineBox with dynamic letter-spacing */}
        <div style={{
          opacity: boxOpacity,
          letterSpacing: `${letterSpacing.toFixed(3)}em`,
        }}>
          <PunchLineBox color={color} fontSize={68}>
            {(() => {
              const lines = text.split('\n');
              return lines.map((line, li) => (
                <React.Fragment key={li}>
                  {li > 0 && <br />}
                  {highlights && highlights.length > 0 ? (() => {
                    // Emphasis-driven kinetic pop — supports pop/pulse/stamp levels
                    const lineSegments = splitByHighlights(line, highlights);
                    return lineSegments.map((seg, si) => {
                      if (seg.highlight) {
                        const emphasis = EMPHASIS_CONFIGS[seg.highlight.emphasis ?? 'pop'];
                        const hScale = seg.highlight.scale ?? emphasis.scale;
                        const hDelay = seg.highlight.delay ?? 16;
                        const hColor = seg.highlight.color || color;

                        const popSpring = spring({
                          frame: Math.max(0, localFrame - 10 - hDelay),
                          fps,
                          config: emphasis.spring,
                        });
                        const popScale = popScaleValue(popSpring, hScale);

                        const breathingGlow = emphasis === EMPHASIS_CONFIGS.pulse
                          ? emphasis.glow * (1 + Math.sin(frame * 0.06) * 0.3)
                          : emphasis.glow;

                        const exitPopScale = isExiting
                          ? interpolate(exitP, [si * 0.05, si * 0.05 + 0.12], [popScale, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                          : popScale;

                        return (
                          <span key={si} style={{
                            color: hColor,
                            transform: `scale(${exitPopScale})`,
                            display: 'inline-block',
                            padding: reservedPadding(hScale),
                            fontWeight: emphasis.weight ?? undefined,
                            textShadow: `0 0 20px ${hexToRgba(hColor, 0.6 * breathingGlow)}, 0 0 40px ${hexToRgba(hColor, 0.25 * breathingGlow)}`,
                          }}>
                            {seg.text}
                          </span>
                        );
                      }
                      return <span key={si} style={{ color: C.textSecondary }}>{seg.text}</span>;
                    });
                  })() : line}
                </React.Fragment>
              ));
            })()}
          </PunchLineBox>
        </div>

        {/* English text */}
        {enText && (
          <p
            style={{
              fontSize: 24,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.5)',
              fontFamily: F.text,
              letterSpacing: '0.1em',
              lineHeight: 1.2,
              margin: 0,
              maxWidth: 880,
              opacity: boxOpacity,
              textAlign: 'center',
            }}
          >
            {enText}
          </p>
        )}

        {/* Author — delayed fade-in with slide-up, exits first */}
        {author && (
          <p
            style={{
              fontSize: 22,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.45)',
              fontFamily: F.text,
              letterSpacing: '0.05em',
              margin: '18px 0 0 0',
              opacity: authorOpacity,
              transform: `translateY(${authorY}px)`,
            }}
          >
            {author}
          </p>
        )}
      </div>
    </div>
  );
};
