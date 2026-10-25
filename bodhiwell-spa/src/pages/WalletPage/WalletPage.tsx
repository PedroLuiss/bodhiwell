import { useTranslation } from 'react-i18next';
import styles from './WalletPage.module.scss';
import WalletIcon from '@mui/icons-material/Wallet';
import { PageContentLayout } from '../../components/ui/layout/PageContentLayout/PageContentLayout';
import { WalletMovements } from '../../components/Wallet/WalletMovements/WalletMovements';
import { WalletSummary } from '../../components/Wallet/WalletSummary/WalletSummary';
import { useWallet } from '../../hooks/useWallet';
import Loading from '../../components/ui/Loading/Loading';
import { ErrorView } from '../../components/ui/ErrorView/ErrorView';

export const WalletPage = () => {
  const { t } = useTranslation();
  const { balances, transactions, loading, error, fetchWalletData } = useWallet();

  if (error) {
    return (
      <PageContentLayout title={t("appAdmin.walletPage.title")} icon={WalletIcon}>
         <ErrorView 
            title={t("appAdmin.walletPage.errorTitle", "No pudimos cargar la billetera")}
            message={error}
            onRetry={() => fetchWalletData()} 
            fullscreen={false} 
         />
      </PageContentLayout>
    );
  }
  
  return (
    <PageContentLayout title={t("appAdmin.walletPage.title")} icon={WalletIcon}>
      
      {loading && <Loading fullscreen text={t("appAdmin.walletPage.loading", "Cargando datos de la billetera...")} />}
      
      
      <WalletSummary 
        totalBalance={balances.total}
        availableBalance={balances.available}
        frozenBalance={balances.frozen}
        currency={balances.currency}
      />

      <div className={styles['wallet-page__content']}>
        <WalletMovements 
          transactions={transactions} 
          onFilterChange={fetchWalletData} 
        />
      </div>

    </PageContentLayout>
  );
};