import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import { useAvailabilityCalendar } from './hooks/useAvailabilityCalendar';
import styles from './AvailabilityCalendar.module.scss';

import { ExtendedAvailabilityCalendarProps } from './types/AvailabilityCalendar.types';

dayjs.extend(isSameOrAfter);
dayjs.extend(utc);

const AvailabilityCalendar = (props: ExtendedAvailabilityCalendarProps) => {
  const {
    t,
    i18n,
    calendarRef,
    containerRef,
    currentView,
    isMobile,
    today,
    calendarEvents,
    handleSelect,
    handleEventChange,
    handleDateClick,
    renderDayHeaderContent,
    renderSlotLabelContent,
    handleEventClickTimeRange,
    renderEventContent,
    renderDayCellContent,
    handleViewChange,
    handleDayCellDidMount,
    handleDayHeaderDidMount,
    handleDatesSet
  } = useAvailabilityCalendar(props);

  const {
    onSave,
    onBack,
    isSaving,
    isDirty,
    lastSaved
  } = props;

  return (
    <>
      <div ref={containerRef} className={styles['calendar-wrapper']}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          dayCellContent={renderDayCellContent}
          dayCellDidMount={handleDayCellDidMount}
          dayHeaderDidMount={handleDayHeaderDidMount}
          dayHeaderContent={renderDayHeaderContent}
          slotLabelContent={renderSlotLabelContent}
          dayHeaderFormat={isMobile ? { weekday: 'narrow' } : { weekday: 'short', day: 'numeric', month: 'numeric', omitCommas: true }}
          selectAllow={(selectInfo) => {
            const now = dayjs();
            const selectionStart = dayjs(selectInfo.start);
            return selectionStart.isSameOrAfter(now);
          }}
          dayCellClassNames={(arg) => {
            return dayjs(arg.date).isBefore(today, 'day') ? styles['past-event'] : '';
          }}
          headerToolbar={isMobile ? {
            left: 'prev next',
            center: 'title',
            right: 'today'
          } : {
            left: 'prev next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          footerToolbar={false}
          initialView='dayGridMonth'
          firstDay={1}
          locale={i18n.language}
          aspectRatio={isMobile ? 0.8 : 1.35}
          handleWindowResize={true}
          windowResizeDelay={100}
          weekends={true}
          allDaySlot={false}
          navLinks={false}
          showNonCurrentDates={true}
          fixedWeekCount={false}
          buttonHints={{
            prev: t('appAdmin.AvailabilityCalendar.buttonHints.prev'),
            next: t('appAdmin.AvailabilityCalendar.buttonHints.next'),
            today: t('appAdmin.AvailabilityCalendar.buttonHints.today'),
            prevYear: t('appAdmin.AvailabilityCalendar.buttonHints.prevYear'),
            nextYear: t('appAdmin.AvailabilityCalendar.buttonHints.nextYear'),
            week: t('appAdmin.AvailabilityCalendar.buttonHints.week'),
            month: t('appAdmin.AvailabilityCalendar.buttonHints.month')
          }}
          buttonText={{
            today: t('appAdmin.AvailabilityCalendar.buttonText.today'),
            month: t('appAdmin.AvailabilityCalendar.buttonText.month'),
            week: t('appAdmin.AvailabilityCalendar.buttonText.week'),
            day: t('appAdmin.AvailabilityCalendar.buttonText.day'),
            prevYear: t('appAdmin.AvailabilityCalendar.buttonText.prevYear'),
            nextYear: t('appAdmin.AvailabilityCalendar.buttonText.nextYear'),
          }}
          viewDidMount={handleViewChange}
          datesSet={handleDatesSet}
          height={currentView === 'timeGridWeek' ? 700 : 'auto'}
          selectable={true}
          editable={true}
          select={handleSelect}
          dateClick={handleDateClick}
          eventDrop={handleEventChange}
          eventResize={handleEventChange}
          events={calendarEvents}
          eventContent={renderEventContent}
          eventClick={handleEventClickTimeRange}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            meridiem: 'short'
          }}
        />
      </div>
      <div className={`${styles['save-bar-wrap']} ${styles['is-floating']}`}>
        <div className={styles['save-pill']}>
          <div className={styles['save-state']}>
            <div className={`${styles['save-dot']} ${lastSaved && !isDirty ? styles['save-dot--saved'] : ''}`} />
            <div>
              <div className={styles['save-copy']}>
                {lastSaved && !isDirty 
                  ? t('appAdmin.AvailabilityProfessionalPage.changesSaved', 'Cambios guardados')
                  : t('appAdmin.AvailabilityProfessionalPage.unsavedChanges', 'Tenés cambios sin guardar')
                }
              </div>
              <div className={styles['save-sub']}>
                {lastSaved && !isDirty 
                  ? t('appAdmin.AvailabilityProfessionalPage.availabilityUpdated', 'Tu disponibilidad está actualizada.')
                  : t('appAdmin.AvailabilityProfessionalPage.saveToUpdate', 'Guardalos para actualizar la información visible en tu disponibilidad.')
                }
              </div>
            </div>
          </div>
          <div className={styles['save-actions']}>
            <button className={styles['btn-secondary']} type="button" onClick={onBack}>
              {t('appAdmin.AvailabilityProfessionalPage.salir', 'Salir')}
            </button>
            <button 
              className={styles['save-cta']} 
              type="button" 
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? t('appAdmin.AvailabilityProfessionalPage.saving', 'Guardando...') : t('appAdmin.AvailabilityProfessionalPage.save', 'Guardar')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AvailabilityCalendar;