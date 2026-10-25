import React from 'react';
import { IconProps, defaultIconProps } from './types';

export const UserIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19" />
  </svg>
);