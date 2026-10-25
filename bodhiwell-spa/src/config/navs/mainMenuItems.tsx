import { MainMenuItem } from "../../types/dashboard";
import {
  UserIcon,
  HomeIcon,
  ArticlesIcon,
  ConsultationIcon,
  PaymentsIcon,
  WalletIcon,
  BellIcon,
  CalendarIcon,
} from "../../components/icons";
import { ClockIcon } from "@mui/x-date-pickers";

export type MenuGroup = 'registro' | 'admin' | 'other';

export interface MenuItemKey extends Omit<MainMenuItem, "label"> {
  labelKey: string;
  group: MenuGroup;
}

export const BLOCKED_STATUSES = ['pending_completion', 'pending_approval', 'rejected'];

export const ROUTES_TO_BLOCK = [
  'appAdmin.dashboard.reservations',
  'appAdmin.dashboard.consultations',
  'appAdmin.dashboard.payments',
  'appAdmin.dashboard.wallet',
  'appAdmin.dashboard.profileMenu.availability',
  'appAdmin.blog.title',
];

export const getMenuItemKeys = (user: any): MenuItemKey[] => [
  {
    labelKey: "appAdmin.dashboard.home",
    path: "/dashboard",
    icon: <HomeIcon />,
    group: 'registro',
  },
  ...(user?.type_account === "professional"
    ? [
        {
          labelKey: "appAdmin.dashboard.profileMenu.personalInfo",
          path: "/personal-info",
          icon: <UserIcon />,
          group: 'registro' as MenuGroup,
        },
      ]
    : []),
  {
    labelKey: "appAdmin.dashboard.profile",
    path: "/profile",
    icon: <UserIcon />,
    group: 'registro',
  },
  ...(user?.type_account === "professional"
    ? [
        {
          labelKey: "appAdmin.dashboard.profileMenu.availability",
          path: "/availability",
          icon: <ClockIcon />,
          group: 'registro' as MenuGroup,
        },
      ]
    : []),


  ...(user?.type_account === "professional"
    ? [
        {
          labelKey: "appAdmin.blog.title",
          path: "/blog",
          icon: <ArticlesIcon />,
          group: 'admin' as MenuGroup,
        },
      ]
    : []),
  {
    labelKey: "appAdmin.dashboard.reservations",
    path: "/reservations",
    icon: <CalendarIcon />,
    group: 'admin',
  },
  {
    labelKey: "appAdmin.dashboard.consultations",
    path: "/my-consultation",
    icon: <ConsultationIcon />,
    group: 'admin',
  },
  {
    labelKey: "appAdmin.dashboard.payments",
    path: "/payment-list",
    icon: <PaymentsIcon />,
    group: 'admin',
  },
  ...(user?.type_account === "professional"
    ? [
        {
          labelKey: "appAdmin.dashboard.wallet",
          path: "/wallet",
          icon: <WalletIcon />,
          group: 'admin' as MenuGroup,
        },
      ]
    : []),


  {
    labelKey: "landing.header.notifications",
    path: "/notifications",
    icon: <BellIcon />,
    group: 'other',
  },
];