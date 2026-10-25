import React from 'react';
import './_form-checkbox.scss';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';
import { 
    FormCheckboxProps, 
    thisThemeColor 
} from '../../types';

const FormCheckbox: React.FC<FormCheckboxProps> = ({
    id,
    label,
    checked,
    onChange,
    className
}) => {

    const AntSwitch = styled(Switch)(({ theme }) => ({
        width: 28,
        height: 16,
        padding: 0,
        display: 'flex',
        backgroundColor: 'transparent',
        '&:active': {
            '& .MuiSwitch-switchBase.Mui-checked': {
                transform: 'translateX(12px)',
            },
        },
        '& .MuiSwitch-switchBase': {
            padding: 2,
            '&.Mui-checked': {
                transform: 'translateX(12px)',
                color: '#fff',
                '& + .MuiSwitch-track': {
                    opacity: 1,
                    backgroundColor: thisThemeColor.primary,
                    border: `1px solid ${thisThemeColor.primary}`,
                    ...theme.applyStyles('dark', {
                        backgroundColor: thisThemeColor.primary,
                    }),
                },

                '& .MuiSwitch-thumb': {
                    backgroundColor: '#fff',
                }
            },
        },
        '& .MuiSwitch-thumb': {
            boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
            backgroundColor: '#000',
            width: 12,
            height: 12,
            borderRadius: 6,
            transition: theme.transitions.create(['width'], {
                duration: 200,
            }),
        },
        '& .MuiSwitch-track': {
            borderRadius: 16 / 2,
            opacity: 1,
            backgroundColor: thisThemeColor.transparent,
            border: `1px solid #000`,
            boxSizing: 'border-box',
            ...theme.applyStyles('dark', {
                backgroundColor: 'rgba(255,255,255,.35)',
            }),
        },
    }));


    return (
         <div className={className}> 
            <label
                htmlFor={id} 
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
                <AntSwitch
                    id={id}
                    checked={checked}
                    onChange={e => onChange(e.target.checked)}
                    inputProps={{ 'aria-label': label }}
                />
                <Typography variant="body2">{label}</Typography> 
            </label>
        </div>
    );
};

export default FormCheckbox;
