import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProfessionalForm, ProfileData, FormStudyItem, SystemSettings } from '../../../types';
import { systemSettingsService } from '../../../services/systemSettingsService';
import { getProfileDetails } from '../../../services/profileService';
import { useAuthContext } from '../../../context/AuthContext';
import { mapProfileToForm } from '../utils';
import { useAvailability } from '../../../hooks/useAvailability';

export const useProfessionalPreview = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuthContext();
    const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const professionalUid = user?.uid;
    const { availability, loading: availabilityLoading } = useAvailability(professionalUid || '');

    const getInitialFormData = useCallback((): ProfessionalForm => {
        if (location.state?.formData) return location.state.formData as ProfessionalForm;

        return {
            first_name: '',
            last_name: '',
            dni: '',
            details: {
                about: '',
                professional_info: '',
                banner_image: '',
                image: '',
                phone: '',
                date_birth: '',
                address: '',
                zipcode: '',
                city: '',
                country: '',
                language: '',
                main_profession: { uid: '', name: '' },
                specialty_tags: [],
                consult_price: 0,
                consult_time: 0,
                profile_media_type: 'image',
                profile_video_url: '',
                msp_number: '',
                policies: false,
                account_number: '',
                short_description: '',
                modality: undefined
            } as any,
            studies: []
        };
    }, [location.state]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await systemSettingsService.getSettings();
                setSystemSettings(settings);
            } catch (err) {
                console.error("Error loading system settings", err);
            }
        };
        fetchSettings();
    }, []);

    const [formData, setFormData] = useState<ProfessionalForm>(getInitialFormData());

    useEffect(() => {
        if (!location.state?.formData && isAuthenticated && user?.uid) {
            const userId = user.uid;
            const fetchProfile = async () => {
                setLoading(true);
                try {
                    const profileData = await getProfileDetails(userId);
                    if (profileData) {
                        const mappedData = mapProfileToForm({ profile: profileData });
                        setFormData(mappedData);
                    }
                } catch (err) {
                    console.error("Error fetching profile for preview", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        }
    }, [isAuthenticated, user?.uid, location.state]);

    const previewData = useMemo((): ProfileData | null => {
        if (!formData) return null;

        const handleFileUrl = (source: string | File | null | undefined) => {
            if (source instanceof File) return URL.createObjectURL(source);
            return source || '';
        };

        const normalizeContent = (content: string | null | undefined) => {
            if (!content) return null;
            const cleaned = content.replace(/<[^>]*>?/gm, '').trim();
            if (cleaned === '' || cleaned === '&nbsp;') return null;
            return content;
        };

        return {
            profile: {
                uid: 'preview',
                email: '',
                username: '',
                first_name: formData.first_name,
                last_name: formData.last_name,
                type_account: 'professional',
                dni: formData.dni,
                status: 'active',
                details: {
                    ...formData.details,
                    about: normalizeContent(formData.details.about),
                    professional_info: normalizeContent(formData.details.professional_info),
                    banner_image: handleFileUrl(formData.details.banner_image),
                    image: handleFileUrl((formData.details as any).image),
                    msp_number: formData.details.msp_number,
                    is_msp_verified: !!formData.details.msp_number,
                    main_specialty: formData.details.main_profession?.name ? formData.details.main_profession : null,
                } as any,
                studies: formData.studies.map((s: FormStudyItem) => ({
                    ...s,
                    url_certificate: handleFileUrl(s.url_certificate),
                    is_validated: true,
                })) as any,
            }
        };
    }, [formData]);

    const handleGoBack = useCallback(() => navigate(-1), [navigate]);

    return {
        t,
        formData,
        previewData,
        handleGoBack,
        systemSettings,
        loading,
        availability,
        availabilityLoading
    };
};