import { AvailabilityTableProps } from '../../../../types';

export interface ExtendedAvailabilityTableProps extends AvailabilityTableProps {
  activeDate?: string | null;
  onSetActiveDate?: (date: string) => void;
  t: any;
}
