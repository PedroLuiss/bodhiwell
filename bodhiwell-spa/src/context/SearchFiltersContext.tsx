import React, { createContext, useContext, ReactNode } from 'react';
import { useProfessionalSearch } from '../hooks/useProfessionalSearch';
import { useSpecialties } from '../hooks/useSpecialties';

type SearchFiltersContextType = ReturnType<typeof useProfessionalSearch> & {
    specialtiesList: ReturnType<typeof useSpecialties>['specialties'];
    loadingSpecialties: boolean;
};

const SearchFiltersContext = createContext<SearchFiltersContextType | undefined>(undefined);

export const SearchFiltersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { specialties, loading: loadingSpecialties } = useSpecialties();
    const searchData = useProfessionalSearch(true, specialties, loadingSpecialties);

    const value: SearchFiltersContextType = {
        ...searchData,
        specialtiesList: specialties,
        loadingSpecialties
    };

    return (
        <SearchFiltersContext.Provider value={value}>
            {children}
        </SearchFiltersContext.Provider>
    );
};

export const useSearchFiltersContext = () => {
    const context = useContext(SearchFiltersContext);
    if (!context) {
        throw new Error('useSearchFiltersContext must be used within a SearchFiltersProvider');
    }
    return context;
};
