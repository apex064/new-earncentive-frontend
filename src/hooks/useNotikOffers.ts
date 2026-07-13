import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { API_BASE_URL } from '@/lib/config';

export interface NotikOffer {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  payout: number;
  currency: string;
  category?: string;
  os?: string;
  requirements?: string;
  external_url?: string;
  provider: string;
  type: string;
  device_type?: string;
  offer_id: string;
  clicked?: boolean;
}

export interface NotikOffersResponse {
  status: string;
  offers: NotikOffer[];
  next_page_url?: string;
  timestamp: string;
}

export function useNotikOffers() {
  const router = useRouter();
  const [offers, setOffers] = useState<NotikOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);

  const fetchOffers = useCallback(async (pageUrl?: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      setLoading(true);
      setError(null);

      const url = pageUrl 
        ? pageUrl 
        : `${API_BASE_URL}/notik/offers/filtered/`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch Notik offers');
      }

      const data: NotikOffersResponse = await res.json();
      
      if (pageUrl) {
        // Append more offers
        setOffers((prev) => [...prev, ...data.offers]);
      } else {
        // Replace offers
        setOffers(data.offers);
      }

      setNextPageUrl(data.next_page_url || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error(`Error loading offers: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const markOfferAsClicked = useCallback((offerId: string) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId ? { ...o, clicked: true } : o
      )
    );
  }, []);

  const loadMore = useCallback(() => {
    if (nextPageUrl) {
      fetchOffers(nextPageUrl);
    }
  }, [nextPageUrl, fetchOffers]);

  return {
    offers,
    loading,
    error,
    nextPageUrl,
    fetchOffers,
    markOfferAsClicked,
    loadMore,
  };
}
