import React from 'react';
import { IconProps, defaultIconProps } from './types';

export const ClockIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <circle cx="12" cy="12" r="7" />
    <path d="M12 8v5l3 2" />
  </svg>
);