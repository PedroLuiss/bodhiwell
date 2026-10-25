import { useTranslation } from "react-i18next";
import { useAuthContext } from "../../../../context/AuthContext";
import useProfile from "../../../../hooks/useProfile";
import { useUserStatus } from "../../../../context/UserStatusContext";
import { useProfileCompletion } from "../../../../context/ProfileCompletionContext";
import { useProfessions } from "../../../../hooks/useProfessions";
import { useAvailability } from "../../../../hooks/useAvailability";

export const useEditProfileProfessional = () => {
    const { t } = useTranslation();
    const { user } = useAuthContext();
    const { updateProfessionalProfile, loading } = useProfile();
    const { fetchUserStatus } = useUserStatus();
    const { checkCompletionStatus, profileData } = useProfileCompletion();
    const { professions } = useProfessions();

    const professionalUid = user?.uid;
    const { availability, loading: availabilityLoading } = useAvailability(professionalUid || '');

    const onSubmit = async (data: any) => {
        await updateProfessionalProfile(data);
        await fetchUserStatus();
        await checkCompletionStatus();
    };

    return {
        t,
        user,
        loading,
        profileData,
        professions,
        availability,
        availabilityLoading,
        professionalUid,
        onSubmit
    };
};
