import { useState } from 'react';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { availabilityService } from '../services/availabilityService';
import { useNotification } from '../context/NotificationContext';
import { IApiAvailabilityItem, IAvailabilitySavePayload } from '../types';
import { useTranslation } from 'react-i18next';

dayjs.extend(isSameOrAfter);

type ComponentData = {
  selectedDates: string[];
  notAvailable: { [date: string]: boolean };
  blocksByDate: { [date: string]: { from: string; to: string }[] };
};

export const useAvailabilitySave = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const hasSlotsChanged = (originalSlots: { start: string; end: string }[], newBlocks: { from: string; to: string }[]) => {
    if (originalSlots.length !== newBlocks.length) return true;

    const sortedOriginal = [...originalSlots].sort((a, b) => a.start.localeCompare(b.start));
    const sortedNew = [...newBlocks].sort((a, b) => a.from.localeCompare(b.from));

    for (let i = 0; i < sortedOriginal.length; i++) {
      if (
        sortedOriginal[i].start !== sortedNew[i].from || 
        sortedOriginal[i].end !== sortedNew[i].to
      ) {
        return true; 
      }
    }

    return false; 
  };

  const saveAvailability = async (
    currentData: ComponentData,
    initialData: IApiAvailabilityItem[] | null
  ): Promise<IApiAvailabilityItem[] | null> => {
    setLoading(true);
    setError(null);

    if (!initialData) {
      setError(t('useAvailabilitySave.loadError'));
      showNotification(t('useAvailabilitySave.missingDataError'), "error");
      setLoading(false);
      return null;
    }

    try {
      const initialDataMap = new Map<string, IApiAvailabilityItem>(
        initialData.map(item => [item.date, item])
      );
      const currentDatesSet = new Set(currentData.selectedDates);
      const payloadItems: any[] = [];
      
      const today = dayjs().startOf('day');

      currentData.selectedDates.forEach(date => {
        if (dayjs(date).isSameOrAfter(today)) {
            const originalItem = initialDataMap.get(date);
            const isNotAvailable = !!currentData.notAvailable[date];
            const currentBlocks = isNotAvailable ? [] : (currentData.blocksByDate[date] || []);

            const itemPayload = {
              date: date,
              day: dayjs(date).day(),
              slots: currentBlocks.map(b => ({ start: b.from, end: b.to }))
            };

            if (!originalItem) {
              payloadItems.push(itemPayload);
            } else {
              const originalSlots = originalItem.slots || [];
              
              if (hasSlotsChanged(originalSlots, currentBlocks)) {
                payloadItems.push({ ...itemPayload, uid: originalItem.uid });
              }
            }
        }
      });

      initialData.forEach(originalItem => {
        if (originalItem.date && !currentDatesSet.has(originalItem.date)) {
           if (dayjs(originalItem.date).isSameOrAfter(today)) {
               payloadItems.push({
                 uid: originalItem.uid,
                 delete: true
               });
           }
        }
      });
      
      if (payloadItems.length === 0) {
          showNotification(t('useAvailabilitySave.noChangesToSave'), 'warning');
          setLoading(false);
          return initialData; 
      }

      const payload: IAvailabilitySavePayload = {
        availabilities: payloadItems,
      };

      const resp = await availabilityService.saveAvailability(payload);
      showNotification(t('useAvailabilitySave.successMessage'), 'success', 3000);

      const savedItems = resp.data || [];
      const deletedUids = new Set(payloadItems.filter(p => p.delete).map(p => p.uid));
      
      const updatedList = initialData
        .filter(item => !deletedUids.has(item.uid))
        .map(item => {
          const savedItem = savedItems.find((s: any) => s.date === item.date || s.uid === item.uid);
          return savedItem || item;
        });
        
      savedItems.forEach((savedItem: any) => {
        const alreadyInList = updatedList.some((item: any) => item.date === savedItem.date || item.uid === savedItem.uid);
        if (!alreadyInList) {
          updatedList.push(savedItem);
        }
      });

      return updatedList;
    } catch (err: any) {
      const errorMessage = err.error || err.message || ('useAvailabilitySave.unexpectedError');
      
      setError(errorMessage);

      showNotification(errorMessage, 'error', 5000);
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { saveAvailability, loading, error };
};