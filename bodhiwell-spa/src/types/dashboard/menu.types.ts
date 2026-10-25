import React from 'react';

export type MenuItem = {
  label?: string;
  labelKey: string;
  path: string;
  icon: React.ReactNode;
}

export type SubmenuData = {
  items: MenuItem[] | null;
  title: string | null;
}

export type MainMenuItem = {
  label?: string;
  labelKey: string;
  icon: React.ReactNode;
  path?: string; 
  basePath?: string; 
  isSubmenu?: boolean; 
  submenu?: MenuItem[];
}