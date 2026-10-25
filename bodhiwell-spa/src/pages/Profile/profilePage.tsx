import { useEffect } from "react";
import { useNavigate, } from 'react-router-dom';
import { useTranslation } from "react-i18next";

// Styles
import styles from './profile.module.scss'

// Pages
import EditProfileProfessional from "../../components/EditProfileProfessional/EditProfileProfessional/EditProfileProfessional";
import EditPatientPage from "../EditPatientPage/EditPatientPage";

// Context
import { useAuthContext } from "../../context/AuthContext";

const ProfilePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthContext();

    useEffect(() => {
        if (user === null) {
            navigate("/login");
        } else if (user?.type_account === null) {
            navigate("/selection-type-account");
        }
    }, [user, navigate]);

    if (!user) {
        return (
            <section className={styles["profile-page"]}>
                <div className="container text-center">
                    <h2 className={styles["profile-page__title"]}>{t('appAdmin.profilePage.title')}</h2>
                </div>
            </section>
        );
    }

    return (
        <div>
            {user?.type_account === 'professional' ? 
                <EditProfileProfessional/>:
                <EditPatientPage/>
            }
        </div>
    );
}

export default ProfilePage;