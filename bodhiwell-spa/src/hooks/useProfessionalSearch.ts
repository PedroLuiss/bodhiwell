import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { searchProfessionals } from '../services/professionalService';
import { ProfessionalsItem, SearchFilters } from '../types';

const INITIAL_FILTERS: SearchFilters = {
    q: '',
    dimension: null,
    specialties: [],
    page: 1,
    perPage: 8
};

export function useProfessionalSearch(executeOnMount = false, specialtiesList: any[] = [], loadingSpecialties = false) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const lastSearchRef = useRef<string>("");
    const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);
    
    const [results, setResults] = useState<ProfessionalsItem[]>([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 8 });
    const [loading, setLoading] = useState(executeOnMount);
    const [error, setError] = useState<string | null>(null);

    const executeSearch = useCallback(async (filtersToUse: SearchFilters) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await searchProfessionals(filtersToUse);
            setResults(response.data);
            setPagination({
                current_page: response.meta.current_page,
                last_page: response.meta.last_page,
                total: response.meta.total,
                per_page: response.meta.per_page
            });
        } catch (err: any) {
            setError(err.message || 'Error al buscar profesionales');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const dimUid = searchParams.get('dimension');
        const specUids = searchParams.getAll('specialties').flatMap(s => s.includes(',') ? s.split(',') : [s]).filter(Boolean);
        
        if (loadingSpecialties && (dimUid || specUids.length > 0)) return;

        const q = searchParams.get('q') || '';
        const page = parseInt(searchParams.get('page') || '1', 10);

        const newFilters: SearchFilters = {
            ...INITIAL_FILTERS, 
            q,
            dimension: dimUid ? { 
                uid: dimUid, 
                name: specialtiesList.find(s => s.dimension?.uid === dimUid)?.dimension?.name || dimUid 
            } : null,
            specialties: specUids.map(uid => {
                const s = specialtiesList.find(sp => sp.uid === uid);
                return { uid, name: s?.name || uid };
            }),
            page
        };

        const currentFiltersStr = JSON.stringify({ 
            q: newFilters.q, 
            dim: newFilters.dimension?.uid, 
            specs: newFilters.specialties.map(s => s.uid),
            page: newFilters.page 
        });

        if (currentFiltersStr !== lastSearchRef.current) {
            setFilters(newFilters);
            if (executeOnMount || lastSearchRef.current !== "") {
                executeSearch(newFilters);
            }
            lastSearchRef.current = currentFiltersStr;
        }
    }, [searchParams, executeOnMount, executeSearch, specialtiesList, loadingSpecialties]);


    const applyFilters = useCallback(() => {
        const params = new URLSearchParams();
        if (filters.q) params.set('q', filters.q);
        if (filters.dimension?.uid) params.set('dimension', filters.dimension.uid);
        if (filters.specialties.length > 0) {
            filters.specialties.forEach(item => params.append('specialties', item.uid));
        }
        
        params.set('page', '1'); 

        const targetPath = '/professionals';
        navigate(`${targetPath}?${params.toString()}`);
    }, [filters, navigate]);
    
    const setFilter = useCallback((key: keyof SearchFilters, value: any) => {
        setFilters(prev => {
            let newValue = value;
            if (key === 'dimension') {
                const s = specialtiesList.find(sp => sp.dimension?.uid === value);
                newValue = value ? { uid: value, name: s?.dimension?.name || value } : null;
            } else if (key === 'specialties') {
                newValue = (value as string[]).map(uid => {
                    const s = specialtiesList.find(sp => sp.uid === uid);
                    return { uid, name: s?.name || uid };
                });
            }
            const newState = { ...prev, [key]: newValue };
            if (key === 'dimension') {
                newState.specialties = []; 
            }
            return newState;
        });
    }, [specialtiesList]);

    const clearFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
        if (location.pathname === '/professionals') {
            navigate('/professionals');
        }
    }, [location.pathname, navigate]);

    const handleRemoveFilter = useCallback((type: 'q' | 'dimension' | 'specialty', value?: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');

        if (type === 'q') {
            params.delete('q');
        } else if (type === 'dimension') {
            params.delete('dimension');
            params.delete('specialties');
        } else if (type === 'specialty') {
            const currentSpecs = params.getAll('specialties').flatMap(s => s.split(',')).filter(Boolean);
            const newSpecs = currentSpecs.filter(t => t !== value);
            params.delete('specialties');
            newSpecs.forEach(uid => params.append('specialties', uid));
        }

        navigate(`/professionals?${params.toString()}`);
    }, [searchParams, navigate]);

    const navigatePage = useCallback((page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        navigate(`/professionals?${params.toString()}`);
    }, [searchParams, navigate]);

    return {
        filters,
        setFilter,
        results,
        pagination,
        loading,
        error,
        applyFilters,
        clearFilters,
        handleRemoveFilter,
        navigatePage,
        executeSearch: useCallback(() => executeSearch(filters), [executeSearch, filters]) 
    };
}