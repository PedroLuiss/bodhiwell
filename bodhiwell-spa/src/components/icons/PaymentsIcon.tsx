import React from 'react';
import { IconProps, defaultIconProps } from './types';

export const PaymentsIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <rect x="4.5" y="7" width="15" height="10" rx="2" />
    <circle cx="9" cy="12" r="1" />
  </svg>
);