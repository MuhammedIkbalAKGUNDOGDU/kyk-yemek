"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, HelpCircle, Calendar, Upload, LogIn, LogOut, User, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasToken, authAPI, User as UserType } from "@/lib/api";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
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

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const user = useUser();
  const isLoggedIn = !!user;
  const userName = user?.fullName || null;

  const handleLogout = async () => {
    await authAPI.logout();
    onClose();
    window.location.href = "/";
  };

  const getActiveItem = () => {
    if (pathname === "/faq") return "faq";
    if (pathname === "/monthly") return "monthly";
    if (pathname === "/upload") return "upload";
    if (pathname === "/login") return "login";
    if (pathname?.startsWith("/profile")) return "profile";
    if (pathname === "/") return "home";
    return "home";
  };

  const currentActive = getActiveItem();

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <Link 
            href={isLoggedIn ? "/profile" : "/login"}
            onClick={onClose}
            className="flex items-center gap-2"
          >
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
          </Link>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentActive === item.id;

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all",
                      isActive
                        ? "bg-green-50 text-green-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "text-green-600" : "text-gray-400")} />
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
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="h-5 w-5 text-red-400" />
                  Çıkış Yap
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all",
                    currentActive === "login"
                      ? "bg-green-50 text-green-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <LogIn className={cn("h-5 w-5", currentActive === "login" ? "text-green-600" : "text-gray-400")} />
                  Giriş Yap
                </Link>
              )}
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 p-4">
          <p className="text-center text-xs text-gray-400">
            © 2024 Yemek KYK
          </p>
        </div>
      </div>
    </>
  );
}
