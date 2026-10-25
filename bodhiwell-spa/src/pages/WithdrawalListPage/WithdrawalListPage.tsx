import { useTranslation } from 'react-i18next';
import { ListWithdrawal } from '../../components/ListWithdrawal/ListWithdrawal';
import { PageContentLayout } from '../../components/ui/layout/PageContentLayout/PageContentLayout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export const WithdrawalListPage = () => {
  const { t } = useTranslation();
  return (
    <PageContentLayout 
      title={t("appAdmin.withdrawalListPage.title")}
      icon={AccountBalanceWalletIcon}
    >
      <ListWithdrawal />
    </PageContentLayout>
  );
};
