"use client";

import { useState } from "react";
import { Calendar, Sun, Moon, MessageSquare } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { AdBanner } from "@/components/AdBanner";
import { CommentModal } from "@/components/CommentModal";
import { monthlyMenu, currentMonth, type DailyMenu } from "@/data/monthlyMenu";
import { useCity } from "@/hooks/useCity";
import type { Comment } from "@/data/menus";

interface DayCardProps {
  day: DailyMenu;
  onOpenComments: (day: DailyMenu) => void;
  commentCounts: Record<number, number>;
}

function DayCard({ day, onOpenComments, commentCounts }: DayCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      {/* Day Header */}
      <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-lg font-bold text-white">
            {day.date}
          </span>
          <span className="text-sm font-medium text-gray-600">
            {day.day}
          </span>
        </div>
      </div>

      {/* Breakfast */}
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          <Sun className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            Kahvaltı
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {day.breakfast.join(", ")}
        </p>
      </div>

      {/* Dinner */}
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          <Moon className="h-4 w-4 text-indigo-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Akşam
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {day.dinner.join(", ")}
        </p>
      </div>

      {/* Comment Button */}
      <button
        onClick={() => onOpenComments(day)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Yorumlar</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
          {commentCounts[day.date] || 0}
        </span>
      </button>
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

export default function MonthlyMenuPage() {
  const { selectedCity, selectedCityName, setSelectedCity, isLoaded } = useCity();
  const [selectedDay, setSelectedDay] = useState<DailyMenu | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<number, Comment[]>>(
    () => {
      const map: Record<number, Comment[]> = {};
      monthlyMenu.forEach((day) => {
        map[day.date] = day.comments;
      });
      return map;
    }
  );

  const handleOpenComments = (day: DailyMenu) => {
    setSelectedDay(day);
  };

  const handleAddComment = (text: string) => {
    if (!selectedDay) return;

    const newComment: Comment = {
      id: `d${selectedDay.date}c${Date.now()}`,
      author: "Misafir",
      text,
      timestamp: new Date(),
    };

    setCommentsMap((prev) => ({
      ...prev,
      [selectedDay.date]: [...(prev[selectedDay.date] || []), newComment],
    }));
  };

  const commentCounts = Object.fromEntries(
    Object.entries(commentsMap).map(([date, comments]) => [date, comments.length])
  );

  // Insert ads every 6 days
  const renderDaysWithAds = () => {
    const elements: React.ReactNode[] = [];
    
    monthlyMenu.forEach((day, index) => {
      elements.push(
        <DayCard
          key={day.date}
          day={day}
          onOpenComments={handleOpenComments}
          commentCounts={commentCounts}
        />
      );

      // Add ad after every 6 days (after 6th, 12th, 18th, 24th, 30th)
      if ((index + 1) % 6 === 0 && index < monthlyMenu.length - 1) {
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
                {currentMonth}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {selectedCityName}
              </p>
            </div>

            {/* Monthly Menu Card */}
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
      {selectedDay && (
        <CommentModal
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          menuTitle={`${selectedDay.date} ${currentMonth.split(" ")[0]} - ${selectedDay.day}`}
          comments={commentsMap[selectedDay.date] || []}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
}
