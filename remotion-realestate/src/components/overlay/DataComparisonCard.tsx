// DataComparisonCard — 左右分栏数值对比卡 (zhuzige)
// 数字滚动计数 + 垂直分隔线 + 差值弹跳
// 左侧数值 | 差值高亮 | 右侧数值
// 三向模式：提供 centerLabel 时自动切换 → 左 | 中 | 右 三栏

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, hexToRgba, textDepth, idleFloat, settleBounce, RADIUS, OverlayElementBase } from './animation';
import { ICON_MAP } from './iconMap';

interface DataComparisonCardProps extends OverlayElementBase {
  label?: string;
  icon?: string;
  leftLabel: string;
  leftValue: string;
  leftUnit?: string;
  rightLabel: string;
  rightValue: string;
  rightUnit?: string;
  // 三向模式（提供 centerLabel 自动启用）
  centerLabel?: string;
  centerValue?: string;
  centerUnit?: string;
  enLeftLabel?: string;
  enCenterLabel?: string;
  enRightLabel?: string;
  delta?: string;
  enDelta?: string;
  color?: string;
  /** Scale the entire card (default 1). Use 1.15-1.25 to make small cards more prominent. */
  cardScale?: number;
  /** Disable Apple-style idle breathing/float when true */
  disableBreathing?: boolean;
}

// Parse "56万" → { num: 56, suffix: "万" }, "0.05%" → { num: 0.05, suffix: "%" }
// Range values like "1.2-1.3万" → isRange=true (skip counting)
// Text values like "粤语 · 广府菜" → isText=true (fade in, no counting)
function parseValue(v: string): { num: number; suffix: string; isRange: boolean; isText: boolean } {
  // Detect range/approximate values: "1.2-1.3万", "73-77万", "~50万"
  if (/[-~]/.test(v.replace(/^[\d,.]+/, ''))) {
    return { num: 0, suffix: '', isRange: true, isText: false };
  }
  const m = v.match(/^([\d,.]+)\s*(.*)$/);
  if (m) {
    const numStr = m[1].replace(/,/g, '');
    return { num: parseFloat(numStr), suffix: m[2], isRange: false, isText: false };
  }
  // Pure text — no number prefix → fade in, no counting
  return { num: 0, suffix: v, isRange: false, isText: true };
}

function formatCounted(num: number, orig: string): string {
  const m = orig.match(/^([\d,.]+)\s*(.*)$/);
  if (!m) return orig;
  const suffix = m[2];
  // Preserve original decimal places
  const origNum = m[1].replace(/,/g, '');
  const decimals = origNum.includes('.') ? origNum.split('.')[1].length : 0;
  const formatted = num.toFixed(decimals);
  // Add back thousands separators if original had them
  if (m[1].includes(',')) {
    const parts = formatted.split('.');
    parts[0] = parseInt(parts[0]).toLocaleString('en-US');
    return parts.join('.') + suffix;
  }
  return formatted + suffix;
}

export const DataComparisonCard: React.FC<DataComparisonCardProps> = ({
  label, icon, leftLabel, leftValue, leftUnit,
  rightLabel, rightValue, rightUnit,
  centerLabel, centerValue, centerUnit,
  enLeftLabel, enCenterLabel, enRightLabel,
  delta, enDelta,
  color = '#F5A623',
  cardScale = 1,
  disableBreathing = false,
  enterAt, exitAt, animation, position, offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });
  const isThreeWay = !!centerLabel;

  if (!anim.isVisible) return null;

  const posStyle = positionToStyle(position, offset);
  const localFrame = Math.max(0, frame - enterAt);
  const isExiting = anim.phase === 'exit';
  const exitP = anim.phaseProgress;

  // Springs: icon → left → (center) → right → divider → delta
  // Apple-style breathing: high damping, low stiffness, no overshoot
  const iconSpring = spring({ frame: localFrame, fps, config: { damping: 24, stiffness: 80, mass: 1.0 } });
  const leftSpring = spring({ frame: Math.max(0, localFrame - 6), fps, config: { damping: 26, stiffness: 70, mass: 1.2 } });
  const centerSpring = spring({ frame: Math.max(0, localFrame - 12), fps, config: { damping: 26, stiffness: 70, mass: 1.2 } });
  const rightSpring = spring({ frame: Math.max(0, localFrame - (isThreeWay ? 18 : 16)), fps, config: { damping: 26, stiffness: 70, mass: 1.2 } });
  const dividerSpring = spring({ frame: Math.max(0, localFrame - 14), fps, config: { damping: 30, stiffness: 65, mass: 1.3 } });
  const deltaSpring = spring({ frame: Math.max(0, localFrame - (isThreeWay ? 28 : 26)), fps, config: { damping: 28, stiffness: 70, mass: 1.2 } });

  // Slide positions — gentle 40px slide, no aggressive movement
  const slideDist = 40;
  const leftX = isExiting
    ? interpolate(exitP, [0, 1], [0, -slideDist], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(leftSpring, [0, 1], [-slideDist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rightX = isExiting
    ? interpolate(exitP, [0, 1], [0, slideDist], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(rightSpring, [0, 1], [slideDist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // Center panel: soft scale-in from 0.92, no slide
  const centerScale = isExiting
    ? interpolate(exitP, [0, 1], [1, 0.92], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(centerSpring, [0, 1], [0.92, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const centerOpacity = isExiting
    ? interpolate(exitP, [0, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : centerSpring;
  // Icon: subtle scale 0→1.06 with overshoot clamp
  const iconScale = isExiting
    ? interpolate(exitP, [0.3, 0.7], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(iconSpring, [0, 1], [0, 1.06], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const iconFinalScale = isExiting ? iconScale : Math.min(iconScale, 1.02);

  // Number counting — smooth spring, both sides sync. Range values skip counting.
  const leftParsed = parseValue(leftValue);
  const centerParsed = centerValue ? parseValue(centerValue) : { num: 0, suffix: '', isRange: false, isText: false };
  const rightParsed = parseValue(rightValue);
  const anyRange = leftParsed.isRange || centerParsed.isRange || rightParsed.isRange;
  const anyText = leftParsed.isText || centerParsed.isText || rightParsed.isText;

  // Small integer without suffix/decimal (≤999): skip counting — show final value immediately.
  // e.g. "300", "60", "80" → no point animating; "1,100", "0.05%", "300+" → animate.
  function skipCount(v: string, p: ReturnType<typeof parseValue>): boolean {
    if (p.isText || p.isRange || p.suffix !== '') return false;
    return /^[\d,]+$/.test(v) && p.num <= 999;
  }
  const leftSkip = skipCount(leftValue, leftParsed);
  const centerSkip = centerValue ? skipCount(centerValue, centerParsed) : false;
  const rightSkip = skipCount(rightValue, rightParsed);

  const countSpring = spring({ frame: Math.max(0, localFrame - 10), fps, config: { damping: 28, stiffness: 65, mass: 1.0 } });
  const countProgress = isExiting ? interpolate(exitP, [0, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : countSpring;
  // Settle bounce: 1→1.03→1 overshoot when counting completes (~36f after entry) (disabled when disableBreathing=true)
  const settle = disableBreathing ? { scale: 1, active: false } : settleBounce(localFrame, fps, 36);
  const numberScale = (settle.active ? settle.scale : 1);
  // Text values: fade in; small integers: show immediately; others: count up
  const leftDisplay = leftParsed.isText ? leftValue : (anyRange && leftParsed.isRange ? leftValue : leftSkip ? leftValue : formatCounted(interpolate(countProgress, [0, 1], [0, leftParsed.num]), leftValue));
  const centerDisplay = centerValue
    ? (centerParsed.isText ? centerValue : (anyRange && centerParsed.isRange ? centerValue : centerSkip ? centerValue : formatCounted(interpolate(countProgress, [0, 1], [0, centerParsed.num]), centerValue)))
    : '';
  const rightDisplay = rightParsed.isText ? rightValue : (anyRange && rightParsed.isRange ? rightValue : rightSkip ? rightValue : formatCounted(interpolate(countProgress, [0, 1], [0, rightParsed.num]), rightValue));
  const textValueOpacity = anyText ? countSpring : 1;

  // Per-mode sizing (text values use smaller font to fit Chinese chars in 3-way panels)
  const valueFontSize = isThreeWay ? (anyText ? 28 : 48) : 64;
  const labelFontSize = isThreeWay ? 24 : 28;
  const enLabelSize = isThreeWay ? 24 : 24;
  const unitFontSize = isThreeWay ? 20 : 24;
  const panelPad = isThreeWay ? '12px 8px 16px' : '20px 16px 24px';

  // Exit: divider collapses, connector lines shrink
  const dividerHeight = isExiting
    ? interpolate(exitP, [0, 0.5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(dividerSpring, [0, 1], [0, 1]);
  const connectorWidthL = isExiting
    ? interpolate(exitP, [0, 0.5], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(leftSpring, [0, 1], [0, 50]);
  const connectorWidthC = isExiting
    ? interpolate(exitP, [0, 0.5], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(centerSpring, [0, 1], [0, 50]);
  const connectorWidthR = isExiting
    ? interpolate(exitP, [0, 0.5], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(rightSpring, [0, 1], [0, 50]);

  // Exit: delta badge exits first
  const deltaExitOpacity = isExiting ? interpolate(exitP, [0, 0.35], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // Idle floating (disabled when disableBreathing=true)
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.5, 0.024);

  // Reusable panel renderer
  const renderPanel = (
    labelText: string, valueText: string, unitText: string | undefined,
    enLabelText: string | undefined, slideX: number, connectorW: number,
    extraStyle?: React.CSSProperties,
  ) => (
    <div style={{
      transform: isThreeWay ? undefined : `translateX(${slideX}px)`,
      textAlign: 'center', flex: 1,
      padding: panelPad,
      borderRadius: RADIUS.panel,
      ...extraStyle,
    }}>
      <p style={{ fontSize: labelFontSize, fontWeight: 600, color: C.textSecondary, fontFamily: F.text, margin: '0 0 6px 0' }}>{labelText}</p>
      {enLabelText && <p style={{ fontSize: enLabelSize, fontWeight: 400, color: 'rgba(255,255,255,0.5)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '0 0 8px 0' }}>{enLabelText}</p>}
      {/* Connector line: label → number */}
      <div style={{
        width: `${connectorW}%`,
        height: 1,
        background: `linear-gradient(to right, transparent, ${hexToRgba(color, 0.5)}, transparent)`,
        margin: '0 auto 10px auto',
        borderRadius: 1,
      }} />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
        <span style={{
          fontSize: valueFontSize, fontWeight: 900, color: C.text, fontFamily: F.mono,
          textShadow: textDepth(0.25),
          opacity: anyText ? textValueOpacity : 1,
          transform: `scale(${numberScale})`,
          display: 'inline-block',
        }}>{valueText}</span>
        {unitText && <span style={{ fontSize: unitFontSize, fontWeight: 600, color: C.textSecondary, fontFamily: F.text }}>{unitText}</span>}
      </div>
    </div>
  );

  // Reusable divider renderer
  const renderDivider = (key: string) => (
    <div key={key} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0, width: isThreeWay ? 20 : 32,
    }}>
      <div style={{
        width: 1,
        height: `${dividerHeight * 100}%`,
        background: `linear-gradient(to bottom, transparent, ${hexToRgba(color, 0.45)}, ${hexToRgba(color, 0.30)}, transparent)`,
        borderRadius: 1,
      }} />
    </div>
  );

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: posStyle.display, justifyContent: posStyle.justifyContent,
      alignItems: posStyle.alignItems, padding: posStyle.padding,
      transform: posStyle.transform, pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      <div style={{
        opacity: anim.opacity,
        maxWidth: Math.min(posStyle.maxWidth, cardScale > 1 ? posStyle.maxWidth / cardScale : posStyle.maxWidth),
        width: '100%',
        overflow: 'hidden',
        transform: `scale(${cardScale}) translateY(${floatY}px)`,
      }}>
        {/* Icon with bounce */}
        {icon && ICON_MAP[icon] && (
          <div style={{
            marginBottom: 16, textAlign: 'center',
            opacity: isExiting ? interpolate(exitP, [0.3, 0.6], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : iconSpring,
            transform: `scale(${iconFinalScale})`,
          }}>
            {React.createElement(ICON_MAP[icon], { size: 56, color, strokeWidth: 2.5 })}
          </div>
        )}

        {/* Label: 彩色小字标注 */}
        {label && (
          <p style={{
            fontSize: 36, fontWeight: 600, color, fontFamily: F.text,
            letterSpacing: '0.08em', lineHeight: 1.3,
            textShadow: textDepth(0.3), margin: '0 0 20px 0',
            textAlign: 'center', opacity: isExiting ? interpolate(exitP, [0.4, 0.7], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : iconSpring,
          }}>
            {label}
          </p>
        )}

        {/* Panels row */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, position: 'relative' }}>
          {/* Left panel */}
          {renderPanel(leftLabel, leftDisplay, leftUnit, enLeftLabel, leftX, connectorWidthL,
            isThreeWay ? { opacity: leftSpring, transform: `scale(${0.88 + leftSpring * 0.12})` } : undefined)}

          {/* Divider 1 */}
          {renderDivider('d1')}

          {/* Center panel (3-way only) */}
          {isThreeWay && centerLabel && (
            <>
              {renderPanel(centerLabel, centerDisplay, centerUnit, enCenterLabel, 0, connectorWidthC, {
                opacity: centerOpacity, transform: `scale(${centerScale})`,
              })}
              {/* Divider 2 */}
              {renderDivider('d2')}
            </>
          )}

          {/* Right panel */}
          {renderPanel(rightLabel, rightDisplay, rightUnit, enRightLabel, rightX, connectorWidthR,
            isThreeWay ? { opacity: rightSpring, transform: `scale(${0.88 + rightSpring * 0.12})` } : undefined)}
        </div>

        {/* Delta badge */}
        {delta && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <div style={{
              transform: `scale(${isExiting ? interpolate(exitP, [0, 0.4], [1, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : (0.6 + deltaSpring * 0.4)})`,
              opacity: isExiting ? deltaSpring * deltaExitOpacity : deltaSpring,
              padding: '10px 20px',
              backgroundColor: 'transparent',
              borderRadius: 12,
              border: `1px solid ${hexToRgba(color, 0.4)}`,
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 28, fontWeight: 800, color, fontFamily: F.display, margin: 0, lineHeight: 1.2 }}>{delta}</p>
              {enDelta && <p style={{ fontSize: 20, fontWeight: 400, color: 'rgba(255,255,255,0.5)', fontFamily: F.text, letterSpacing: '0.1em', lineHeight: 1.2, margin: '4px 0 0 0' }}>{enDelta}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
