import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom'; 
import ProfessionalCard from './ProfessionalCard';
import styles from './ProfessionalsList.module.scss';
import placeholder from "../../assets/images/Bd_Placeholder.png";
import Loading from '../../components/ui/Loading/Loading';
import Pagination from '../../components/ui/Pagination/Pagination';
import { useProfessionalsList } from './hooks/useProfessionalsList';
import { HolisticSearch } from '../../components/Landing';

const ProfessionalsList = () => {
  const { t } = useTranslation();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const {
    professionals,
    loading,
    error,
    pagination,
    hasActiveFilters,
    listRef,
    handlePageChange,
    clearFilters
  } = useProfessionalsList();

  if (loading) {
    return <Loading fullscreen text="Cargando profesionales..." />;
  }

  if ( error || !professionals || professionals.length === 0) {
    return (
      <div className={styles["professionals"]}>
      

      <header className={styles["professionals__header"]}>
        <p className={styles["eyebrow"]}>{t('landing.professionalsList.eyebrow')}</p>
        <h2 className={styles["section-title"]}>
          <span className={styles["title-line"]}>{t('landing.professionalsList.titleLine1')}</span>
          <span className={styles["title-line"]}>{t('landing.professionalsList.titleLine2')}</span>
        </h2>
        <p className={styles["section-copy"]}>
          {t('landing.professionalsList.copy')}
        </p>
      </header>
        <HolisticSearch className={hasActiveFilters ? "mb-0" : "mb-5"} />
        {hasActiveFilters && (
        <div className={styles["grid-toolbar"]}>
          <div className={styles["grid-count"]}>
            {t('landing.professionalsList.showing')} ({pagination.total})
          </div>
          <button className={styles["clear-btn"]} onClick={clearFilters}>
            {t('landing.professionalsList.clearFilters')}
          </button>
        </div>
      )}
        <div className={styles['professionals__empty-card']}>
        <h1 className={styles["section-title-empty"]}>
          {t('landing.professionalsList.noProfessionals', 'No encontramos profesionales para esta búsqueda')}
        </h1>
        
        <p className={styles["section-copy"]}>
          {t('landing.professionalsList.noProfessionalsCopy', 'Probá ajustando los filtros o explorando otras especialidades.')}
        </p>

        <button 
          className={styles["clear-btn"]} 
          onClick={clearFilters}
        >
          {t('landing.professionalsList.viewAll', 'Ver todos los profesionales')}
        </button>
      </div>
       
        
      </div>
    );
  }

  return (
    <div className={styles["professionals"]} ref={listRef}>
      

      <header className={styles["professionals__header"]}>
        <p className={styles["eyebrow"]}>{t('landing.professionalsList.eyebrow')}</p>
        <h2 className={styles["section-title"]}>
          <span className={styles["title-line"]}>{t('landing.professionalsList.titleLine1')}</span>
          <span className={styles["title-line"]}>{t('landing.professionalsList.titleLine2')}</span>
        </h2>
        <p className={styles["section-copy"]}>
          {t('landing.professionalsList.copy')}
        </p>
      </header>

      <HolisticSearch className={hasActiveFilters ? "mb-0" : "mb-5"} />

      {hasActiveFilters && (
        <div className={styles["grid-toolbar"]}>
          <div className={styles["grid-count"]}>
            {t('landing.professionalsList.showing')} ({pagination.total})
          </div>
          <button className={styles["clear-btn"]} onClick={clearFilters}>
            {t('landing.professionalsList.clearFilters')}
          </button>
        </div>
      )}

      <section className={styles["professionals__grid"]}>
        {professionals.map((prof) => (
          <ProfessionalCard
            key={prof.uid}
            uid={prof.uid}
            professional={{
              name: `${prof.first_name} ${prof.last_name}`,
              specialty: prof.main_specialty?.name || 'Especialidad por definir',
              dimension: prof.main_specialty?.dimension?.name || 'CUERPO',
              description: prof.short_description || '',
              image: prof.image ? `${apiUrl}${prof.image}` : placeholder,
              mediaType: prof.profile_media_type ?? 'image',
              videoUrl: prof.profile_video_url || undefined,
              isMspVerified: prof.has_msp || false
            }}
          />
        ))}
      </section>

      {pagination.last_page > 1 && (
        <Pagination
          currentPage={pagination.current_page}
          totalCount={pagination.total}
          pageSize={pagination.per_page || 8}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default ProfessionalsList;