import { useState, useMemo } from 'react';
import { Offer } from './useOffersData';

interface FilterState {
  category: string;
  os: string;
  country: string;
  provider: string;
}

export function useOfferFilters(offers: Offer[]) {
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    os: '',
    country: '',
    provider: 'all',
  });

  const filteredOffers = useMemo(() => {
    let filtered = offers;

    if (filters.category) {
      filtered = filtered.filter((offer) =>
        offer.category?.toLowerCase().includes(filters.category.toLowerCase()) ?? false
      );
    }
    if (filters.os) {
      filtered = filtered.filter((offer) =>
        offer.os?.toLowerCase().includes(filters.os.toLowerCase()) ?? false
      );
    }
    if (filters.country) {
      filtered = filtered.filter((offer) =>
        offer.countries?.toLowerCase().includes(filters.country.toLowerCase()) ?? false
      );
    }
    if (filters.provider !== 'all') {
      filtered = filtered.filter(
        (offer) => offer.provider?.toLowerCase() === filters.provider.toLowerCase()
      );
    }

    return filtered;
  }, [offers, filters]);

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      os: '',
      country: '',
      provider: 'all',
    });
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some((v) => v !== '' && v !== 'all');
  };

  return { filters, filteredOffers, updateFilter, clearFilters, hasActiveFilters };
}
