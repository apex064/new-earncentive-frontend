// utils/offers.tsx
import { Globe } from 'lucide-react';
import { AppleFilled, AndroidFilled, WindowsFilled } from '@ant-design/icons';

export interface Offer {
  id: string;
  name: string;
  description: string;
  logo: string;
  payout: number;
  payout_coins: number;
  currency: string;
  category: string;
  os: string;
  external_url: string;
  countries: string;
  clicked: boolean;
  provider: string;
  type: string;
  instructions?: string;
  requirements?: string;
  device_type?: string;
  network?: string;
  rating?: number;
  is_cpe?: boolean;
  has_events?: boolean;
  events?: Array<{
    id: string;
    name: string;
    payout: number;
    description?: string;
  }>;
  events_count?: number;
}

export const getDisplayPrice = (offer: Offer): string => {
  const actualAmount = offer.payout_coins;
  if (actualAmount < 0.01 && actualAmount > 0) {
    return actualAmount.toFixed(4);
  }
  return actualAmount.toFixed(2);
};

export const calculateEventsTotal = (events: Offer['events']): number => {
  if (!events || events.length === 0) return 0;
  return events.reduce((total, event) => total + event.payout, 0);
};

export const extractOffers = (data: any): any[] => {
  if (!data) return [];
  if (data.offers && Array.isArray(data.offers.data)) return data.offers.data;
  if (Array.isArray(data.offers)) return data.offers;
  if (Array.isArray(data)) return data;
  return [];
};

// Function to parse OS string and return array of supported platforms
export const getSupportedPlatforms = (osString: string): string[] => {
  if (!osString) return [];
  
  const osLower = osString.toLowerCase();
  const platforms: string[] = [];
  
  // Check for specific platforms
  if (osLower.includes('android')) platforms.push('android');
  if (osLower.includes('ios')) platforms.push('ios');
  if (osLower.includes('windows') || osLower.includes('win')) platforms.push('windows');
  
  // If no specific platforms found but it's not 'any' or 'all', return empty
  if (platforms.length === 0 && !osLower.includes('all') && !osLower.includes('any')) {
    return [];
  }
  
  return platforms;
};

// Get OS icons based on supported platforms (no text, just icons)
export const getOSIcons = (osString: string) => {
  const platforms = getSupportedPlatforms(osString);
  
  // If no specific platforms or 'any'/'all', return null (don't show any icons)
  if (platforms.length === 0) {
    return null;
  }
  
  const iconMap: Record<string, React.ReactNode> = {
    android: <AndroidFilled key="android" className="h-3.5 w-3.5 text-success" />,
    ios: <AppleFilled key="ios" className="h-3.5 w-3.5 text-muted-foreground" />,
    windows: <WindowsFilled key="windows" className="h-3.5 w-3.5 text-info" />,
  };
  
  return (
    <div className="flex items-center gap-1.5">
      {platforms.map(platform => iconMap[platform])}
    </div>
  );
};

// Legacy function for backward compatibility (returns first icon)
export const getOSIcon = (os: string) => {
  const platforms = getSupportedPlatforms(os);
  if (platforms.length === 0) return null;
  
  switch (platforms[0]) {
    case 'android':
      return <AndroidFilled className="h-4 w-4 text-success" />;
    case 'ios':
      return <AppleFilled className="h-4 w-4 text-muted-foreground" />;
    case 'windows':
      return <WindowsFilled className="h-4 w-4 text-info" />;
    default:
      return null;
  }
};

export const getProviderBadge = (provider: string) => {
  const badges: Record<string, string> = {
    revtoo: 'RevToo',
    kiwiwall: 'KiwiWall',
    ayet: 'Ayet',
    primewall: 'Primewall',
    offery: 'Offery',
    notik: 'Notik',
    opinionuniverse: 'OpinionUniverse',
  };
  const name = badges[provider] || provider;
  const colorClass =
    provider === 'revtoo'
      ? 'bg-secondary'
      : provider === 'kiwiwall'
      ? 'bg-success-dark'
      : provider === 'ayet'
      ? 'bg-secondary'
      : provider === 'primewall'
      ? 'bg-secondary'
      : provider === 'offery'
      ? 'bg-secondary'
      : provider === 'notik'
      ? 'bg-orange-600'
      : provider === 'opinionuniverse'
      ? 'bg-secondary'
      : 'bg-muted';
  return <span className={`${colorClass} text-foreground px-2 py-1 rounded text-xs`}>{name}</span>;
};