import React from 'react';

interface FormatAmountOptions {
  symbol?: string;
  decimals?: number;
  locale?: string;
  currency?: string | null;
  currencyClassName?: string; 
  currencyStyle?: React.CSSProperties; 
}

const defaultCurrencyStyle: React.CSSProperties = {
  fontSize: '14px',
  opacity: 0.75,
  fontWeight: 500,
  marginLeft: '4px',
  verticalAlign: 'middle',
};

export const formatAmount = (
  amount: number | null | undefined,
  options: FormatAmountOptions = {}
): React.ReactNode => { 
  
  const { 
    symbol = '$', 
    decimals = 2, 
    locale = 'de-DE',
    currency = null,
    currencyClassName = '',
    currencyStyle = defaultCurrencyStyle 
  } = options;

  if (typeof amount !== 'number' || !isFinite(amount)) {
    return ''; 
  }

  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return (
    <>
      {symbol} {formattedNumber}
      {currency !== null && (
        <span className={currencyClassName} style={currencyStyle}>
          {' '}{currency}
        </span>
      )}
    </>
  );
};