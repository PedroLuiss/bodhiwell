import { useState, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

interface FilterConfig<T> {
  data: T[];
  searchKeys: (keyof T)[];
  dateKey: keyof T;        
}

export const useDataFilter = <T>({ data, searchKeys, dateKey }: FilterConfig<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [period, setPeriod] = useState<string>('all');

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    const today = dayjs();
    
    switch (newPeriod) {
      case 'week':
        setStartDate(today.subtract(1, 'week'));
        setEndDate(today);
        break;
      case 'month':
        setStartDate(today.subtract(1, 'month'));
        setEndDate(today);
        break;
      case '3months':
        setStartDate(today.subtract(3, 'month'));
        setEndDate(today);
        break;
      case 'year':
        setStartDate(today.subtract(1, 'year'));
        setEndDate(today);
        break;
      case 'all':
        setStartDate(null);
        setEndDate(null);
        break;
      default:
        break;
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = searchKeys.some((key) => {
        const value = item[key];
        return value 
          ? String(value).toLowerCase().includes(searchTerm.toLowerCase())
          : false;
      });

      if (searchTerm && !matchesSearch) return false;

      const itemDate = dayjs(item[dateKey] as string | Date);
      
      if (startDate && itemDate.isBefore(startDate, 'day')) return false;
      if (endDate && itemDate.isAfter(endDate, 'day')) return false;

      return true;
    });
  }, [data, searchTerm, startDate, endDate, searchKeys, dateKey]);

  return {
    searchTerm,
    setSearchTerm,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    period,
    handlePeriodChange,
    filteredData
  };
};