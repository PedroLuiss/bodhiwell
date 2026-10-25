import axiosInstance from './axiosInstance';
import { ProfileData, IAvailabilityByDate, ProfessionalsItem } from '../types/Profesionals/professional'
import { PaginatedResponse, SearchFilters } from '../types';

/**
 * Obtiene detalle de un profesional por UID
 * @param uid - UID del profesional
 * @returns datos del profesional
 * @throws payload de error si falla la petición
 */
export async function getProfessionalByUid(
    uid: string
): Promise<ProfileData> {
    try {
        const response = await axiosInstance.get(`/profile/${uid}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
}

/**
 * Búsqueda ponderada de profesionales con filtros
 */
export async function searchProfessionals(filters: SearchFilters): Promise<PaginatedResponse<ProfessionalsItem>> {
    try {
        const params = new URLSearchParams();
        if (filters.q) params.append('q', filters.q);
        if (filters.dimension) params.append('dimension', filters.dimension.uid);
        if (filters.specialties && filters.specialties.length > 0) {
            filters.specialties.forEach(item => params.append('specialties', item.uid));
        }

        const response = await axiosInstance.get<ProfessionalsItem[]>(`/professionals?${params.toString()}`);

        const allResults = response.data;
        const total = allResults.length;

        const start = (filters.page - 1) * filters.perPage;
        const end = start + filters.perPage;
        const paginatedData = allResults.slice(start, end);

        return {
            data: paginatedData,
            meta: {
                current_page: filters.page,
                last_page: Math.ceil(total / filters.perPage) || 1,
                per_page: filters.perPage,
                total: total
            }
        };

    } catch (error: any) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
}

/**
 * Obtiene listado de profesionales
 * @returns listado de profesionales
 * @throws payload de error si falla la petición
 */
export async function getListProfessionals(): Promise<ProfessionalsItem[]> {
    const response = await searchProfessionals({
        q: '',
        dimension: null,
        specialties: [],
        page: 1,
        perPage: 100
    });
    return response.data;
}

export async function getAvailability(
    uid: string
): Promise<IAvailabilityByDate[]> {
    try {
        const { data } = await axiosInstance.get(`/api/professionals/${uid}/availabilities`);
        return data;
    } catch (error: any) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
}