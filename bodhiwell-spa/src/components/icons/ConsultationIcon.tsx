import React from 'react';
import { IconProps, defaultIconProps } from './types';

export const ConsultationIcon: React.FC<IconProps> = (props) => (
  <svg {...defaultIconProps} {...props}>
    <path d="M7 5.5h10v13H7z" />
    <path d="M10 9h4" />
    <path d="M10 12h4" />
    <path d="M10 15h4" />
  </svg>
);