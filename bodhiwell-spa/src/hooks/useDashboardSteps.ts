import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { useUserStatus } from '../context/UserStatusContext';
import { useProfileCompletion } from '../context/ProfileCompletionContext';
import { useGetAvailability } from './useGetAvailability';
import { useGetReservations } from './useGetReservations';
import { IPatient } from '../types/Patient/Patient.type';

export type StepStatus = 'pending' | 'current' | 'completed';

export interface DashboardStep {
    id: string;
    label: string;
    status: StepStatus;
    actionLabel?: string;
    actionPath?: string;
    description?: string;
}

export const useDashboardSteps = () => {
    const { t } = useTranslation();
    const { user } = useAuthContext();
    const { userStatusData, loading: statusLoading } = useUserStatus();
    const { isProfileComplete, isPersonalInfoComplete, loading: completionLoading } = useProfileCompletion();
    const { data: availabilityData, loading: availabilityLoading } = useGetAvailability();
    const { data: reservationsData, loading: reservationsLoading } = useGetReservations();

    const loading = statusLoading || completionLoading || availabilityLoading || reservationsLoading;

    const isPatientProfileComplete = useMemo(() => {
        if (!user || user.type_account === 'professional') return false;

        // Cast user to IPatient to access details
        const patient = user as unknown as IPatient;

        const hasBasicInfo = !!(patient.first_name && patient.last_name);
        const details = patient.details || {};
        const hasDetails = !!(
            details.date_birth &&
            details.gender &&
            details.phone &&
            details.country &&
            details.city &&
            details.address &&
            details.zipcode
        );

        return hasBasicInfo && hasDetails;
    }, [user]);

    const hasBookings = useMemo(() => {
        return reservationsData && reservationsData.length > 0;
    }, [reservationsData]);

    const steps = useMemo<DashboardStep[]>(() => {
        if (!user) return [];

        const isProfessional = user.type_account === 'professional';
        const stepsList: DashboardStep[] = [];

        if (isProfessional) {
            // Step 1: Complete Profile
            const isFullProfileComplete = isProfileComplete && isPersonalInfoComplete;
            const profileStepStatus: StepStatus = isFullProfileComplete ? 'completed' : 'current';
            stepsList.push({
                id: 'complete_profile',
                label: t('dashboard.steps.professional.completeProfile'),
                status: profileStepStatus,
                actionLabel: profileStepStatus !== 'completed' ? t('dashboard.steps.action.complete') : undefined,
                actionPath: '/profile'
            });

            // Step 2: Admin Validation
            let validationStatus: StepStatus = 'pending';
            if (isFullProfileComplete) {
                if (userStatusData?.status === 'active') {
                    validationStatus = 'completed';
                } else if (userStatusData?.status === 'pending_approval' || userStatusData?.status === 'pending_completion') {
                    validationStatus = 'current';
                }
            }

            stepsList.push({
                id: 'admin_validation',
                label: t('dashboard.steps.professional.adminValidation'),
                status: validationStatus,
                description: validationStatus === 'current' ? t('dashboard.steps.status.waiting') : undefined
            });

            // Step 3: Add Availability
            let availabilityStatus: StepStatus = 'pending';
            if (validationStatus === 'completed') {
                if (availabilityData && availabilityData.length > 0) {
                    availabilityStatus = 'completed';
                } else {
                    availabilityStatus = 'current';
                }
            }

            stepsList.push({
                id: 'add_availability',
                label: t('dashboard.steps.professional.addAvailability'),
                status: availabilityStatus,
                actionLabel: availabilityStatus === 'current' ? t('dashboard.steps.action.add') : undefined,
                actionPath: '/availability'
            });

            // Step 4: Ready
            if (availabilityStatus === 'completed') {
                stepsList.push({
                    id: 'ready',
                    label: t('dashboard.steps.professional.ready'),
                    status: 'completed'
                });
            }

        } else {
            // Patient Flow
            // Step 1: Complete Profile
            // Use strict validation for Patient
            const profileStepStatus: StepStatus = isPatientProfileComplete ? 'completed' : 'current';
            stepsList.push({
                id: 'complete_profile',
                label: t('dashboard.steps.patient.completeProfile'),
                status: profileStepStatus,
                actionLabel: profileStepStatus !== 'completed' ? t('dashboard.steps.action.complete') : undefined,
                actionPath: '/profile'
            });

            // Step 2: Search Professionals (Find your Guide)
            // Completed if has at least one booking (attempt or confirmed)
            let searchStatus: StepStatus = 'pending';
            if (profileStepStatus === 'completed') {
                searchStatus = hasBookings ? 'completed' : 'current';
            }

            stepsList.push({
                id: 'search_professionals',
                label: t('dashboard.steps.patient.searchProfessionals'),
                status: searchStatus,
                actionLabel: searchStatus === 'current' ? t('dashboard.steps.action.search') : undefined,
                actionPath: '/#search-section'
            });
        }

        return stepsList;
    }, [user, t, isProfileComplete, isPersonalInfoComplete, userStatusData, availabilityData, isPatientProfileComplete, hasBookings]);

    return { steps, loading };
};
