import { FormStudyItem, ProfessionalForm, ProfileData } from "../../../types";

export const mapProfileToForm = (user: ProfileData): ProfessionalForm => {
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
        } as any,
        studies,
    };
};