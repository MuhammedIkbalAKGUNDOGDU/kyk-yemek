"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { cities } from "@/data/menus";

interface HeaderProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

export function Header({ selectedCity, onCityChange }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const quickCities = cities.slice(0, 3);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center gap-1.5">
          <div className="flex h-7 w-7 items-center justify-center">
            <X className="h-5 w-5 text-green-500" strokeWidth={3} />
          </div>
          <span className="text-base font-bold text-gray-900">Menü Platformu</span>
        </div>

        {/* City Navigation */}
        <nav className="flex items-center gap-1.5">
          {/* Quick City Links - Hidden on mobile */}
          <div className="hidden items-center gap-5 md:flex">
            {quickCities.map((city) => (
              <button
                key={city.id}
                onClick={() => onCityChange(city.id)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-green-600",
                  selectedCity === city.id ? "text-green-600" : "text-gray-600"
                )}
              >
                {city.name}
              </button>
            ))}
          </div>

          {/* City Dropdown */}
          <div className="relative ml-3">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 rounded-full bg-green-500 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-600"
            >
              Şehir Seçin
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isDropdownOpen && "rotate-180")} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 rounded-lg border border-gray-100 bg-white py-1.5 shadow-lg">
                {cities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      onCityChange(city.id);
                      setIsDropdownOpen(false);
                    }}
                    className={cn(
                      "block w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-gray-50",
                      selectedCity === city.id
                        ? "bg-green-50 font-medium text-green-600"
                        : "text-gray-700"
                    )}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}