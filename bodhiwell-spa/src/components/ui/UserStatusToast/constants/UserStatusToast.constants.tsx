import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { StatusConfig } from '../types';


export const STATUS_CONFIGS: Record<string, StatusConfig> = {
  pending_completion: {
    severity: 'warning',
    icon: <WarningAmberIcon />,
    titleKey: 'UserStatusToast.pendingCompletion.title',
    messageKey: 'UserStatusToast.pendingCompletion.message',
    action: {
      textKey: 'UserStatusToast.pendingCompletion.action',
      path: '/profile',
    },
  },
  pending_approval: {
    severity: 'warning',
    icon: '✓',
    titleKey: 'UserStatusToast.pendingApproval.title',
    messageKey: 'UserStatusToast.pendingApproval.message',
  },
  rejected: {
    severity: 'error',
    icon: <ReportProblemIcon />,
    titleKey: 'UserStatusToast.rejected.title',
    messageKey: 'UserStatusToast.rejected.message',
  },
};