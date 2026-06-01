import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useOverlayAnimation, positionToStyle, OverlayElementBase } from './animation';

interface QuoteBarProps extends OverlayElementBase {
  text: string;
  author?: string;
  color?: string;
}

export const QuoteBar: React.FC<QuoteBarProps> = ({
  text,
  author,
  color = '#C8A052',
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
          transform: anim.transform,
          display: 'flex',
          gap: 20,
          maxWidth: 600,
        }}
      >
        <div
          style={{
            width: 5,
            minWidth: 5,
            borderRadius: 3,
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: '#F5F0EB',
              fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", serif',
              lineHeight: 1.45,
              fontStyle: 'italic',
              margin: 0,
              textShadow: '0 2px 10px rgba(0,0,0,0.4)',
            }}
          >
            {text}
          </p>
          {author && (
            <span
              style={{
                fontSize: 22,
                color: '#8A8278',
                fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
                alignSelf: 'flex-end',
              }}
            >
              {'——'} {author}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
