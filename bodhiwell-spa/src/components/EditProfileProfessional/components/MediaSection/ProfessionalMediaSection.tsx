import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageProfessional } from '../../../DetailPage/ImageProfessional/ImageProfessional';
import { TextFieldUi } from '../../../ui/TextFieldUi/TextFieldUi';
import ProfessionalPhotoCropper from '../../../ProfessionalPhotoEditor/ProfessionalPhotoCropper';
import type { CropResult } from '../../../ProfessionalPhotoEditor/types';
import styles from './ProfessionalMediaSection.module.scss';
import { ProfileData } from '../../../../types';

interface ProfessionalMediaSectionProps {
    isEditMode: boolean;
    form: any;
    errors: any;
    setFieldValue: (path: string, value: any) => void;
    setNewImageFile: (file: File | null) => void;
    newImageFile: File | null;
    handlePhotoCropSave: (result: CropResult) => void;
    imageUrl: string;
    user: ProfileData;
}

export const ProfessionalMediaSection: React.FC<ProfessionalMediaSectionProps> = ({
    isEditMode,
    form,
    errors,
    setFieldValue,
    newImageFile,
    handlePhotoCropSave,
    imageUrl,
    user
}) => {
    const { t } = useTranslation();
    const [cropperOpen, setCropperOpen] = useState(false);

    const currentImageUrl = newImageFile ? URL.createObjectURL(newImageFile) : imageUrl;

    if (!isEditMode) {
        return (
            <div className={styles['media-display']}>
                <ImageProfessional
                    image={imageUrl}
                    mediaType={user.profile.details?.profile_media_type as 'image' | 'video'}
                    videoUrl={user.profile.details?.profile_video_url || ''}
                />
            </div>
        );
    }

    return (
        <section className={styles['card']}>
            <h3>{t('appAdmin.EditProfessionalInfo.mediaTitle', 'Portada del perfil')}</h3>
            <p className={styles['card-desc']}>
                {t('appAdmin.EditProfessionalInfo.mediaDesc', 'La imagen se gestiona directamente sobre la portada. El video se carga aparte, como un enlace.')}
                <br />
                {t('appAdmin.EditProfessionalInfo.mediaDesc2', 'Recomendación de imagen: 1200 × 500 px.')}
            </p>

            <div className={styles['hero-preview']}>
                <ImageProfessional
                    image={currentImageUrl}
                    mediaType="image"
                    videoUrl={form.details.profile_video_url}
                    isEditMode={true}
                />

                <div className={styles['hero-overlay']}>
                    <button
                        type="button"
                        className={styles['btn-secondary-on-image']}
                        onClick={() => setCropperOpen(true)}
                    >
                        {t('appAdmin.EditProfessionalInfo.changeImage', 'Cambiar imagen')}
                    </button>
                </div>
            </div>

            <div className={styles['fields']}>
                <div className={`${styles['field']} ${styles['full']}`}>
                    <label className={styles['label']}>
                        {t('appAdmin.EditProfessionalInfo.videoUrlLabel', 'Video de presentación')}
                    </label>
                    <TextFieldUi
                        placeholder="https://www.youtube.com/..."
                        value={form.details.profile_video_url || ''}
                        onChange={e => setFieldValue('details.profile_video_url', e.target.value)}
                        error={!!errors.profile_video_url}
                        helperText={null} 
                        fullWidth
                    />
                    <div className={styles['helper']}>
                        {t('appAdmin.EditProfessionalInfo.videoHelper', 'Pegá el enlace de tu video para mostrarlo en tu perfil.')}
                    </div>
                </div>
            </div>

            {errors.banner_image_or_video && (
                <div className={styles['media-manager__error']}>{errors.banner_image_or_video}</div>
            )}

            <ProfessionalPhotoCropper
                open={cropperOpen}
                onClose={() => setCropperOpen(false)}
                onSave={handlePhotoCropSave}
            />
        </section>
    );
};