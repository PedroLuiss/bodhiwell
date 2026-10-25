import { useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../../../context/NotificationContext';
import { useAvailabilitySave } from '../../../../hooks/useAvailabilitySave';
import { ExtendedAvailabilityTableProps } from '../types/AvailabilityTable.types';

export const useAvailabiilityTable = ({
  selectedDates,
  setSelectedDates,
  notAvailable,
  setNotAvailable,
  blocksByDate,
  setBlocksByDate,
  reservationsByDate,
  initialData,
  onSaveSuccess,
  activeDate,
  onSetActiveDate,
  t: propsT
}: ExtendedAvailabilityTableProps) => {
  const { t: localT, i18n } = useTranslation();
  const t = propsT || localT;
  const { showNotification } = useNotification();
  const [tempBlocks, setTempBlocks] = useState<{ [date: string]: { from: string, to: string } }>({});
  const [errorsByDate, setErrorsByDate] = useState<{ [date: string]: string | null }>({});
  const { saveAvailability, loading } = useAvailabilitySave();

  const futureSelectedDates = useMemo(() => {
    const today = dayjs().startOf('day');
    return selectedDates.filter(date => dayjs(date).isSameOrAfter(today));
  }, [selectedDates]);

  const clearErrorForDate = useCallback((date: string) => {
    setErrorsByDate(prev => ({ ...prev, [date]: null }));
  }, []);

  const removeDate = useCallback((date: string) => {
    if (reservationsByDate?.[date]?.length > 0) {
      showNotification(t('appAdmin.AvailabilityTable.removeDateWithReservationsError', 'No se puede eliminar un día con reservas activas.'), 'error', 4000);
      return;
    }
    setSelectedDates(prev => prev.filter(d => d !== date));
    setBlocksByDate(prev => {
      const updated = { ...prev };
      delete updated[date];
      return updated;
    });
    setNotAvailable(prev => {
      const updated = { ...prev };
      delete updated[date];
      return updated;
    });
    setTempBlocks(prev => {
      const copy = { ...prev };
      delete copy[date];
      return copy;
    });
    clearErrorForDate(date);
    if (activeDate === date && onSetActiveDate) onSetActiveDate('');
  }, [reservationsByDate, setSelectedDates, setBlocksByDate, setNotAvailable, activeDate, onSetActiveDate, clearErrorForDate, showNotification, t]);

  const handleAddBlockToDay = useCallback((date: string) => {
    clearErrorForDate(date);
    const newBlock = tempBlocks[date] || { from: '09:00', to: '17:00' };
    const existingBlocksForDay = blocksByDate[date] || [];
    const isToday = dayjs(date).isSame(dayjs(), 'day');

    if (isToday) {
      const proposedStartDateTime = dayjs(`${date}T${newBlock.from}`);
      if (proposedStartDateTime.isBefore(dayjs())) {
        setErrorsByDate(prev => ({ ...prev, [date]: t('appAdmin.AvailabilityTable.pastTimeAddError') }));
        return;
      }
    }

    if (newBlock.from >= newBlock.to) {
      setErrorsByDate(prev => ({ ...prev, [date]: t('appAdmin.AvailabilityTable.invalidTimeRange') }));
      return;
    }

    const isOverlapping = existingBlocksForDay.some(
      (existingBlock) => (newBlock.from < existingBlock.to && newBlock.to > existingBlock.from)
    );

    if (isOverlapping) {
      setErrorsByDate(prev => ({ ...prev, [date]: t('appAdmin.AvailabilityTable.overlapBlockError') }));
      return;
    }

    setBlocksByDate(prev => {
      const updatedBlocks = [...(prev[date] || []), newBlock];
      updatedBlocks.sort((a, b) => a.from.localeCompare(b.from));
      return { ...prev, [date]: updatedBlocks };
    });
    setTempBlocks(prev => ({ ...prev, [date]: { from: '09:00', to: '17:00' } }));
  }, [blocksByDate, clearErrorForDate, setBlocksByDate, t, tempBlocks]);

  const handleRemoveBlockFromDay = useCallback((date: string, idx: number) => {
    setBlocksByDate(prev => {
      const updated = { ...prev };
      if (updated[date]) {
        updated[date] = updated[date].filter((_, i) => i !== idx);
      }
      return updated;
    });
    clearErrorForDate(date);
  }, [clearErrorForDate, setBlocksByDate]);

  const handleBadgeClick = useCallback((date: string) => {
    if (onSetActiveDate) onSetActiveDate(date); 
    const elementId = `day-card-${date}`;
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [onSetActiveDate]);

  const handleSave = useCallback(async () => {
    setErrorsByDate({});
    if (futureSelectedDates.length === 0) {
      showNotification(t('appAdmin.AvailabilityTable.noDatesSelectedError'), 'error', 3000);
      return false;
    }
    const invalidDate = futureSelectedDates.find(date => {
      const isAvailable = !notAvailable[date];
      const hasNoBlocks = !blocksByDate[date] || blocksByDate[date].length === 0;
      return isAvailable && hasNoBlocks;
    });
    if (invalidDate) {
      setErrorsByDate(prev => ({ ...prev, [invalidDate]: t('appAdmin.AvailabilityTable.noHoursAssignedErrorGeneric') || 'Debe asignar al menos un horario.' }));
      handleBadgeClick(invalidDate);
      return false;
    }
    const newAvailabilityData = await saveAvailability(
      { selectedDates, notAvailable, blocksByDate },
      initialData
    );
    if (newAvailabilityData) {
      onSaveSuccess(newAvailabilityData);
      return true;
    }
    return false;
  }, [futureSelectedDates, notAvailable, blocksByDate, saveAvailability, selectedDates, initialData, t, showNotification, handleBadgeClick, onSaveSuccess]);

  const handleClearAll = useCallback(() => {
    const todayStr = dayjs().format('YYYY-MM-DD');
    const datesToKeep = selectedDates.filter(date => date < todayStr);
    const blocksToKeep = Object.keys(blocksByDate).reduce((acc, date) => {
      if (date < todayStr) acc[date] = blocksByDate[date];
      return acc;
    }, {} as typeof blocksByDate);
    const notAvailableToKeep = Object.keys(notAvailable).reduce((acc, date) => {
      if (date < todayStr) acc[date] = notAvailable[date];
      return acc;
    }, {} as typeof notAvailable);

    setSelectedDates(datesToKeep);
    setBlocksByDate(blocksToKeep);
    setNotAvailable(notAvailableToKeep);
    setTempBlocks({});
    setErrorsByDate({}); 
    if (onSetActiveDate) onSetActiveDate('');
    showNotification(t('appAdmin.AvailabilityTable.clearedDatesMessage'), 'success', 2000);
  }, [selectedDates, blocksByDate, notAvailable, setSelectedDates, setBlocksByDate, setNotAvailable, onSetActiveDate, showNotification, t]);

  const handleCardClick = useCallback((date: string) => {
    if (onSetActiveDate && activeDate !== date) {
        onSetActiveDate(date);
    }
  }, [activeDate, onSetActiveDate]);

  return {
    t,
    i18n,
    tempBlocks,
    setTempBlocks,
    errorsByDate,
    loading,
    futureSelectedDates,
    clearErrorForDate,
    removeDate,
    handleAddBlockToDay,
    handleRemoveBlockFromDay,
    handleSave,
    handleBadgeClick,
    handleClearAll,
    handleCardClick
  };
};

