import React from 'react';
import { CheckboxProps } from '@mui/material';
import { CustomCheckbox } from './CheckboxUi.styles';

export const CheckboxUi: React.FC<CheckboxProps> = (props) => {
    return (
        <CustomCheckbox 
            {...props}
            disableRipple 
        />
    );
};