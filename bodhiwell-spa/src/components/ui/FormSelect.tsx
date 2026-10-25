import React from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import { FormControl, Select, MenuItem, FormHelperText } from '@mui/material';

interface OptionType {
    label: string;
    value: string;
}

interface FormSelectProps {
    id: string;
    name?: string;
    options: OptionType[];
    value: string;
    onChange: (value: string) => void;
    onChangeElement?: (e: any) => void;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    sx?: SxProps<Theme>;
}

const FormSelect: React.FC<FormSelectProps> = ({
    id,
    name,
    options,
    value,
    onChange,
    onChangeElement = () => {},
    placeholder = 'Selecciona una opción',
    error,
    disabled,
    sx,
}) => {
    return (
            <div className="form-selector"> 
            <FormControl fullWidth variant="outlined" error={!!error} disabled={disabled} sx={sx}>
                <Select
                    id={id}
                    name={name || id}
                    value={value}
                    onChange={(e) => {
                        const targetValue = e.target.value as string;
                        onChange(targetValue);
                        if (onChangeElement) {
                            onChangeElement(e);
                        }
                    }}
                    displayEmpty
                     sx={{
                        borderRadius: '8px',
                        '& .MuiSelect-select': {
                            padding: '1rem',
                            fontSize: '1rem',
                        },
                        
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#e0e0e0',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#e0e0e0',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#566cb0',
                            boxShadow: '0 0 0 3px rgba(86, 108, 176, 0.1)',
                            borderWidth: '1px',
                        },
                    }}
                >
                    <MenuItem value="" disabled>
                        <em>{placeholder}</em>
                    </MenuItem>
                    {options.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </MenuItem>
                    ))}
                </Select>
                {error && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
        </div>
    );
};

export default FormSelect;