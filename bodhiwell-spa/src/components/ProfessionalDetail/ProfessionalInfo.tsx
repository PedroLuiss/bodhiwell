import React from 'react';
import styles from './ProfessionalInfo.module.scss';
import { ImageProfessional } from '../DetailPage/ImageProfessional/ImageProfessional';
import TabsComponent from '../DetailPage/TabsComponent/TabsComponent';
import { ProfileData } from '../../types';
import { useProfessionalInfo } from './hooks/useProfessionalInfo';
import { Alert, Snackbar } from '@mui/material';
import tagIcon from '../../assets/images/tag.png';

interface ProfessionalInfoProps {
    professional: ProfileData;
    aboutSettings?: { fallback: string; placeholder: string };
    professionalInfoSettings?: { fallback: string; placeholder: string };
}

export const ProfessionalInfo: React.FC<ProfessionalInfoProps> = ({
    professional,
    aboutSettings,
    professionalInfoSettings,
}) => {
    const {
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
        handleNativeShare,
        openSnackbar,
        setOpenSnackbar,
        hasUserPurpose,
        displayAboutRaw,
        getTagClass
    } = useProfessionalInfo(professional, aboutSettings, styles);

    return (
        <main className={styles['prof-info']}>
            <section className={`${styles['prof-info__card']} ${styles['prof-info__card--media']}`}>
                <div className={styles['prof-info__hero-wrapper']}>
                    <ImageProfessional
                        image={imageUrl}
                        mediaType={profile.details?.profile_media_type ?? undefined}
                        videoUrl={profile.details?.profile_video_url ?? undefined}
                    />
                </div>
            </section>

            <section className={`${styles['prof-info__card']} ${styles['prof-info__card--profile']}`}>
                <div className={styles['prof-info__profile-head']}>
                    <div>
                        <h1 className={styles['prof-info__name']}>{fullName}</h1>
                        <p className={styles['prof-info__role']}>{mainProfession}</p>
                    </div>
                    <div className={styles['prof-info__share']} onClick={handleNativeShare}>
                        {t('landing.professionalInfo.shareProfile', 'Compartir perfil')} ↗

                    </div>
                </div>

                {profile.studies?.length > 0 && (
                    <div className={styles['prof-info__specialties-row']}>
                        <div className={styles['prof-info__specialties-label']}>
                            <img className={styles['prof-info__icon-tag']} src={tagIcon} alt="" />
                            <span>{t('landing.professionalInfo.specialties', 'Especialidades')}</span>
                        </div>
                        <div className={styles['prof-info__chip-row']}>
                            {profile.studies.map((study, idx) => (
                                study.is_validated && (
                                    <span key={idx} className={getTagClass(study.specialty?.dimension?.name.toLowerCase())}>
                                        {study.specialty?.name}
                                    </span>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {profile.details?.is_msp_verified && (
                    <div className={styles['prof-info__meta-line']}>
                        <span className={styles['prof-info__icon-check']}></span>
                        <span>{t('landing.professionalInfo.mspVerified', 'Registro MSP verificado')}</span>
                    </div>
                )}
            </section>

            <section className={`${styles['prof-info__card']} ${styles['prof-info__card--section']}`}>
                <h2 className={styles['prof-info__section-title']}>
                    {t('landing.professionalInfo.purposeTitle', 'Mi propósito y enfoque')}
                </h2>
                <div className={styles['prof-info__copy']}>
                    <div dangerouslySetInnerHTML={{ __html: hasUserPurpose ? (showFullAbout ? aboutRaw : aboutPreview) : displayAboutRaw }} />
                    {hasUserPurpose && isLong && (
                        <button
                            className={styles['prof-info__read-more']}
                            onClick={() => toggleShowFullAbout()}
                        >
                            {showFullAbout ? t('landing.professionalInfo.readLess') : t('landing.professionalInfo.readMore')}
                        </button>
                    )}
                </div>
            </section>

            <section className={`${styles['prof-info__card']} ${styles['prof-info__card--tabs']}`}>
                <TabsComponent
                    professionalInfo={profile.details?.professional_info ?? undefined}
                    studies={profile.studies ?? undefined}
                    educationDefaultText={professionalInfoSettings?.fallback}
                />
            </section>

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
        </main>
    );
};