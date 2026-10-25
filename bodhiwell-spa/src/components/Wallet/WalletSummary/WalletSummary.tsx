import { useTranslation } from 'react-i18next';
import styles from './WalletSummary.module.scss';
import { formatAmount } from '../../../utils/formattersAmount.utils';
import { IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { TooltipUi } from '../../ui/TooltipUi/TooltipUi';

interface WalletSummaryProps {
  totalBalance: number;
  availableBalance: number;
  frozenBalance: number;
  currency?: string;
}

export const WalletSummary = ({
  totalBalance,
  availableBalance,
  frozenBalance,
  currency = 'USD'
}: WalletSummaryProps) => {
  const { t } = useTranslation();

  const frozenBalanceTooltip = t(
    'appAdmin.walletSummary.frozenBalanceTooltip', 
    'Saldo pendiente de acreditación. Se liberará automáticamente al generar el informe de la cita correspondiente.'
  );

  return (
    <section className={styles['wallet-card']}>
      <div className={styles['wallet-card__main']}>
        <span className={styles['wallet-card__eyebrow']}>
          {t("appAdmin.walletSummary.totalBalance")}
        </span>
        <h2 className={styles['wallet-card__amount-large']}>
          {formatAmount(totalBalance, { decimals: 2, currency })}
        </h2>
      </div>

      <div className={styles['wallet-card__divider']} />

      <div className={styles['wallet-card__grid']}>
        <div className={styles['wallet-item']}>
          <label className={styles['wallet-item__label']}>
            {t("appAdmin.walletSummary.availableBalance")}
          </label>
          <span className={`${styles['wallet-item__amount']} ${styles['wallet-item__amount--available']}`}>
            {formatAmount(availableBalance, { decimals: 2, currency })}
          </span>
        </div>

        <div className={styles['wallet-item']}>
          <div className={styles['wallet-item__label-group']}>
            <label className={styles['wallet-item__label']}>
              {t("appAdmin.walletSummary.frozenBalance")}
            </label>
            <TooltipUi title={frozenBalanceTooltip}>
              <IconButton size="small" className={styles['wallet-item__help-btn']}>
                <HelpOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </TooltipUi>
          </div>
          <span className={`${styles['wallet-item__amount']} ${styles['wallet-item__amount--frozen']}`}>
            {formatAmount(frozenBalance, { decimals: 2, currency })}
          </span>
        </div>
      </div>
    </section>
  );
};