import { IconPropsType } from './types/IconsProps.type';

type IconDotsVerticalProps = & IconPropsType

export const DotsVerticalIcon = ({
  width = 4,
  height = 16,
  className = '',
  style = {},
  fillColor = 'currentColor',
}:IconDotsVerticalProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 4 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 15.5002C1.17157 15.5002 0.5 14.8286 0.5 14.0002C0.5 13.1717 1.17157 12.5002 2 12.5002C2.82843 12.5002 3.5 13.1717 3.5 14.0002C3.5 14.8286 2.82843 15.5002 2 15.5002ZM2 9.50015C1.17157 9.50015 0.5 8.82858 0.5 8.00015C0.5 7.17173 1.17157 6.50015 2 6.50015C2.82843 6.50015 3.5 7.17173 3.5 8.00015C3.5 8.82858 2.82843 9.50015 2 9.50015ZM2 3.50015C1.17157 3.50015 0.5 2.82858 0.5 2.00015C0.5 1.17173 1.17157 0.500152 2 0.500152C2.82843 0.500152 3.5 1.17173 3.5 2.00015C3.5 2.82858 2.82843 3.50015 2 3.50015Z"
        fill={fillColor}
      />
    </svg>
  );
};

