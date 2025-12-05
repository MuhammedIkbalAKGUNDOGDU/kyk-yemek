"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, Calendar, Upload, LogIn, User, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdBanner } from "./AdBanner";

interface SidebarProps {
  activeItem?: string;
}

const navItems = [
  { id: "home", label: "Ana Sayfa", icon: Home, href: "/" },
  { id: "monthly", label: "Aylık Menü", icon: Calendar, href: "/monthly" },
  { id: "faq", label: "Sıkça Sorulan Sorular", icon: HelpCircle, href: "/faq" },
  { id: "upload", label: "Menü Yükle", icon: Upload, href: "/upload" },
  { id: "login", label: "Giriş Yap", icon: LogIn, href: "/login" },
];

export function Sidebar({ activeItem }: SidebarProps) {
  const pathname = usePathname();

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
        href="/profile"
        className="rounded-xl bg-white p-3 shadow-sm block transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Profilim</h3>
            <p className="text-xs text-green-500">Bilgileri gör →</p>
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
        </ul>
      </nav>

      {/* Ad Banner */}
      <AdBanner position="left" />
    </aside>
  );
}
