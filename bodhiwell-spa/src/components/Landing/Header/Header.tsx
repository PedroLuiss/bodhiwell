import { Link } from 'react-router-dom';
import { useHeader } from '../../../hooks/useHeader';
import classNames from 'classnames';

import ReorderOutlinedIcon from '@mui/icons-material/ReorderOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';

import styles from './Header.module.scss';
import logo from '../../../assets/images/Logo-bodhiwell.png';
import mundoIcon from '../../../assets/images/header/mundo.png';
import { NotificationDropdown } from '../../ui/NotificationDropdown/NotificationDropdown';

export const Header = () => {
    const {
        user, t, i18n, isMenuOpen, isProfileMenuOpen, setIsProfileMenuOpen,
        isLanguageMenuOpen, setIsLanguageMenuOpen, isAtTop, profileMenuRef,
        languageMenuRef, toggleMenu, closeAllMenus, handleLogout,
        selectLanguage, handleScrollToSection
    } = useHeader();

    return (
        <>
            <header className={classNames(styles['header'], {
                [styles['header--scrolled']]: !isAtTop,
                [styles['header--is-menu-open']]: isMenuOpen,
            })}>
                <div
                    className={classNames(styles['header__overlay'], { [styles['header__overlay--is-open']]: isMenuOpen })}
                    onClick={toggleMenu}
                />
                <div className={styles['header__inner']}>

                    <div className={styles['header__logo-container']}>
                        <Link to="/" className={styles['header__logo']} onClick={closeAllMenus}>
                            <img src={logo} alt="Bodhiwell" />
                        </Link>
                    </div>

                    <nav className={classNames(styles['header__nav'], { 
                        [styles['header__nav--is-open']]: isMenuOpen 
                    })}>
                        <div className={styles['header__nav-header']}>
                            <Link to="/" className={styles['header__logo']} onClick={closeAllMenus}>
                                <img src={logo} alt="Bodhiwell" />
                            </Link>
                            <button className={styles['header__nav-close']} onClick={toggleMenu}>
                                <CloseIcon sx={{ fontSize: 32 }} />
                            </button>
                        </div>

                        <div className={styles['header__nav-links']}>
                            <Link to="/" onClick={handleScrollToSection('about')} className={styles['header__nav-link']}>
                                {t('landing.header.about')}
                            </Link>
                            <Link to="/" onClick={handleScrollToSection('how-it-works')} className={styles['header__nav-link']}>
                                {t('landing.header.howItWorks')}
                            </Link>
                            <Link to="/" onClick={handleScrollToSection('community')} className={styles['header__nav-link']}>
                                {t('landing.header.community')}
                            </Link>
                            <a href={process.env.REACT_APP_BLOG_URL} target="_blank" rel="noreferrer" className={styles['header__nav-link']}>
                                {t('landing.header.blog')}
                            </a>
                            <Link to="/contact" className={styles['header__nav-link']}>
                                {t('landing.header.contact')}
                            </Link>
                        </div>

                        <div className={styles['header__nav-footer']}>
                            <div className={styles['header__nav-mobile-lang']}>
                                <button
                                    onClick={() => selectLanguage('es')}
                                    className={classNames(styles['header__nav-lang-btn'], { [styles['header__nav-lang-btn--active']]: i18n.language === 'es' })}
                                >
                                    ES
                                </button>
                                <button
                                    onClick={() => selectLanguage('en')}
                                    className={classNames(styles['header__nav-lang-btn'], { [styles['header__nav-lang-btn--active']]: i18n.language === 'en' })}
                                >
                                    EN
                                </button>
                            </div>

                            {user ? (
                                <div className={styles['header__nav-mobile-user']}>
                                    <div className={styles['header__nav-user-info']}>
                                        <AccountCircleIcon className={styles['header__nav-user-icon']} />
                                        <div className={styles['header__nav-user-details']}>
                                            <span className={styles['header__nav-user-name']}>{user.first_name}</span>
                                            <span className={styles['header__nav-user-email']}>{user.email}</span>
                                        </div>
                                    </div>
                                    <div className={styles['header__nav-user-actions']}>
                                        <Link to="/dashboard" className={styles['header__nav-user-link']} onClick={closeAllMenus}>
                                            <HomeIcon /> {t('landing.header.myDashboard')}
                                        </Link>
                                        <Link to="/profile" className={styles['header__nav-user-link']} onClick={closeAllMenus}>
                                            <PersonIcon /> {t('landing.header.myProfile')}
                                        </Link>
                                        <button onClick={handleLogout} className={classNames(styles['header__nav-user-link'], styles['header__nav-logout'])}>
                                             {t('landing.header.logout')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles['header__nav-mobile-auth']}>
                                    <Link to="/login" className={styles['header__nav-login-btn']} onClick={closeAllMenus}>
                                        {t('landing.header.login', 'Acceder')}
                                    </Link>
                                    <Link to="/register" className={classNames(styles['header__btn'], styles['header__nav-register-btn'])} onClick={closeAllMenus}>
                                        {t('landing.header.register', 'Crear mi cuenta')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>

                    <div className={styles['header__right-group']}>
                        <div className={styles['header__actions']}>
                            <div className={styles['header__action-item']} ref={languageMenuRef}>
                                <button
                                    className={`${styles['header__lang-btn']} ${isLanguageMenuOpen ? styles['header__lang-btn--active'] : ''}`}
                                    onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                                >
                                    <img src={mundoIcon} alt="" className={styles['header__lang-world-icon']} />
                                    <span>{i18n.language.toUpperCase()}</span>
                                </button>

                                {isLanguageMenuOpen && (
                                    <div className={`${styles['header__dropdown']} ${styles['header__dropdown--lang']}`}>
                                        <button
                                            onClick={() => selectLanguage('es')}
                                            className={`${styles['header__dropdown-item']} ${i18n.language === 'es' ? styles['header__dropdown-item--active'] : ''}`}
                                        >
                                            <div className={styles['header__dropdown-icon-wrapper']}>
                                                <span className={styles['header__lang-abbr']}>ES</span>
                                            </div>
                                            <span>{t('landing.header.spanish')}</span>
                                        </button>

                                        <button
                                            onClick={() => selectLanguage('en')}
                                            className={`${styles['header__dropdown-item']} ${i18n.language === 'en' ? styles['header__dropdown-item--active'] : ''}`}
                                        >
                                            <div className={styles['header__dropdown-icon-wrapper']}>
                                                <span className={styles['header__lang-abbr']}>EN</span>
                                            </div>
                                            <span>{t('landing.header.english')}</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {user ? (
                                <>
                                    <NotificationDropdown customButtonClass={styles['header__nav-link']} />

                                    <div className={styles['header__action-item']} ref={profileMenuRef}>
                                        <button
                                            className={`${styles['header__profile-btn']} ${isProfileMenuOpen ? styles['header__profile-btn--active'] : ''}`}
                                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        >
                                            <AccountCircleIcon className={styles['header__profile-icon']} />
                                            <span className={styles['header__profile-name']}>{user?.first_name}</span>
                                            <ExpandMoreIcon className={classNames(styles['header__arrow'], { [styles['header__arrow--open']]: isProfileMenuOpen })} />
                                        </button>

                                        {isProfileMenuOpen && (
                                            <div className={styles['header__dropdown']}>
                                                <div className={styles['header__dropdown-header']}>
                                                    <p className={styles['header__dropdown-user-name']}>{user?.first_name} {user?.last_name}</p>
                                                    <p className={styles['header__dropdown-user-email']}>{user?.email}</p>
                                                </div>

                                                <div className={styles['header__dropdown-divider']} />

                                                <Link to="/dashboard" className={styles['header__dropdown-item']} onClick={closeAllMenus}>
                                                    <div className={styles['header__dropdown-icon-wrapper']}>
                                                        <HomeIcon />
                                                    </div>
                                                    <span>{t('landing.header.myDashboard')}</span>
                                                </Link>

                                                <Link to="/profile" className={styles['header__dropdown-item']} onClick={closeAllMenus}>
                                                    <div className={styles['header__dropdown-icon-wrapper']}>
                                                        <PersonIcon />
                                                    </div>
                                                    <span>{t('landing.header.myProfile')}</span>
                                                </Link>

                                                <div className={styles['header__dropdown-divider']} />

                                                <button onClick={handleLogout} className={`${styles['header__dropdown-item']} `}>
                                                   
                                                    <span>{t('landing.header.logout')}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className={styles['header__login-link']}>
                                        {t('landing.header.login', 'Acceder')}
                                    </Link>
                                    <Link to="/register" className={styles['header__btn']}>
                                        {t('landing.header.register', 'Crear mi cuenta')}
                                    </Link>
                                </>
                            )}
                        </div>

                        <button className={styles['header__toggler']} onClick={toggleMenu}>
                            <ReorderOutlinedIcon sx={{ fontSize: 32 }} />
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
};