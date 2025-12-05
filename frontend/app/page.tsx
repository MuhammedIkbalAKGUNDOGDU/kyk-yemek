"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { MenuCard } from "@/components/MenuCard";
import { AdBanner } from "@/components/AdBanner";
import { useCity } from "@/hooks/useCity";
import { getTodayMenus, PublicMenu } from "@/lib/publicApi";
import { Upload, AlertCircle, Coffee, Moon } from "lucide-react";
import Link from "next/link";

// PublicMenu'yu MenuCard formatına çevir
function convertToMenuCardFormat(menu: PublicMenu) {
  return {
    id: menu.id,
    title: menu.mealType === 'breakfast' ? 'Kahvaltı' : 'Akşam Yemeği',
    type: menu.mealType as 'breakfast' | 'dinner',
    items: menu.items.map((name, index) => ({
      id: `${menu.id}-${index}`,
      name,
      description: '',
      calories: 0, // Bireysel kalori yok
      likes: 0,
      dislikes: 0,
    })),
    totalCalories: menu.totalCalories,
    comments: [],
  };
}

export default function Home() {
  const { selectedCity, selectedCityName, setSelectedCity, isLoaded } = useCity();
  const [menus, setMenus] = useState<PublicMenu[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Şehir değiştiğinde menüleri çek
  useEffect(() => {
    if (!isLoaded || !selectedCity) return;

    const fetchMenus = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTodayMenus(selectedCity);
        setMenus(data);
      } catch (err) {
        console.error('Menü çekme hatası:', err);
        setError('Menüler yüklenirken bir hata oluştu');
        setMenus([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenus();
  }, [selectedCity, isLoaded]);

  // Don't render until localStorage is loaded to prevent hydration mismatch
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  // Kahvaltı ve akşam yemeğini ayır
  const breakfastMenu = menus.find(m => m.mealType === 'breakfast');
  const dinnerMenu = menus.find(m => m.mealType === 'dinner');

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

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent mb-4" />
                <p className="text-gray-500">Menüler yükleniyor...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bir Hata Oluştu</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                >
                  Tekrar Dene
                </button>
              </div>
            )}

            {/* No Menu State */}
            {!isLoading && !error && menus.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 lg:p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🍽️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {selectedCityName} İçin Menü Bulunamadı
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Bu şehir için henüz bugünün menüsü yüklenmemiş. 
                  Elinizde menü varsa yükleyerek diğer öğrencilere yardımcı olabilirsiniz!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/upload"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Menü Yükle
                  </Link>
                  <Link
                    href="/monthly"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Aylık Menüye Bak
                  </Link>
                </div>
                <p className="mt-6 text-sm text-gray-400">
                  İletişim: <a href="mailto:iletisim@yemekkyk.com" className="text-green-600 hover:underline">iletisim@yemekkyk.com</a>
                </p>
              </div>
            )}

            {/* Menu Cards */}
            {!isLoading && !error && menus.length > 0 && (
              <div className="flex flex-col gap-10">
                {/* Kahvaltı */}
                {breakfastMenu && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Coffee className="w-5 h-5 text-amber-600" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">Kahvaltı</h2>
                    </div>
                    <MenuCard menu={convertToMenuCardFormat(breakfastMenu)} />
                  </div>
                )}

                {/* Akşam Yemeği */}
                {dinnerMenu && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <Moon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">Akşam Yemeği</h2>
                    </div>
                    <MenuCard menu={convertToMenuCardFormat(dinnerMenu)} />
                  </div>
                )}
              </div>
            )}
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
