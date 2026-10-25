import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { HeaderProps } from "../../types/dashboard";
import styles from "./style/Header.module.scss";
import { useSidebarContext } from "../../context/SidebarContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/Logo-bodhiwell.png";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { SidebarHeaderIcon } from "../../components/icons";
import classNames from "classnames";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { NotificationDropdown } from "../../components/ui/NotificationDropdown/NotificationDropdown";
import { useIsMobile } from "../../hooks/use-mobile";
import { localStorageHelper, REDIRECT_AFTER_LOGIN } from "../../utils/localStorageHelper";

const Header = ({ title }: HeaderProps) => {
  const { t } = useTranslation();
  const { toggleSidebar, isSidebarOpen } = useSidebarContext();
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const isMobile = useIsMobile();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    localStorageHelper.removeItem(REDIRECT_AFTER_LOGIN);
    navigate("/");
  };

  const goToLanding = () => {
    navigate("/");
  };

  return (
    <header className={styles.header}>
      <button
        className={styles["header__mobile-menu-button"]}
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <SidebarHeaderIcon fillColor="#445867" />
        ) : (
          <SidebarHeaderIcon width={25} height={25} fillColor="#445867" />
        )}
      </button>

      <div className="flex-fill d-flex justify-content-between align-items-center">

        <button
          className={styles["header__landing-button"]}
          onClick={goToLanding}
          title={t("appAdmin.header.goToLanding")}
        >
          <HomeOutlinedIcon sx={{ fontSize: 30 }}/>
        </button>
        <span onClick={() => navigate("/")} className={styles["header__logo"]}>
          <img src={logo} alt="bodhiWell" className={styles["header__logo-img"]} />
        </span>

        <h1 className={styles["header__title"]}>{title}</h1>
        
        <div className="d-flex align-items-center gap-2 md:gap-3"> 
          <NotificationDropdown />

          <div className={styles["header__profile-container"]} ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={styles["header__profile-button"]}
              style={isMobile ? { padding: '8px' } : {}}
            >
              <AccountCircleIcon />
              {!isMobile && (user?.first_name + " " + user?.last_name)}
            </button>

            <div
              className={classNames(styles["header__profile-dropdown"], {
                [styles["header__profile-dropdown--open"]]: isMenuOpen,
              })}
            >
              <Link
                to="/profile"
                className={styles["header__profile-dropdown-item"]}
                onClick={() => setIsMenuOpen(false)}
              >
                <PersonOutlineIcon fontSize="small" />
                {t("appAdmin.header.myProfile")}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={styles["header__profile-dropdown-item"]}
              >
                <LogoutIcon fontSize="small" />
                {t("appAdmin.header.logout")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;