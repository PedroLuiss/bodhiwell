import React from "react";
import styles from "./StatusBadge.module.scss";
import { useTranslation } from "react-i18next"; 

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import SaveIcon from "@mui/icons-material/Save";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PublicIcon from "@mui/icons-material/Public";
import { BookingStatus } from "../../../types/Booking/booking";
import { BlogStatus } from "../../../types/Blog/Blog.type";

interface StatusBadgeProps {
  status?: BookingStatus | BlogStatus;
}

interface StatusConfigItem {
  textKey: string; 
  icon: React.ReactNode;
  className: string;
}

const statusConfig: Record<string, StatusConfigItem> = {
  CONFIRMED: {
    textKey: "statusBadge.confirmed",
    icon: <CheckCircleIcon fontSize="small" />,
    className: "status-badge--confirmed",
  },
  CANCELLED: {
    textKey: "statusBadge.cancelled",
    icon: <CancelIcon fontSize="small" />,
    className: "status-badge--cancelled",
  },
  PENDING_PROVIDER: {
    textKey: "statusBadge.pending",
    icon: <HourglassEmptyIcon fontSize="small" />,
    className: "status-badge--pending",
  },
  COMPLETED: {
    textKey: "statusBadge.completed",
    icon: <TaskAltIcon fontSize="small" />,
    className: "status-badge--completed",
  },
  WAITING_PAYMENT: {
    textKey: "statusBadge.waitingPayment",
    icon: <HourglassEmptyIcon fontSize="small" />,
    className: "status-badge--waiting-payment",
  },
  PROCESSING: {
    textKey: "statusBadge.processing",
    icon: <HourglassEmptyIcon fontSize="small" />,
    className: "status-badge--processing",
  },
  // Blog Statuses
  publish: {
    textKey: "statusBadge.publish",
    icon: <PublicIcon fontSize="small" />,
    className: "status-badge--publish",
  },
  draft: {
    textKey: "statusBadge.draft",
    icon: <SaveIcon fontSize="small" />,
    className: "status-badge--draft",
  },
  trash: {
    textKey: "statusBadge.trash",
    icon: <DeleteOutlineIcon fontSize="small" />,
    className: "status-badge--trash",
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation(); 
  
  if (!status) {
    return null;
  }

  const config = statusConfig[status];

  if (!config) {
    return null;
  }

  return (
    <p className={`${styles["status-badge"]} ${styles[config.className]}`}>
      {config.icon}
      <span>{t(config.textKey)}</span>
    </p>
  );
};

export default StatusBadge;