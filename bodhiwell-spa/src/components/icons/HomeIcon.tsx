import React from 'react';
import { IconProps, defaultIconProps } from './types';

export const HomeIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M4 11.5l8-6 8 6" />
    <path d="M7 10.5v8h10v-8" />
  </svg>
);