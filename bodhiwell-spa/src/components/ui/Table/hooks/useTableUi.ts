import { useState, useMemo } from 'react';
import { TableUiProps, SortConfig, SortDirection } from '../types';

export const useTableUi = <T extends { uid: string | number }>(props: TableUiProps<T>) => {
  const { data, pagination } = props;
  
  const isServerPaginated = !!pagination;
  const [internalCurrentPage, setInternalCurrentPage] = useState<number>(1);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState<number>(10);
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);

  const currentPage = isServerPaginated ? pagination.currentPage : internalCurrentPage;
  const rowsPerPage = isServerPaginated ? pagination.rowsPerPage : internalRowsPerPage;
  
  const sortedData = useMemo(() => {
    if (!sortConfig) return [...data];
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const dataToRender = useMemo(() => {
    if (isServerPaginated) return sortedData;
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [isServerPaginated, sortedData, currentPage, rowsPerPage]);

  const totalPages = isServerPaginated 
    ? pagination.totalPages 
    : Math.ceil(data.length / rowsPerPage);

  const handleSort = (key: keyof T) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = Number(e.target.value);
    if (isServerPaginated) {
      pagination.onRowsPerPageChange(newLimit);
    } else {
      setInternalRowsPerPage(newLimit);
      setInternalCurrentPage(1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (isServerPaginated) {
      pagination.onPageChange(newPage);
    } else {
      setInternalCurrentPage(newPage);
    }
  };

  const paginationItems = useMemo(() => {
    const items = [];
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (currentPage <= half) end = Math.min(totalPages, maxButtons);
    if (currentPage + half >= totalPages) start = Math.max(1, totalPages - maxButtons + 1);

    if (start > 1) {
      items.push(1);
      if (start > 2) items.push('...');
    }
    for (let i = start; i <= end; i++) items.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) items.push('...');
      items.push(totalPages);
    }
    return items;
  }, [currentPage, totalPages]);

  return {
    currentPage,
    rowsPerPage,
    totalPages,
    sortConfig,
    dataToRender,
    paginationItems,
    handleSort,
    handleRowsPerPageChange,
    handlePageChange,
  };
};