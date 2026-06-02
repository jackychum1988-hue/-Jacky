// JackyTalkingHeadEdit — 口播视频精剪版
// 柱子哥风格：结构化标题 + 口播内容 + CTA 尾板

import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  OffthreadVideo,
  Sequence,
  spring,
  interpolate,
  Easing,
  staticFile,
} from 'remotion';
import { COLORS, FONTS, SIZES } from '../../design-system/tokens';
import { LightSweep } from '../../components/new';

// ====== Intro 开场标题卡 (0~3s, 90f) ======

const IntroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  const titleY = interpolate(frame, [0, 20], [60, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.5)),
  });

  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const lineWidth = interpolate(frame, [15, 40], [0, 200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  const tagOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const tagScale = spring({
    frame: frame - 35,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.spacing.xxl,
      }}
    >
      {/* 背景光晕 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 60% 40% at 50% 30%, ${COLORS.primary}15 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 50% 60%, ${COLORS.extended.terracotta}10 0%, transparent 50%)
          `,
        }}
      />

      {/* 小标签 */}
      <div
        style={{
          opacity: tagOpacity,
          transform: `scale(${tagScale})`,
          padding: `${SIZES.spacing.xs}px ${SIZES.spacing.lg}px`,
          border: `1px solid ${COLORS.primary}80`,
          borderRadius: SIZES.radius.full,
          marginBottom: SIZES.spacing.lg,
        }}
      >
        <span
          style={{
            fontSize: SIZES.caption,
            fontFamily: FONTS.text,
            color: COLORS.primary,
            fontWeight: 500,
            letterSpacing: '0.1em',
          }}
        >
          港人中山置業通 Jacky
        </span>
      </div>

      {/* 大标题 */}
      <h1
        style={{
          fontSize: SIZES.h3,
          fontFamily: FONTS.display,
          color: COLORS.text,
          fontWeight: 700,
          textAlign: 'center',
          lineHeight: 1.3,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textShadow: '0 0 60px rgba(200, 160, 82, 0.15)',
        }}
      >
        21.8萬中山精裝公寓
        <br />
        男人的「救命草」
      </h1>

      {/* 金色分割线 */}
      <div
        style={{
          width: lineWidth,
          height: 2,
          backgroundColor: COLORS.primary,
          marginTop: SIZES.spacing.lg,
          marginBottom: SIZES.spacing.lg,
          opacity: 0.6,
        }}
      />

      {/* 副标题 */}
      <p
        style={{
          fontSize: SIZES.body,
          fontFamily: FONTS.text,
          color: COLORS.textSecondary,
          textAlign: 'center',
          opacity: subtitleOpacity,
          lineHeight: 1.6,
          maxWidth: 320,
        }}
      >
        總價低 · 民水民電 · 明火煮食
        <br />
        週末過關 · 一個人的秘密基地
      </p>
    </AbsoluteFill>
  );
};

// ====== Video Overlay 视频叠加层 ======

const VideoOverlay: React.FC<{ showFrame: boolean }> = ({ showFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle breathing border
  const borderOpacity = interpolate(
    Math.sin(frame / 60) * 0.5 + 0.5,
    [0, 1],
    [0.15, 0.3]
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        // Warm gold subtle frame
        border: `3px solid ${COLORS.primary}${Math.round(borderOpacity * 255)
          .toString(16)
          .padStart(2, '0')}`,
        // Subtle gradient overlay at bottom for text readability
        background: `
          linear-gradient(to top, ${COLORS.background}60 0%, transparent 20%),
          linear-gradient(to bottom, ${COLORS.background}30 0%, transparent 8%)
        `,
      }}
    />
  );
};

// ====== Outro CTA 尾板 (last 3s) ======

const OutroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cardScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const textOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const contactOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.spacing.xxl,
      }}
    >
      {/* 背景光晕 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 50% 50% at 50% 40%, ${COLORS.primary}10 0%, transparent 70%)
          `,
        }}
      />

      {/* CTA 大标题 */}
      <h2
        style={{
          fontSize: SIZES.h1,
          fontFamily: FONTS.display,
          color: COLORS.text,
          fontWeight: 700,
          textAlign: 'center',
          lineHeight: 1.3,
          opacity: textOpacity,
          transform: `translateY(${interpolate(frame, [0, 20], [40, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}px)`,
          textShadow: '0 0 80px rgba(200, 160, 82, 0.2)',
        }}
      >
        想睇樓？
      </h2>

      <p
        style={{
          fontSize: SIZES.h4,
          fontFamily: FONTS.text,
          color: COLORS.primary,
          fontWeight: 400,
          marginTop: SIZES.spacing.md,
          opacity: textOpacity,
          transform: `translateY(${interpolate(frame, [5, 25], [30, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}px)`,
        }}
      >
        即刻聯絡我 Jacky！
      </p>

      {/* 联系方式卡片 */}
      <div
        style={{
          marginTop: SIZES.spacing.xl,
          padding: `${SIZES.spacing.lg}px ${SIZES.spacing.xl}px`,
          backgroundColor: `${COLORS.backgroundElevated}E0`,
          borderRadius: SIZES.radius.xl,
          border: `1px solid ${COLORS.backgroundSecondary}`,
          textAlign: 'center',
          opacity: contactOpacity,
          transform: `scale(${cardScale * 0.05 + 0.95})`,
        }}
      >
        <p
          style={{
            fontSize: SIZES.caption,
            fontFamily: FONTS.text,
            color: COLORS.textSecondary,
            marginBottom: SIZES.spacing.xs,
          }}
        >
          WhatsApp · 致電 · 預約睇樓
        </p>
        <p
          style={{
            fontSize: SIZES.h4,
            fontFamily: FONTS.mono,
            color: COLORS.text,
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          Jacky +852 XXXX XXXX
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ====== 主场景组件 ======

export const JackyTalkingHeadEdit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 时间线规划（基于 30fps）:
  // 0~90f (0~3s):   开场标题卡
  // 90f~end-90f:     口播视频内容
  // end-90f~end:     尾版 CTA

  const introFrames = 90; // 3 seconds
  const outroFrames = 90; // 3 seconds
  // The video segment duration will be determined by the trimmed video length
  // We set the Composition duration to match, so the outro starts at the right time

  // Video starts after intro
  const videoStartFrame = introFrames;
  const videoDurationInFrames = useVideoConfig().durationInFrames - introFrames - outroFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* ===== 阶段 1: 开场标题卡 ===== */}
      <Sequence from={0} durationInFrames={introFrames}>
        <IntroCard />
        <LightSweep duration={90} height={1920} />
      </Sequence>

      {/* ===== 阶段 2: 口播视频 ===== */}
      <Sequence from={videoStartFrame} durationInFrames={videoDurationInFrames}>
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
          <OffthreadVideo
            src={staticFile('Jacky_trimmed.mp4')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <VideoOverlay showFrame={true} />
        </AbsoluteFill>
      </Sequence>

      {/* ===== 阶段 3: 尾版 CTA ===== */}
      <Sequence from={videoStartFrame + videoDurationInFrames} durationInFrames={outroFrames}>
        <OutroCard />
        <LightSweep duration={90} height={1920} />
      </Sequence>
    </AbsoluteFill>
  );
};
