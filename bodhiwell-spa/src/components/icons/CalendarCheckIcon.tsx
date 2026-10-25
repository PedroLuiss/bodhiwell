import { IconPropsType } from './types/IconsProps.type';

type CalendarCheckIconProps = IconPropsType;

export const CalendarCheckIcon = ({
  width = 34,
  height = 38,
  className = '',
  style = {},
  fillColor = 'currentColor',
}: CalendarCheckIconProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 34 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M25.5567 19.114L23.5544 17.1L14.3367 26.372L10.3322 22.344L8.33 24.358L14.3367 30.4L25.5567 19.114ZM30.2222 3.8H28.3333V0H24.5556V3.8H9.44444V0H5.66667V3.8H3.77778C1.68111 3.8 0.0188889 5.51 0.0188889 7.6L0 34.2C0 36.29 1.68111 38 3.77778 38H30.2222C32.3 38 34 36.29 34 34.2V7.6C34 5.51 32.3 3.8 30.2222 3.8ZM30.2222 34.2H3.77778V13.3H30.2222V34.2Z"
        fill={fillColor}
      />
    </svg>
  );
};
