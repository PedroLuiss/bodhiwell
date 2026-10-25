import React from 'react';

export interface ColumnDefinitionTableUi<T> {
  header: string;
  accessor: keyof T | 'actions';
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface PaginationControlledProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newLimit: number) => void;
}

export interface ReminderConfig<T> {
  checkIsActive: (item: T) => boolean;
  onToggle: (item: T) => void;
  tooltipTitle: string;
  tooltipMessage: string;
  activeColor?: string;
}

export interface TableUiProps<T> {
  columns: ColumnDefinitionTableUi<T>[];
  data: T[];
  textempty?: string;
  pagination?: PaginationControlledProps;
  reminderConfig?: ReminderConfig<T>;
}

export type SortDirection = 'ascending' | 'descending';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}