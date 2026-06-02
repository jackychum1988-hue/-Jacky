// HeroProductTitle — 产品标题动效（两行文字自上而下酷炫入场）

import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { COLORS, FONTS } from '../../design-system/tokens';

interface HeroProductTitleProps {
  line1: string;
  line2: string;
  line1Delay?: number;
  line2Delay?: number;
}

export const HeroProductTitle: React.FC<HeroProductTitleProps> = ({
  line1,
  line2,
  line1Delay = 5,
  line2Delay = 30,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ── 第一行：下落 + 回弹 ──
  const l1Spring = spring({
    frame: frame - line1Delay,
    fps,
    config: { damping: 12, stiffness: 80, mass: 1.8 },
  });

  const l1Opacity = interpolate(frame - line1Delay, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 下落偏移动画：从上方 -120px 落到 0，带 overshoot
  const l1Y = interpolate(
    l1Spring,
    [0, 1],
    [-140, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 下落时的旋转微倾斜（增强冲击感）
  const l1Rotate = interpolate(
    l1Spring,
    [0, 0.6, 1],
    [-3, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // ── 第二行：延迟下落，更重更有力 ──
  const l2Spring = spring({
    frame: frame - line2Delay,
    fps,
    config: { damping: 10, stiffness: 70, mass: 2.5 },
  });

  const l2Opacity = interpolate(frame - line2Delay, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const l2Y = interpolate(
    l2Spring,
    [0, 1],
    [-160, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const l2Rotate = interpolate(
    l2Spring,
    [0, 0.5, 1],
    [-4, 1.5, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // ── 黑色底框入场（随第二行一起出现） ──
  const boxOpacity = interpolate(frame - line2Delay + 5, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  const boxScale = spring({
    frame: frame - line2Delay + 5,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  // ── 装饰光扫 ──
  const sweepX = interpolate(
    frame - line2Delay - 10,
    [0, 60],
    [-width * 0.6, width * 0.6],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.quad),
    }
  );

  // ── 角落装饰线条 ──
  const cornerProgress = interpolate(frame - line2Delay - 15, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // ── 蓝色光晕呼吸 ──
  const blueGlow = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [0.15, 0.35],
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* 黑色半透明底框 + 阴影 */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          padding: '48px 72px',
          backgroundColor: `rgba(0, 0, 0, ${0.65 * boxOpacity})`,
          borderRadius: 20,
          boxShadow: `
            0 20px 80px rgba(0, 0, 0, ${0.55 * boxOpacity}),
            0 0 120px rgba(0, 82, 204, ${0.12 * boxOpacity}),
            inset 0 1px 0 rgba(255, 255, 255, ${0.04 * boxOpacity})
          `,
          backdropFilter: `blur(${12 * boxOpacity}px)`,
          border: `1px solid rgba(255, 255, 255, ${0.06 * boxOpacity})`,
          transform: `scale(${0.9 + boxScale * 0.1})`,
          overflow: 'hidden',
        }}
      >
        {/* 光扫效果（在底框内部扫过） */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '60%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
            transform: `translateX(${sweepX}px)`,
            pointerEvents: 'none',
          }}
        />

        {/* 角落装饰 — 左上 */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            width: interpolate(cornerProgress, [0, 1], [0, 28]),
            height: interpolate(cornerProgress, [0, 1], [0, 28]),
            borderTop: '2px solid rgba(255,255,255,0.25)',
            borderLeft: '2px solid rgba(255,255,255,0.25)',
            opacity: cornerProgress,
          }}
        />

        {/* 角落装饰 — 右下 */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            width: interpolate(cornerProgress, [0, 1], [0, 28]),
            height: interpolate(cornerProgress, [0, 1], [0, 28]),
            borderBottom: '2px solid rgba(255,255,255,0.25)',
            borderRight: '2px solid rgba(255,255,255,0.25)',
            opacity: cornerProgress,
          }}
        />

        {/* ── 第一行：白色文字（较小） ── */}
        <div
          style={{
            opacity: l1Opacity,
            transform: `translateY(${l1Y}px) rotate(${l1Rotate}deg)`,
            position: 'relative',
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 600,
              color: '#FFFFFF',
              fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Heiti SC", sans-serif',
              letterSpacing: '0.06em',
              textShadow: '0 0 60px rgba(255, 255, 255, 0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            {line1}
          </span>
        </div>

        {/* ── 第二行：蓝色底 + 大字体 ── */}
        <div
          style={{
            opacity: l2Opacity,
            transform: `translateY(${l2Y}px) rotate(${l2Rotate}deg)`,
            position: 'relative',
          }}
        >
          {/* 蓝色光晕 */}
          <div
            style={{
              position: 'absolute',
              inset: -20,
              borderRadius: 30,
              background: `radial-gradient(ellipse 80% 60% at center, rgba(0, 122, 255, ${blueGlow}) 0%, transparent 70%)`,
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }}
          />

          {/* 蓝色底 Pill */}
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              padding: '16px 56px',
              background: 'linear-gradient(135deg, #0052CC 0%, #0068E0 40%, #1A7BFF 100%)',
              borderRadius: 12,
              boxShadow: `
                0 8px 40px rgba(0, 82, 204, 0.45),
                0 2px 8px rgba(0, 40, 120, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `,
              // 微妙的顶部光泽
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            {/* 高光条 */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '15%',
                right: '15%',
                height: '40%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)',
                borderRadius: '12px 12px 0 0',
                pointerEvents: 'none',
              }}
            />

            <span
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: '#FFFFFF',
                fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Heiti SC", sans-serif',
                letterSpacing: '0.04em',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                whiteSpace: 'nowrap',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {line2}
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
