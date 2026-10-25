export interface Option {
  uid: string;
  name: string;
}

export interface MultiSelectUiProps {
  label: string;
  options: Option[];
  value: string[];
  onChange: (selectedIds: string[]) => void;
  maxLimit?: number;
  errors?: string;
  tooltip?: string;
  disabled?: boolean;
}