import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { OpinionCover } from '../../src/covers/OpinionCover';

afterEach(() => {
  cleanup();
});

describe('OpinionCover', () => {
  const defaultProps = {
    series: 'opinion' as const,
    episodeNumber: 1,
    title: '港人买中山楼\n最易中嘅3个伏',
    hook: '第一个你可能已经踩咗...',
  };

  it('renders without crashing', () => {
    const { container } = render(<OpinionCover {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('renders the title', () => {
    const { getByText } = render(<OpinionCover {...defaultProps} />);
    expect(getByText(/港人买中山楼/)).toBeTruthy();
  });

  it('renders the hook line', () => {
    const { getByText } = render(<OpinionCover {...defaultProps} />);
    expect(getByText(/第一个你可能已经踩咗/)).toBeTruthy();
  });
});
