import { useState } from 'react';
import styles from './SearchSection.module.scss';
import { useTranslation } from 'react-i18next';

export interface SearchOption {
  label: string;
  value: string;
}

export interface SearchSectionProps {
  categories?: SearchOption[];
  specialties?: SearchOption[];
  onSearch?: (criteria: { category: string; specialty: string }) => void;
}

// Presentational search section (Single Responsibility: layout + basic state handling)
export const SearchSection = ({
  categories = [
    { label: 'Nutrición', value: 'nutricion' },
    { label: 'Psicología', value: 'psicologia' },
    { label: 'Fisioterapia', value: 'fisioterapia' }
  ],
  specialties = [
    { label: 'Deportiva', value: 'deportiva' },
    { label: 'Clínica', value: 'clinica' },
    { label: 'Pediátrica', value: 'pediatrica' }
  ],
  onSearch
}: SearchSectionProps) => {
   const { t } = useTranslation();

  const [category, setCategory] = useState('');
  const [specialty, setSpecialty] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ category, specialty });
  };

  return (
    <section className={styles['search-section']} aria-labelledby="landing-search-heading">
      <div className={styles['search-section__wrapper']}>
        <h2 id="landing-search-heading" className={styles['search-section__heading']}>
          {/* Inicia ahora tu camino hacia el bienestar */}
          {t("landing.searchSection.heading")}
        </h2>
        <form className={styles['search-section__form']} onSubmit={handleSubmit} role="search" aria-label="Buscar profesionales">
          <div className={styles['search-section__field']}>
            <label htmlFor="category" className={styles['visually-hidden']}>{t("landing.searchSection.category")}</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={styles['search-section__select']}
            >
              <option value="" disabled hidden>
                {/* Categoría */}
                {t("landing.searchSection.category")}
              </option>
              {categories.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className={styles['search-section__field']}>
            <label htmlFor="specialty" className={styles['visually-hidden']}>{t("landing.searchSection.specialty")}</label>
            <select
              id="specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className={styles['search-section__select']}
            >
              <option value="" disabled hidden>
                {/* Especialidad */}
                {t("landing.searchSection.specialty")}
              </option>
              {specialties.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button type="submit" className={styles['search-section__button']}>
            {/* Buscar */}
            {t("landing.searchSection.button")}
          </button>
        </form>
      </div>
    </section>
  );
};

export default SearchSection;
