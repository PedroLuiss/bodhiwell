import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { getProfileMe } from '../../../services/profileService';
import useProfile from '../../../hooks/useProfile';
import { useNotification } from '../../../context/NotificationContext';
import { useUserStatus } from '../../../context/UserStatusContext';
import { useProfileCompletion } from '../../../context/ProfileCompletionContext';
import { localStorageHelper } from '../../../utils/localStorageHelper';
import { FormProfessionalInfoPersonal } from '../../../types';
import profilePlaceholder from '../../../assets/images/Bd_Placeholder.png';

const PERSONAL_INFO_AUTOSAVE_KEY = 'personal_info_backup';

export const usePersonalInfoPage = () => {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const { fetchUserStatus } = useUserStatus();
    const { updateProfile } = useProfile();
    const { checkCompletionStatus } = useProfileCompletion();

    // --- ESTADOS ---
    const [form, setForm] = useState<FormProfessionalInfoPersonal>({
        first_name: '',
        last_name: '',
        dni: '',
        details: {
            image: '',
            banner_image: '',
            account_number: '',
            bank_name: '',
            holder_name: '',
            phone: '',
            date_birth: '',
            gender: '',
            country: '',
            country_code: '',
            city: '',
            address: '',
            zipcode: ''
        },
    } as FormProfessionalInfoPersonal);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
    const [imageOriginal, setImageOriginal] = useState<File | null>(null);
    const [bannerOriginal, setBannerOriginal] = useState<File | null>(null);
    const [imageParams, setImageParams] = useState<string | null>(null);
    const [bannerParams, setBannerParams] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSaved, setLastSaved] = useState(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const isMounted = useRef(true);

    const loadProfile = useCallback(async (showLoading = true) => {
        if (showLoading) setFetching(true);
        setError(null);
        try {
            const profile = await getProfileMe();
            const countryData = profile?.details?.country;
            const countryCode = (typeof countryData === 'object' && countryData !== null) ? countryData.code : (countryData || '');

            const mapped = {
                first_name: profile?.first_name || '',
                last_name: profile?.last_name || '',
                dni: (profile?.dni as string) || '',
                details: {
                    account_number: profile?.details?.account_number || '',
                    bank_name: profile?.details?.bank_name || '',
                    holder_name: profile?.details?.holder_name || '',
                    phone: profile?.details?.phone || '',
                    date_birth: profile?.details?.date_birth ? dayjs(profile.details.date_birth).format('YYYY-MM-DD') : '',
                    gender: profile?.details?.gender || '',
                    country: countryCode,
                    country_code: profile?.details?.country_code || '',
                    city: profile?.details?.city || '',
                    address: profile?.details?.address || '',
                    zipcode: profile?.details?.zipcode || '',
                    image: profile?.details?.image || ''
                }
            };

            if (isMounted.current) {
                setForm(mapped as any);
            }
            return mapped;
        } catch (err: any) {
            const message = err?.message || t('appAdmin.EditProfessionalInfo.errorLoadingProfile');
            if (isMounted.current) setError(message);
        } finally {
            if (showLoading && isMounted.current) setFetching(false);
        }
    }, [t]);

    useEffect(() => {
        isMounted.current = true;
        loadProfile();
        return () => { isMounted.current = false; };
    }, [loadProfile]);

    useEffect(() => {
        if (!fetching) {
            const timer = setTimeout(() => {
                localStorageHelper.setItem(PERSONAL_INFO_AUTOSAVE_KEY, form);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [form, fetching]);

    useEffect(() => {
        if (newImageFile) {
            const url = URL.createObjectURL(newImageFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [newImageFile]);

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsDirty(true);
        if (field.startsWith('details.')) {
            const key = field.split('.')[1];
            setForm(prev => ({ ...prev, details: { ...prev.details, [key]: e.target.value } }));
        } else {
            setForm(prev => ({ ...prev, [field]: e.target.value }));
        }
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setNewImageFile(file);
    };

    const handlePhotoCropSave = (result: any) => {
        setIsDirty(true);
        const profileFileType = result.profileBlob.type || 'image/webp';
        const newProfileFile = new File([result.profileBlob], 'banner-cropped.webp', { type: profileFileType });
 
        const cardFileType = result.cardBlob.type || 'image/webp';
        const newCardFileRaw = new File([result.cardBlob], 'card-cropped.webp', { type: cardFileType });

        setNewImageFile(newCardFileRaw);
        setNewBannerFile(newProfileFile);
        setImageOriginal(result.cardOriginalFile);
        setBannerOriginal(result.profileOriginalFile);
        setImageParams(JSON.stringify(result.cardCrop));
        setBannerParams(JSON.stringify(result.profileCrop));

        setIsCropperOpen(false);
    };

    const validate = (): boolean => {
        const basicErrors: Record<string, string> = {};
        if (!form.dni?.trim()) basicErrors['dni'] = t('appAdmin.EditPersonalInfo.validation.dniRequired');
        if (!form.details.phone?.trim()) basicErrors['details.phone'] = t('appAdmin.EditPersonalInfo.validation.phoneRequired');
        if (!form.details.date_birth?.trim()) basicErrors['details.date_birth'] = t('appAdmin.EditPersonalInfo.validation.dateBirthRequired');
        if (!form.details.gender?.trim()) basicErrors['details.gender'] = t('appAdmin.EditPersonalInfo.validation.genderRequired');
        if (!form.details.country?.trim()) basicErrors['details.country'] = t('appAdmin.EditPersonalInfo.validation.countryRequired');
        if (!form.details.city?.trim()) basicErrors['details.city'] = t('appAdmin.EditPersonalInfo.validation.cityRequired');
        if (!form.details.address?.trim()) basicErrors['details.address'] = t('appAdmin.EditPersonalInfo.validation.addressRequired');
        if (!form.details.zipcode?.trim()) basicErrors['details.zipcode'] = t('appAdmin.EditPersonalInfo.validation.zipcodeRequired');
        if (!form.details.bank_name?.trim()) basicErrors['details.bank_name'] = t('appAdmin.EditPersonalInfo.validation.bankNameRequired');
        if (!form.details.account_number?.trim()) basicErrors['details.account_number'] = t('appAdmin.EditPersonalInfo.validation.accountNumberRequired');
        if (!form.details.holder_name?.trim()) basicErrors['details.holder_name'] = t('appAdmin.EditPersonalInfo.validation.holderNameRequired');

        setErrors(basicErrors);
        return Object.keys(basicErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setError(null);

        try {
            const { country_code, image, ...restDetails } = form.details;
            const payload: Record<string, any> = {
                dni: form.dni,
                first_name: form.first_name,
                last_name: form.last_name,
                details: {
                    ...restDetails,
                    date_birth: form.details.date_birth ? dayjs(form.details.date_birth).format('YYYY-MM-DD') : ''
                }
            };

            if (newImageFile) payload.details.image = newImageFile;
            if (newBannerFile) payload.details.banner_image = newBannerFile;
            if (imageOriginal) payload.details.image_original = imageOriginal;
            if (bannerOriginal) payload.details.banner_image_original = bannerOriginal;
            if (imageParams) payload.details.image_params = imageParams;
            if (bannerParams) payload.details.banner_image_params = bannerParams;

            await updateProfile(payload);
            await fetchUserStatus();
            await checkCompletionStatus();
            await loadProfile(false);

            setNewImageFile(null);
            setNewBannerFile(null);
            setImageOriginal(null);
            setBannerOriginal(null);
            setImageParams(null);
            setBannerParams(null);
            setLastSaved(true);
            setIsDirty(false);
            showNotification(t('appAdmin.dataSaved'), 'success', 4000);
        } catch (err: any) {
            const message = err?.message || t('landing.validation.unknownError');
            setError(message);
            showNotification(message, 'error', 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm({
            dni: '',
            details: { image: null, account_number: '', bank_name: '', holder_name: '', phone: '', date_birth: '', gender: '', country: '', city: '', address: '', zipcode: '' }
        } as any);
        setError(null);
        setErrors({});
        setNewImageFile(null);
        setNewBannerFile(null);
        setImageOriginal(null);
        setBannerOriginal(null);
        setImageParams(null);
        setBannerParams(null);
    };

    const imageUrl = useMemo(() => {
        if (previewUrl) return previewUrl;
        return form.details.image 
            ? `${process.env.REACT_APP_API_URL}${form.details.image}` 
            : profilePlaceholder;
    }, [previewUrl, form.details.image]);

    const handleExitClick = () => {
        if (isDirty) {
            setShowUnsavedModal(true);
        } else {
            setIsEditMode(false);
            setLastSaved(false);
        }
    };

    const handleConfirmExitWithoutSaving = async () => {
        setShowUnsavedModal(false);
        await loadProfile(false);
        setIsEditMode(false);
        setIsDirty(false);
        setLastSaved(false);
    };

    const handleConfirmSaveAndExit = async (e?: React.FormEvent) => {
        setShowUnsavedModal(false);
        await handleSubmit(e as any);
        setIsEditMode(false);
    };

    return {
        form, setForm, errors, setErrors, loading, fetching, error, 
        newImageFile, fileInputRef, imageUrl,
        handleChange, handleImageChange, handlePhotoCropSave, handleSubmit, handleReset, t,
        isCropperOpen, setIsCropperOpen, loadProfile,
        isEditMode, setIsEditMode, isDirty, setIsDirty,
        lastSaved, setLastSaved, showUnsavedModal, setShowUnsavedModal,
        handleExitClick, handleConfirmExitWithoutSaving, handleConfirmSaveAndExit
    };
};