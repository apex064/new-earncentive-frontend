import { useState, useEffect } from 'react';
import { getCachedData, setCachedData, isCacheValid } from '@/lib/cache';
import { Offer, extractOffers } from '@/utils/offers';

import { API_BASE_URL } from '@/lib/config';

// Offerwall logos (same as before)
export const offerwallLogos: Record<string, string> = {
  bitlabs: '/logos/bitlabs.png',
  offertoro: '/logos/offertoro.png',
  cpx: '/logos/cpx.png',
  lootably: '/logos/lootably.png',
  adgate: '/logos/adgate.png',
  adgem: '/logos/adgem.png',
  mychips: '/logos/mychips-logo.svg',
  ayet: '/logos/ayet.png',
  wannads: '/logos/wannads.png',
  timewall: '/logos/timewall.png',
  kiwiwall: '/logos/kiwiwall.png',
  pubscale: '/logos/pubscale.png',
  revtoo: '/logos/revtoo.png',
  mmwall: '/logos/mmwall.svg',
  appsprize: '/logos/appsprize.svg',
  primewall: '/logos/primewall.png',
  offery: '/logos/offery.png',
  theoremreach: '/logos/theoremreach.svg',
  notik: '/logos/notik_logo.png',
  mylead: '/logos/mylead_logo.svg',
  opinionuniverse: '/logos/opinionuniverse.png',
  incentium: '/logos/incentium.png',
  gemiwall: '/logos/gemiad.png',
};

const normalizeOffer = (offer: any, provider: string): Offer => {
  let description = '';
  if (typeof offer.description === 'string') description = offer.description;
  else if (offer.description?.en) description = offer.description.en;
  
  // FIX: Use payout_coins for consistency across all providers
  // KiwiWall: payout_coins is tokens (21000), RevToo: payout_coins is tokens, etc.
  const payoutInTokens = parseFloat(offer.payout_coins || offer.payout || 0);
  
  return {
    ...offer,
    provider,
    logo: offer.logo || offer.image || offer.banner || offer.icon || offerwallLogos[provider],
    payout_coins: payoutInTokens,
    payout: payoutInTokens, // Store tokens in payout for consistency
    name: offer.name || offer.title || '',
    description,
    currency: offer.currency || 'USD',
    category: offer.category || 'General',
    os: offer.os || offer.device || offer.device_type || 'any',
    external_url: offer.external_url || offer.click_url || '',
    countries:
      Array.isArray(offer.country) ? offer.country.join(',') : offer.countries || offer.country || 'Global',
    clicked: offer.clicked || false,
    type: offer.type || 'simple',
    has_events: offer.has_events || (offer.events?.length > 0),
    events: offer.events || [],
    events_count: offer.events_count || offer.events?.length || 0,
  };
};

const providerPriority = [
  'incentium',
  'notik',
  'revtoo',
  'kiwiwall',
  'ayet',
  'primewall',
  'offery',
  'opinionuniverse',
  'gemiad',
];

const shuffleOffers = <T,>(items: T[]) =>
  [...items].sort(() => Math.random() - 0.5);

const offerIsMobile = (offer: Offer) =>
  offer.category?.toLowerCase().includes('mobile') ||
  offer.os?.toLowerCase().includes('mobile') ||
  ['notik', 'kiwiwall', 'ayet', 'offery'].includes(offer.provider);

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
  const values = normalizeCountryList(offer.countries);
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

export function useOffers() {
  const [recommendedOffers, setRecommendedOffers] = useState<Offer[]>([]);
  const [gamingOffers, setGamingOffers] = useState<Offer[]>([]);
  const [premiumOffers, setPremiumOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all offers and categorize
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // First, get Notik offers from cache or fetch
        let notikOffers: Offer[] = [];
        const notikCacheKey = 'notik_offers';
        if (isCacheValid(notikCacheKey)) {
          notikOffers = getCachedData<Offer[]>(notikCacheKey) || [];
        } else {
          const res = await fetch(`${API_BASE_URL}/notik/offers/filtered/?limit=100`, {
            headers: { Authorization: `Token ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const raw = extractOffers(data);
            notikOffers = raw.map((o) => normalizeOffer(o, 'notik'));
            setCachedData(notikCacheKey, notikOffers);
          }
        }

        // Fetch all other offerwalls
        const endpoints = [
          'kiwiwall', 'revtoo', 'ayet', 'primewall', 'offery', 'opinionuniverse', 'gemi', 'incentium'
        ];
        const fetchPromises = endpoints.map(async (service) => {
          try {
            const url = `${API_BASE_URL}/${service}/offers/filtered/?limit=30`;
            const res = await fetch(url, { headers: { Authorization: `Token ${token}` } });
            if (!res.ok) throw new Error(`Failed ${service}`);
            const data = await res.json();
            const raw = extractOffers(data);
            return raw.map((o) => normalizeOffer(o, service === 'gemi' ? 'gemiad' : service));
          } catch {
            return [];
          }
        });
        const results = await Promise.all(fetchPromises);
        const allOffers = filterProviderOffers([notikOffers, ...results].flat());
        const prioritizedOffers = sortOffersByPriority(allOffers);

        const recommendedProviders = ['incentium', 'notik', 'revtoo', 'ayet'];
        const recommendedPool = prioritizedOffers.filter(
          (o) =>
            recommendedProviders.includes(o.provider) ||
            offerIsMobile(o)
        );
        const shuffledRecommended = shuffleOffers(recommendedPool);
        const recommendedOffersList = shuffledRecommended.slice(0, 15);
        setRecommendedOffers(recommendedOffersList);
        setCachedData('recommended_offers', recommendedOffersList);

        const mobileOffers = shuffleOffers(prioritizedOffers.filter(offerIsMobile));
        setGamingOffers(mobileOffers.slice(0, 15));
        setCachedData('gaming_offers', mobileOffers.slice(0, 15));

        // FIX: Use payout_coins (tokens) for filtering - minimum 500 tokens = $0.50
        const premiumCandidates = prioritizedOffers
          .filter((o) => (o.payout_coins || 0) >= 500)
          .sort((a, b) =>
            (b.payout_coins || 0) - (a.payout_coins || 0) ||
            providerPriority.indexOf(a.provider) - providerPriority.indexOf(b.provider)
          );
        let premium = premiumCandidates.slice(0, 15);
        if (premium.length < 15) {
          const fill = prioritizedOffers.filter((o) => !premium.some((p) => p.id === o.id)).slice(0, 15 - premium.length);
          premium = [...premium, ...fill];
        }
        setPremiumOffers(premium);
        setCachedData('premium_offers', premium);
      } catch (err) {
        console.error('Error fetching offers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { recommendedOffers, gamingOffers, premiumOffers, loading };
}
