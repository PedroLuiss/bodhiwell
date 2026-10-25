import styles from "./DashboardPage.module.scss";
import { DashboardProfessional } from "../../components/DashboardProfessional/DashboardProfessional";
import { DashboardPatient } from "../../components/DashboardPatient/DashboardPatient";
import { useAuthContext } from "../../context/AuthContext";

export const DashboardPage = () => {
  const { user } = useAuthContext();

  return (
    <div className={styles[`mainPage`]}>
      {user?.type_account === "professional" ? (
        <DashboardProfessional />
      ) : (
        <DashboardPatient />
      )}
    </div>
  );
};
