"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, Calendar, Upload, LogIn, LogOut, User, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdBanner } from "./AdBanner";
import { hasToken, authAPI, User as UserType } from "@/lib/api";

interface SidebarProps {
  activeItem?: string;
}

const navItems = [
  { id: "home", label: "Ana Sayfa", icon: Home, href: "/" },
  { id: "monthly", label: "Aylık Menü", icon: Calendar, href: "/monthly" },
  { id: "faq", label: "Sıkça Sorulan Sorular", icon: HelpCircle, href: "/faq" },
  { id: "upload", label: "Menü Yükle", icon: Upload, href: "/upload" },
];

// localStorage'ı izleyen hook
let cachedUser: UserType | null = null;
let cachedUserStr: string | null = null;

function useUser() {
  const getSnapshot = (): UserType | null => {
    if (typeof window === "undefined") return null;
    if (!hasToken()) {
      cachedUser = null;
      cachedUserStr = null;
      return null;
    }
    const userStr = localStorage.getItem("user");
    if (userStr !== cachedUserStr) {
      cachedUserStr = userStr;
      cachedUser = userStr ? JSON.parse(userStr) : null;
    }
    return cachedUser;
  };
  const getServerSnapshot = (): UserType | null => null;
  const subscribe = (callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  };
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function Sidebar({ activeItem }: SidebarProps) {
  const pathname = usePathname();
  const user = useUser();
  const isLoggedIn = !!user;
  const userName = user?.fullName || null;

  const handleLogout = async () => {
    await authAPI.logout();
    window.location.href = "/";
  };

  const getActiveItem = () => {
    if (activeItem) return activeItem;
    if (pathname === "/faq") return "faq";
    if (pathname === "/monthly") return "monthly";
    if (pathname === "/upload") return "upload";
    if (pathname === "/login") return "login";
    if (pathname?.startsWith("/profile")) return "profile";
    if (pathname === "/") return "home";
    return "home";
  };

  const currentActive = getActiveItem();

  return (
    <aside className="flex w-full flex-col gap-4 lg:w-56">
      {/* Profile Section - Tıklanınca profil sayfasına git */}
      <Link 
        href={isLoggedIn ? "/profile" : "/login"}
        className="rounded-xl bg-white p-3 shadow-sm block transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {isLoggedIn && userName ? userName : "Misafir"}
            </h3>
            <p className="text-xs text-green-500">
              {isLoggedIn ? "Profili gör →" : "Giriş yap →"}
            </p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="rounded-xl bg-white p-1.5 shadow-sm">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentActive === item.id;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all",
                    isActive
                      ? "bg-green-50 text-green-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-green-600" : "text-gray-400")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
          
          {/* Giriş Yap / Çıkış Yap */}
          <li>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="h-4 w-4 text-red-400" />
                Çıkış Yap
              </button>
            ) : (
              <Link
                href="/login"
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all",
                  currentActive === "login"
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <LogIn className={cn("h-4 w-4", currentActive === "login" ? "text-green-600" : "text-gray-400")} />
                Giriş Yap
              </Link>
            )}
          </li>
        </ul>
      </nav>

      {/* Ad Banner */}
      <AdBanner position="left" />
    </aside>
  );
}
