import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import { EventClickArg } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';
import { useNotification } from '../../../../context/NotificationContext';
import { useSidebarContext } from '../../../../context/SidebarContext';
import { useIsMobile } from '../../../../hooks/use-mobile';
import { ExtendedAvailabilityCalendarProps, CalendarEvent } from '../types';
import styles from '../AvailabilityCalendar.module.scss';
import { capitalizeFirstLetter } from '../utils/AvailabilityCalendar.utils';
import { TooltipUi } from '../../../ui/TooltipUi/TooltipUi';

interface UseAvailabilityCalendarProps extends ExtendedAvailabilityCalendarProps {}

export const useAvailabilityCalendar = ({
  selectedDates,
  setSelectedDates,
  notAvailable,
  setNotAvailable,
  blocksByDate,
  setBlocksByDate,
  onDateSelect,
  reservationsByDate,
  activeDate
}: UseAvailabilityCalendarProps) => {
  const { t, i18n } = useTranslation();
  const { showNotification } = useNotification();
  const { isSidebarOpen } = useSidebarContext();
  
  const calendarRef = useRef<FullCalendar>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const isMobile = useIsMobile();

  useEffect(() => {
    dayjs.locale(i18n.language);
  }, [i18n.language]);

  const today = dayjs().format('YYYY-MM-DD');

  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    const processAndAddEvent = (date: string, block?: { from: string; to: string }, isNotAvailable = false) => {
      const eventDate = dayjs(date);
      const isPast = eventDate.isBefore(today, 'day');

      if (isNotAvailable) {
        events.push({
          id: `${date}-not-available`,
          title: 'No Disponible',
          start: date,
          allDay: true,
          display: 'background',
          color: '#fee2e2',
          classNames: isPast ? [styles['past-event']] : []
        });
      } else if (block) {
        events.push({
          id: `${date}-${block.from}-${block.to}`,
          title: t('appAdmin.AvailabilityCalendar.loadedSchedule', 'Horario cargado'),
          start: `${date}T${block.from}`,
          end: `${date}T${block.to}`,
          color: '#82B194',
          editable: !isPast,
          classNames: isPast ? [styles['past-event']] : [],
          extendedProps: { isGrouped: true, blocks: [block] }
        });
      }
    };

    if (currentView === 'dayGridMonth') {
      Object.keys(blocksByDate).forEach(date => {
        const dayBlocks = blocksByDate[date];
        if (dayBlocks && dayBlocks.length > 0) {
          const isPast = dayjs(date).isBefore(today, 'day');
          events.push({
            id: `${date}-grouped`,
            title: dayBlocks.length === 1 
              ? t('appAdmin.AvailabilityCalendar.loadedSchedule', 'Horario cargado') 
              : t('appAdmin.AvailabilityCalendar.loadedSchedules', 'Horarios cargados'),
            start: `${date}T00:00:00`,
            end: `${date}T23:59:59`,
            color: '#82B194',
            editable: false,
            classNames: isPast ? [styles['past-event']] : [],
            extendedProps: { isGrouped: true, blocks: dayBlocks }
          });
        }
      });
    } else {
      Object.keys(blocksByDate).forEach(date => {
        if (blocksByDate[date]) {
          blocksByDate[date].forEach(block => processAndAddEvent(date, block));
        }
      });
    }

    selectedDates.forEach(date => {
      if (notAvailable[date]) {
        processAndAddEvent(date, undefined, true);
      }
    });

    return events;
  }, [selectedDates, notAvailable, blocksByDate, today, t, currentView]);

  const addBlockToDate = (date: string, newBlock: { from: string; to: string }) => {
    setBlocksByDate(prev => {
      const existingBlocks = prev[date] || [];

      const isOverlapping = existingBlocks.some(
        (block) => (newBlock.from < block.to && newBlock.to > block.from)
      );
      if (isOverlapping) {
        showNotification(t('appAdmin.AvailabilityCalendar.overlapError'), 'error', 3000);
        return prev;
      }
      const updatedBlocks = [...existingBlocks, newBlock].sort((a, b) => a.from.localeCompare(b.from));
      return { ...prev, [date]: updatedBlocks };
    });
  };

  const handleSelect = (info: any) => {
    if (dayjs(info.startStr).isBefore(today, 'day')) {
      calendarRef.current?.getApi().unselect();
      return;
    }

    if (info.allDay) {
      const days: string[] = [];
      let current = dayjs(info.startStr);
      const end = dayjs(info.endStr);

      while (current.isBefore(end)) {
        days.push(current.format('YYYY-MM-DD'));
        current = current.add(1, 'day');
      }

      const isMultipleSelection = days.length > 1;

      if (isMultipleSelection) {
        setSelectedDates(prev => Array.from(new Set([...prev, ...days])).sort());

        if (days.length > 0) {
          onDateSelect(days[0]);
        }
      } else {
        const dateToAdd = days[0];

        if (!selectedDates.includes(dateToAdd)) {
          setSelectedDates(prev => [...prev, dateToAdd].sort());
        }
        onDateSelect(dateToAdd);
      }

    } else {
      const selectionStart = dayjs(info.start);
      const isToday = selectionStart.isSame(dayjs(), 'day');

      if (isToday && selectionStart.isBefore(dayjs())) {
        showNotification(t('appAdmin.AvailabilityCalendar.pastTimeRangeError'), 'error', 4000);
        calendarRef.current?.getApi().unselect();
        return;
      }

      const date = dayjs(info.start).format('YYYY-MM-DD');
      const newBlock = {
        from: dayjs(info.start).format('HH:mm'),
        to: dayjs(info.end).format('HH:mm'),
      };

      if (newBlock.from === newBlock.to) return;

      if (!selectedDates.includes(date)) {
        setSelectedDates(prev => [...prev, date].sort());
      }

      setNotAvailable(prev => {
        const updated = { ...prev };
        delete updated[date];
        return updated;
      });

      addBlockToDate(date, newBlock);
      onDateSelect(date);
    }
  };

  const handleEventChange = (changeInfo: any) => {
    const { event, oldEvent } = changeInfo;
    const originalDate = dayjs(oldEvent.start).format('YYYY-MM-DD');
    const originalBlock = {
      from: dayjs(oldEvent.start).format('HH:mm'),
      to: dayjs(oldEvent.end).format('HH:mm'),
    };
    const newDate = dayjs(event.start).format('YYYY-MM-DD');

    if (dayjs(newDate).isBefore(today, 'day')) {
      showNotification(t('appAdmin.AvailabilityCalendar.pastDateMoveError'), 'error');
      changeInfo.revert();
      return;
    }

    const newStartDateTime = dayjs(event.start);
    const isToday = newStartDateTime.isSame(dayjs(), 'day');

    if (isToday && newStartDateTime.isBefore(dayjs())) {
      showNotification(t('appAdmin.AvailabilityCalendar.pastTimeMoveError'), 'error', 4000);
      changeInfo.revert();
      return;
    }

    const newBlock = {
      from: dayjs(event.start).format('HH:mm'),
      to: dayjs(event.endStr ? event.end : event.start).format('HH:mm'),
    };
    if (newBlock.from === newBlock.to) {
      changeInfo.revert();
      return;
    }
    setBlocksByDate(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      let blockFoundAndRemoved = false;
      if (newState[originalDate]) {
        const blockIndex = newState[originalDate].findIndex(
          (b: { from: string; to: string }) => b.from === originalBlock.from && b.to === originalBlock.to
        );
        if (blockIndex > -1) {
          newState[originalDate].splice(blockIndex, 1);
          blockFoundAndRemoved = true;
        }
      }
      if (!blockFoundAndRemoved) {
        changeInfo.revert();
        return prev;
      }
      const newDateBlocks = newState[newDate] || [];
      const isOverlapping = newDateBlocks.some(
        (b: { from: string; to: string }) => newBlock.from < b.to && newBlock.to > b.from
      );
      if (isOverlapping) {
        showNotification(t('appAdmin.AvailabilityCalendar.moveOverlapError'), 'error', 3000);
        changeInfo.revert();
        return prev;
      }
      newState[newDate] = [...newDateBlocks, newBlock].sort((a, b) => a.from.localeCompare(b.from));
      return newState;
    });
    if (originalDate !== newDate && !selectedDates.includes(newDate)) {
      setSelectedDates(prev => [...prev, newDate].sort());
    }
  };

  const handleDateClick = (clickInfo: DateClickArg) => {
    if (dayjs(clickInfo.dateStr).isBefore(today, 'day')) return;
    if (clickInfo.jsEvent.target instanceof HTMLElement && clickInfo.jsEvent.target.closest('.fc-event')) return;

    if (currentView === 'timeGridWeek') {
      const clickedDateTime = dayjs(clickInfo.date);
      const isToday = clickedDateTime.isSame(dayjs(), 'day');

      if (isToday && clickedDateTime.isBefore(dayjs())) {
        showNotification('No puedes agregar disponibilidad en una hora que ya ha pasado.', 'error', 4000);
        return;
      }

      const date = clickedDateTime.format('YYYY-MM-DD');
      const clickTime = clickedDateTime.format('HH:mm');
      const existingBlocksForDay = blocksByDate[date] || [];

      const isClickInsideExistingBlock = existingBlocksForDay.some(block =>
        clickTime >= block.from && clickTime < block.to
      );

      if (isClickInsideExistingBlock) {
        onDateSelect(date);
        return;
      }

      const newBlock = {
        from: clickTime,
        to: clickedDateTime.add(1, 'hour').format('HH:mm'),
      };

      if (!selectedDates.includes(date)) {
        setSelectedDates(prev => [...prev, date].sort());
      }

      setNotAvailable(prev => {
        const updated = { ...prev };
        if (updated[date]) delete updated[date];
        onDateSelect(date);
        return updated;
      });

      addBlockToDate(date, newBlock);
      onDateSelect(date);

    } else {
      const dateStr = clickInfo.dateStr;
      if (!selectedDates.includes(dateStr)) {
        setSelectedDates(prevDates => {
          const newDates = [...prevDates, dateStr].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
          return newDates;
        });
      }
      onDateSelect(dateStr);
    }
  };

  const renderDayHeaderContent = (arg: any) => {
    const date = dayjs(arg.date).utc();
    const dayName = capitalizeFirstLetter(date.format('ddd'));
    const dayDate = date.format('D/M');
    const isMonthView = arg.view.type === 'dayGridMonth';

    return (
      <div className={styles['custom-day-header']}>
        <span className={styles['custom-day-header__name']}>{dayName}</span>
        {!isMonthView && (
          <span className={styles['custom-day-header__date']}>{dayDate}</span>
        )}
      </div>
    );
  };

  const renderSlotLabelContent = (arg: any) => {
    const timeText = dayjs(arg.date).format('h:mm A');
    return (
      <div className={styles['custom-time-slot']}>
        {timeText}
      </div>
    );
  };

  const handleEventClickTimeRange = (clickInfo: EventClickArg) => {
    clickInfo.jsEvent.preventDefault();
    const date = dayjs(clickInfo.event.start).format('YYYY-MM-DD');
    onDateSelect(date);
  };

  const renderEventContent = (eventInfo: any) => {
    if (eventInfo.event.allDay) {
      if (eventInfo.view.type === 'dayGridMonth') {
        const contentStyle: React.CSSProperties = {
          padding: '2px 4px',
          backgroundColor: '#f8d7da',
          color: '#58151c',
          borderRadius: '3px',
          fontSize: '10px',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        };
        return (
          <div style={contentStyle}>
            <i>{eventInfo.event.title}</i>
          </div>
        );
      }
      return null;
    }

    const start = eventInfo.event.start;
    const end = eventInfo.event.end;
    if (!start || !end) return null;

    const isGrouped = eventInfo.event.extendedProps?.isGrouped;
    const blocks = eventInfo.event.extendedProps?.blocks || [];

    const isMobileGrouped = isMobile && isGrouped;

    const startTimeFormatted = dayjs(start).format('h:mm A');
    const endTimeFormatted = dayjs(end).format('h:mm A');
    
    const isTimeGridView = currentView.includes('timeGrid');
    
    let displayTitle = '';
    if (isTimeGridView) {
      displayTitle = `${startTimeFormatted} - ${endTimeFormatted}`;
    } else if (isGrouped || eventInfo.event.backgroundColor === '#82B194') {
      const blockCount = blocks.length || 1;
      displayTitle = isMobile ? '' : (blockCount === 1 
        ? t('appAdmin.AvailabilityCalendar.loadedSchedule', 'Horario cargado') 
        : t('appAdmin.AvailabilityCalendar.loadedSchedules', 'Horarios cargados'));
    } else {
      displayTitle = isMobile ? `${startTimeFormatted}` : `${startTimeFormatted} - ${endTimeFormatted}`;
    }


    const eventContentStyle: React.CSSProperties = {
      backgroundColor: isMobileGrouped ? '#82B194' : 'rgba(130, 177, 148, 0.16)', 
      padding: isMobileGrouped ? '0' : (isMobile ? '2px 4px' : '5px 6px'), 
      overflow: 'hidden',
      lineHeight: '1.1', 
      fontSize: isMobile ? '7.5px' : '9px', 
      height: isMobileGrouped ? '5px' : (isTimeGridView ? '100%' : 'auto'), 
      width: (isMobileGrouped || isTimeGridView) ? '100%' : 'auto',
      borderRadius: isMobile ? '4px' : '10px', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '1px',
      color: '#2D5F4B',
      fontWeight: '700',
      cursor: 'pointer',
      marginTop: isMobileGrouped ? '2px' : '0',
      boxSizing: 'border-box',
      textAlign: 'center'
    };

    const timeTextStyle: React.CSSProperties = {
      color: '#2D5F4B', display: 'block', fontWeight: '700', whiteSpace: 'normal', wordBreak: 'break-word',
    };
    const statusTextStyle: React.CSSProperties = {
      color: '#2D5F4B', fontWeight: '700', fontStyle: 'normal',
    };

    const tooltipContent = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px' }}>
        {blocks.length > 0 ? (
          blocks.map((block: any, idx: number) => {
            const bStart = dayjs(`${dayjs(start).format('YYYY-MM-DD')}T${block.from}`).format('h:mm A');
            const bEnd = dayjs(`${dayjs(start).format('YYYY-MM-DD')}T${block.to}`).format('h:mm A');
            return <span key={idx} style={{ fontSize: '11px', fontWeight: 600 }}>{`${bStart} - ${bEnd}`}</span>;
          })
        ) : (
          <span style={{ fontSize: '11px', fontWeight: 600 }}>{`${startTimeFormatted} - ${endTimeFormatted}`}</span>
        )}
      </div>
    );

    const eventEl = (
      <div style={eventContentStyle}>
        <span style={timeTextStyle}>{displayTitle}</span>
        {(!isGrouped && !isTimeGridView && eventInfo.event.backgroundColor !== '#82B194') && isMobile && (<span style={timeTextStyle}>{endTimeFormatted}</span>)}
        {(!isGrouped && !isTimeGridView && eventInfo.event.backgroundColor !== '#82B194') && <span style={statusTextStyle}>{t('appAdmin.AvailabilityCalendar.available', 'Disponible')}</span>}
      </div>
    );

    if (isTimeGridView) {
      return eventEl;
    }

    return (
      <TooltipUi title={tooltipContent} arrow placement="top">
        {eventEl}
      </TooltipUi>
    );
  };

  const renderDayCellContent = (arg: any) => {
    const dateStr = arg.date.toISOString().slice(0, 10);
    const isSelected = selectedDates.includes(dateStr);
    const isActive = activeDate === dateStr; 

    const hasReservations = reservationsByDate && reservationsByDate[dateStr] && reservationsByDate[dateStr].length > 0;

    if (arg.view.type === 'dayGridMonth') {
      const parentStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'start',
        height: '100%',
        width: '100%',
        position: 'relative',
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
      };
 
      let bg = 'transparent';
      let color = '#4b5563';
      let border = '1px solid transparent';
      let fontWeight = 400;

      if (isActive) {
        bg = '#82B194';
        color = '#ffffff';
        border = '1px solid #82B194';
        fontWeight = 700;
      } else if (isSelected) {
        bg = 'rgba(130, 177, 148, 0.08)';
        color = '#648875';
        border = '1px solid rgba(130, 177, 148, 0.52)';
        fontWeight = 700;
      }

      const cellStyle: React.CSSProperties = {
        background: bg,
        border: border,
        borderRadius: '999px',
        height: isMobile ? '20px' : '26px',
        width: isMobile ? '20px' : '26px',
        color: color,
        fontWeight: fontWeight,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        fontSize: isMobile ? '9px' : '12px',
        zIndex: 2,
        textDecoration: 'none',
        boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'
      };

      const dotStyle: React.CSSProperties = {
        width: '12px',
        height: '12px',
        backgroundColor: '#82B194',
        borderRadius: '999px',
        marginTop: '2px',
        boxShadow: '0 0 0 4px rgba(130, 177, 148, 0.14) inset',
      };

      return (
        <div style={parentStyle}>
          <div style={cellStyle}>
            {arg.dayNumberText}
          </div>
          {hasReservations && <div style={dotStyle} title={t('appAdmin.AvailabilityCalendar.dayReserved', 'Día con reservas')}></div>}
        </div>
      );
    }

    return arg.dayNumberText;
  };

  const handleViewChange = (viewInfo: any) => {
    setCurrentView(viewInfo.view.type);
  };

  const addReservationDot = (dateStr: string, element: HTMLElement) => {
    if (element.querySelector('.reservation-dot')) {
      return;
    }

    const hasReservations = reservationsByDate && reservationsByDate[dateStr] && reservationsByDate[dateStr].length > 0;

    if (hasReservations) {
      const dot = document.createElement('div');
      dot.className = 'reservation-dot';
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.backgroundColor = '#76A886';
      dot.style.borderRadius = '50%';
      dot.style.position = 'absolute';
      dot.style.top = '5px';
      dot.style.right = '5px';
      dot.title = t('appAdmin.AvailabilityCalendar.dayReserved', 'Día con reservas');

      const parent = element.closest('.fc-daygrid-day-frame, .fc-col-header-cell');
      if (parent) {
        (parent as HTMLElement).style.position = 'relative';
        parent.appendChild(dot);
      }
    }
  };

  const handleDayCellDidMount = (arg: any) => {
    const dateStr = arg.date.toISOString().slice(0, 10);
    addReservationDot(dateStr, arg.el);
  };
  
  const handleDayHeaderDidMount = (arg: any) => {
    const dateStr = arg.date.toISOString().slice(0, 10);
    addReservationDot(dateStr, arg.el);
  };

  const handleDatesSet = (arg: any) => {
    if (arg.view.type !== currentView) {
      setCurrentView(arg.view.type);
    }
    
    setTimeout(() => {
      const calendarEl = containerRef.current;
      if (!calendarEl) return;

      const titleEl = calendarEl.querySelector('.fc-toolbar-title');
      if (titleEl && titleEl.parentElement) {
        const parent = titleEl.parentElement as HTMLElement;
        if (!parent.querySelector('.custom-reservation-legend')) {
          const legend = document.createElement('div');
          legend.className = 'custom-reservation-legend';
          legend.style.display = 'flex';
          legend.style.alignItems = 'center';
          legend.style.justifyContent = 'center';
          legend.style.gap = '5px';
          legend.style.marginTop = '4px';
          legend.style.marginLeft = '0px';
          legend.innerHTML = `
            <div style="width: 12px; height: 12px; background-color: #82B194; border-radius: 999px; box-shadow: 0 0 0 4px rgba(130, 177, 148, 0.14) inset;"></div>
            <span style="font-size: 12px; color: #65716B; font-weight: 500;">${t('appAdmin.AvailabilityCalendar.reservedDays', 'Días reservados')}</span>
          `;

          parent.style.display = 'flex';
          parent.style.flexDirection = 'column';
          parent.style.alignItems = 'center';
          parent.appendChild(legend);
        }
      }
    }, 100);
  };

  useEffect(() => {
    if (isMobile && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      if (calendarApi.view.type !== 'dayGridMonth') {
        calendarApi.changeView('dayGridMonth');
      }
    }
  }, [isMobile]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (calendarRef.current) {
        calendarRef.current.getApi().updateSize();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isSidebarOpen]);

  return {
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
  };
};
