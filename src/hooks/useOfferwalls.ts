import { useState, useEffect } from 'react';
import { getCachedData, setCachedData, isCacheValid } from '@/lib/cache';
import { offerwallLogos } from './useOffers';

import { API_BASE_URL } from '@/lib/config';

interface Offerwall {
  service: string;
  name: string;
  logo: string;
}

const offerwallNames: Record<string, string> = {
  bitlabs: 'Bitlabs',
  offertoro: 'OfferToro',
  cpx: 'CPX Research',
  lootably: 'Lootably',
  adgate: 'AdGate Media',
  adgem: 'AdGem Media',
  mychips: 'MyChips',
  ayet: 'ayet studios',
  wannads: 'Wannads',
  timewall: 'timewall',
  kiwiwall: 'KiwiWall',
  pubscale: 'pubscale',
  revtoo: 'revtoo',
  mmwall: 'mmwall',
  appsprize: 'appsprize',
  primewall: 'Primewall',
  offery: 'offery',
  theoremreach: 'theoremreach',
  notik: 'notik',
  mylead: 'MyLead',
  opinionuniverse: 'Opinion Universe',
  gemiwall: 'gemiad',
  incentium: 'incentium'
};

export function useOfferwalls() {
  const [offerwalls, setOfferwalls] = useState<Offerwall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfferwalls = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const cacheKey = 'offerwalls_list';
      if (isCacheValid(cacheKey)) {
        const cached = getCachedData<Offerwall[]>(cacheKey);
        if (cached) {
          setOfferwalls(cached);
          setLoading(false);
          return;
        }
      }
      try {
        const res = await fetch(`${API_BASE_URL}/keys/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch offerwalls');
        const data = await res.json();
        const available = Object.keys(data.keys || {})
          .filter((service) => offerwallNames[service])
          .map((service) => ({
            service,
            name: offerwallNames[service],
            logo: offerwallLogos[service],
          }));
        setCachedData(cacheKey, available);
        setOfferwalls(available);
      } catch (error) {
        console.error('Error fetching offerwalls:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOfferwalls();
  }, []);

  return { offerwalls, loading };
}
