"use client";

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { MenuCard } from "@/components/MenuCard";
import { AdBanner } from "@/components/AdBanner";
import { mockMenus } from "@/data/menus";
import { useCity } from "@/hooks/useCity";

export default function Home() {
  const { selectedCity, selectedCityName, setSelectedCity, isLoaded } = useCity();

  // Don't render until localStorage is loaded to prevent hydration mismatch
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        selectedCity={selectedCity}
        selectedCityName={selectedCityName}
        onCityChange={setSelectedCity}
      />

      {/* Main Layout */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:w-60 lg:shrink-0">
            <div className="sticky top-[80px]">
              <Sidebar activeItem="home" />
            </div>
          </div>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            {/* Page Title with Date */}
            <div className="mb-8 text-center">
              <p className="mb-2 text-base text-gray-500">
                {new Date().toLocaleDateString("tr-TR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                Yemek KYK
              </h1>
              <p className="mt-1 text-sm text-green-600 font-medium">
                {selectedCityName}
              </p>
            </div>

            {/* Menu Cards */}
            <div className="flex flex-col gap-10">
              {mockMenus.map((menu) => (
                <MenuCard key={menu.id} menu={menu} />
              ))}
            </div>
          </main>

          {/* Right Sidebar */}
          <div className="hidden xl:block xl:w-60 xl:shrink-0">
            <div className="sticky top-[80px] space-y-6">
              <AdBanner position="right" />
              <AdBanner position="right" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Ad */}
      <div className="px-4 pb-8 lg:hidden">
        <AdBanner position="right" className="mx-auto max-w-sm" />
      </div>
    </div>
  );
}
