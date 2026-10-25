import { useRef, useMemo } from 'react';
import { useSearchFiltersContext } from '../../../context/SearchFiltersContext';

export const useProfessionalsList = () => {
  const listRef = useRef<HTMLDivElement>(null);

  const {
    results: professionals,
    loading,
    error,
    pagination,
    filters,
    clearFilters,
    handleRemoveFilter,
    navigatePage,
    loadingSpecialties
  } = useSearchFiltersContext();

  const handlePageChange = (page: number) => {
    navigatePage(page);
    listRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const hasActiveFilters = useMemo(() => Boolean(
    filters.q ||
    filters.dimension ||
    (filters.specialties && filters.specialties.length > 0)
  ), [filters]);

  return {
    professionals,
    loading: loading || loadingSpecialties,
    error,
    pagination,
    filters,
    hasActiveFilters,
    listRef,
    handlePageChange,
    handleRemoveFilter,
    clearFilters
  };
};