"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  X,
  Check,
  Mail,
  UserCircle,
  Lock,
  AlertCircle,
  Utensils
} from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { AdBanner } from "@/components/AdBanner";
import { useCity } from "@/hooks/useCity";
import { cities } from "@/data/menus";
import { cn } from "@/lib/utils";
import { authAPI, hasToken, removeToken, User as UserType, UserComment, UserVote } from "@/lib/api";

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

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Profile Edit Modal Component
function ProfileEditModal({
  onClose,
  user,
  onSave,
  isSaving,
  error,
}: {
  onClose: () => void;
  user: UserType;
  onSave: (data: { fullName: string; nickname: string; cityId: string; avatarId: string }) => void;
  isSaving: boolean;
  error: string | null;
}) {
  const [fullName, setFullName] = useState(user.fullName);
  const [nickname, setNickname] = useState(user.nickname);
  const [cityId, setCityId] = useState(user.cityId);
  const [avatarId, setAvatarId] = useState(user.avatarId || "avatar1");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const handleSave = () => {
    onSave({ fullName, nickname, cityId, avatarId });
  };

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
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

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

            {/* Email - Sadece okunabilir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 pl-12 pr-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">E-posta adresi değiştirilemez</p>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şehir
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
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

// Password Change Modal
function PasswordChangeModal({
  onClose,
  onSave,
  isSaving,
  error,
  success,
}: {
  onClose: () => void;
  onSave: (data: { currentPassword: string; newPassword: string }) => void;
  isSaving: boolean;
  error: string | null;
  success: boolean;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const handleSave = () => {
    if (newPassword.length < 6) {
      setLocalError("Yeni şifre en az 6 karakter olmalı");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError("Şifreler eşleşmiyor");
      return;
    }
    setLocalError(null);
    onSave({ currentPassword, newPassword });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4">
        <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Şifre Değiştir</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {(error || localError) && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error || localError}
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-600">
                <Check className="h-4 w-4 shrink-0" />
                Şifre başarıyla değiştirildi!
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mevcut Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3 text-sm text-gray-900 transition-all focus:bg-white focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3 text-sm text-gray-900 transition-all focus:bg-white focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Şifre (Tekrar)
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3 text-sm text-gray-900 transition-all focus:bg-white focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-sm font-medium text-white hover:bg-green-600 transition-colors disabled:bg-gray-300"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Değiştiriliyor...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Şifreyi Değiştir
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Login Required Component
function LoginRequired() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
              <User className="h-10 w-10 text-gray-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Giriş Yapmalısınız
          </h1>
          <p className="text-gray-500 mb-6">
            Profil sayfasını görüntülemek için lütfen giriş yapın veya kayıt olun.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-600"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 rounded-full bg-white border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Kayıt Ol
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { selectedCity, selectedCityName, setSelectedCity, isLoaded } = useCity();
  const [activeTab, setActiveTab] = useState<"comments" | "likes" | "dislikes" | "settings">("comments");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // User state
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // User activity data
  const [comments, setComments] = useState<UserComment[]>([]);
  const [likes, setLikes] = useState<UserVote[]>([]);
  const [dislikes, setDislikes] = useState<UserVote[]>([]);
  const [stats, setStats] = useState({ commentCount: 0, likeCount: 0, dislikeCount: 0 });
  
  // Modal states
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!hasToken()) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        // Fetch user info
        const userResponse = await authAPI.getMe();
        setUser(userResponse.user);
        setIsAuthenticated(true);

        // Fetch stats, comments, and votes in parallel
        const [statsResponse, commentsResponse, votesResponse] = await Promise.all([
          authAPI.getMyStats(),
          authAPI.getMyComments(),
          authAPI.getMyVotes(),
        ]);

        setStats(statsResponse);
        setComments(commentsResponse.comments);
        setLikes(votesResponse.likes);
        setDislikes(votesResponse.dislikes);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        removeToken();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveProfile = async (data: { fullName: string; nickname: string; cityId: string; avatarId: string }) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.user);
      setIsEditModalOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    setIsSaving(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      await authAPI.changePassword(data);
      setPasswordSuccess(true);
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess(false);
      }, 1500);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
    }
    router.push("/login");
  };

  // Loading state
  if (isLoading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <LoginRequired />;
  }

  const currentAvatar = avatarOptions.find((a) => a.id === user.avatarId) || avatarOptions[0];
  const cityName = cities.find((c) => c.id === user.cityId)?.name || user.cityId;

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
                    {user.fullName}
                  </h1>
                  <p className="text-sm text-green-600 font-medium mb-2">@{user.nickname}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {cityName}
                    </span>
                    {user.createdAt && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(user.createdAt)} tarihinden beri üye
                      </span>
                    )}
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
                <button
                  onClick={() => setActiveTab("comments")}
                  className={cn(
                    "rounded-xl p-4 text-center transition-colors",
                    activeTab === "comments" ? "bg-green-50 ring-2 ring-green-500" : "bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    {stats.commentCount}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Yorum</p>
                </button>
                <button
                  onClick={() => setActiveTab("likes")}
                  className={cn(
                    "rounded-xl p-4 text-center transition-colors",
                    activeTab === "likes" ? "bg-green-50 ring-2 ring-green-500" : "bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
                    <ThumbsUp className="h-5 w-5 text-green-500" />
                    {stats.likeCount}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Beğeni</p>
                </button>
                <button
                  onClick={() => setActiveTab("dislikes")}
                  className={cn(
                    "rounded-xl p-4 text-center transition-colors",
                    activeTab === "dislikes" ? "bg-red-50 ring-2 ring-red-400" : "bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
                    <ThumbsDown className="h-5 w-5 text-red-400" />
                    {stats.dislikeCount}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Beğenmeme</p>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
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
                Yorumlarım
              </button>
              <button
                onClick={() => setActiveTab("likes")}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                  activeTab === "likes"
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                )}
              >
                <ThumbsUp className="h-4 w-4" />
                Beğendiklerim
              </button>
              <button
                onClick={() => setActiveTab("dislikes")}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                  activeTab === "dislikes"
                    ? "bg-red-400 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                )}
              >
                <ThumbsDown className="h-4 w-4" />
                Beğenmediklerim
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
                {comments.length === 0 ? (
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
                  comments.map((comment) => {
                    const cityName = cities.find((c) => c.id === comment.cityId)?.name || comment.cityId;
                    const mealTypeText = comment.mealType === "breakfast" ? "Kahvaltı" : "Akşam Yemeği";
                    const commentDate = new Date(comment.createdAt);
                    const menuDate = new Date(comment.menuDate + "T00:00:00");
                    
                    return (
                      <div
                        key={comment.id}
                        className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                              <span className="font-medium text-gray-700">{mealTypeText}</span>
                              <span>•</span>
                              <span>{menuDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {cityName}
                              </span>
                            </div>
                            <p className="text-gray-900">{comment.text}</p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {commentDate.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === "likes" && (
              <div className="space-y-4">
                {likes.length === 0 ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                    <ThumbsUp className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Henüz yemek beğenmediniz
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Sevdiğiniz yemekleri beğenerek görüşlerinizi paylaşın!
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
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
                    <div className="grid gap-3">
                      {likes.map((vote) => (
                        <div
                          key={vote.foodId}
                          className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                              <Utensils className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="font-medium text-gray-900">{vote.foodName}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-green-600">
                              <ThumbsUp className="h-4 w-4" />
                              {vote.totalLikes}
                            </span>
                            <span className="flex items-center gap-1 text-gray-400">
                              <ThumbsDown className="h-4 w-4" />
                              {vote.totalDislikes}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "dislikes" && (
              <div className="space-y-4">
                {dislikes.length === 0 ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                    <ThumbsDown className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Beğenmediğiniz yemek yok
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Sevmediğiniz yemekleri işaretleyerek görüşlerinizi paylaşın!
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
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
                    <div className="grid gap-3">
                      {dislikes.map((vote) => (
                        <div
                          key={vote.foodId}
                          className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                              <Utensils className="h-5 w-5 text-red-500" />
                            </div>
                            <span className="font-medium text-gray-900">{vote.foodName}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-gray-400">
                              <ThumbsUp className="h-4 w-4" />
                              {vote.totalLikes}
                            </span>
                            <span className="flex items-center gap-1 text-red-500">
                              <ThumbsDown className="h-4 w-4" />
                              {vote.totalDislikes}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="flex items-center justify-between w-full p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Lock className="h-5 w-5 text-blue-600" />
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
                    onClick={handleLogout}
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
      {isEditModalOpen && (
        <ProfileEditModal
          onClose={() => {
            setIsEditModalOpen(false);
            setSaveError(null);
          }}
          user={user}
          onSave={handleSaveProfile}
          isSaving={isSaving}
          error={saveError}
        />
      )}

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <PasswordChangeModal
          onClose={() => {
            setIsPasswordModalOpen(false);
            setPasswordError(null);
            setPasswordSuccess(false);
          }}
          onSave={handleChangePassword}
          isSaving={isSaving}
          error={passwordError}
          success={passwordSuccess}
        />
      )}
    </div>
  );
}
