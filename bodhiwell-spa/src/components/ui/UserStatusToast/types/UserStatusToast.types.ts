
export interface StatusConfig {
  severity: 'warning' | 'info' | 'error';
  icon: React.ReactNode;
  titleKey: string;
  messageKey: string;
  action?: {
    textKey: string;
    path: string;
  };
}