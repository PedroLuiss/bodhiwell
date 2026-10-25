import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import truncate from 'truncate-html';
import { ProfileData } from '../../../types';
import imageDetail from '../../../assets/images/Bd_Placeholder.png';

export const useProfessionalInfo = (
    professional: ProfileData, 
    aboutSettings?: { fallback: string; placeholder: string },
    styles?: { [key: string]: string }
) => {
    const { t } = useTranslation();
    const TRUNCATE_LENGTH = 300;
    const { profile } = professional;

    const [showFullAbout, setShowFullAbout] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const fullName = `${profile.first_name} ${profile.last_name}`;
    
    const mainProfession = profile.details?.main_specialty?.name 
        || t('landing.professionalInfo.noProfession');
        
    const aboutRaw = profile.details?.about || "";

    const aboutCleaned = aboutRaw ? aboutRaw.replace(/<[^>]*>?/gm, '').trim() : '';
    const hasUserPurpose = aboutCleaned !== '';
    const displayAboutRaw = hasUserPurpose ? aboutRaw : (aboutSettings?.fallback || t('appAdmin.EditProfessionalInfo.aboutMePlaceholder'));

    const isLong = aboutRaw.replace(/<[^>]*>/g, '').length > TRUNCATE_LENGTH;
    
    const aboutPreview = isLong 
        ? truncate(aboutRaw, TRUNCATE_LENGTH, { byWords: false, ellipsis: '...' }) 
        : aboutRaw;

    const imageUrl = profile.details?.banner_image
        ? (profile.details.banner_image.toString().startsWith('blob:') || profile.details.banner_image.toString().startsWith('data:')
            ? profile.details.banner_image.toString()
            : (process.env.REACT_APP_API_URL || "") + profile.details.banner_image)
        : imageDetail;

    const toggleShowFullAbout = () => setShowFullAbout(prev => !prev);

    const handleNativeShare = async () => {
        const currentUrl = window.location.href;
        const shareDescription = t('landing.professionalsDetail.SocialShare.shareDescription', { name: fullName });

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `BodhiWell - ${fullName}`,
                    text: shareDescription,
                    url: currentUrl,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(currentUrl);
                setOpenSnackbar(true);
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        }
    };

    const getTagClass = (slug?: string) => {
        if (!slug || !styles) return '';
        const baseClass = styles['prof-info__tag'] || '';
        if (slug.includes('cuerpo')) return `${baseClass} ${styles['prof-info__tag--cuerpo'] || ''}`;
        if (slug.includes('mente')) return `${baseClass} ${styles['prof-info__tag--mente'] || ''}`;
        if (slug.includes('conciencia')) return `${baseClass} ${styles['prof-info__tag--conciencia'] || ''}`;
        if (slug.includes('energia')) return `${baseClass} ${styles['prof-info__tag--energia'] || ''}`;
        return baseClass;
    };

    return {
        profile,
        fullName,
        mainProfession,
        aboutRaw,
        aboutPreview,
        showFullAbout,
        isLong,
        imageUrl,
        toggleShowFullAbout,
        t,
        openSnackbar,
        setOpenSnackbar,
        handleNativeShare,
        aboutCleaned,
        hasUserPurpose,
        displayAboutRaw,
        getTagClass
    };
};