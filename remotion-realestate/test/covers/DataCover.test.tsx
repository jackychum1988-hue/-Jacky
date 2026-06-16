import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { DataCover } from '../../src/covers/DataCover';

afterEach(() => {
  cleanup();
});

describe('DataCover', () => {
  const defaultProps = {
    series: 'data' as const,
    episodeNumber: 1,
    title: '香港 vs 中山\n买楼成本大对比',
    leftLabel: '香港',
    leftValue: '$800万',
    leftSub: '200呎',
    rightLabel: '中山',
    rightValue: '$80万',
    rightSub: '900呎',
    insight: '港人每月悭供款 $12,000',
  };

  it('renders without crashing', () => {
    const { container } = render(<DataCover {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('renders both comparison values', () => {
    const { getByText } = render(<DataCover {...defaultProps} />);
    expect(getByText('$800万')).toBeTruthy();
    expect(getByText('$80万')).toBeTruthy();
  });

  it('renders the insight text', () => {
    const { getByText } = render(<DataCover {...defaultProps} />);
    expect(getByText(/港人每月悭供款/)).toBeTruthy();
  });
});
