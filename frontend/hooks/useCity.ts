"use client";

import { useState, useEffect } from "react";
import { cities } from "@/data/menus";

const STORAGE_KEY = "selectedCity";
const DEFAULT_CITY = "istanbul";

export function useCity() {
  const [selectedCity, setSelectedCity] = useState<string>(DEFAULT_CITY);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && cities.some((c) => c.id === stored)) {
      setSelectedCity(stored);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when city changes
  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    localStorage.setItem(STORAGE_KEY, cityId);
  };

  const selectedCityName = cities.find((c) => c.id === selectedCity)?.name || "Istanbul";

  return {
    selectedCity,
    selectedCityName,
    setSelectedCity: handleCityChange,
    isLoaded,
  };
}

