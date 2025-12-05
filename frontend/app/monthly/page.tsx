"use client";

import { useState, useEffect } from "react";
import { Calendar, Sun, Moon, MessageSquare, Upload, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { AdBanner } from "@/components/AdBanner";
import { CommentModal } from "@/components/CommentModal";
import { useCity } from "@/hooks/useCity";
import { getMonthlyMenus, DailyMenu, getCommentCount } from "@/lib/publicApi";
import Link from "next/link";

// UI için gün kartı tipi
interface DayCardData {
  date: number;
  dayName: string;
  breakfast: string[];
  dinner: string[];
  breakfastId: string | null;
  dinnerId: string | null;
}

interface DayCardProps {
  day: DayCardData;
  onOpenComments: (menuId: string, title: string) => void;
  breakfastCommentCount: number;
  dinnerCommentCount: number;
}

function DayCard({ day, onOpenComments, breakfastCommentCount, dinnerCommentCount, monthName, year }: DayCardProps & { monthName: string; year: number }) {
  const hasBreakfast = day.breakfast.length > 0;
  const hasDinner = day.dinner.length > 0;

  if (!hasBreakfast && !hasDinner) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      {/* Day Header - Full Date */}
      <div className="mb-4 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-xl font-bold text-white">
            {day.date}
          </span>
          <div>
            <p className="text-base font-bold text-gray-900">
              {day.date} {monthName} {year}
            </p>
            <p className="text-sm text-gray-500">
              {day.dayName}
            </p>
          </div>
        </div>
      </div>

      {/* Breakfast */}
      {hasBreakfast && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                Kahvaltı
              </span>
            </div>
            {day.breakfastId && (
              <button
                onClick={() => onOpenComments(day.breakfastId!, `${day.date} ${day.dayName} - Kahvaltı`)}
                className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors"
              >
                <MessageSquare className="h-3 w-3" />
                <span>{breakfastCommentCount}</span>
              </button>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {day.breakfast.join(", ")}
          </p>
        </div>
      )}

      {/* Dinner */}
      {hasDinner && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                Akşam
              </span>
            </div>
            {day.dinnerId && (
              <button
                onClick={() => onOpenComments(day.dinnerId!, `${day.date} ${day.dayName} - Akşam`)}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <MessageSquare className="h-3 w-3" />
                <span>{dinnerCommentCount}</span>
              </button>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {day.dinner.join(", ")}
          </p>
        </div>
      )}

      {/* Comment Buttons Row */}
      <div className="flex gap-2">
        {hasBreakfast && day.breakfastId && (
          <button
            onClick={() => onOpenComments(day.breakfastId!, `${day.date} ${day.dayName} - Kahvaltı`)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-amber-600"
          >
            <Sun className="h-3 w-3" />
            <span>Kahvaltı Yorumları</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold">
              {breakfastCommentCount}
            </span>
          </button>
        )}
        {hasDinner && day.dinnerId && (
          <button
            onClick={() => onOpenComments(day.dinnerId!, `${day.date} ${day.dayName} - Akşam`)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-600"
          >
            <Moon className="h-3 w-3" />
            <span>Akşam Yorumları</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold">
              {dinnerCommentCount}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function InlineAd() {
  return (
    <div className="col-span-1 md:col-span-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 flex items-center justify-center">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-500">Reklam Alanı</p>
        <p className="text-xs text-gray-400 mt-1">728 x 90 Banner</p>
      </div>
    </div>
  );
}

// Gün isimlerini al
function getDayName(year: number, month: number, day: number): string {
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('tr-TR', { weekday: 'long' });
}

// Aydaki gün sayısını al
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export default function MonthlyMenuPage() {
  const { selectedCity, selectedCityName, setSelectedCity, isLoaded } = useCity();
  
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  
  const [menuData, setMenuData] = useState<DailyMenu[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Comment modal state
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentMenuId, setCommentMenuId] = useState<string | null>(null);
  const [commentMenuTitle, setCommentMenuTitle] = useState("");
  
  // Comment counts
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const currentMonthName = `${monthNames[selectedMonth - 1]} ${selectedYear}`;

  // Şehir veya ay değiştiğinde menüleri çek
  useEffect(() => {
    if (!isLoaded || !selectedCity) return;

    const fetchMenus = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getMonthlyMenus(selectedCity, selectedYear, selectedMonth);
        setMenuData(data);
        
        // Yorum sayılarını çek
        const counts: Record<string, number> = {};
        for (const menu of data) {
          if (menu.breakfastId) {
            counts[menu.breakfastId] = await getCommentCount(menu.breakfastId);
          }
          if (menu.dinnerId) {
            counts[menu.dinnerId] = await getCommentCount(menu.dinnerId);
          }
        }
        setCommentCounts(counts);
      } catch (err) {
        console.error('Aylık menü çekme hatası:', err);
        setError('Menüler yüklenirken bir hata oluştu');
        setMenuData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenus();
  }, [selectedCity, selectedYear, selectedMonth, isLoaded]);

  // API verisini gün kartlarına dönüştür
  const dayCards: DayCardData[] = [];
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const menuForDay = menuData.find(m => {
      const menuDate = new Date(m.date);
      return menuDate.getDate() === day;
    });

    if (menuForDay) {
      dayCards.push({
        date: day,
        dayName: getDayName(selectedYear, selectedMonth, day),
        breakfast: menuForDay.breakfast?.items || [],
        dinner: menuForDay.dinner?.items || [],
        breakfastId: menuForDay.breakfastId,
        dinnerId: menuForDay.dinnerId,
      });
    }
  }

  const handleOpenComments = (menuId: string, title: string) => {
    setCommentMenuId(menuId);
    setCommentMenuTitle(title);
    setCommentModalOpen(true);
  };

  const handleCloseComments = () => {
    setCommentModalOpen(false);
    // Yorum sayısını güncelle
    if (commentMenuId) {
      getCommentCount(commentMenuId).then(count => {
        setCommentCounts(prev => ({ ...prev, [commentMenuId]: count }));
      });
    }
    setCommentMenuId(null);
  };

  // Insert ads every 6 days
  const renderDaysWithAds = () => {
    const elements: React.ReactNode[] = [];
    
    dayCards.forEach((day, index) => {
      elements.push(
        <DayCard
          key={day.date}
          day={day}
          onOpenComments={handleOpenComments}
          breakfastCommentCount={day.breakfastId ? (commentCounts[day.breakfastId] || 0) : 0}
          dinnerCommentCount={day.dinnerId ? (commentCounts[day.dinnerId] || 0) : 0}
          monthName={monthNames[selectedMonth - 1]}
          year={selectedYear}
        />
      );

      // Add ad after every 6 days
      if ((index + 1) % 6 === 0 && index < dayCards.length - 1) {
        elements.push(<InlineAd key={`ad-${index}`} />);
      }
    });

    return elements;
  };

  // Don't render until localStorage is loaded
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
              <Sidebar activeItem="monthly" />
            </div>
          </div>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            {/* Page Title */}
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                Aylık Menü
              </h1>
              <p className="mt-2 text-lg font-medium text-green-600">
                {currentMonthName}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {selectedCityName}
              </p>

              {/* Month/Year Selector */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-green-500 focus:outline-none"
                >
                  {monthNames.map((name, index) => (
                    <option key={index} value={index + 1}>{name}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-green-500 focus:outline-none"
                >
                  {[2024, 2025, 2026].map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
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
            {!isLoading && !error && dayCards.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 lg:p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📅</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {selectedCityName} - {currentMonthName} İçin Menü Bulunamadı
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Bu şehir için henüz {currentMonthName} ayının menüsü yüklenmemiş. 
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
                </div>
                <p className="mt-6 text-sm text-gray-400">
                  İletişim: <a href="mailto:iletisim@yemekkyk.com" className="text-green-600 hover:underline">iletisim@yemekkyk.com</a>
                </p>
              </div>
            )}

            {/* Monthly Menu Card */}
            {!isLoading && !error && dayCards.length > 0 && (
              <>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                  {/* Grid - 2 days per row */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {renderDaysWithAds()}
                  </div>
                </div>

                {/* Info Note */}
                <div className="mt-6 rounded-xl bg-amber-50 p-4 text-center">
                  <p className="text-sm text-amber-700">
                    📌 Menüler değişiklik gösterebilir. Güncel bilgi için yemekhanenizi kontrol ediniz.
                  </p>
                </div>
              </>
            )}
          </main>

          {/* Right Sidebar */}
          <div className="hidden xl:block xl:w-60 xl:shrink-0">
            <div className="sticky top-[80px] space-y-6">
              <AdBanner position="right" />
            </div>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={commentModalOpen}
        onClose={handleCloseComments}
        menuTitle={commentMenuTitle}
        menuId={commentMenuId}
      />
    </div>
  );
}
