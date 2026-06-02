// PriceTag - 价格展示组件
// 适合房产视频中的价格呈现（港币/人民币）

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { COLORS, FONTS, SIZES } from '../../design-system/tokens';
import { SPRING_PRESETS } from '../../design-system/animations';

interface PriceTagProps {
  /** 价格数值 */
  price: number;
  /** 货币单位，默认"萬" */
  unit?: string;
  /** 前缀，如"總價"、"首付" */
  label?: string;
  /** 后缀说明 */
  suffix?: string;
  /** 动画延迟（帧） */
  startDelay?: number;
  /** 大小预设 */
  size?: 'small' | 'medium' | 'large';
}

const SIZE_MAP = {
  small: { price: SIZES.h3, unit: SIZES.h4, label: SIZES.body },
  medium: { price: SIZES.h2, unit: SIZES.h3, label: SIZES.h4 },
  large: { price: SIZES.h1, unit: SIZES.h2, label: SIZES.h3 },
};

export const PriceTag: React.FC<PriceTagProps> = ({
  price,
  unit = '萬',
  label,
  suffix,
  startDelay = 0,
  size = 'medium',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sizes = SIZE_MAP[size];

  // 价格数字滚动动画
  const progress = spring({
    frame: frame - startDelay,
    fps,
    config: SPRING_PRESETS.luxury,
  });

  const displayPrice = interpolate(progress, [0, 1], [0, price], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 光晕效果
  const glowOpacity = interpolate(
    frame - startDelay,
    [0, 20, 60],
    [0, 0.3, 0.15],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 标签入场
  const labelProgress = spring({
    frame: frame - startDelay - 10,
    fps,
    config: SPRING_PRESETS.smooth,
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* 光晕背景 */}
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 150,
          background: `radial-gradient(ellipse, ${COLORS.primary}${Math.floor(glowOpacity * 40).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* 标签 */}
      {label && (
        <div
          style={{
            fontSize: sizes.label,
            fontFamily: FONTS.text,
            color: COLORS.textSecondary,
            letterSpacing: '0.15em',
            marginBottom: SIZES.spacing.sm,
            opacity: labelProgress,
            transform: `translateY(${(1 - labelProgress) * 10}px)`,
          }}
        >
          {label}
        </div>
      )}

      {/* 价格主体 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: SIZES.spacing.xs,
          opacity: progress,
          transform: `scale(${0.9 + progress * 0.1})`,
        }}
      >
        {/* 港币符号 */}
        <span
          style={{
            fontSize: sizes.unit,
            fontFamily: FONTS.text,
            color: COLORS.primary,
            fontWeight: 600,
          }}
        >
          HK$
        </span>

        {/* 价格数字 */}
        <span
          style={{
            fontSize: sizes.price,
            fontFamily: FONTS.display,
            fontWeight: 700,
            color: COLORS.text,
            letterSpacing: '-0.03em',
            textShadow: '0 0 60px rgba(200, 160, 82, 0.2)',
          }}
        >
          {Math.round(displayPrice).toLocaleString('zh-HK')}
        </span>

        {/* 单位 */}
        <span
          style={{
            fontSize: sizes.unit,
            fontFamily: FONTS.text,
            color: COLORS.textSecondary,
            fontWeight: 400,
          }}
        >
          {unit}
        </span>
      </div>

      {/* 后缀说明 */}
      {suffix && (
        <div
          style={{
            fontSize: SIZES.caption,
            fontFamily: FONTS.text,
            color: COLORS.textTertiary,
            marginTop: SIZES.spacing.sm,
            opacity: interpolate(frame - startDelay - 20, [0, 15], [0, 1], {
              extrapolateLeft: 'clamp',
            }),
          }}
        >
          {suffix}
        </div>
      )}

      {/* 底部金线装饰 */}
      <div
        style={{
          marginTop: SIZES.spacing.md,
          width: interpolate(progress, [0, 1], [0, 80]),
          height: 2,
          background: `linear-gradient(90deg, transparent, ${COLORS.primary}, transparent)`,
          opacity: progress,
        }}
      />
    </div>
  );
};
