import { AvailabilityCalendarProps, CalendarEvent } from '../../../../types';

export interface ExtendedAvailabilityCalendarProps extends AvailabilityCalendarProps {
  activeDate?: string | null;
  hasChanges?: boolean;
  onSave?: () => void;
  onBack?: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
  lastSaved?: boolean;
}

export type {
  AvailabilityCalendarProps,
  CalendarEvent
};
