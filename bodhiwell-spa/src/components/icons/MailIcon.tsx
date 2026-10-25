import { IconPropsType } from './types/IconsProps.type';

type MailIconProps = IconPropsType;

export const MailIcon = ({
  width = 22,
  height = 18,
  className = '',
  style = {},
  fillColor = 'none', 
  strokeColor = 'currentColor', 
}: MailIconProps & { strokeColor?: string }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 22 18"
      fill={fillColor}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M21 5V15C21 16.1046 20.1192 17 19.0328 17H2.96721C1.88075 17 1 16.1046 1 15V3C1 1.89543 1.88075 1 2.96721 1H15.4262C16.5127 1 17.3934 1.89543 17.3934 3V13.3333M5.2623 11H13.459M5.2623 6H13.459"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
};
