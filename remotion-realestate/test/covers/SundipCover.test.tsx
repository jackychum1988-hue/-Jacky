import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { SundipCover } from '../../src/covers/SundipCover';

afterEach(() => {
  cleanup();
});

describe('SundipCover', () => {
  const defaultProps = {
    series: 'sundip' as const,
    episodeNumber: 1,
    highlightNumber: '21.8',
    highlightUnit: '万',
    highlightLabel: '首付上车中山',
    propertyName: '港航汇·三房',
    tags: ['近港珠澳大桥', '精装修交付'],
  };

  it('renders without crashing', () => {
    const { container } = render(<SundipCover {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('renders the highlight number', () => {
    const { getByText } = render(<SundipCover {...defaultProps} />);
    expect(getByText('21.8')).toBeTruthy();
  });

  it('renders series badge', () => {
    const { getByText } = render(<SundipCover {...defaultProps} />);
    expect(getByText('笋盘速报')).toBeTruthy();
  });

  it('renders brand bar', () => {
    const { getByText } = render(<SundipCover {...defaultProps} />);
    expect(getByText(/港人中山置業通/)).toBeTruthy();
  });
});
