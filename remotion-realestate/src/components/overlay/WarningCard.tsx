// WarningCard — SplitCard + GlassCard 模式 (zhuzige)
// v10: 图标旋转入场 + 标题字间距呼吸 + 描述淡入分层
// NumberBadge + 彩色标题 + 白色描述 + 中英对照

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, breathingScale, idleFloat, hexToRgba, OverlayElementBase, splitByHighlights, HighlightWord, EMPHASIS_CONFIGS, popScaleValue, reservedPadding } from './animation';
import { NumberBadge } from '../new/NumberBadge';
import { GlassCard } from '../new/GlassCard';
import { ICON_MAP } from './iconMap';

interface WarningCardProps extends OverlayElementBase {
  label?: string;
  n: number;
  title: string;
  desc: string;
  enTitle?: string;
  enDesc?: string;
  icon?: string;
  color?: string;
  bullets?: string[];
  /** Keywords to highlight in title with kinetic pop animation */
  highlights?: HighlightWord[];
}

export const WarningCard: React.FC<WarningCardProps> = ({
  label,
  n,
  title,
  desc,
  enTitle,
  enDesc,
  icon,
  color = '#FF4136',
  bullets,
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
  const localFrame = Math.max(0, frame - enterAt);
  const isExiting = anim.phase === 'exit';
  const exitP = anim.phaseProgress;

  // Main slide-in with Apple spring
  const slideSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 30, stiffness: 65, mass: 1.5 },
  });
  const slideX = isExiting
    ? interpolate(exitP, [0, 1], [0, 80], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(slideSpring, [0, 1], [80, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Icon rotation on entry — exit: reverse rotate + shrink
  const iconSpring = spring({
    frame: Math.max(0, localFrame - 4),
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.7 },
  });
  const iconRotate = isExiting
    ? interpolate(exitP, [0, 0.4], [0, 15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(iconSpring, [0, 1], [-15, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const iconScale = isExiting
    ? interpolate(exitP, [0, 0.4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(iconSpring, [0, 1], [0, 1.15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Title letter-spacing — exit: tighten back
  const titleSpring = spring({
    frame: Math.max(0, localFrame - 8),
    fps,
    config: { damping: 26, stiffness: 70, mass: 1.3 },
  });
  const titleLetterSpacing = isExiting
    ? interpolate(exitP, [0.1, 0.6], [-0.005, 0.06], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(titleSpring, [0, 1], [0.06, -0.005]);
  const titleOpacity = isExiting
    ? interpolate(exitP, [0.1, 0.5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(titleSpring, [0, 1], [0, 1]);

  // Desc stagger — exit: fade before title
  const descOpacity = isExiting
    ? interpolate(exitP, [0, 0.35], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(
        spring({ frame: Math.max(0, localFrame - 16), fps, config: { damping: 30, stiffness: 65, mass: 1.5 } }),
        [0, 1], [0, 1],
      );

  // Exit: card content fades before slide completes
  const exitContentOpacity = isExiting ? interpolate(exitP, [0, 0.7], [1, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // Idle breathing
  const floatY = idleFloat(frame, 1.3, 0.024);
  const cardBreath = breathingScale(frame);

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
      <div
        style={{
          opacity: anim.opacity * exitContentOpacity,
          transform: `translateX(${slideX}px) translateY(${floatY}px)`,
          width: '100%',
          maxWidth: posStyle.maxWidth,
        }}
      >
        <GlassCard
          color={color}
          showLeftBar
          glowIntensity={0.2}
          transparentBg
          showOuterGlow={false}
          disableEntryAnimation
          padding="40px 48px 36px 56px"
          maxWidth={880}
        >
          {/* Label: 彩色小字标注 */}
          {label && (
            <p style={{
              fontSize: 36, fontWeight: 600, color, fontFamily: F.text,
              letterSpacing: '0.08em', lineHeight: 1.3,
              textShadow: textDepth(0.3), margin: '0 0 16px 0',
              transform: `scale(${cardBreath})`,
            }}>
              {label}
            </p>
          )}

          {/* NumberBadge + Icon row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
            <NumberBadge number={n} color={color} size={64} fontSize={40} />
            {icon && ICON_MAP[icon] && (
              <div style={{
                opacity: iconSpring,
                transform: `rotate(${iconRotate}deg) scale(${iconScale > 1 ? 1 : iconScale})`,
              }}>
                {React.createElement(ICON_MAP[icon], { size: 48, color, strokeWidth: 2 })}
              </div>
            )}
          </div>

          {/* Title with letter-spacing animation + kinetic keyword pop */}
          <h2
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: C.text,
              fontFamily: F.display,
              margin: '0 0 8px 0',
              lineHeight: 1.2,
              letterSpacing: `${titleLetterSpacing.toFixed(3)}em`,
              opacity: titleOpacity,
              transform: `scale(${breathingScale(frame)})`,
            }}
          >
            {highlights && highlights.length > 0 ? (
              splitByHighlights(title, highlights).map((seg, si) => {
                if (seg.highlight) {
                  const emphasis = EMPHASIS_CONFIGS[seg.highlight.emphasis ?? 'pop'];
                  const hScale = seg.highlight.scale ?? emphasis.scale;
                  const hDelay = seg.highlight.delay ?? 14;
                  const hColor = seg.highlight.color || color;

                  const popSpring = spring({
                    frame: Math.max(0, localFrame - 8 - hDelay),
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
                      textShadow: `${textDepth(0.35)}, 0 0 18px ${hexToRgba(hColor, 0.4 * breathingGlow * (isExiting ? 1 - exitP : 1))}`,
                    }}>
                      {seg.text}
                    </span>
                  );
                }
                return <span key={si} style={{ color: C.textSecondary }}>{seg.text}</span>;
              })
            ) : (
              title
            )}
          </h2>

          {/* English title */}
          {enTitle && (
            <p
              style={{
                fontSize: 24,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: F.text,
                letterSpacing: '0.1em',
                lineHeight: 1.2,
                margin: '0 0 16px 0',
                opacity: titleOpacity,
              }}
            >
              {enTitle}
            </p>
          )}

          {/* Description */}
          <p
            style={{
              fontSize: 28,
              color: C.textSecondary,
              fontFamily: F.text,
              fontWeight: 500,
              lineHeight: 1.5,
              textShadow: textDepth(0.2),
              opacity: descOpacity,
              margin: 0,
              transform: `scale(${cardBreath})`,
            }}
          >
            {desc}
          </p>

          {/* English description */}
          {enDesc && (
            <p
              style={{
                fontSize: 24,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: F.text,
                letterSpacing: '0.1em',
                lineHeight: 1.2,
                margin: '10px 0 0 0',
                opacity: descOpacity,
              }}
            >
              {enDesc}
            </p>
          )}

          {/* Bullet points with stagger */}
          {bullets && bullets.length > 0 && (
            <div style={{ margin: '16px 0 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bullets.map((b, bi) => {
                const bulletFrame = Math.max(0, frame - enterAt - 20 - bi * 6);
                const bulletOpacityEnter = interpolate(bulletFrame, [0, 14], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                // Exit: reverse stagger — last bullet exits first
                const revI = bullets.length - 1 - bi;
                const exitDelay = revI * 5;
                const bulletOpacityExit = isExiting
                  ? interpolate(exitP, [exitDelay / 20, (exitDelay + 10) / 20], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                  : 1;
                const bulletOpacity = isExiting ? bulletOpacityEnter * bulletOpacityExit : bulletOpacityEnter;
                return (
                  <div
                    key={bi}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 10,
                      fontSize: 24,
                      color: C.textSecondary,
                      fontFamily: F.text,
                      lineHeight: 1.5,
                      opacity: bulletOpacity,
                    }}
                  >
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      backgroundColor: hexToRgba(color, 0.18),
                      color: color,
                      fontSize: 13,
                      fontWeight: 800,
                      fontFamily: F.mono,
                      flexShrink: 0,
                      marginTop: 2,
                    }}>
                      {bi + 1}
                    </span>
                    <span>{b}</span>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
