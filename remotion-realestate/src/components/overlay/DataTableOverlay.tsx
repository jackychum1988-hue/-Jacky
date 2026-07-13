// DataTableOverlay — 数据表格/进度条双模式卡 (v1 overlay adapter)
// 合并 new/DataTable + ProgressTable，纯字符串单元格
// 适用: 多行多列数据展示、进度对比、指标表格

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, idleFloat } from './animation';

interface TableColumn {
  key: string;
  title: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

interface TableRow {
  [key: string]: string;
}

interface ProgressRow {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
}

interface DataTableOverlayProps extends OverlayElementBase {
  label?: string;
  // Standard table mode
  columns?: TableColumn[];
  data?: TableRow[];
  highlightColumn?: string;
  highlightRow?: number;
  // Progress table mode
  progressRows?: ProgressRow[];
  color?: string;
  disableBreathing?: boolean;
}

export const DataTableOverlay: React.FC<DataTableOverlayProps> = ({
  label,
  columns,
  data,
  highlightColumn,
  highlightRow,
  progressRows,
  color = '#F5A623',
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
  const isProgress = progressRows && progressRows.length > 0;

  // ── Label: 0-12f ──
  const labelOpacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelExit = isExiting ? interpolate(exitP, [0.5, 0.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // ── Header: 6-18f (table mode only) ──
  const headerOpacity = interpolate(localFrame, [6, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Idle float ──
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.4, 0.022);

  // Standard table row count, progress row count
  const rowCount = isProgress ? progressRows!.length : (data?.length ?? 0);

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
        padding: '36px 40px 28px 48px',
        backgroundColor: 'rgba(10,8,6,0.55)',
        borderRadius: 18,
        border: `1.5px solid ${hexToRgba(color, 0.45)}`,
        boxShadow: `0 0 32px ${hexToRgba(color, 0.18)}, 0 0 72px ${hexToRgba(color, 0.06)}, inset 0 1px 0 ${hexToRgba(color, 0.15)}, inset 0 -1px 0 rgba(0,0,0,0.3)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 9, bottom: 9, width: 5, borderRadius: '0 9px 9px 0', backgroundColor: color, boxShadow: `0 0 8px ${hexToRgba(color, 0.5)}` }} />

        {label && (
          <p style={{ fontSize: 36, fontWeight: 600, color, fontFamily: F.text, letterSpacing: '0.08em', textShadow: textDepth(0.3), margin: '0 0 20px 0', textAlign: 'center', opacity: labelOpacity * labelExit }}>
            {label}
          </p>
        )}

        {isProgress ? (
          /* ── Progress Table Mode ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {progressRows!.map((pr, pri) => {
              const rowDelay = 6 + pri * 10;
              const rowFrame = Math.max(0, localFrame - rowDelay);
              const rowSpring = spring({ frame: rowFrame, fps, config: { damping: 22, stiffness: 85, mass: 1.1 } });
              const rowOpacity = isExiting
                ? interpolate(exitP, [(rowCount - 1 - pri) * 0.04, (rowCount - 1 - pri) * 0.04 + 0.15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : interpolate(rowSpring, [0, 1], [0, 1]);
              const rowX = isExiting
                ? interpolate(exitP, [(rowCount - 1 - pri) * 0.04, (rowCount - 1 - pri) * 0.04 + 0.2], [0, -30], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : interpolate(rowSpring, [0, 1], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

              // Progress bar animation
              const barDelay = rowDelay + 5;
              const barFrame = Math.max(0, localFrame - barDelay);
              const barSpring = spring({ frame: barFrame, fps, config: { damping: 20, stiffness: 100, mass: 0.8 } });
              const maxV = pr.maxValue ?? 100;
              const barPct = (pr.value / maxV) * 100;
              const barWidth = isExiting
                ? interpolate(exitP, [(rowCount - 1 - pri) * 0.03, (rowCount - 1 - pri) * 0.03 + 0.18], [barPct, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : interpolate(barSpring, [0, 1], [0, barPct]);

              const pColor = pr.color || color;

              return (
                <div key={pri} style={{ opacity: rowOpacity, transform: `translateX(${rowX}px)` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontSize: 28, fontWeight: 600, color: C.text, fontFamily: F.text, textShadow: textDepth(0.15) }}>
                      {pr.label}
                    </span>
                    <span style={{ fontSize: 28, fontWeight: 800, color: pColor, fontFamily: F.mono, textShadow: `0 0 16px ${hexToRgba(pColor, 0.4)}` }}>
                      {pr.value}/{maxV}
                    </span>
                  </div>
                  <div style={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${barWidth}%`, height: '100%', borderRadius: 5,
                      background: `linear-gradient(to right, ${hexToRgba(pColor, 0.4)}, ${pColor})`,
                      boxShadow: `0 0 12px ${hexToRgba(pColor, 0.3)}`,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Standard Table Mode ── */
          <div>
            {/* Header */}
            {columns && (
              <div style={{
                display: 'flex', gap: 8, padding: '10px 16px',
                borderBottom: `2px solid ${hexToRgba(color, 0.5)}`,
                marginBottom: 12, opacity: headerOpacity,
              }}>
                {columns.map((col) => (
                  <div key={col.key} style={{
                    flex: col.width ?? 1,
                    textAlign: col.align ?? 'left',
                  }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color, fontFamily: F.text, textShadow: `0 0 16px ${hexToRgba(color, 0.4)}` }}>
                      {col.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Data rows */}
            {data && data.map((row, ri) => {
              const rowDelay = 12 + ri * 8;
              const rowFrame = Math.max(0, localFrame - rowDelay);
              const rowSpring = spring({ frame: rowFrame, fps, config: { damping: 22, stiffness: 85, mass: 1.1 } });
              const rowOpacity = isExiting
                ? interpolate(exitP, [(rowCount - 1 - ri) * 0.04, (rowCount - 1 - ri) * 0.04 + 0.15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : interpolate(rowSpring, [0, 1], [0, 1]);
              const rowX = isExiting
                ? interpolate(exitP, [(rowCount - 1 - ri) * 0.04, (rowCount - 1 - ri) * 0.04 + 0.2], [0, -30], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : interpolate(rowSpring, [0, 1], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

              const isHighlighted = highlightRow !== undefined && ri === highlightRow;

              return (
                <div key={ri} style={{
                  display: 'flex', gap: 8, padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: isHighlighted ? hexToRgba(color, 0.12) : 'transparent',
                  borderRadius: isHighlighted ? RADIUS.panel : 0,
                  opacity: rowOpacity,
                  transform: `translateX(${rowX}px)`,
                }}>
                  {columns && columns.map((col) => {
                    const cellVal = row[col.key] || '';
                    const isHighlightCol = highlightColumn === col.key;
                    return (
                      <div key={col.key} style={{
                        flex: col.width ?? 1,
                        textAlign: col.align ?? 'left',
                      }}>
                        <span style={{
                          fontSize: 26, fontWeight: isHighlightCol ? 800 : 500,
                          color: isHighlightCol ? color : (isHighlighted ? C.text : C.text),
                          fontFamily: col.key === 'value' || col.key === 'price' ? F.mono : F.text,
                          textShadow: isHighlightCol ? `0 0 18px ${hexToRgba(color, 0.5)}` : textDepth(0.15),
                        }}>
                          {cellVal}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
