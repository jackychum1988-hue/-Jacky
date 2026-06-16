import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { WarningCover } from '../../src/covers/WarningCover';

afterEach(() => {
  cleanup();
});

describe('WarningCover', () => {
  const defaultProps = {
    series: 'warning' as const,
    episodeNumber: 1,
    title: '买卖合同\n3大陷阱',
    items: ['公摊面积模糊', '交付标准缩水', '违约责任不对等'],
  };

  it('renders without crashing', () => {
    const { container } = render(<WarningCover {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('renders all warning items', () => {
    const { getByText } = render(<WarningCover {...defaultProps} />);
    expect(getByText('公摊面积模糊')).toBeTruthy();
    expect(getByText('交付标准缩水')).toBeTruthy();
    expect(getByText('违约责任不对等')).toBeTruthy();
  });
});
