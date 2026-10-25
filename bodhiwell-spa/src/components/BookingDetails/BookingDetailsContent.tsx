import React from 'react';
import styles from './BookingDetailsContent.module.scss';
import { IBookingDetail } from '../../types/Booking/booking';
import imagePlaceholder from '../../assets/images/plaholderprofilewhite.png';
import BookingStatusInfo from './BookingStatusInfo';
import RedPagosAlert from './RedPagosAlert';
import { useBookingDetailsContent } from './hooks/useBookingDetailsContent';
import { renderNoteWithLinks } from './renderNoteWithLinks';
import { ButtonUi } from '../../components/ui/ButtonUi/ButtonUi';
import VisibilityIcon from '@mui/icons-material/Visibility';
import classNames from 'classnames';

interface BookingDetailsContentProps {
    bookingDetail: IBookingDetail;
    onAction?: (actionType: string) => void;
    isActionLoading?: boolean;
    onUpdateBooking?: (id: string, data: { notes: string }) => Promise<any>;
    isUpdateLoading?: boolean;
}


const BookingDetailsContent: React.FC<BookingDetailsContentProps> = (props) => {
    const { bookingDetail, isActionLoading, isUpdateLoading } = props;

    const {
        t, isProfessional, isVirtual, date, formattedTime, durationDisplay, modalityLabel,
        displayText, needsTruncation, isReasonExpanded, toggleReasonExpansion,
        isEditingNote, setIsEditingNote, noteContent, setNoteContent, handleSaveNote,
        handleCancelEdit, handleCreateMeetLink, handleViewProfessionalProfile,
        handleViewPatientProfile, handleStatusAction, getPatientPlaceholderMessage,
        showProfessionalReminder
    } = useBookingDetailsContent(props);

    return (
        <div className={styles['booking']}>
            {showProfessionalReminder && (
                <div className={styles['booking__reminder']}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                    </svg>
                    <span>
                        {isVirtual 
                            ? t('appAdmin.BookingDetailsContent.missingLink') 
                            : t('appAdmin.BookingDetailsContent.missingAddress')}
                    </span>
                </div>
            )}

            <header className={styles['booking__header']}>
                <h1 className={styles['booking__title']}>{t('appAdmin.BookingDetailsContent.title')}</h1>
                <p className={styles['booking__subtitle']}>
                    {t('appAdmin.BookingDetailsContent.subtitle', {
                        professional: bookingDetail.professional,
                        patient: bookingDetail.patient,
                    })}
                </p>
            </header>

            <main className={styles['booking__grid']}>
                <div className={styles['booking__info-column']}>
                    <div className={styles['booking__card']}>
                        <div className={styles['info-grid']}>
                            <div className={styles['info-item']}>
                                <label className={styles['info-item__label']}>{t('appAdmin.BookingDetailsContent.name')}</label>
                                <div className={styles['info-item__profile-link']}>
                                    <p className={styles['info-item__value']}>{bookingDetail.patient}</p>
                                    {isProfessional && (
                                        <button onClick={handleViewPatientProfile} className={styles['info-item__view-btn']}>
                                            {t('appAdmin.BookingDetailsContent.viewProfile')} ↗
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className={styles['info-item']}>
                                <label className={styles['info-item__label']}>{t('appAdmin.BookingDetailsContent.consultationReason')}</label>
                                <p className={styles['info-item__value']}>{displayText}</p>
                                {needsTruncation && (
                                    <button onClick={toggleReasonExpansion} className={styles['info-item__more-btn']}>
                                        {isReasonExpanded ? t('appAdmin.BookingDetailsContent.viewLess') : t('appAdmin.BookingDetailsContent.viewMore')}
                                    </button>
                                )}
                            </div>

                            <div className={styles['info-item']}>
                                <label className={styles['info-item__label']}>{t('appAdmin.BookingDetailsContent.date')}</label>
                                <p className={styles['info-item__value']}>{date} — {formattedTime}</p>
                            </div>

                            <div className={styles['info-item']}>
                                <label className={styles['info-item__label']}>{t('appAdmin.BookingDetailsContent.modality')}</label>
                                <p className={styles['info-item__value']}>{modalityLabel} ({durationDisplay})</p>
                            </div>
                        </div>

                        <div className={styles['booking__divider']} />

                        <div className={styles['notes-section']}>
                            <label className={styles['info-item__label']}>{t('appAdmin.BookingDetailsContent.note')}</label>
                            {isEditingNote ? (
                                <div className={styles['notes-editor']}>
                                    <textarea
                                        className={styles['notes-editor__input']}
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        placeholder={t('appAdmin.BookingDetailsContent.notePlaceholder')}
                                    />
                                    <div className={styles['notes-editor__actions']}>
                                        {isVirtual && (
                                            <button onClick={handleCreateMeetLink} className={styles['notes-editor__meet']}>
                                                {t('appAdmin.BookingDetailsContent.generateLink')}
                                            </button>
                                        )}
                                        <div className={styles['notes-editor__buttons']}>
                                            <button className={styles['notes-editor__btn--cancel']} onClick={handleCancelEdit}>{t('appAdmin.BookingDetailsContent.cancel')}</button>
                                            <button className={styles['notes-editor__btn--save']} onClick={handleSaveNote} disabled={isUpdateLoading}>
                                                {isUpdateLoading ? t('appAdmin.BookingDetailsContent.savingNote') : t('appAdmin.BookingDetailsContent.saveNote')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles['notes-display']}>
                                    <p className={classNames(styles['notes-display__text'], { [styles['notes-display__text--empty']]: !bookingDetail.notes })}>
                                        {bookingDetail.notes 
                                            ? renderNoteWithLinks(bookingDetail.notes) 
                                            : (isProfessional ? t('appAdmin.BookingDetailsContent.noNotes') : getPatientPlaceholderMessage())}
                                    </p>
                                    {isProfessional && bookingDetail.status === 'CONFIRMED' && (
                                        <button className={styles['notes-display__edit']} onClick={() => setIsEditingNote(true)}>
                                            {t('appAdmin.BookingDetailsContent.editNote')}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {!isProfessional && <RedPagosAlert bookingDetail={bookingDetail} />}
                    
                    <div className={styles['booking__status-wrapper']}>
                        <BookingStatusInfo
                            bookingDetail={bookingDetail}
                            onAction={handleStatusAction}
                            isActionLoading={isActionLoading}
                            userType={isProfessional ? 'professional' : 'patient'}
                            reservationDateTime={bookingDetail.date_start}
                        />
                    </div>
                </div>

                <aside className={styles['booking__sidebar']}>
                    <div className={classNames(styles['booking__card'], styles['professional-card'])}>
                        <div className={styles['professional-card__avatar-frame']}>
                            <div 
                                className={styles['professional-card__img-container']} 
                                style={{ backgroundImage: `url(${bookingDetail.banner_image ? process.env.REACT_APP_API_URL + bookingDetail.banner_image : imagePlaceholder})` }}
                            >
                            </div>
                        </div>
                        <div className={styles['professional-card__info']}>
                            <h2 className={styles['professional-card__name']}>{bookingDetail.professional}</h2>
                            <p className={styles['professional-card__specialty']}>
                                {bookingDetail.main_specialty?.name || t('appAdmin.BookingDetailsContent.noSpecialty')}
                            </p>
                        </div>
                        <ButtonUi 
                            variant="outlined" 
                            fullWidth 
                            onClick={handleViewProfessionalProfile}
                            startIcon={<VisibilityIcon />}
                        >
                            {t('appAdmin.BookingDetailsContent.viewProfile')}
                        </ButtonUi>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default BookingDetailsContent;