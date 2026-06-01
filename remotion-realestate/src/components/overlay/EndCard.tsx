// EndCard — 片尾关注引导卡 (zhuzige)
// 居中弹性入场 + 光晕脉动，引导关注/扫码/加微信
// 复用: 视频结尾场景

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgba, C, F, OverlayElementBase } from './animation';

interface EndCardProps extends OverlayElementBase {
  channelName: string;
  subscribeText?: string;
  enSubscribeText?: string;
  qrLabel?: string;
  enQrLabel?: string;
  color?: string;
}

export const EndCard: React.FC<EndCardProps> = ({
  channelName,
  subscribeText = '关注我，带你睇更多中山好楼',
  enSubscribeText,
  qrLabel,
  enQrLabel,
  color = '#F5A623',
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

  const mainSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.9 },
  });
  const mainScale = interpolate(mainSpring, [0, 1], [0.88, 1]);

  const subtitleSpring = spring({
    frame: Math.max(0, localFrame - 15),
    fps,
    config: { damping: 18, stiffness: 100, mass: 0.8 },
  });
  const subtitleOpacity = interpolate(subtitleSpring, [0, 1], [0, 1]);

  const qrSpring = spring({
    frame: Math.max(0, localFrame - 30),
    fps,
    config: { damping: 16, stiffness: 100, mass: 0.8 },
  });
  const qrOpacity = interpolate(qrSpring, [0, 1], [0, 1]);

  const pulse = 1 + Math.sin(frame * 0.06) * 0.03;

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
      <div
        style={{
          opacity: anim.opacity,
          transform: `scale(${mainScale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          maxWidth: 880,
          textAlign: 'center',
        }}
      >
        {/* Logo/头像占位圆 */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
          backgroundColor: hexToRgba(color, 0.12),
          border: `2px solid ${hexToRgba(color, 0.35)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${pulse})`,
        }}
      >
        <span
          style={{
            fontSize: 42,
            fontWeight: 800,
            color,
            fontFamily: F.display,
          }}
        >
          {channelName.charAt(0)}
        </span>
      </div>

      {/* 频道名 */}
      <h2
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: C.text,
          fontFamily: F.display,
          lineHeight: 1.2,
          margin: 0,
        }}
      >
        {channelName}
      </h2>

      {/* 关注引导 */}
      <p
        style={{
          fontSize: 28,
          fontWeight: 500,
          color: C.textSecondary,
          fontFamily: F.text,
          lineHeight: 1.4,
          opacity: subtitleOpacity,
          margin: 0,
          maxWidth: 600,
        }}
      >
        {subscribeText}
      </p>
      {enSubscribeText && (
        <p
          style={{
            fontSize: 20,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.5)',
            fontFamily: F.text,
            letterSpacing: '0.1em',
            opacity: subtitleOpacity,
            margin: 0,
          }}
        >
          {enSubscribeText}
        </p>
      )}

      {/* 扫码/加微信提示 */}
      {qrLabel && (
        <div
          style={{
            opacity: qrOpacity,
            marginTop: 8,
            padding: '20px 40px',
            backgroundColor: hexToRgba(color, 0.1),
            borderRadius: 14,
            border: `2px solid ${hexToRgba(color, 0.35)}`,
            boxShadow: `0 0 32px ${hexToRgba(color, 0.25)}`,
          }}
        >
          <span
            style={{
              fontSize: 26,
              fontWeight: 600,
              color,
              fontFamily: F.text,
              lineHeight: 1.3,
            }}
          >
            {qrLabel}
          </span>
          {enQrLabel && (
            <span
              style={{
                fontSize: 18,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: F.text,
                letterSpacing: '0.1em',
                display: 'block',
                marginTop: 4,
              }}
            >
              {enQrLabel}
            </span>
          )}
        </div>
      )}
    </div>
  </div>
);
};
