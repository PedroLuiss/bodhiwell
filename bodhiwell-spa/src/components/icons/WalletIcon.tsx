import React from 'react';
import { IconProps, defaultIconProps } from './types';

export const WalletIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M4.5 9.5h15v7a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2z" />
    <path d="M4.5 11.5h15" />
    <path d="M8 7.5h6" />
  </svg>
);