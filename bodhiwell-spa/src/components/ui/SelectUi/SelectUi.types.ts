import { SelectProps, SelectChangeEvent } from '@mui/material';
import React from 'react';

export interface SelectUiProps extends Omit<SelectProps, 'label'> {
    label?: string;
    children: React.ReactNode;
    placeholder?: string;
    helperText?: React.ReactNode;
    onChange?: (event: SelectChangeEvent<any>, child: React.ReactNode) => void;
}