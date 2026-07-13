'use client';

import { useState } from 'react';
import { X, Calendar, MapPin, Crown, Trophy, Star, User as UserIcon, Gift, CheckCircle, AlertCircle, Clock, Target } from 'lucide-react';
import { PiCoinsThin } from "react-icons/pi";
import { HiOutlineBanknotes } from "react-icons/hi2";

import { API_BASE_URL } from '@/lib/config';
import { useCurrency } from '@/contexts/CurrencyContext';

// Fix image URL helper
const fixImageUrl = (url: string | null) => {
  if (!url) return null;
  if (url.includes('rebackend-ij74.onrender.com')) return url.replace(/^http:/, 'https:');
  if (url.startsWith('/media/')) return `https://rebackend-ij74.onrender.com${url}`;
  return url.replace(/^http:/, 'https:');
};

// Get country flag emoji from country name (same as profile page)
const getCountryFlag = (countryName?: string): string => {
  if (!countryName) return '🌍';
  
  const countryFlags: Record<string, string> = {
    'United States': '🇺🇸', 'USA': '🇺🇸', 'US': '🇺🇸', 'America': '🇺🇸',
    'United Kingdom': '🇬🇧', 'UK': '🇬🇧', 'England': '🇬🇧', 'Britain': '🇬🇧',
    'Canada': '🇨🇦', 'CA': '🇨🇦',
    'Australia': '🇦🇺', 'AU': '🇦🇺',
    'Germany': '🇩🇪', 'DE': '🇩🇪',
    'France': '🇫🇷', 'FR': '🇫🇷',
    'Spain': '🇪🇸', 'ES': '🇪🇸',
    'Italy': '🇮🇹', 'IT': '🇮🇹',
    'Japan': '🇯🇵', 'JP': '🇯🇵',
    'China': '🇨🇳', 'CN': '🇨🇳',
    'India': '🇮🇳', 'IN': '🇮🇳',
    'Brazil': '🇧🇷', 'BR': '🇧🇷',
    'Mexico': '🇲🇽', 'MX': '🇲🇽',
    'South Africa': '🇿🇦', 'ZA': '🇿🇦',
    'Nigeria': '🇳🇬', 'NG': '🇳🇬',
    'Russia': '🇷🇺', 'RU': '🇷🇺',
    'South Korea': '🇰🇷', 'KR': '🇰🇷',
    'Netherlands': '🇳🇱', 'NL': '🇳🇱',
    'Sweden': '🇸🇪', 'SE': '🇸🇪',
    'Norway': '🇳🇴', 'NO': '🇳🇴',
    'Denmark': '🇩🇰', 'DK': '🇩🇰',
    'Finland': '🇫🇮', 'FI': '🇫🇮',
    'Poland': '🇵🇱', 'PL': '🇵🇱',
    'Turkey': '🇹🇷', 'TR': '🇹🇷',
    'UAE': '🇦🇪', 'AE': '🇦🇪',
    'Saudi Arabia': '🇸🇦', 'SA': '🇸🇦',
    'Egypt': '🇪🇬', 'EG': '🇪🇬',
    'Kenya': '🇰🇪', 'KE': '🇰🇪',
    'Ghana': '🇬🇭', 'GH': '🇬🇭',
    'Indonesia': '🇮🇩', 'ID': '🇮🇩',
    'Philippines': '🇵🇭', 'PH': '🇵🇭',
    'Vietnam': '🇻🇳', 'VN': '🇻🇳',
    'Thailand': '🇹🇭', 'TH': '🇹🇭',
    'Malaysia': '🇲🇾', 'MY': '🇲🇾',
    'Singapore': '🇸🇬', 'SG': '🇸🇬'
  };
  
  return countryFlags[countryName] || '🌍';
};

// Sleek Badge Components (with purple theme)
const AdminBadge = ({ className = "" }: { className?: string }) => (
  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/30 ${className}`}>
    Admin
  </div>
);

const StaffBadge = ({ className = "" }: { className?: string }) => (
  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/30 ${className}`}>
    Staff
  </div>
);

const SuperUserBadge = ({ className = "" }: { className?: string }) => (
  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/30 ${className}`}>
    <Crown className="w-3 h-3" /> Admin 1
  </div>
);

const ModeratorBadge = ({ className = "", roomName }: { className?: string; roomName?: string }) => (
  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/30 ${className}`}>
    {roomName ? `Mod (${roomName})` : 'Moderator'}
  </div>
);

// Level Badge with sleek design (purple themed)
const LevelBadge = ({ level }: { level: string }) => {
  const getLevelConfig = () => {
    switch (level?.toLowerCase()) {
      case 'diamond': return { icon: <Crown className="w-3 h-3" />, color: 'bg-primary/10 text-primary border-primary/30' };
      case 'platinum': return { icon: <Trophy className="w-3 h-3" />, color: 'bg-muted/20 text-muted-foreground border-border/50' };
      case 'gold': return { icon: <Star className="w-3 h-3" />, color: 'bg-warning/10 text-warning border-warning/30' };
      case 'silver': return { icon: <Star className="w-3 h-3" />, color: 'bg-muted/20 text-muted-foreground border-border/50' };
      case 'bronze': return { icon: <Star className="w-3 h-3" />, color: 'bg-warning/10 text-warning border-warning/30' };
      default: return { icon: <UserIcon className="w-3 h-3" />, color: 'bg-primary/10 text-primary border-primary/30' };
    }
  };
  const config = getLevelConfig();
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {level?.toUpperCase()}
    </div>
  );
};

// Country Badge with flag (purple themed)
const CountryBadge = ({ country }: { country?: string }) => {
  if (!country) return null;
  const flag = getCountryFlag(country);
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/30">
      <MapPin className="w-3 h-3" />
      {country} {flag !== '🌍' && flag}
    </div>
  );
};

// Chess Rating Badge
const ChessRatingBadge = ({ rating }: { rating?: number }) => {
  if (!rating) return null;
  
  const getRatingColor = () => {
    if (rating >= 2000) return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
    if (rating >= 1500) return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
    if (rating >= 1000) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    return 'text-muted-foreground bg-muted/20';
  };
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRatingColor()}`}>
      <Target className="w-3 h-3" />
      Chess Rating: {rating}
    </div>
  );
};

const formatJoinDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatLastSeen = (timestamp?: string | null) => {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  if (Number.isNaN(date.valueOf())) return 'Unknown';
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  cover_photo?: string;
  level: string;
  total_earned: number;
  streak_days: number;
  date_joined: string;
  country?: string;
  current_balance: number;
  referral_earnings: number;
  total_referrals: number;
  is_admin: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_moderator?: boolean;
  moderator_rooms?: Array<{ room_id: number; room_name: string }>;
  is_online?: boolean;
  last_seen?: string;
  chess_rating?: number;
  recent_offers?: Array<{
    id: number;
    task_id: number;
    title: string;
    category: string;
    reward_earned: number;
    completed_at: string;
    icon?: string;
  }>;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  loading?: boolean;
  isLoading?: boolean;
  isOnline?: boolean;
}

export function UserProfileModal({ isOpen, onClose, user, loading = false, isLoading, isOnline = false }: UserProfileModalProps) {
  const { formatBalanceShort, isDollarMode } = useCurrency();
  const onlineStatus = isOnline || Boolean(user?.is_online);
  const isLoadingState = loading || isLoading || false;
  const CurrencyIcon = isDollarMode ? HiOutlineBanknotes : PiCoinsThin;
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto overflow-x-visible scrollbar-hide">
        {isLoadingState ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        ) : user ? (
          <div className="p-0">
            {/* Cover Photo Section - Fixed z-index and positioning */}
            <div className="relative h-36 w-full rounded-t-xl overflow-visible">
              {user.cover_photo ? (
                <img 
                  src={fixImageUrl(user.cover_photo)} 
                  alt="Cover" 
                  className="w-full h-full object-cover rounded-t-xl"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-primary to-primary-dark rounded-t-xl" />
              )}
              
              {/* Close Button - Higher z-index */}
              <div className="absolute top-3 right-3 z-20">
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 backdrop-blur-sm"
                  type="button"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Profile Picture - Very high z-index to prevent covering */}
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 z-[99999]">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full border-4 border-background overflow-hidden bg-primary/10 shadow-xl">
                    {user.profile_picture ? (
                      <img 
                        src={fixImageUrl(user.profile_picture)} 
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary text-2xl font-bold bg-card">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Online Status Dot - Also high z-index */}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background z-[99999] ${
                    onlineStatus ? 'bg-success' : 'bg-muted'
                  }`} />
                </div>
              </div>
            </div>
           
            {/* Profile Content - Adjusted padding and positioning */}
            <div className="bg-background pt-12 pb-4 px-4 rounded-b-xl relative z-10">
              {/* Header with Name and Username */}
              <div className="text-center mb-3">
                <h2 className="text-xl font-bold text-foreground mb-0.5">
                  {user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.username
                  }
                </h2>
                <p className="text-muted-foreground text-sm">@{user.username}</p>
              </div>

              {/* Role Badges */}
              <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                {user.is_superuser && <SuperUserBadge />}
                {user.is_admin && !user.is_superuser && <AdminBadge />}
                {user.is_staff && !user.is_admin && !user.is_superuser && <StaffBadge />}
                {user.is_moderator && user.moderator_rooms && user.moderator_rooms.length > 0 && (
                  user.moderator_rooms.map((room, index) => (
                    <ModeratorBadge key={index} roomName={room.room_name} />
                  ))
                )}
                <LevelBadge level={user.level} />
                {user.country && <CountryBadge country={user.country} />}
                {user.chess_rating && <ChessRatingBadge rating={user.chess_rating} />}
              </div>

              {/* Compact Stats Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-card/30 rounded-lg p-2 text-center border border-border/50">
                  <div className="text-lg font-bold text-primary">
                    {formatBalanceShort(user.total_earned || 0)}
                  </div>
                  <div className="text-muted-foreground text-xs">Total Earned</div>
                </div>
               
                <div className="bg-card/30 rounded-lg p-2 text-center border border-border/50">
                  <div className="text-lg font-bold text-foreground">
                    {user.streak_days}
                  </div>
                  <div className="text-muted-foreground text-xs">Streak Days</div>
                </div>
               
                <div className="bg-card/30 rounded-lg p-2 text-center border border-border/50">
                  <div className="text-lg font-bold text-foreground">
                    {user.total_referrals}
                  </div>
                  <div className="text-muted-foreground text-xs">Referrals</div>
                </div>
               
                <div className="bg-card/30 rounded-lg p-2 text-center border border-border/50">
                  <div className="flex items-center justify-center gap-1">
                    <CurrencyIcon className="w-4 h-4 text-warning" />
                    <span className="text-lg font-bold text-warning">
                      {formatBalanceShort(user.current_balance || 0)}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs">Balance</div>
                </div>
              </div>

              {/* Chess Rating Row - Separate row for rating if not in badges */}
              {user.chess_rating && (
                <div className="bg-card/30 rounded-lg p-2 mb-4 text-center border border-border/50">
                  <div className="flex items-center justify-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-semibold">Chess Rating:</span>
                    <span className="text-primary font-bold text-lg">{user.chess_rating}</span>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="space-y-2 bg-card/30 rounded-lg p-3 mb-4 border border-border/50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">Joined {formatJoinDate(user.date_joined)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${
                    onlineStatus ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted-foreground'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${onlineStatus ? 'bg-success animate-pulse' : 'bg-muted'}`} />
                    {onlineStatus ? 'Online' : user.last_seen ? `Last seen ${formatLastSeen(user.last_seen)}` : 'Offline'}
                  </div>
                  {user.referral_earnings > 0 && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                      <Trophy className="w-3 h-3" />
                      {formatBalanceShort(user.referral_earnings || 0)} referral
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Completed Offers */}
              {user.recent_offers && user.recent_offers.length > 0 && (
                <div className="bg-card/30 rounded-lg p-3 border border-border/50">
                  <h3 className="text-foreground font-semibold text-sm mb-2 flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5 text-primary" />
                    Recent Offers
                  </h3>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-hide">
                    {user.recent_offers.slice(0, 5).map((offer) => (
                      <div key={offer.id} className="flex items-center justify-between bg-card/50 rounded-lg p-2 border border-border/30">
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-xs font-medium truncate">{offer.title}</p>
                          <p className="text-muted-foreground text-xs">{offer.category}</p>
                        </div>
                        <div className="text-right ml-2">
                          <div className="flex items-center gap-1">
                            <CurrencyIcon className="w-3 h-3 text-success" />
                            <p className="text-success font-semibold text-xs">{formatBalanceShort(offer.reward_earned)}</p>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {new Date(offer.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-destructive mb-4">Failed to load user profile</div>
            <button
              onClick={onClose}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for fetching user profile
export function useUserProfile() {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [userProfileLoading, setUserProfileLoading] = useState(false);
  const [userProfileCache, setUserProfileCache] = useState<Map<number, UserProfile>>(new Map());

  const fetchUserProfile = async (userId: number, forceRefresh: boolean = false) => {
    try {
      setUserProfileLoading(true);
      setShowUserProfile(true);
      
      if (!forceRefresh && userProfileCache.has(userId)) {
        const cachedUser = userProfileCache.get(userId)!;
        if (cachedUser.recent_offers !== undefined) {
          setSelectedUser(cachedUser);
          setUserProfileLoading(false);
          return;
        }
      }

      const res = await fetch(`${API_BASE_URL}/profile/${userId}/`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch user profile: ${res.status}`);
      }
      
      const userData = await res.json();
      console.log('Fetched user profile:', userData);
      
      const userWithFixedImage: UserProfile = {
        ...userData,
        profile_picture: fixImageUrl(userData.profile_picture),
        cover_photo: fixImageUrl(userData.cover_photo),
        chess_rating: userData.chess_rating || 1200,
      };
      
      setUserProfileCache(prev => new Map(prev.set(userId, userWithFixedImage)));
      setSelectedUser(userWithFixedImage);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setSelectedUser(null);
    } finally {
      setUserProfileLoading(false);
    }
  };

  const closeUserProfile = () => {
    setShowUserProfile(false);
    setSelectedUser(null);
  };

  return {
    selectedUser,
    showUserProfile,
    userProfileLoading,
    fetchUserProfile,
    closeUserProfile,
    userProfileCache,
  };
}

export default UserProfileModal;
