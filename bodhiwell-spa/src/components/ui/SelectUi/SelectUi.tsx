import { Select, InputLabel, FormHelperText, OutlinedInput, MenuItem } from '@mui/material';
import { SelectUiProps } from './SelectUi.types';
import { CustomFormControl } from './SelectUi.styles';

export const SelectUi = ({ label, children, placeholder, helperText, ...props }: SelectUiProps) => {
    const selectId = `styled-select-${props.id || label?.toLowerCase().replace(/\s/g, '-')}`;

    return (
        <CustomFormControl
            error={props.error}
            fullWidth={props.fullWidth}
            sx={props.sx}
            disabled={props.disabled}
            variant="outlined"
        >
            {label && <InputLabel 
                id={`${selectId}-label`}
                shrink={true}
            >
                {label}
            </InputLabel>}
            
            <Select
                labelId={`${selectId}-label`}
                id={selectId}
                input={<OutlinedInput notched={false} label={label} />}
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: 48 * 6,
                            marginTop: '8px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                            border: '1px solid rgba(16,25,21,0.08)',
                        },
                    },
                    anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                    },
                    transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                    },
                }}
                {...props}
            >
                {placeholder && <MenuItem value="" disabled>{placeholder}</MenuItem>}
                {children}
            </Select>

            {helperText && (
                <FormHelperText id={`${selectId}-helper-text`}>
                    {helperText}
                </FormHelperText>
            )}
        </CustomFormControl>
    );
};