import React from 'react';
import { IconProps, defaultIconProps } from './types';

export const CalendarIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <rect x="5" y="6" width="14" height="13" rx="2" />
    <path d="M8 3.5v5" />
    <path d="M16 3.5v5" />
    <path d="M5 10.5h14" />
  </svg>
);