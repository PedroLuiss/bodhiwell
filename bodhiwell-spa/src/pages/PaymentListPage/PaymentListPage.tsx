// import styles from './PaymentListPage.module.scss';
import { useTranslation } from 'react-i18next';
import { ListPayment } from '../../components/ListPayment/ListPayment';
import { PageContentLayout } from '../../components/ui/layout/PageContentLayout/PageContentLayout';
import PaymentsIcon from '@mui/icons-material/Payments';

export const PaymentListPage = () => {
    const { t } = useTranslation();
  return (
     <PageContentLayout title={t('appAdmin.paymentListPage.titlePage')} icon={PaymentsIcon}>
          <ListPayment />
     </PageContentLayout>
  );
};