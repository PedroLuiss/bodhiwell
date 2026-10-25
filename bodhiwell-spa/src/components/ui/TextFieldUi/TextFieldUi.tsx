import { TextFieldProps } from '@mui/material'; 
import { CustomTextField, getNumberInputStyles } from './TextFieldUi.styles';
import { SxProps, Theme } from '@mui/material';

export const TextFieldUi = (props: TextFieldProps) => {
    const numberInputStyles: SxProps<Theme> | undefined = getNumberInputStyles(props.type);
    
    return (
        <CustomTextField 
            {...props} 
            InputLabelProps={{ 
                shrink: true, 
                ...props.InputLabelProps 
            }}
            sx={[
                numberInputStyles, 
                props.sx           
            ] as SxProps<Theme>} 
        />
    );
};