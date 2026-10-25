import { TextFieldProps } from '@mui/material';
import { CustomTextArea } from './TextAreaUi.styles';

export const TextAreaUi = (props: TextFieldProps) => {
    return (
        <CustomTextArea 
            {...props} 
            multiline
            InputLabelProps={{ 
                shrink: true, 
                ...props.InputLabelProps 
            }}
        />
    );
};
