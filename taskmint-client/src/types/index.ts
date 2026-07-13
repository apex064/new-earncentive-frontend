export type ApiResponse<T> = {
  message: string;
  success: boolean;
  data: T;
};

// Matches rebackend's User model shape, with computed fields for taskmint UI compatibility
export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  /** Computed: first_name + last_name (for taskmint UI compatibility) */
  fullname: string;
  profile_picture?: string | null;
  /** Alias: profile_picture (for taskmint UI compatibility) */
  profileImg?: string;
  is_admin: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_moderator: boolean;
  level: string;
  country?: string;
  current_balance?: string;
  total_earned?: string;
  twoFactorEnabled?: boolean;
};

export interface Meta {
  total: number;
  nextPage: number | null;
  prevPage: number | null;
  page: number;
  limit: number;
  totalPages: number;
}
