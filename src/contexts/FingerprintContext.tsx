// contexts/FingerprintContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { API_BASE_URL } from '@/lib/config';
import { toast } from 'sonner';

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

interface FingerprintContextType {
  fingerprintId: string | null;
  visitorId: string | null;
  isLoading: boolean;
  error: Error | null;
  isDeviceKnown: boolean;
  isTrustedDevice: boolean;
  isSharedDevice: boolean;
  sharedWithUser: string | null;
  registerFingerprint: () => Promise<boolean>;
  verifyFingerprint: () => Promise<{
    isKnownDevice: boolean;
    isTrustedDevice: boolean;
    isSharedDevice: boolean;
    sharedWithUser: string | null;
  }>;
  refreshDeviceStatus: () => Promise<void>;
  checkWithdrawalEligibility: () => Promise<boolean>;
}

const FingerprintContext = createContext<FingerprintContextType | undefined>(undefined);

export function useFingerprint() {
  const context = useContext(FingerprintContext);
  if (!context) {
    throw new Error('useFingerprint must be used within a FingerprintProvider');
  }
  return context;
}

interface FingerprintProviderProps {
  children: React.ReactNode;
}

export function FingerprintProvider({ children }: FingerprintProviderProps) {
  const [fingerprintId, setFingerprintId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDeviceKnown, setIsDeviceKnown] = useState(false);
  const [isTrustedDevice, setIsTrustedDevice] = useState(false);
  const [isSharedDevice, setIsSharedDevice] = useState(false);
  const [sharedWithUser, setSharedWithUser] = useState<string | null>(null);
  const fpPromiseRef = useRef<Promise<any> | null>(null);
  const initializedRef = useRef(false);
  const refreshInProgressRef = useRef(false);
  const registrationAttemptedRef = useRef<Record<string, boolean>>({});

  // Initialize FingerprintJS once
  useEffect(() => {
    if (!fpPromiseRef.current) {
      fpPromiseRef.current = FingerprintJS.load({
        monitoring: false,
      });
    }
  }, []);

  // Get fingerprint and verify on mount
  useEffect(() => {
    const initFingerprint = async () => {
      if (!fpPromiseRef.current || initializedRef.current) return;

      try {
        setIsLoading(true);
        const fp = await fpPromiseRef.current;
        const result = await fp.get();

        const fpId = result.visitorId;
        setFingerprintId(fpId);
        setVisitorId(result.visitorId);

        const token = localStorage.getItem('token');

        if (token && fpId) {
          // First, verify the device with the backend - this gives us the actual status
          const verificationResult = await performVerification(fpId);

          console.log('Initial verification result:', verificationResult);

          // Update state based on verification result
          setIsDeviceKnown(verificationResult.isKnownDevice);
          setIsTrustedDevice(verificationResult.isTrustedDevice);
          setIsSharedDevice(verificationResult.isSharedDevice);
          setSharedWithUser(verificationResult.sharedWithUser);

          // Only register if the device is NOT known and we haven't attempted registration for this fingerprint yet
          const registerKey = `fingerprint_register_${fpId}`;
          const alreadyAttemptedRegistration = sessionStorage.getItem(registerKey);

          if (!verificationResult.isKnownDevice && !alreadyAttemptedRegistration) {
            console.log('Device not known, attempting registration...');
            sessionStorage.setItem(registerKey, 'true');
            const registerSuccess = await registerFingerprintDirect(result);
            if (registerSuccess) {
              // After registration, verify again to get updated status
              const newVerification = await performVerification(fpId);
              setIsDeviceKnown(newVerification.isKnownDevice);
              setIsTrustedDevice(newVerification.isTrustedDevice);
              setIsSharedDevice(newVerification.isSharedDevice);
              setSharedWithUser(newVerification.sharedWithUser);
              console.log('Post-registration status:', newVerification);
            }
          } else if (verificationResult.isKnownDevice) {
            console.log('Device already known, no registration needed');
            sessionStorage.setItem(registerKey, 'true');
          }
        }

        initializedRef.current = true;

      } catch (err) {
        console.error('FingerprintJS error:', err);
        setError(err instanceof Error ? err : new Error('Failed to get fingerprint'));
      } finally {
        setIsLoading(false);
      }
    };

    initFingerprint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to perform verification and return result
  const performVerification = async (fpId: string): Promise<{
    isKnownDevice: boolean;
    isTrustedDevice: boolean;
    isSharedDevice: boolean;
    sharedWithUser: string | null;
  }> => {
    const token = localStorage.getItem('token');
    if (!token || !fpId) {
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
        body: JSON.stringify({ fingerprint_id: fpId }),
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

  const registerFingerprintDirect = async (result: any): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const fpId = result.visitorId;

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
      }
      return false;
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
      const success = await registerFingerprintDirect(result);
      if (success) {
        // Refresh status after registration
        await refreshDeviceStatus();
      }
      return success;
    } catch (err) {
      console.error('Failed to register fingerprint:', err);
      return false;
    }
  };

  const refreshDeviceStatus = async () => {
    if (refreshInProgressRef.current) {
      console.log('Refresh already in progress, skipping...');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token || !fingerprintId) {
      console.log('No token or fingerprintId for refresh');
      return;
    }

    refreshInProgressRef.current = true;

    try {
      console.log('Refreshing device status for fingerprint:', fingerprintId);
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
        console.log('Device verification response:', data);
        setIsDeviceKnown(data.is_known_device);
        setIsTrustedDevice(data.is_trusted_device);
        setIsSharedDevice(data.is_shared_device);
        setSharedWithUser(data.shared_with_user);
      } else {
        console.error('Failed to verify fingerprint:', response.status);
      }
    } catch (err) {
      console.error('Failed to verify fingerprint:', err);
    } finally {
      refreshInProgressRef.current = false;
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

  const checkWithdrawalEligibility = async (): Promise<boolean> => {
    const verification = await verifyFingerprint();

    if (verification.isSharedDevice) {
      toast.error(
        'Security check failed: This device is associated with another account. Please contact support.',
        { duration: 5000 }
      );
      return false;
    }

    if (!verification.isKnownDevice) {
      const confirmRegister = window.confirm(
        'This is a new device. For security, please register this device before withdrawing. Register now?'
      );

      if (confirmRegister) {
        const success = await registerFingerprint();
        if (success) {
          toast.success('Device registered! You can now proceed with withdrawal.');
          return true;
        } else {
          toast.error('Failed to register device. Please try again.');
          return false;
        }
      }

      toast.info('Please register this device before making withdrawals.', { duration: 5000 });
      return false;
    }

    return true;
  };

  const value = {
    fingerprintId,
    visitorId,
    isLoading,
    error,
    isDeviceKnown,
    isTrustedDevice,
    isSharedDevice,
    sharedWithUser,
    registerFingerprint,
    verifyFingerprint,
    refreshDeviceStatus,
    checkWithdrawalEligibility,
  };

  return (
    <FingerprintContext.Provider value={value}>
      {children}
    </FingerprintContext.Provider>
  );
}
