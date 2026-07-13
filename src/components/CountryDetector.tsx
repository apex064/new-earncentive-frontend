"use client";

import { useEffect } from "react";

import { API_BASE_URL } from "@/lib/config";

/**
 * Detects country from IP using ipapi.co
 * Returns { country, countryCode } or null on failure.
 */
const detectCountryByIP = async (): Promise<{
  country: string;
  countryCode: string;
} | null> => {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (response.ok) {
      const data = await response.json();
      if (data.country_name && data.country_code) {
        return {
          country: data.country_name,
          countryCode: data.country_code,
        };
      }
    }
  } catch (error) {
    console.error("Error detecting country by IP:", error);
  }
  return null;
};

/**
 * Saves the country to the backend profile.
 * Only called when the user's country field is empty (first-time set).
 * Returns true if saved successfully.
 */
const saveCountryToBackend = async (country: string): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found for saving country");
    return false;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/profile/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ country }),
    });

    if (res.ok) {
      console.log("Country saved to backend:", country);
      return true;
    } else {
      const errorData = await res.json();
      console.error("Failed to save country to backend:", errorData);
      return false;
    }
  } catch (err) {
    console.error("Error saving country to backend:", err);
    return false;
  }
};

/**
 * Background component that sets the user's country once when it's empty.
 *
 * ONLY sets the country if the backend has no country stored yet (first-time).
 * This prevents false "country change" detections that were caused by different
 * geolocation APIs returning slightly different country names.
 *
 * Runs once per session (via sessionStorage) to avoid redundant API calls.
 */
export default function CountryDetector() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // Check if we already attempted country detection this session
    const countryDetected = sessionStorage.getItem("country_detected");
    if (countryDetected) return;

    const detectAndSaveCountry = async () => {
      try {
        // First, check if country is already set on the backend
        const profileRes = await fetch(`${API_BASE_URL}/profile/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!profileRes.ok) return;

        const profileData = await profileRes.json();

        // Only set country if it's empty/none (first time)
        if (profileData.country && profileData.country.trim()) {
          // Country already set — no need to override
          sessionStorage.setItem("country_detected", "true");
          return;
        }

        // Country is empty — detect and set it
        const countryData = await detectCountryByIP();
        if (countryData) {
          const saved = await saveCountryToBackend(countryData.country);
          if (saved) {
            sessionStorage.setItem("country_detected", "true");
            console.log("Country initially saved to backend");
          }
        }
      } catch (error) {
        console.error("CountryDetector error:", error);
      }
    };

    detectAndSaveCountry();
  }, []);

  return null;
}
