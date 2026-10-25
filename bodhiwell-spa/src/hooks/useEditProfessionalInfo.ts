import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import { localStorageHelper } from '../utils/localStorageHelper';
import {
    PROFESSIONAL_PROFILE_AUTOSAVE_KEY,
    MODALITY_OPTIONS
} from '../constants';
import { CropResult } from '../components/ProfessionalPhotoEditor/types';
import {
    ProfessionalForm,
    ProfessionalInfoProps,
    ProfileData,
    FormStudyItem,
    ProfessionalUpdatePayload
} from '../types';
import { useSystemSettings } from './useSystemSettings';


const mapProfileToForm = (user: ProfileData): ProfessionalForm => {
    const { profile } = user;

    const studies: FormStudyItem[] = profile.studies ? profile.studies.map((study: any) => {
        let typeObj = { code: '', label: '' };
        if (study.type) {
            if (typeof study.type === 'object') {
                typeObj = { 
                    code: study.type.code || '', 
                    label: study.type.label || study.type.name || study.type.code || '' 
                };
            } else {
                typeObj = { code: study.type, label: study.type };
            }
        }

        let specialtyObj = null;
        if (study.specialty) {
            if (typeof study.specialty === 'object') {
                specialtyObj = {
                    uid: study.specialty.uid || '',
                    name: study.specialty.name || study.specialty.nombre || '',
                    requires_msp: !!study.specialty.requires_msp,
                    dimension: study.specialty.dimension
                };
            } else {
                specialtyObj = { uid: study.specialty, name: '', requires_msp: false };
            }
        }

        return {
            ...study,
            type: typeObj,
            specialty: specialtyObj,
            url_certificate: study.url_certificate || '',
            type_other: study.type_other || '',
        };
    }) : [];

    const allStudyTags = studies
        .filter(s => !s.delete && s.specialty?.uid)
        .map(s => s.specialty!.uid);
    const uniqueTags = Array.from(new Set(allStudyTags));

    return {
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        dni: profile.dni || '',
        details: {
            about: profile.details?.about || '',
            account_number: profile.details?.account_number || '',
            phone: profile.details?.phone || '',
            date_birth: profile.details?.date_birth || '',
            gender: profile.details?.gender || '',
            country: profile.details?.country?.code || profile.details?.country_code || '',
            city: profile.details?.city || '',
            zipcode: profile.details?.zipcode || '',
            address: profile.details?.address || '',
            language: profile.details?.language || '',
            holder_name: profile.details?.holder_name || '',
            bank_name: profile.details?.bank_name || '',
            short_description: profile.details?.short_description || '',
            professional_info: profile.details?.professional_info || '',
            main_profession: profile.details?.main_specialty?.uid 
                ? { uid: profile.details.main_specialty.uid, name: profile.details.main_specialty.name || profile.details.main_specialty.nombre || '' }
                : (profile.details?.base_profession?.uid 
                    ? { uid: profile.details.base_profession.uid, name: profile.details.base_profession.name || '' }
                    : { uid: "", name: "" }),
            banner_image: profile.details?.banner_image || '',
            image: profile.details?.image || null,
            modality: profile.details?.consult_type || '',
            specialty_tags: uniqueTags,
            consult_price: profile.details?.consult_price || 0,
            consult_time: profile.details?.consult_time || '',
            profile_media_type: profile.details?.profile_media_type || 'image',
            profile_video_url: profile.details?.profile_video_url || '',
            policies: profile.details?.policies || false,
            image_original: profile.details?.image_original || null,
            image_params: profile.details?.image_params || null,
            banner_image_original: profile.details?.banner_image_original || null,
            banner_image_params: profile.details?.banner_image_params || null,
        },
        studies,
    };
};


export const useEditProfessionalInfo = (props: ProfessionalInfoProps) => {
    const { user, onSubmit, editable = false } = props;
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const { settings } = useSystemSettings();

    const [form, setForm] = useState<ProfessionalForm>(() => mapProfileToForm(user));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [internalEditing, setInternalEditing] = useState(false);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newCardFile, setNewCardFile] = useState<File | null>(null);
    const [newImageOriginalFile, setNewImageOriginalFile] = useState<File | null>(null);
    const [newCardOriginalFile, setNewCardOriginalFile] = useState<File | null>(null);
    const [imageParams, setImageParams] = useState<string | null>(null);
    const [bannerImageParams, setBannerImageParams] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSaved, setLastSaved] = useState(false);
    const lastSavedData = React.useRef<string | null>(null);

    const isEditMode = editable || internalEditing;

    useEffect(() => {
        if (!internalEditing && !editable) {
            setForm(mapProfileToForm(user));
        } else {
            const savedData = localStorageHelper.getItem<Partial<ProfessionalForm>>(PROFESSIONAL_PROFILE_AUTOSAVE_KEY);
            if (savedData) {
                setForm(prev => ({ ...prev, ...savedData }));
            }
        }
    }, [user, internalEditing, editable]);


    useEffect(() => {
        if (isEditMode) {
            const initialForm = mapProfileToForm(user);
            
            const normalize = (obj: any) => {
                return JSON.stringify(obj, (key, value) => {
                    if (value && typeof value === 'object' && (value instanceof File)) return 'file';
                    if (value === null || value === undefined) return '';
                    return value;
                });
            };

            const currentFormJson = normalize(form);
            const initialFormJson = normalize(initialForm);
            
            const baseJson = (lastSaved && lastSavedData.current) ? lastSavedData.current : initialFormJson;
            
            const isDifferent = currentFormJson !== baseJson || 
                               newImageFile !== null || 
                               newCardFile !== null;
            
            setIsDirty(isDifferent);
            
            if (isDifferent) {
                setLastSaved(false);
                lastSavedData.current = null;
            }

            const timer = setTimeout(() => {
                const formToSave = JSON.parse(JSON.stringify(form, (key, value) => {
                    if (value && typeof value === 'object' && (value instanceof File || value.lastModified)) {
                        return undefined;
                    }
                    return value;
                }));
                localStorageHelper.setItem(PROFESSIONAL_PROFILE_AUTOSAVE_KEY, formToSave);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [form, isEditMode, user, newImageFile, newCardFile, lastSaved]);

    const setFieldValue = useCallback((path: string, value: unknown) => {
        setErrors(prev => ({ ...prev, [path]: '' }));
        setForm(prev => {
            const segments = path.split('.');
            const newState = { ...prev };
            let cursor: Record<string, any> = newState;

            for (let i = 0; i < segments.length - 1; i++) {
                const key = segments[i];
                cursor[key] = Array.isArray(cursor[key])
                    ? [...cursor[key]]
                    : { ...(cursor[key] || {}) };
                cursor = cursor[key];
            }

            cursor[segments[segments.length - 1]] = value;
            return newState;
        });
    }, []);

    useEffect(() => {
        if (isEditMode) {
            const allStudyTags = form.studies
                .filter(s => !s.delete && s.specialty?.uid)
                .map(s => s.specialty!.uid);

            const uniqueTags = Array.from(new Set(allStudyTags));
            const currentGlobalTags = form.details.specialty_tags || [];
            if (JSON.stringify(uniqueTags.sort()) !== JSON.stringify([...currentGlobalTags].sort())) {
                setFieldValue('details.specialty_tags', uniqueTags);
            }
        }
    }, [form.studies, form.details.specialty_tags, isEditMode, setFieldValue]);

    const mspRequired = useMemo(() => {
        return form.studies.some(s => !s.delete && s.specialty?.requires_msp === true);
    }, [form.studies]);



    const updateList = useCallback((listName: 'studies', updater: (arr: FormStudyItem[]) => FormStudyItem[]) => {
        setForm(prev => ({ ...prev, [listName]: updater(prev[listName] || []) }));
        setErrors(prev => ({ ...prev, [listName]: '' }));
    }, []);


    const handleOtherProfessionsChange = useCallback((event: React.ChangeEvent<{ value: unknown }>) => {
        const val = event.target.value;
        const selectedUids = Array.isArray(val) ? (val as string[]) : (typeof val === 'string' ? val.split(',') : []);
        const selectedObjects = selectedUids.map((uid: string) => ({ uid }));

        setFieldValue('professions', [...selectedObjects]);
    }, [setFieldValue]);
 
    const handlePhotoCropSave = useCallback((result: CropResult) => {
        const profileFileType = result.profileBlob.type || 'image/webp';
        const newProfileFile = new File([result.profileBlob], 'banner-cropped.webp', { type: profileFileType });
 
        const cardFileType = result.cardBlob.type || 'image/webp';
        const newCardFileRaw = new File([result.cardBlob], 'card-cropped.webp', { type: cardFileType });
 
        setNewImageFile(newProfileFile);
        setNewCardFile(newCardFileRaw);
 
        setNewImageOriginalFile(result.profileOriginalFile);
        setNewCardOriginalFile(result.cardOriginalFile);
        setBannerImageParams(JSON.stringify(result.profileCrop));
        setImageParams(JSON.stringify(result.cardCrop));
 
        setFieldValue('details.banner_image', newProfileFile);
        setFieldValue('details.image', newCardFileRaw);
    }, [setFieldValue]);

    const validate = (): string[] => {
        if (!isEditMode) return [];

        const basicErrors: Record<string, string> = {};
        const missingFields: string[] = [];

        const addError = (key: string, labelKey: string, defaultLabel: string, errorKey: string, isMissing = true) => {
            const label = t(`appAdmin.EditProfessionalInfo.fieldName.${labelKey}`, defaultLabel);
            basicErrors[key] = t(`appAdmin.EditProfessionalInfo.${errorKey}`);
            if (isMissing) missingFields.push(label);
        };

        if (!form.first_name?.trim()) addError('first_name', 'firstName', 'Nombre', 'firstNameRequired');
        if (!form.last_name?.trim()) addError('last_name', 'lastName', 'Apellido', 'lastNameRequired');

        if (form.details.consult_price === null || form.details.consult_price === '' || form.details.consult_price === 0) {
            addError('consult_price', 'consultPrice', 'Precio de consulta', 'consultPriceRequired');
        }
        if (!form.details.modality) addError('modality', 'modality', 'Modalidad de atención', 'modalityRequired');
        if (!form.details.main_profession?.uid) addError('main_profession', 'mainProfession', 'Profesión principal', 'mainProfessionRequired');



        const activeStudies = form.studies?.filter(s => !s.delete);
        activeStudies.forEach((study, i) => {
            const originalIndex = form.studies.findIndex(s => s === study);
            const suffix = ` (#${i + 1})`;

            if (!study.name?.trim()) {
                basicErrors[`studies_name_${originalIndex}`] = t('appAdmin.EditProfessionalInfo.studyNameRequired');
                missingFields.push(t('appAdmin.EditProfessionalInfo.fieldName.studiesName', 'Nombre del estudio') + suffix);
            }
            if (!study.institute?.trim()) {
                basicErrors[`studies_institute_${originalIndex}`] = t('appAdmin.EditProfessionalInfo.studyInstituteRequired');
                missingFields.push(t('appAdmin.EditProfessionalInfo.fieldName.studiesInstitute', 'Instituto') + suffix);
            }
            if (!study.type?.code) {
                basicErrors[`studies_type_${originalIndex}`] = t('appAdmin.EditProfessionalInfo.studyTypeRequired');
                missingFields.push(t('appAdmin.EditProfessionalInfo.fieldName.studiesType', 'Tipo de estudio') + suffix);
            } else if (study.type.code === 'other' && !study.type_other?.trim()) {
                basicErrors[`studies_type_other_${originalIndex}`] = t('appAdmin.EditProfessionalInfo.studyTypeOtherRequired', 'Debe especificar el tipo de estudio');
                missingFields.push(t('appAdmin.EditProfessionalInfo.fieldName.studiesTypeOther', 'Especificación de tipo de estudio') + suffix);
            }
            if (!study.specialty?.uid) {
                basicErrors[`studies_specialty_tags_${originalIndex}`] = t('appAdmin.EditProfessionalInfo.studySpecialtyRequired', 'Especialidad es requerida');
                missingFields.push(t('appAdmin.EditProfessionalInfo.fieldName.studiesSpecialty', 'Especialidad') + suffix);
            }

            if (!study.date_start) {
                basicErrors[`studies_date_start_${originalIndex}`] = t('appAdmin.EditProfessionalInfo.studyDateStartRequired');
                missingFields.push(t('appAdmin.EditProfessionalInfo.fieldName.studiesDateStart', 'Fecha de inicio') + suffix);
            }
            if (!study.date_end) {
                basicErrors[`studies_date_end_${originalIndex}`] = t('appAdmin.EditProfessionalInfo.studyDateEndRequired');
                missingFields.push(t('appAdmin.EditProfessionalInfo.fieldName.studiesDateEnd', 'Fecha de fin') + suffix);
            }
        });

        if (form.details.profile_media_type === 'video' && !form.details.profile_video_url?.trim()) {
            basicErrors['profile_video_url'] = t('appAdmin.EditProfessionalInfo.videoUrlRequired', 'La URL del video es requerida');
            missingFields.push(t('appAdmin.EditProfessionalInfo.videoUrl', 'URL del Video'));
        }

        setErrors(basicErrors);
        return missingFields;
    };




    const handleSubmit = async (e?: React.FormEvent, stayInEditMode = false) => {
        if (e) e.preventDefault();
        const missingFields = validate();

        if (missingFields.length > 0) {
            const message = t('appAdmin.EditProfessionalInfo.requiredFieldsDetailed', {
                fields: missingFields.join(', ')
            });
            showNotification(message, 'error');
            return;
        }

        localStorageHelper.setItem(PROFESSIONAL_PROFILE_AUTOSAVE_KEY, form);

        setSubmitting(true);

        try {
            const details = form.details;
            const consultType = (MODALITY_OPTIONS.find(opt => opt.label === details.modality)?.value ?? details.modality) || 'presential';
            const consultPrice = details.consult_price === '' ? '0' : String(details.consult_price);

            const studiesPayload = form.studies.map(study => {
                if (study.delete) {
                    return {
                        uid: study.uid,
                        delete: true
                    };
                }

                return {
                    uid: study.uid,
                    name: study.name || '',
                    institute: study.institute || '',
                    type: study.type?.code === 'other' ? (study.type_other || '') : (study.type?.code || ''),
                    date_start: study.date_start ? study.date_start.slice(0, 10) : '',
                    date_end: study.date_end ? study.date_end.slice(0, 10) : '',
                    specialty_uid: study.specialty?.uid,
                    delete: false,
                    url_certificate: study.url_certificate instanceof File ? study.url_certificate : null
                };
            });

            const dataToSubmit: ProfessionalUpdatePayload = {
                first_name: form.first_name,
                last_name: form.last_name,
                dni: form.dni,

                details: {
                    date_birth: details.date_birth ? details.date_birth.slice(0, 10) : undefined,
                    gender: details.gender,
                    country: details.country,
                    city: details.city,
                    zipcode: details.zipcode,
                    address: details.address,
                    language: details.language,
                    about: details.about,
                    phone: details.phone,
                    account_number: details.account_number,
                    holder_name: details.holder_name,
                    bank_name: details.bank_name,
                    consult_price: consultPrice,
                    consult_time: details.consult_time,
                    consult_type: consultType,
                    main_specialty_uid: details.main_profession?.uid,
                    short_description: details.short_description,
                    professional_info: details.professional_info,
                    policies: details.policies,
                    profile_media_type: details.profile_media_type,
                    profile_video_url: details.profile_video_url,
                    banner_image: newImageFile || undefined,
                    image: newCardFile || undefined,
                    image_original: newCardOriginalFile || undefined,
                    image_params: imageParams || undefined,
                    banner_image_original: newImageOriginalFile || undefined,
                    banner_image_params: bannerImageParams || undefined,
                },
                studies: studiesPayload
            };

            const cleanObject = (obj: any): any => {
                if (Array.isArray(obj)) {
                    return obj.map(item => cleanObject(item));
                }
                if (obj !== null && typeof obj === 'object' && !(obj instanceof File)) {
                    return Object.fromEntries(
                        Object.entries(obj)
                            .filter(([_, value]) => value !== null && value !== undefined && value !== '')
                            .map(([key, value]) => [key, cleanObject(value)])
                    );
                }
                return obj;
            };

            const cleanedData = cleanObject(dataToSubmit);

            if (onSubmit) {
                await onSubmit(cleanedData);
            }

            
            
            setNewImageFile(null);
            setNewCardFile(null);
            setNewImageOriginalFile(null);
            setNewCardOriginalFile(null);
            setImageParams(null);
            setBannerImageParams(null);

            localStorageHelper.removeItem(PROFESSIONAL_PROFILE_AUTOSAVE_KEY);
            if (stayInEditMode) {
                setLastSaved(true);
                setIsDirty(false);
                
                const normalize = (obj: any) => {
                    return JSON.stringify(obj, (key, value) => {
                        if (value && typeof value === 'object' && (value instanceof File)) return 'file';
                        if (value === null || value === undefined) return '';
                        return value;
                    });
                };
                lastSavedData.current = normalize(form);
            } else {
                if (!editable) setInternalEditing(false);
            }

            showNotification(t('appAdmin.EditProfessionalInfo.saveSuccess', 'Perfil actualizado con éxito'), 'success');

        } catch (err: unknown) {
            const error = err as { message?: string };
            showNotification(error.message || t('appAdmin.EditProfessionalInfo.formError'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = useCallback(() => {
        localStorageHelper.removeItem(PROFESSIONAL_PROFILE_AUTOSAVE_KEY);
        setInternalEditing(false);
        setForm(mapProfileToForm(user));
        setErrors({});
        setNewImageFile(null);
        setNewCardFile(null);
        setNewImageOriginalFile(null);
        setNewCardOriginalFile(null);
        setImageParams(null);
        setBannerImageParams(null);
    }, [user]);

    



    const handlePreview = () => {
        window.open('/profile/preview', '_blank');
    };


    useEffect(() => {
        return () => {
            localStorageHelper.removeItem(PROFESSIONAL_PROFILE_AUTOSAVE_KEY);
            localStorageHelper.removeItem('professional_preview_data');
        };
    }, []);

    return {
        form,
        errors,
        submitting,
        isEditMode,
        internalEditing,
        newImageFile,
        newCardFile,
        setInternalEditing,
        setNewImageFile,
        setNewCardFile,
        setNewImageOriginalFile,
        setNewCardOriginalFile,
        setImageParams,
        setBannerImageParams,
        handlePhotoCropSave,
        setFieldValue,
        updateList,
        handleOtherProfessionsChange,
        handleSubmit,
        handleCancel,
        mspRequired,
        handlePreview,
        settings,
        isDirty,
        lastSaved
    };
};
