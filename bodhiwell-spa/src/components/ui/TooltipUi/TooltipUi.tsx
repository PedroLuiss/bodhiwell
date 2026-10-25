import React from 'react';
import { Tooltip, TooltipProps, styled, tooltipClasses } from '@mui/material';
import Zoom from '@mui/material/Zoom';

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: '#F8F6F2',
    '&::before': {
      boxShadow: '0 2px 8px rgba(16, 25, 21, 0.08)',
    },
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#F8F6F2',
    color: '#13231D',
    boxShadow: '0 4px 14px rgba(16, 25, 21, 0.08)',
    borderRadius: '18px',
    border: '1px solid rgba(16, 25, 21, 0.08)',
    padding: '10px 15px',
    fontSize: '0.85rem',
    maxWidth: '300px',
    lineHeight: '1.5',
    fontWeight: 600,
  },
}));

interface TooltipUiProps extends Omit<TooltipProps, 'children'> {
  children: React.ReactElement;
}

export const TooltipUi: React.FC<TooltipUiProps> = ({ children, ...props }) => {
  return (
    <CustomTooltip
      TransitionComponent={Zoom}
      placement="top"
      arrow
      PopperProps={{ disablePortal: true }}
      {...props}
    >
      {children}
    </CustomTooltip>
  );
};