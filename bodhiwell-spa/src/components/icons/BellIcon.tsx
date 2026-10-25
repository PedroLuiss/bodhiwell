import React from 'react';
import { IconProps, defaultIconProps } from './types';

export const BellIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M12 19.5c3-2.5 5-4.7 5-8a5 5 0 1 0-10 0c0 3.3 2 5.5 5 8z" />
    <path d="M12 7.5v4" />
  </svg>
);