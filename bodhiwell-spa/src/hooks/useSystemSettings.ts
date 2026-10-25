import { useState, useEffect } from 'react';
import { systemSettingsService } from '../services/systemSettingsService';
import { SystemSettings } from '../types';

export const useSystemSettings = () => {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const data = await systemSettingsService.getSettings();
                setSettings(data);
            } catch (err) {
                console.error('Error loading system settings:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return { settings, loading, error };
};
