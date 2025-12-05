"use client";

import { useState, useEffect } from "react";
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
  ChevronRight,
  X,
  Check,
  Mail,
  UserCircle
} from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { AdBanner } from "@/components/AdBanner";
import { useCity } from "@/hooks/useCity";
import { cities } from "@/data/menus";
import { cn } from "@/lib/utils";

// Seçilebilir avatarlar
const avatarOptions = [
  { id: "avatar1", emoji: "😊", bg: "from-yellow-400 to-orange-500" },
  { id: "avatar2", emoji: "🍕", bg: "from-red-400 to-pink-500" },
  { id: "avatar3", emoji: "🍔", bg: "from-amber-400 to-orange-500" },
  { id: "avatar4", emoji: "🍜", bg: "from-green-400 to-emerald-500" },
  { id: "avatar5", emoji: "🍣", bg: "from-pink-400 to-rose-500" },
  { id: "avatar6", emoji: "🥗", bg: "from-lime-400 to-green-500" },
  { id: "avatar7", emoji: "🍰", bg: "from-purple-400 to-violet-500" },
  { id: "avatar8", emoji: "☕", bg: "from-amber-600 to-yellow-700" },
  { id: "avatar9", emoji: "🧑‍🍳", bg: "from-blue-400 to-cyan-500" },
  { id: "avatar10", emoji: "🎓", bg: "from-indigo-400 to-purple-500" },
  { id: "avatar11", emoji: "🏠", bg: "from-teal-400 to-emerald-500" },
  { id: "avatar12", emoji: "⭐", bg: "from-yellow-400 to-amber-500" },
];

// Mock user data
const initialMockUser = {
  id: "user1",
  fullName: "Ahmet Yılmaz",
  nickname: "yemeksever34",
  email: "yemeksever34@email.com",
  city: "istanbul",
  cityName: "İstanbul",
  avatarId: "avatar4",
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
    menuTitle: "Kahvaltı",
    date: "5 Aralık 2024",
    city: "İstanbul",
    text: "Bugünkü kahvaltı gerçekten güzeldi, peynir taze gelmiş.",
    timestamp: new Date(2024, 11, 5, 8, 30),
    likes: 12,
    menuId: "breakfast-dec5",
  },
  {
    id: "c2",
    menuTitle: "Akşam Yemeği",
    date: "4 Aralık 2024",
    city: "İstanbul",
    text: "Mercimek çorbası biraz tuzlu olmuş ama yenilebilir seviyede.",
    timestamp: new Date(2024, 11, 4, 19, 15),
    likes: 8,
    menuId: "dinner-dec4",
  },
  {
    id: "c3",
    menuTitle: "Akşam Yemeği",
    date: "3 Aralık 2024",
    city: "İstanbul",
    text: "Tavuk sote muhteşemdi, şefe teşekkürler! 👨‍🍳",
    timestamp: new Date(2024, 11, 3, 18, 45),
    likes: 23,
    menuId: "dinner-dec3",
  },
  {
    id: "c4",
    menuTitle: "Kahvaltı",
    date: "2 Aralık 2024",
    city: "Ankara",
    text: "Yumurtalar bugün güzel pişmişti.",
    timestamp: new Date(2024, 11, 2, 9, 0),
    likes: 5,
    menuId: "breakfast-dec2",
  },
  {
    id: "c5",
    menuTitle: "Akşam Yemeği",
    date: "1 Aralık 2024",
    city: "İstanbul",
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

// Profile Edit Modal Component
function ProfileEditModal({
  isOpen,
  onClose,
  user,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: typeof initialMockUser;
  onSave: (data: { fullName: string; nickname: string; email: string; city: string; avatarId: string }) => void;
}) {
  const [fullName, setFullName] = useState(user.fullName);
  const [nickname, setNickname] = useState(user.nickname);
  const [email, setEmail] = useState(user.email);
  const [city, setCity] = useState(user.city);
  const [avatarId, setAvatarId] = useState(user.avatarId);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFullName(user.fullName);
      setNickname(user.nickname);
      setEmail(user.email);
      setCity(user.city);
      setAvatarId(user.avatarId);
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSave({ fullName, nickname, email, city, avatarId });
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  const selectedAvatar = avatarOptions.find((a) => a.id === avatarId) || avatarOptions[0];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4">
        <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Profili Düzenle</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Profil Resmi Seçin
              </label>
              
              {/* Current Avatar */}
              <div className="flex justify-center mb-4">
                <div className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br text-4xl shadow-lg ring-4 ring-green-200",
                  selectedAvatar.bg
                )}>
                  {selectedAvatar.emoji}
                </div>
              </div>

              {/* Avatar Grid */}
              <div className="grid grid-cols-6 gap-3">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setAvatarId(avatar.id)}
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-2xl transition-all hover:scale-110",
                      avatar.bg,
                      avatarId === avatar.id 
                        ? "ring-3 ring-green-500 ring-offset-2" 
                        : "hover:ring-2 hover:ring-gray-300"
                    )}
                  >
                    {avatar.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad
              </label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:bg-white focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                  placeholder="Ahmet Yılmaz"
                />
              </div>
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:bg-white focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                  placeholder="Kullanıcı adınız"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">Yorumlarda bu isim görünecektir</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:bg-white focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şehir
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3 text-sm text-gray-900 transition-all focus:bg-white focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 appearance-none cursor-pointer"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-sm font-medium text-white hover:bg-green-600 transition-colors disabled:bg-gray-300"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProfilePage() {
  const { selectedCity, selectedCityName, setSelectedCity, isLoaded } = useCity();
  const [activeTab, setActiveTab] = useState<"comments" | "settings">("comments");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mockUser, setMockUser] = useState(initialMockUser);

  const handleSaveProfile = (data: { fullName: string; nickname: string; email: string; city: string; avatarId: string }) => {
    const cityObj = cities.find((c) => c.id === data.city);
    setMockUser({
      ...mockUser,
      fullName: data.fullName,
      nickname: data.nickname,
      email: data.email,
      city: data.city,
      cityName: cityObj?.name || data.city,
      avatarId: data.avatarId,
    });
  };

  const currentAvatar = avatarOptions.find((a) => a.id === mockUser.avatarId) || avatarOptions[0];

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
                <div className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br text-4xl shadow-lg",
                  currentAvatar.bg
                )}>
                  {currentAvatar.emoji}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {mockUser.fullName}
                  </h1>
                  <p className="text-sm text-green-600 font-medium mb-2">@{mockUser.nickname}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {mockUser.cityName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {formatDate(mockUser.joinDate)} tarihinden beri üye
                    </span>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <Settings className="h-4 w-4" />
                  Düzenle
                </button>
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
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-green-600">
                              {comment.menuTitle}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs font-medium text-gray-600">
                              {comment.date}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                              <MapPin className="h-3 w-3" />
                              {comment.city}
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
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center justify-between w-full p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
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
                  </button>

                  {/* Change Password */}
                  <button
                    onClick={() => alert("Şifre değiştirme yakında eklenecek!")}
                    className="flex items-center justify-between w-full p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
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
                  </button>

                  {/* Logout */}
                  <button
                    onClick={() => {
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

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={mockUser}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
