import { useState, useEffect, useCallback } from 'react';
import { getCachedData, setCachedData, isCacheValid } from '@/lib/cache';
import { extractOffers } from '@/utils/offers';
import { toast } from 'sonner';

// Use proxy endpoint instead of direct API to avoid CORS
const API_BASE_URL = '/api/proxy';

interface Offer {
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
  has_events?: boolean;
  featured?: boolean;
  events?: any[];
  is_variable_payout?: boolean;
  instructions?: string;
  requirements?: string;
  device_type?: string;
  network?: string;
  rating?: number;
  is_cpe?: boolean;
  image?: string;
  raw_data?: any;
  events_count?: number;
  campaign_id?: string;
  target_os?: string;
  target_geo?: string[];
  reward_name?: string;
  your_earning?: number;
  click_url?: string;
}

const providerPriority = [
  'incentium',  // Added Incentium to priority list (high priority)
  'notik',
  'revtoo',
  'kiwiwall',
  'ayet',
  'primewall',
  'offery',
  'opinionuniverse',
  'gemiad',
];

const normalizeCountryList = (countries: string | string[] | undefined) => {
  if (!countries) return [];
  if (Array.isArray(countries)) return countries.map((c) => String(c).trim().toUpperCase());
  return String(countries)
    .split(/[,;|]/)
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean);
};

const isGemiUsOffer = (offer: Offer) => {
  if (offer.provider !== 'gemiad') return true;
  const values = normalizeCountryList(offer.countries || '');
  return values.some((value) => ['US', 'USA', 'UNITED STATES', 'UNITED STATES OF AMERICA', 'AMERICA'].includes(value));
};

const sortOffersByPriority = (offers: Offer[]) =>
  [...offers].sort((a, b) => {
    const providerIndexA = providerPriority.indexOf(a.provider);
    const providerIndexB = providerPriority.indexOf(b.provider);
    if (providerIndexA !== providerIndexB) return providerIndexA - providerIndexB;
    return (b.payout_coins || b.payout || 0) - (a.payout_coins || a.payout || 0);
  });

const filterProviderOffers = (offers: Offer[]) => offers.filter(isGemiUsOffer);

const fetchFromProvider = async (
  token: string,
  provider: string,
  url: string,
  mapper: (offer: any) => Offer
): Promise<Offer[]> => {
  try {
    const res = await fetch(url, { 
      headers: { 
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json'
      } 
    });
    if (!res.ok) throw new Error(`Failed to fetch ${provider} offers`);
    const data = await res.json();
    const rawOffers = extractOffers(data);
    return rawOffers.map(mapper);
  } catch (error) {
    console.error(`Error fetching ${provider} offers:`, error);
    return [];
  }
};

export function useOffersData() {
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchOffers = useCallback(async (silent = false, forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError(new Error('No authentication token found'));
      setLoading(false);
      return;
    }

    const cacheKey = 'all_offers_data';
    if (!forceRefresh && isCacheValid(cacheKey)) {
      const cachedOffers = getCachedData<Offer[]>(cacheKey);
      if (cachedOffers) {
        setAllOffers(cachedOffers);
        if (!silent) {
          toast.success(`Loaded ${cachedOffers.length} offers (cached)`);
        }
        setLoading(false);
        setRefreshing(false);
        setError(null);
        return;
      }
    }

    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    setError(null);

    const tokenValue = token;
    const providers = [
      // ==================== INCENTIUM (NEW) ====================
      {
        name: 'incentium',
        url: `${API_BASE_URL}/incentium/offers/?limit=100`,
        mapper: (o: any): Offer => {
          // Handle Incentium's specific response structure
          // Incentium returns: { offers: [{ id, name, your_earning, reward_amount, click_url, ... }] }
          return {
            id: o.id || o.campaign_id || `incentium_${Math.random().toString(36).substr(2, 9)}`,
            campaign_id: o.id || o.campaign_id,
            name: o.name || 'Incentium Offer',
            description: o.description || 'Complete this offer to earn rewards',
            logo: o.icon_url || o.logo || o.image || '',
            payout: parseFloat(o.your_earning || o.payout || 0),
            payout_coins: parseFloat(o.reward_amount || o.payout_coins || o.payout || 0),
            currency: o.currency || 'USD',
            category: o.category || 'Offer',
            os: o.target_os || o.os || 'any',
            external_url: o.click_url || o.external_url || '',
            countries: Array.isArray(o.target_geo) ? o.target_geo.join(',') : (o.countries || 'Global'),
            clicked: false,
            provider: 'incentium',
            type: o.campaign_type || 'offerwall',
            has_events: (o.total_events || 0) > 0,
            featured: o.featured || false,
            events: o.flow_steps || [],
            events_count: o.total_events || 0,
            is_variable_payout: false,
            device_type: o.target_device || 'any',
            requirements: o.description || '',
            target_os: o.target_os,
            target_geo: o.target_geo,
            reward_name: o.reward_name || 'Points',
            your_earning: parseFloat(o.your_earning || 0),
            click_url: o.click_url,
            total_conversions: o.total_conversions || 0,
            conversion_status: o.conversion_status,
            completed_events: o.completed_events || 0,
            total_events: o.total_events || 1,
          };
        },
      },
      // ==================== KIWIWALL ====================
      {
        name: 'kiwiwall',
        url: `${API_BASE_URL}/kiwiwall/offers/?limit=100`,
        mapper: (o: any): Offer => ({
          ...o,
          provider: 'kiwiwall',
          payout_coins: o.payout_coins || o.payout || 0,
          payout: o.payout || o.payout_coins || 0,
          currency: o.currency || 'USD',
        }),
      },
      // ==================== REVTOO ====================
      {
        name: 'revtoo',
        url: `${API_BASE_URL}/revtoo/offers/?limit=100`,
        mapper: (o: any): Offer => ({
          ...o,
          provider: 'revtoo',
          payout_coins: o.payout_coins || o.payout || 0,
          payout: o.payout || o.payout_coins || 0,
          currency: o.currency || 'USD',
        }),
      },
      // ==================== AYET ====================
      {
        name: 'ayet',
        url: `${API_BASE_URL}/ayet/offers/?limit=100`,
        mapper: (o: any): Offer => ({
          ...o,
          provider: 'ayet',
          payout_coins: o.payout_coins || o.payout || 0,
          payout: o.payout || o.payout_coins || 0,
          currency: o.currency || 'USD',
        }),
      },
      // ==================== PRIMEWALL ====================
      {
        name: 'primewall',
        url: `${API_BASE_URL}/primewall/offers/?limit=100`,
        mapper: (o: any): Offer => ({
          id: o.id || `primewall_${Math.random().toString(36).substr(2, 9)}`,
          name: o.name || o.title || 'Primewall Offer',
          description: o.description || 'Complete this offer to earn rewards',
          logo: o.logo || o.image || '',
          payout: o.payout || o.payout_coins || 0,
          payout_coins: o.payout_coins || o.payout || 0,
          currency: o.currency || 'USD',
          category: o.category || 'Offer',
          os: o.os || o.device || 'any',
          external_url: o.external_url || o.click_url || '',
          countries: o.countries || 'Global',
          clicked: o.clicked || false,
          provider: 'primewall',
          type: o.type || 'simple',
          has_events: o.has_events || false,
          featured: o.featured || false,
          events: o.events || [],
          events_count: o.events_count || 0,
          is_variable_payout: o.is_variable_payout || false,
          image: o.image || '',
          raw_data: o.raw_data || o,
        }),
      },
      // ==================== OFFERY ====================
      {
        name: 'offery',
        url: `${API_BASE_URL}/offery/offers/?limit=100`,
        mapper: (o: any): Offer => ({
          id: o.id || `offery_${Math.random().toString(36).substr(2, 9)}`,
          name: o.name || o.title || 'Offery Offer',
          description: o.description || 'Complete this offer to earn rewards',
          logo: o.logo || o.image || '',
          payout: o.payout || o.payout_coins || 0,
          payout_coins: o.payout_coins || o.payout || 0,
          currency: o.currency || 'USD',
          category: o.category || 'Offer',
          os: o.os || o.device_type || 'any',
          external_url: o.external_url || o.click_url || '',
          countries: o.countries || 'Global',
          clicked: o.clicked || false,
          provider: 'offery',
          type: o.type || 'offerwall',
          has_events: o.has_events || false,
          featured: o.featured || false,
          events: o.events || [],
          events_count: o.events_count || 0,
          is_variable_payout: false,
          device_type: o.device_type || '',
          requirements: o.requirements || '',
        }),
      },
      // ==================== NOTIK ====================
      {
        name: 'notik',
        url: `${API_BASE_URL}/notik/offers/filtered/?limit=100`,
        mapper: (o: any): Offer => ({
          id: o.id || `notik_${Math.random().toString(36).substr(2, 9)}`,
          name: o.name || o.title || 'Notik Offer',
          description: o.description || o.description1 || 'Complete this offer to earn rewards',
          logo: o.logo || o.image || o.image_url || '',
          payout: o.payout || o.payout_coins || 0,
          payout_coins: o.payout_coins || o.payout || 0,
          currency: o.currency || 'USD',
          category: o.category || o.categories?.[0] || 'Offer',
          os: o.os || o.device_type || 'any',
          external_url: o.external_url || o.click_url || '',
          countries: o.countries || o.country_code || 'Global',
          clicked: o.clicked || false,
          provider: 'notik',
          type: o.type || 'offerwall',
          has_events: o.has_events || false,
          featured: o.featured || false,
          events: o.events || [],
          events_count: o.events_count || 0,
          is_variable_payout: false,
          device_type: o.device_type || '',
          requirements: o.requirements || o.description2 || '',
        }),
      },
      // ==================== OPINIONUNIVERSE ====================
      {
        name: 'opinionuniverse',
        url: `${API_BASE_URL}/opinionuniverse/offers/?limit=100`,
        mapper: (o: any): Offer => ({
          ...o,
          provider: 'opinionuniverse',
          payout_coins: o.payout_coins || o.payout || 0,
          payout: o.payout || o.payout_coins || 0,
          currency: o.currency || 'USD',
        }),
      },
      // ==================== GEMIAD ====================
      {
        name: 'gemiad',
        url: `${API_BASE_URL}/gemi/offers/filtered/?limit=100`,
        mapper: (o: any): Offer => {
          let desc = '';
          if (typeof o.description === 'string') desc = o.description;
          else if (o.description && o.description.en) desc = o.description.en;
          return {
            ...o,
            id: o.id || `gemi_${Math.random().toString(36).substr(2, 9)}`,
            name: o.name || 'GemiAd Offer',
            description: desc,
            logo: o.logo || o.banner || o.icon || '',
            payout: o.payout || 0,
            payout_coins: o.payout || 0,
            currency: 'USD',
            category: o.category || 'Offer',
            os: 'any',
            external_url: o.external_url || o.url || '',
            countries: Array.isArray(o.country) ? o.country.join(',') : o.country || 'Global',
            clicked: false,
            provider: 'gemiad',
            type: 'offerwall',
            has_events: o.events && o.events.length > 0,
            events: o.events || [],
            events_count: o.events ? o.events.length : 0,
          };
        },
      },
    ];

    try {
      const promises = providers.map((p) =>
        fetchFromProvider(tokenValue, p.name, p.url, p.mapper)
      );
      const results = await Promise.allSettled(promises);

      const combinedOffers: Offer[] = [];
      results.forEach((res) => {
        if (res.status === 'fulfilled') combinedOffers.push(...res.value);
      });

      const filteredOffers = filterProviderOffers(combinedOffers);
      const prioritizedOffers = sortOffersByPriority(filteredOffers);

      setCachedData(cacheKey, prioritizedOffers);
      setAllOffers(prioritizedOffers);

      if (!silent) {
        const incentiumCount = prioritizedOffers.filter(o => o.provider === 'incentium').length;
        toast.success(`Loaded ${prioritizedOffers.length} offers (${incentiumCount} from Incentium)`);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      setError(error as Error);
      if (!silent) toast.error('Error loading offers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
    const interval = setInterval(() => fetchOffers(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchOffers]);

  return { allOffers, loading, refreshing, refresh: () => fetchOffers(false, true), error };
}
