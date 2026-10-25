import React from 'react';
import { MenuItem, TextField, Tooltip } from '@mui/material';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import dayjs from 'dayjs';

import styles from './BookingPanel.module.scss';
import { ERROR_TOOLTIP_PROPS, CALENDAR_SX, TEXT_FIELD_SX } from './constant';
import { BookingPanelProps } from './types';
import { useBookingPanel } from './hooks';

import virtualIcon from '../../assets/images/virtual.png';
import presencialIcon from '../../assets/images/presencial.png';

export const BookingPanel: React.FC<BookingPanelProps> = (props) => {
    const {
        viewsConfirmDate = false,
        modality = 'Presencial',
        loading = false,
        consultPrice,
    } = props;

    const {
        t,
        currentLocale,
        displayDate,
        displayTime,
        timeOptions,
        timeError,
        ServerDay,
        dayTooltipOpen,
        timeTooltipOpen,
        selectDayFirstTooltipOpen,
        bookingModality,
        setDayTooltipOpen,
        setTimeTooltipOpen,
        setSelectDayFirstTooltipOpen,
        setBookingModality,
        handleDateUpdate,
        handleTimeUpdate,
        handleShowBookingModal,
        shouldDisableDate,
        validateTimeOnBlur,
        calendarHeight,
        setCurrentMonth,
    } = useBookingPanel(props);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={currentLocale}>
            <aside className={styles['booking']}>
                <h3 className={styles['booking__title']}>
                    {t('landing.professionalsDetail.bookingPanel.availabilityTitle', 'Disponibilidad')}
                </h3>

                {!viewsConfirmDate && (
                    <div className={styles['booking__legend']}>
                        <span><span className={styles['booking__dot']}></span>{t('landing.professionalsDetail.bookingPanel.legend.availableDay')}</span>
                        <span><span className={`${styles['booking__dot']} ${styles['booking__dot--selected']}`}></span>{t('landing.professionalsDetail.bookingPanel.legend.selectedDay')}</span>
                    </div>
                )}

                    <Tooltip
                        open={dayTooltipOpen}
                        title={t('landing.professionalsDetail.bookingPanel.tooltipSelectDay')}
                        {...ERROR_TOOLTIP_PROPS}
                    >
                        <div onClick={() => setDayTooltipOpen(false)}>
                            <DateCalendar
                                showDaysOutsideCurrentMonth
                                value={displayDate}
                                onChange={handleDateUpdate}
                                onMonthChange={(newMonth) => setCurrentMonth(newMonth)}
                                shouldDisableDate={shouldDisableDate}
                                loading={loading}
                                slots={{ day: ServerDay }}
                                views={['day']}
                                sx={{
                                    ...CALENDAR_SX,
                                    height: `${calendarHeight}px !important`,
                                    minHeight: `${calendarHeight}px !important`,
                                    transition: 'height 0.2s ease-in-out',
                                }}
                            />
                        </div>
                    </Tooltip>

                <div className={styles['booking__field-wrapper']}>
                    <Tooltip
                        open={timeTooltipOpen || selectDayFirstTooltipOpen}
                        title={selectDayFirstTooltipOpen ? t('landing.professionalsDetail.bookingPanel.tooltipSelectDayFirst') : t('landing.professionalsDetail.bookingPanel.tooltipSelectTime')}
                        placement="top"
                        arrow
                        {...ERROR_TOOLTIP_PROPS}
                    >
                        <div 
                            className={styles['booking__field-inner']}
                            onClick={() => !displayDate && setSelectDayFirstTooltipOpen(true)}
                        >
                            <TextField
                                select
                                fullWidth
                                value={displayTime}
                                onChange={(e) => handleTimeUpdate(e.target.value)}
                                onBlur={validateTimeOnBlur}
                                onClick={() => setTimeTooltipOpen(false)}
                                disabled={!displayDate}
                                error={!!timeError}
                                label={displayTime ? "" : t('landing.professionalsDetail.bookingPanel.selectTimePlaceholder', 'Selecciona un horario')}
                                SelectProps={{
                                    IconComponent: () => (
                                        <svg className={styles['booking__field-icon']} viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="8"></circle>
                                            <path d="M12 8v5l3 2"></path>
                                        </svg>
                                    )
                                }}
                                sx={TEXT_FIELD_SX}
                            >
                                {displayDate && timeOptions.length > 0 ? (
                                    timeOptions.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                                            {dayjs(opt.value, 'HH:mm').format('h:mm A')}
                                            {opt.disabled ? ` (${t('landing.professionalsDetail.bookingPanel.Reserved', 'Reservado')})` : ''}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled value="">
                                        {t('landing.professionalsDetail.bookingPanel.selectTimePlaceholder')}
                                    </MenuItem>
                                )}
                            </TextField>
                        </div>
                    </Tooltip>
                </div>

                {modality && (
                    <>
                        <div className={styles['booking__helper-text']}>
                            {modality === 'Presencial/Virtual' 
                                ? t('landing.professionalsDetail.bookingPanel.selectAppointmentModality', 'Selecciona la modalidad de la consulta')
                                : t('landing.professionalsDetail.bookingPanel.appointmentModality', 'Modalidad de la consulta')
                            }
                        </div>
                        <div 
                            className={styles['booking__split-card']}
                            style={{ gridTemplateColumns: modality === 'Presencial/Virtual' ? '1fr 1fr' : '1fr' }}
                        >
                            {(modality === 'Presencial/Virtual' || modality === 'Virtual') && (
                                <button 
                                    className={bookingModality === 'Virtual' ? styles['is-active'] : ''}
                                    onClick={() => modality === 'Presencial/Virtual' && setBookingModality('Virtual')}
                                    style={{ cursor: modality === 'Presencial/Virtual' ? 'pointer' : 'default' }}
                                >
                                    <img src={virtualIcon} alt="Virtual" />
                                    <span>{t('landing.professionalsDetail.bookingPanel.virtual', 'Virtual')}</span>
                                </button>
                            )}
                            {(modality === 'Presencial/Virtual' || modality === 'Presencial') && (
                                <button 
                                    className={bookingModality === 'Presencial' ? styles['is-active'] : ''}
                                    onClick={() => modality === 'Presencial/Virtual' && setBookingModality('Presencial')}
                                    style={{ 
                                        cursor: modality === 'Presencial/Virtual' ? 'pointer' : 'default',
                                        borderLeft: modality === 'Presencial/Virtual' ? '' : 'none' 
                                    }}
                                >
                                    <img src={presencialIcon} alt="Presencial" />
                                    <span>{t('landing.professionalsDetail.bookingPanel.presential', 'Presencial')}</span>
                                </button>
                            )}
                        </div>
                    </>
                )}

                <div className={styles['booking__price-card']}>
                    <div className={styles['booking__price-label']}>
                        {t('landing.professionalsDetail.bookingPanel.consultValue', 'Valor de la consulta')}
                    </div>
                    <div className={styles['booking__price-value']}>
                        {`$U ${consultPrice ?? '0'}`}
                    </div>
                </div>

                {!viewsConfirmDate && (
                    <button
                        onClick={handleShowBookingModal}
                        disabled={loading || !displayDate || !displayTime}
                        className={styles['booking__cta']}
                    >
                        {t('landing.professionalsDetail.bookingPanel.btnReserveNow', 'Reservar consulta')}
                    </button>
                )}
            </aside>
        </LocalizationProvider>
    );
};