"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  User, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Trash2,
  ChevronRight
} from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { AdBanner } from "@/components/AdBanner";
import { useCity } from "@/hooks/useCity";
import { cn } from "@/lib/utils";

// Mock user data
const mockUser = {
  id: "user1",
  nickname: "yemeksever34",
  email: "yemeksever34@email.com",
  city: "İstanbul",
  joinDate: new Date(2024, 8, 15),
  stats: {
    comments: 24,
    likes: 156,
    dislikes: 12,
  },
};

// Mock user comments
const mockUserComments = [
  {
    id: "c1",
    menuTitle: "Kahvaltı - 5 Aralık 2024",
    text: "Bugünkü kahvaltı gerçekten güzeldi, peynir taze gelmiş.",
    timestamp: new Date(2024, 11, 5, 8, 30),
    likes: 12,
    menuId: "breakfast-dec5",
  },
  {
    id: "c2",
    menuTitle: "Akşam Yemeği - 4 Aralık 2024",
    text: "Mercimek çorbası biraz tuzlu olmuş ama yenilebilir seviyede.",
    timestamp: new Date(2024, 11, 4, 19, 15),
    likes: 8,
    menuId: "dinner-dec4",
  },
  {
    id: "c3",
    menuTitle: "Akşam Yemeği - 3 Aralık 2024",
    text: "Tavuk sote muhteşemdi, şefe teşekkürler! 👨‍🍳",
    timestamp: new Date(2024, 11, 3, 18, 45),
    likes: 23,
    menuId: "dinner-dec3",
  },
  {
    id: "c4",
    menuTitle: "Kahvaltı - 2 Aralık 2024",
    text: "Yumurtalar bugün güzel pişmişti.",
    timestamp: new Date(2024, 11, 2, 9, 0),
    likes: 5,
    menuId: "breakfast-dec2",
  },
  {
    id: "c5",
    menuTitle: "Akşam Yemeği - 1 Aralık 2024",
    text: "Pilav biraz sert kalmış, bir sonrakine dikkat edilmeli.",
    timestamp: new Date(2024, 11, 1, 20, 30),
    likes: 15,
    menuId: "dinner-dec1",
  },
];

function formatDate(date: Date) {
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return formatDate(date);
}

export default function ProfilePage() {
  const { selectedCity, selectedCityName, setSelectedCity, isLoaded } = useCity();
  const [activeTab, setActiveTab] = useState<"comments" | "settings">("comments");

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
              <Sidebar />
            </div>
          </div>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            {/* Profile Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar */}
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-3xl font-bold text-white shadow-lg">
                  {mockUser.nickname.charAt(0).toUpperCase()}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {mockUser.nickname}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {mockUser.city}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {formatDate(mockUser.joinDate)} tarihinden beri üye
                    </span>
                  </div>
                </div>

                {/* Edit Button */}
                <Link
                  href="/profile/edit"
                  className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <Settings className="h-4 w-4" />
                  Düzenle
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-gray-50 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    {mockUser.stats.comments}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Yorum</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
                    <ThumbsUp className="h-5 w-5 text-green-500" />
                    {mockUser.stats.likes}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Beğeni</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
                    <ThumbsDown className="h-5 w-5 text-red-400" />
                    {mockUser.stats.dislikes}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Beğenmeme</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab("comments")}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                  activeTab === "comments"
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                )}
              >
                <MessageSquare className="h-4 w-4" />
                Yorumlarım ({mockUserComments.length})
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                  activeTab === "settings"
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                )}
              >
                <Settings className="h-4 w-4" />
                Ayarlar
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "comments" && (
              <div className="space-y-4">
                {mockUserComments.length === 0 ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Henüz yorum yapmadınız
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Menülere yorum yaparak topluluğa katkıda bulunun!
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-600"
                    >
                      Menülere Göz At
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  mockUserComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-green-600">
                              {comment.menuTitle}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">
                              {timeAgo(comment.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {comment.text}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="flex items-center gap-1.5 text-sm text-gray-500">
                              <ThumbsUp className="h-4 w-4 text-green-500" />
                              {comment.likes} beğeni
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Hesap Ayarları</h2>
                
                <div className="space-y-4">
                  {/* Profile Settings */}
                  <Link
                    href="/profile/edit"
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Profil Bilgileri</h3>
                        <p className="text-sm text-gray-500">Kullanıcı adı, e-posta ve şehir</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>

                  {/* Change Password */}
                  <Link
                    href="/profile/password"
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Settings className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Şifre Değiştir</h3>
                        <p className="text-sm text-gray-500">Hesap güvenliğinizi artırın</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      // Handle logout
                      alert("Çıkış yapılıyor...");
                    }}
                    className="flex items-center justify-between w-full p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                        <LogOut className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-red-700">Çıkış Yap</h3>
                        <p className="text-sm text-red-500">Hesabınızdan güvenli çıkış yapın</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-red-400" />
                  </button>
                </div>
              </div>
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
    </div>
  );
}

