import { ButtonProps } from '@mui/material';
import { CustomButton } from './ButtonUi.styles';

export const ButtonUi = (props: ButtonProps) => {
    return <CustomButton {...props} disableRipple />;
};