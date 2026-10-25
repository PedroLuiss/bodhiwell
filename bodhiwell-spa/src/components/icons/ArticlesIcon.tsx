import React from 'react';
import { IconProps, defaultIconProps } from './types';

export const ArticlesIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M7 4.5h8l3 3v12H7z" />
    <path d="M15 4.5v4h4" />
    <path d="M10 12h5" />
    <path d="M10 15h5" />
  </svg>
);