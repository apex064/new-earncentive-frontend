// hooks/useAdSenseKeys.ts
import { useState, useEffect } from 'react';
import { KeysResponse } from '../types/ads';
import { API_BASE_URL } from '@/lib/config';

export const useAdSenseKeys = () => {
  const [adsenseKeys, setAdsenseKeys] = useState<KeysResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/google/adsense/`, {
          headers: { 
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('AdSense keys not configured');
          } else {
            throw new Error(`Failed to fetch AdSense keys: ${response.status}`);
          }
        }
        
        const data = await response.json();
        
        // Transform the response to match the expected structure
        // New endpoint returns: { keys: { key_name: key_value } }
        // Expected structure: { keys: { google_AdSense: { client: string } } }
        
        // Find the client key - it could be named 'client', 'client_id', 'adsense_client', etc.
        const keys = data.keys || {};
        let clientId = '';
        
        // Try common key name variations
        for (const [keyName, keyValue] of Object.entries(keys)) {
          const lowerKey = keyName.toLowerCase();
          if (lowerKey.includes('client') && typeof keyValue === 'string') {
            clientId = keyValue;
            break;
          }
        }
        
        // If no client found, try to get the first string value
        if (!clientId && Object.keys(keys).length > 0) {
          const firstValue = Object.values(keys)[0];
          if (typeof firstValue === 'string') {
            clientId = firstValue;
          }
        }
        
        const transformedData: KeysResponse = {
          user_id: 0, // Not needed for public endpoint
          keys: {
            google_AdSense: {
              client: clientId
            },
            cpx: {},
            ayet: {},
            timewall: {},
            kiwiwall: {},
            pubscale: {},
            revtoo: {},
            adgem: {},
            appsprize: {}
          }
        };
        
        setAdsenseKeys(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred while fetching AdSense keys');
      } finally {
        setLoading(false);
      }
    };

    fetchKeys();
  }, []);

  return { adsenseKeys, loading, error };
};
