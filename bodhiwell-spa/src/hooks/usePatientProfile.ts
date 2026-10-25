import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../services/patientService'; 
import { IPatient } from '../types/Patient/Patient.type';

export const usePatientProfile = (uid: string | undefined) => {
    const [patient, setPatient] = useState<IPatient | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPatient = useCallback(async () => {
        if (!uid) {
            setError("No se proporcionó un UID de paciente.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await patientService.getPatientProfile(uid);
            setPatient(data);

        } catch (err: any) {
            const errorMessage = err.message || "No se pudo cargar el perfil del paciente.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [uid]);

    useEffect(() => {
        fetchPatient();
    }, [fetchPatient]);

    return { patient, loading, error };
};