import { IconPropsType } from './types/IconsProps.type';

type IconArrowSwapProps = & IconPropsType

export const IncreaseViewIcon = ({
    width = 20,
    height = 20,
    className = '',
    style = {},
    fillColor = 'currentColor',
}: IconArrowSwapProps) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={style}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.55261 17.4997C6.88588 17.4997 7.15605 17.2295 7.15605 16.8962C7.15605 16.563 6.88588 16.2928 6.55261 16.2928H4.56123L8.70341 12.1506C8.93906 11.915 8.93906 11.5329 8.70341 11.2972C8.46775 11.0616 8.08568 11.0616 7.85002 11.2972L3.70785 15.4394V13.448C3.70785 13.1148 3.43768 12.8446 3.10441 12.8446C2.77114 12.8446 2.50098 13.1148 2.50098 13.448V16.8962C2.50098 17.2295 2.77114 17.4997 3.10441 17.4997H6.55261Z"
                fill={fillColor}
            />
            <path
                d="M11.2991 7.84904C11.0634 8.0847 11.0634 8.46677 11.2991 8.70243C11.5347 8.93809 11.9168 8.93809 12.1524 8.70243L16.2946 4.56026V6.55164C16.2946 6.8849 16.5648 7.15507 16.8981 7.15507C17.2313 7.15507 17.5015 6.8849 17.5015 6.55164V3.10344C17.5015 2.77017 17.2313 2.5 16.8981 2.5H13.4499C13.1166 2.5 12.8464 2.77017 12.8464 3.10344C12.8464 3.4367 13.1166 3.70687 13.4499 3.70687H15.4412L11.2991 7.84904Z"
                fill={fillColor}
            />
        </svg>
    );
};

