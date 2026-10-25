
export interface Tag {
  uid: string;
  name: string;
  slug: string;
  category_uid?: string;
}

export interface Category {
  uid: string;
  name: string;
  slug: string;
  color_code?: string;
  icon?: string;
}

export interface FilterItem {
  uid: string;
  name: string;
  slug?: string;
}

export interface SearchFilters {
  q: string;
  dimension: FilterItem | null;
  specialties: FilterItem[];
  page: number;
  perPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}