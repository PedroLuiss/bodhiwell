import { useState, useMemo } from 'react';
import { SelectChangeEvent } from '@mui/material/Select';
import { Option } from '../types';

interface UseMultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  maxLimit?: number;
}

export const useMultiSelectUi = ({
  options,
  value,
  onChange,
  maxLimit,
}: UseMultiSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const { target: { value: selectedVal } } = event;
    const newValues = typeof selectedVal === 'string' ? selectedVal.split(',') : selectedVal;

    if (maxLimit === 1) {
      const singleValue = newValues.length > 0 ? [newValues[newValues.length - 1]] : [];
      onChange(singleValue);
      return;
    }

    if (maxLimit === undefined || newValues.length <= maxLimit) {
      onChange(newValues);
    }
  };

  const handleDelete = (uidToDelete: string) => {
    onChange(value.filter((uid) => uid !== uidToDelete));
  };

  const handleClose = () => {
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredOptions,
    handleChange,
    handleDelete,
    handleClose,
  };
};