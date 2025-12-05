"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Menu, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { cities } from "@/data/menus";
import { MobileSidebar } from "./MobileSidebar";

interface HeaderProps {
  selectedCity: string;
  selectedCityName: string;
  onCityChange: (city: string) => void;
}

// Hızlı erişim şehirleri: İstanbul, Ankara, İzmir, Eskişehir
const quickCityIds = ["istanbul", "ankara", "izmir", "eskisehir"];

export function Header({ selectedCity, selectedCityName, onCityChange }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Hızlı erişim şehirlerini filtrele
  const quickCities = cities.filter((city) => quickCityIds.includes(city.id));

  // Arama sonuçlarını filtrele
  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dropdown açılınca arama inputuna focus
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  }, [isDropdownOpen]);

  // Seçili öğeyi görünür yap
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("button");
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  // Klavye navigasyonu
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCities.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCities.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCities[highlightedIndex]) {
          onCityChange(filteredCities[highlightedIndex].id);
          setIsDropdownOpen(false);
        }
        break;
      case "Escape":
        setIsDropdownOpen(false);
        break;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
          {/* Sol - Menü Butonu & Logo */}
          <div className="flex items-center gap-3">
            {/* Mobil Menü Butonu */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-1.5">
              <div className="flex h-7 w-7 items-center justify-center">
                <X className="h-5 w-5 text-green-500" strokeWidth={3} />
              </div>
              <span className="text-base font-bold text-gray-900">Menü Platformu</span>
            </div>
          </div>

          {/* Şehir Navigasyonu */}
          <nav className="flex items-center gap-1.5">
            {/* Hızlı Şehir Linkleri - Mobilde gizli */}
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

            {/* Şehir Dropdown */}
            <div className="relative ml-3">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
              >
                <MapPin className="h-4 w-4" />
                <span>{selectedCityName}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isDropdownOpen && "rotate-180")} />
              </button>

              {isDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  {/* Dropdown */}
                  <div 
                    className="absolute right-0 top-full z-[51] mt-2 w-64 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden"
                    onKeyDown={handleKeyDown}
                  >
                    {/* Arama Input */}
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setHighlightedIndex(0);
                          }}
                          placeholder="Şehir ara..."
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
                        />
                      </div>
                    </div>

                    {/* Şehir Listesi */}
                    <div 
                      ref={listRef}
                      className="max-h-64 overflow-y-auto py-1"
                    >
                      {filteredCities.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-500 text-center">
                          Şehir bulunamadı
                        </p>
                      ) : (
                        filteredCities.map((city, index) => (
                          <button
                            key={city.id}
                            onClick={() => {
                              onCityChange(city.id);
                              setIsDropdownOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors",
                              selectedCity === city.id
                                ? "bg-green-50 font-medium text-green-600"
                                : highlightedIndex === index
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700 hover:bg-gray-50"
                            )}
                          >
                            {selectedCity === city.id && (
                              <span className="h-2 w-2 rounded-full bg-green-500" />
                            )}
                            {city.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Mobil Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
    </>
  );
}
