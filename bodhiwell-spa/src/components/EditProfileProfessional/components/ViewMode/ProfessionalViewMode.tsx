import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ProfessionalViewMode.module.scss';
import { ProfileData } from '../../../../types';
import tagIcon from '../../../../assets/images/tag.png';
import { Alert, Snackbar } from '@mui/material';

interface ProfessionalViewModeProps {
    user: ProfileData;
    form: any;
}

export const ProfessionalViewMode: React.FC<ProfessionalViewModeProps> = ({
    user,
    form,
}) => {
    const { t } = useTranslation();

    const fullName = `${user.profile.first_name} ${user.profile.last_name}`.trim();
    const isMspVerified = user.profile.details?.is_msp_verified;
    const [openSnackbar, setOpenSnackbar] = React.useState(false);

    const handleNativeShare = async () => {
        const publicUrl = `${window.location.origin}/professionals/${user.profile.uid}`;
        const shareDescription = t('landing.professionalsDetail.SocialShare.shareDescription', { name: fullName });

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `BodhiWell - ${fullName}`,
                    text: shareDescription,
                    url: publicUrl,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(publicUrl);
                setOpenSnackbar(true);
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        }
    };

    const mainProfessionFormatted = (() => {
        const mp = user.profile.details?.main_specialty as any;
        if (!mp) return t('appAdmin.EditProfessionalInfo.noProfession', "Sin profesión");
        const gender = user.profile.details?.gender;

        if (gender === 'male') return mp.titulo_masculino || mp.name;
        if (gender === 'female') return mp.titulo_femenino || mp.name;
        return mp.titulo_neutro || mp.name;
    })();

    const renderTags = () => {
        if (!user.profile.studies || !Array.isArray(user.profile.studies)) return null;

        const specialtiesFromStudies = user.profile.studies.filter(
            (s) => !s.delete && s.specialty
        );

        return (
            <div className={styles['profile-view__chip-row']}>
                {specialtiesFromStudies.map((study, index) => {
                    const slug = study.specialty?.dimension?.name || 'cuerpo';
                    return (
                        <span 
                            key={index} 
                            className={`${styles['profile-view__tag']} ${styles[`profile-view__tag--${slug.toLowerCase()}`]}`}
                        >
                            {study.specialty?.name}
                        </span>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={styles['profile-view']}>
            <div className={styles['profile-view__head']}>
                <div>
                    <h1 className={styles['profile-view__name']}>{fullName}</h1>
                    <p className={styles['profile-view__role']}>{mainProfessionFormatted}</p>
                </div>
                <div className={styles['profile-view__share']} onClick={handleNativeShare}>
                    {t('landing.professionalInfo.shareProfile', 'Compartir perfil')} ↗
                </div>
            </div>

            <div className={styles['profile-view__specialties']}>
                <div className={styles['profile-view__label']}>
                    <img className={styles['profile-view__icon-tag']} src={tagIcon} alt="" />
                    <span>{t('landing.professionalInfo.specialties', 'Especialidades')}</span>
                </div>
                {renderTags()}
            </div>

            <div className={styles['profile-view__meta-group']}>
                {isMspVerified && (
                    <div className={styles['profile-view__meta-line']}>
                        <span className={styles['profile-view__icon-check']}></span>
                        <span>{t('landing.professionalInfo.mspVerified', 'Registro MSP verificado')}</span>
                    </div>
                )}
                
                <div className={styles['profile-view__meta-line']}>
                    <span className={styles['profile-view__dot']}></span>
                    <span>{t('appAdmin.EditProfessionalInfo.consultationPrice')}: <b>$U {form.details.consult_price}</b></span>
                </div>
            </div>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
                    {t('landing.professionalsDetail.SocialShare.linkCopied', '¡Enlace copiado!')}
                </Alert>
            </Snackbar>
        </div>
    );
};