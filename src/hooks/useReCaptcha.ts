'use client';

import { useCallback, useEffect, useState } from 'react';

// reCAPTCHA v3 site key
const RECAPTCHA_SITE_KEY = '6Lfj6WwsAAAAAOXQBYiarU84oMcXZ1DWHDP-K-FS';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface UseReCaptchaResult {
  executeRecaptcha: (action: string) => Promise<string | null>;
  isReady: boolean;
  error: string | null;
}

export function useReCaptcha(): UseReCaptchaResult {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if reCAPTCHA is already loaded
    if (typeof window !== 'undefined' && window.grecaptcha) {
      window.grecaptcha.ready(() => {
        setIsReady(true);
      });
      return;
    }

    // Wait for the script to load
    const checkReady = setInterval(() => {
      if (typeof window !== 'undefined' && window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsReady(true);
          clearInterval(checkReady);
        });
      }
    }, 100);

    // Cleanup after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkReady);
      if (!isReady) {
        setError('reCAPTCHA failed to load');
      }
    }, 10000);

    return () => {
      clearInterval(checkReady);
      clearTimeout(timeout);
    };
  }, [isReady]);

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      if (!isReady) {
        console.warn('reCAPTCHA not ready yet');
        return null;
      }

      try {
        const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
        return token;
      } catch (err) {
        console.error('reCAPTCHA execution error:', err);
        setError('Failed to execute reCAPTCHA');
        return null;
      }
    },
    [isReady]
  );

  return { executeRecaptcha, isReady, error };
}

export { RECAPTCHA_SITE_KEY };
