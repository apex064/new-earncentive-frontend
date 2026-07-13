// hooks/useFingerprint.ts
import { useEffect, useState, useRef } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { API_BASE_URL } from '@/lib/config';

interface FingerprintData {
  visitorId: string;
  fingerprintId: string;
  components: any;
  deviceInfo: {
    platform: string;
    language: string;
    screenResolution: string;
    timezone: string;
  };
  browserInfo: {
    userAgent: string;
    languages: string[];
    cookieEnabled: boolean;
    doNotTrack: string | null;
    hardwareConcurrency: number;
    deviceMemory: number | undefined;
  };
}

interface UseFingerprintReturn {
  fingerprintId: string | null;
  visitorId: string | null;
  isLoading: boolean;
  error: Error | null;
  registerFingerprint: () => Promise<boolean>;
  verifyFingerprint: () => Promise<{
    isKnownDevice: boolean;
    isTrustedDevice: boolean;
    isSharedDevice: boolean;
    sharedWithUser: string | null;
  }>;
  isDeviceKnown: boolean;
}

export function useFingerprint(): UseFingerprintReturn {
  const [fingerprintId, setFingerprintId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDeviceKnown, setIsDeviceKnown] = useState(false);
  const fpPromiseRef = useRef<Promise<any> | null>(null);
  const registeredRef = useRef(false);

  // Initialize FingerprintJS once
  useEffect(() => {
    if (!fpPromiseRef.current) {
      fpPromiseRef.current = FingerprintJS.load({
        monitoring: false, // Disable monitoring for better performance
      });
    }
  }, []);

  // Get fingerprint on mount
  useEffect(() => {
    const getFingerprint = async () => {
      if (!fpPromiseRef.current) return;
      
      try {
        setIsLoading(true);
        const fp = await fpPromiseRef.current;
        const result = await fp.get();
        
        // Generate a consistent fingerprint ID (use visitorId or hash components)
        const fpId = result.visitorId;
        setFingerprintId(fpId);
        setVisitorId(result.visitorId);
        
        // Check if this device is known by fetching from backend
        const token = localStorage.getItem('token');
        if (token && fpId) {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/fingerprint/verify/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${token}`,
              },
              body: JSON.stringify({ fingerprint_id: fpId }),
            });
            
            if (verifyRes.ok) {
              const verifyData = await verifyRes.json();
              setIsDeviceKnown(verifyData.is_known_device);
            }
          } catch (err) {
            console.error('Failed to verify fingerprint:', err);
          }
        }
        
        // Auto-register if we have a token and haven't registered this session
        const token = localStorage.getItem('token');
        if (token && fpId && !registeredRef.current) {
          // Check if we already registered this session
          const sessionRegistered = sessionStorage.getItem('fingerprint_registered');
          if (!sessionRegistered) {
            await registerFingerprintDirect(result);
            sessionStorage.setItem('fingerprint_registered', 'true');
          }
        }
        
      } catch (err) {
        console.error('FingerprintJS error:', err);
        setError(err instanceof Error ? err : new Error('Failed to get fingerprint'));
      } finally {
        setIsLoading(false);
      }
    };

    getFingerprint();
  }, []);

  const registerFingerprintDirect = async (result: any) => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    const fpId = result.visitorId;
    
    // Extract device and browser info
    const components = result.components;
    const deviceInfo = {
      platform: components.platform?.value || navigator.platform,
      language: components.language?.value || navigator.language,
      screenResolution: components.screenResolution?.value 
        ? `${components.screenResolution.value[0]}x${components.screenResolution.value[1]}`
        : `${window.screen.width}x${window.screen.height}`,
      timezone: components.timezone?.value || Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    
    const browserInfo = {
      userAgent: navigator.userAgent,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/fingerprint/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          fingerprint_id: fpId,
          visitor_id: result.visitorId,
          components: components,
          device_info: deviceInfo,
          browser_info: browserInfo,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fingerprint registered:', data);
        return true;
      } else {
        console.error('Failed to register fingerprint:', await response.text());
        return false;
      }
    } catch (err) {
      console.error('Error registering fingerprint:', err);
      return false;
    }
  };

  const registerFingerprint = async (): Promise<boolean> => {
    if (!fpPromiseRef.current) {
      fpPromiseRef.current = FingerprintJS.load();
    }
    
    try {
      const fp = await fpPromiseRef.current;
      const result = await fp.get();
      registeredRef.current = true;
      return await registerFingerprintDirect(result);
    } catch (err) {
      console.error('Failed to register fingerprint:', err);
      return false;
    }
  };

  const verifyFingerprint = async () => {
    const token = localStorage.getItem('token');
    if (!token || !fingerprintId) {
      return {
        isKnownDevice: false,
        isTrustedDevice: false,
        isSharedDevice: false,
        sharedWithUser: null,
      };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/fingerprint/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ fingerprint_id: fingerprintId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          isKnownDevice: data.is_known_device,
          isTrustedDevice: data.is_trusted_device,
          isSharedDevice: data.is_shared_device,
          sharedWithUser: data.shared_with_user,
        };
      }
    } catch (err) {
      console.error('Failed to verify fingerprint:', err);
    }
    
    return {
      isKnownDevice: false,
      isTrustedDevice: false,
      isSharedDevice: false,
      sharedWithUser: null,
    };
  };

  return {
    fingerprintId,
    visitorId,
    isLoading,
    error,
    registerFingerprint,
    verifyFingerprint,
    isDeviceKnown,
  };
}