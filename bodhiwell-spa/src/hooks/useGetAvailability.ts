import { useState, useEffect } from 'react';
import {availabilityService } from '../services/availabilityService';
import { IApiAvailabilityItem } from '../types';

type useGetAvailabilityReturn = {
  data: IApiAvailabilityItem[] | null;
  loading: boolean;
  error: Error | null;
};

export const useGetAvailability = (): useGetAvailabilityReturn => {
  const [data, setData] = useState<IApiAvailabilityItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const availabilityData = await availabilityService.getAvailability();
        setData(availabilityData);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); 

  return { data, loading, error };
};