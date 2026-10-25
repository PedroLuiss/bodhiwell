import { useTranslation } from 'react-i18next';
import { ConsultationsList } from '../../components/ConsultationsList/ConsultationsList';
import { PageContentLayout } from '../../components/ui/layout/PageContentLayout/PageContentLayout';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useIsMobile } from '../../hooks/use-mobile';
// import styles from './MyConsultationsPage.module.scss';

export const MyConsultationsPage = () => {
   const { t } = useTranslation();
   const isMobile = useIsMobile();
   return (
      <PageContentLayout
         title={isMobile ? t('appAdmin.myConsultationsPage.titlePageMobile') : t('appAdmin.myConsultationsPage.titlePage')}
         icon={isMobile ? undefined : ListAltIcon}
      >
         <ConsultationsList />
      </PageContentLayout>
   );
};