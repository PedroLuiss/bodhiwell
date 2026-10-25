import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetAvailability } from "../../../hooks/useGetAvailability";
import { useUserStatus } from "../../../hooks/useUserStatus";
import { getProfileMe } from "../../../services/profileService";
import { IApiAvailabilityItem, ProfileData, ReservationAvailability } from "../../../types";
import { isProfileComplete } from "../utils/AvailabilityProfessionalPage.utils";

export const useAvailabilityProfessional = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { status: userStatus } = useUserStatus();
    const { data: initialAvailability, loading: availabilityLoading, error } = useGetAvailability();

    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [notAvailable, setNotAvailable] = useState<Record<string, boolean>>({});
    const [blocksByDate, setBlocksByDate] = useState<Record<string, { from: string, to: string }[]>>({});
    const [reservationsByDate, setReservationsByDate] = useState<Record<string, ReservationAvailability[]>>({});
    const [activeDate, setActiveDate] = useState<string | null>(null);
    const [originalData, setOriginalData] = useState<IApiAvailabilityItem[] | null>(null);

    const [savedSnapshot, setSavedSnapshot] = useState<string>('');
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [lastSaved, setLastSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileData["profile"] | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    const tableRef = useRef<{ handleSave: () => Promise<boolean>, loading: boolean }>(null);

    const generateSnapshot = useCallback((
        dates: string[],
        notAvail: Record<string, boolean>,
        blocks: Record<string, { from: string, to: string }[]>
    ) => {
        const sortedDates = [...dates].sort();
        const na: Record<string, boolean> = {};
        const b: Record<string, any> = {};

        sortedDates.forEach(date => {
            if (notAvail[date] !== undefined) na[date] = notAvail[date];
            if (blocks[date]) {
                b[date] = [...blocks[date]].sort((x, y) => x.from.localeCompare(y.from));
            }
        });

        return JSON.stringify({ d: sortedDates, na, b });
    }, []);

    const processAvailabilityData = useCallback((availabilityData: IApiAvailabilityItem[]) => {
        setOriginalData(availabilityData);
        const newSelectedDates: string[] = [];
        const newNotAvailable: Record<string, boolean> = {};
        const newBlocksByDate: Record<string, { from: string, to: string }[]> = {};
        const newReservationsByDate: Record<string, ReservationAvailability[]> = {};

        availabilityData.forEach(item => {
            if (item.date && !item.delete) {
                newSelectedDates.push(item.date);
                if (item.slots && item.slots.length > 0) {
                    newNotAvailable[item.date] = false;
                    newBlocksByDate[item.date] = item.slots.map(slot => ({
                        from: slot.start,
                        to: slot.end
                    }));
                } else {
                    newNotAvailable[item.date] = true;
                }
                if (item.hasReservation && item.reservations && item.reservations.length > 0) {
                    newReservationsByDate[item.date] = item.reservations;
                }
            }
        });

        const sortedSelectedDates = newSelectedDates.sort();
        setSelectedDates(sortedSelectedDates);
        setNotAvailable(newNotAvailable);
        setBlocksByDate(newBlocksByDate);
        setReservationsByDate(newReservationsByDate);

        const snapshot = generateSnapshot(sortedSelectedDates, newNotAvailable, newBlocksByDate);
        setSavedSnapshot(snapshot);
    }, [generateSnapshot]);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profileData = await getProfileMe();
                setProfile(profileData);
            } catch (err) {
                console.error('Error loading profile:', err);
            } finally {
                setProfileLoading(false);
            }
        };
        loadProfile();
    }, []);

    useEffect(() => {
        if (initialAvailability) {
            processAvailabilityData(initialAvailability);
        }
    }, [initialAvailability, processAvailabilityData]);

    // --- Lógica de cambios (Dirty state) ---
    const hasChanges = useMemo(() => {
        if (!savedSnapshot) return false;
        const currentSnapshot = generateSnapshot(selectedDates, notAvailable, blocksByDate);
        return currentSnapshot !== savedSnapshot;
    }, [selectedDates, notAvailable, blocksByDate, savedSnapshot, generateSnapshot]);

    useEffect(() => {
        if (hasChanges) setLastSaved(false);
    }, [hasChanges]);

    const handleSave = useCallback(async () => {
        if (tableRef.current) {
            setIsSaving(true);
            try {
                const success = await tableRef.current.handleSave();
                return success;
            } finally {
                setIsSaving(false);
            }
        }
        return false;
    }, []);

    const handleSaveSuccess = useCallback((data: IApiAvailabilityItem[]) => {
        processAvailabilityData(data);
        setLastSaved(true);
    }, [processAvailabilityData]);

    const handleExitClick = useCallback(() => {
        if (hasChanges) {
            setShowUnsavedModal(true);
        } else {
            navigate(-1);
        }
    }, [hasChanges, navigate]);

    const handleConfirmExitWithoutSaving = useCallback(() => {
        setShowUnsavedModal(false);
        navigate(-1);
    }, [navigate]);

    const handleConfirmSaveAndExit = useCallback(async () => {
        const success = await handleSave();
        if (success) {
            setShowUnsavedModal(false);
            navigate(-1);
        } else {
            setShowUnsavedModal(false);
        }
    }, [handleSave, navigate]);

    const handleScrollToDateCard = useCallback((date: string) => {
        setActiveDate(date);
        requestAnimationFrame(() => {
            const elementId = `day-card-${date}`;
            const element = document.getElementById(elementId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.style.transition = 'transform 0.3s ease';
                element.style.transform = 'scale(1.02)';
                setTimeout(() => { element.style.transform = 'scale(1)'; }, 400);
            }
        });
    }, []);

    const profileIsComplete = useMemo(() => isProfileComplete(profile), [profile]);
    const isAwaitingApproval = useMemo(() => userStatus === 'pending_approval', [userStatus]);

    return {
        selectedDates, setSelectedDates,
        notAvailable, setNotAvailable,
        blocksByDate, setBlocksByDate,
        reservationsByDate,
        activeDate, setActiveDate,
        originalData,
        loading: availabilityLoading,
        profileLoading,
        error,
        isSaving,
        lastSaved,
        hasChanges,
        showUnsavedModal,
        userStatus,
        profileIsComplete,
        isAwaitingApproval,
        tableRef,
        handleSave,
        handleSaveSuccess,
        handleExitClick,
        handleConfirmExitWithoutSaving,
        handleConfirmSaveAndExit,
        handleCloseUnsavedModal: () => setShowUnsavedModal(false),
        handleScrollToDateCard,
        t
    };
};