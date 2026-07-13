export type ApiResponse<T> = {
  message: string;
  success: boolean;
  data: T;
};

// Matches rebackend's UserProfileSerializer response
export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  /** Computed: first_name + last_name (for taskmint UI compatibility) */
  fullname: string;
  profile_picture?: string | null;
  /** Full URL from backend (already resolved) */
  profile_picture_url?: string | null;
  /** Alias for UI compatibility */
  profileImg?: string | null;
  phone?: string;
  location?: string;
  referral_code?: string;
  total_earned?: string;
  current_balance?: string;
  pending_balance?: string;
  level?: string;
  streak_days?: number;
  date_joined?: string;
  country?: string;
  birth_date?: string;
  gender?: string;
  walletAddress?: string;
  walletChain?: string;
  referral_earnings?: string;
  faucet_earnings?: string;
  qualifying_earnings?: number;
  can_withdraw?: boolean;
  chess_rating?: number;
  chess_games_played?: number;
  chess_games_won?: number;
  chess_games_lost?: number;
  chess_games_drawn?: number;
  chess_bot_games_played?: number;
};

export interface Meta {
  total: number;
  nextPage: number | null;
  prevPage: number | null;
  page: number;
  limit: number;
  totalPages: number;
}
