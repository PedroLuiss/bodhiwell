import { useTranslation } from 'react-i18next';
import { PageContentLayout } from '../../components/ui/layout/PageContentLayout/PageContentLayout';
import { BlogList } from '../../components/BlogList/BlogList';
import { useAuthContext } from '../../context/AuthContext';
import styles from './BlogPage.module.scss';

export const BlogPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthContext();

  if (user?.type_account !== 'professional') {
    return (
      <div className={styles['blog-page']}>
        <h1 className={styles['blog-page__title']}>{t('appAdmin.blog.breadcrumb', 'Blog')}</h1>
        <p className={styles['blog-page__message']}>{t('appAdmin.blog.comingSoon', 'Próximamente... el blog de Bodhiwell.')}</p>
      </div>
    );
  }

  return (
    <PageContentLayout
      title={t('appAdmin.blog.title', 'Mis artículos')}
    >
      <BlogList />
    </PageContentLayout>
  );
};
