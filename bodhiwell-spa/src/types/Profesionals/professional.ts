import { IAvailabilitySlot, ReservationAvailability } from "../Availability/Availability.type";
import { ProfessionItem } from '../../services/professionsService';

export interface IProfessionalDetail {
    image?: string | File | null;
    date_birth?: string | null;
    gender?: string | null;
    country?: {
        code: string;
        name: string;
    };
    country_code?: string;
    city?: string | null;
    zipcode?: string | null;
    address?: string | null;
    language?: string | null;
    about?: string | null;
    phone?: string | null;
    account_number?: string | null;
    holder_name?: string | null;
    bank_name?: string | null;
    policies?: boolean | null;
    medical_condition?: string | null;
    consult_price?: number | null;
    consult_time?: number | null;
    consult_type?: string | null;
    msp_number?: string | null;
    is_msp_verified?: boolean;
    main_specialty?: {
        uid: string;
        name: string;
        nombre?: string;
        titulo_masculino?: string;
        titulo_femenino?: string;
        titulo_neutro?: string;
    } | null;
    base_profession?: {
        uid: string;
        name: string;
    } | null;
    main_specialty_uid?: string;
    base_profession_uid?: string;
    short_description?: string | null;
    banner_image?: string | File | null;
    professional_info?: string | null;
    profile_media_type?: 'image' | 'video' | null;
    profile_video_url?: string | null;
    image_original?: string | File | null;
    image_params?: string | null;
    banner_image_original?: string | File | null;
    banner_image_params?: string | null;
}

export interface profesionStudies {
    uid?: string;
    name?: string;
    institute?: string;
    type?: {
        code: string,
        label: string
    },
    type_other?: string;
    date_start?: string;
    date_end?: string;
    delete?: boolean;
    url_certificate?: string | File | null;
    specialty?: {
        uid: string;
        name: string;
        requires_msp?: boolean;
        dimension?: {
            uid: string;
            name: string;
            slug: string;
            color_code?: string;
            colorCode?: string;
            icon?: string;
        }
    } | null;
    is_validated?: boolean;
}

export interface professionsItems {
    uid?: string | undefined;
    name?: string;
    status?: string;
    delete?: boolean;
    registro_msp_obligatorio?: boolean;
}

export interface professionsCertificate {
    uid?: string;
    name?: string;
    status?: {
        code: string,
        label: string
    },
    institute?: string;
    url_file?: string | File | null;
    delete?: boolean
}

export interface SpecialtyCategory {
    uid: string;
    name: string;
    slug: string;
    colorCode?: string;
    icon?: string;
}

export interface SpecialtyTags {
    uid: string;
    name: string;
    slug: string;
    category?: SpecialtyCategory;
    category_uid?: string;
    registro_msp_obligatorio?: boolean;
}


export type StatusUser = 'pending_completion' | 'pending_approval' | 'rejected' | 'active';

export interface ProfileResponse {
    uid: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    type_account: string;
    dni: string;
    status: StatusUser;
    details: IProfessionalDetail;
    studies: profesionStudies[];
}

export interface ProfileData {
    profile: ProfileResponse;
}

export interface UseProfessionalDetailResult {
    professional: ProfileData | null;
    loading: boolean;
    error: string | [] | null;
    refetch: () => Promise<void>;
}

export interface ProfessionalsItem {
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    uid: string;
    type_account: "professional" | "patient";
    main_profession: string | null;
    name: string | null;
    image: string | null;
    short_description: string | null;
    banner_image: string;
    profile_media_type?: 'image' | 'video';
    profile_video_url?: string;
    has_msp?: boolean;
    main_specialty?: {
        uid: string;
        name: string;
        is_msp_required?: boolean;
        dimension?: {
            uid: string;
            name: string;
        }
    };
}



export type WeekDay =
    | 'Lunes'
    | 'Martes'
    | 'Miércoles'
    | 'Jueves'
    | 'Viernes'
    | 'Sábado'
    | 'Domingo';

export interface IAvailability {
    dayInt: number;
    day: WeekDay;
    start: string;
    end: string;
}

export interface IAvailabilityByDate {
    dayInt: number;
    day: WeekDay;
    date: string;
    slots: IAvailabilitySlot[];
    hasReservation?: boolean;
    reservations?: ReservationAvailability[];
}


export interface UseAvailabilityResult {
    availability: IAvailabilityByDate[] | null;
    loading: boolean;
    error: string | null;
    refetchAvailability: () => Promise<void>;
}

export interface ConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}
export interface FormProfessionalInfoPersonal {
    first_name?: string;
    last_name?: string;
    dni: string;
    details: {
        image: string | null | File;
        banner_image: string | null | File;
        account_number: string;
        bank_name: string;
        holder_name: string;
        phone: string;
        date_birth: string;
        gender: string;
        country: string;
        country_code: string;
        city: string;
        address: string;
        zipcode: string;
    }
}

export interface CertificateViewerModalProps {
    open: boolean;
    onClose: () => void;
    fileUrl: string | null;
    fileName?: string;
    fileType?: string;
}





export interface ProfessionalUpdatePayload {
    first_name: string;
    last_name: string;
    dni: string;
    type_account?: string;
    msp_number?: string;
    details: {
        date_birth?: string;
        gender?: string;
        country?: string;
        city?: string;
        zipcode?: string;
        address?: string;
        language?: string;
        about: string;
        phone: string;
        account_number: string;
        holder_name?: string;
        bank_name?: string;
        consult_price: string | number;
        consult_time?: string | number;
        consult_type: string;
        main_specialty_uid?: string;
        short_description?: string;
        professional_info?: string;
        policies?: boolean;
        profile_media_type: string;
        profile_video_url?: string;
        image?: File | string;
        image_original?: File | string;
        image_params?: string;
        banner_image?: File | string;
        banner_image_original?: File | string;
        banner_image_params?: string;
    };
    studies: {
        uid?: string;
        name?: string;
        institute?: string;
        type?: string;
        date_start?: string;
        date_end?: string;
        specialty_uid?: string;
        delete: boolean;
        url_certificate?: File | string | null;
    }[];
}

export interface ProfessionalInfoProps {
    user: ProfileData;
    onSubmit?: (data: ProfessionalUpdatePayload) => Promise<void> | void;
    style?: React.CSSProperties;
    editable?: boolean;
    loading?: boolean;
    allowInternalToggle?: boolean;
    professions: ProfessionItem[];
}

export interface ProfessionalFormDetails {
    about: string;
    account_number: string;
    phone: string;
    date_birth: string;
    gender?: string;
    country?: string;
    city?: string;
    zipcode?: string;
    address?: string;
    language?: string;
    holder_name?: string;
    bank_name?: string;
    short_description: string;
    professional_info: string;
    main_profession: { uid: string; name: string };
    banner_image: string | File;
    image?: string | File | null;
    modality: string | undefined;
    specialty_tags: string[];
    consult_price: string | number;
    consult_time?: string | number;
    profile_media_type: string;
    profile_video_url: string;
    msp_number?: string;
    policies?: boolean;
    image_original?: string | File | null;
    image_params?: string | null;
    banner_image_original?: string | File | null;
    banner_image_params?: string | null;
}

export interface FormStudyItem extends profesionStudies {
    url_certificate?: string | File | null;
}

export interface ProfessionalForm {
    first_name: string;
    last_name: string;
    dni: string;
    details: ProfessionalFormDetails;
    studies: FormStudyItem[];
}