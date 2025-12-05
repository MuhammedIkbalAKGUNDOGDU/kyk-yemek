"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Upload,
  Salad,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminAuthAPI, hasAdminToken, getStoredAdmin } from "@/lib/adminApi";

interface AdminUser {
  id: string;
  email: string;
  name: string;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { id: "menus", label: "Menüler", icon: UtensilsCrossed, href: "/admin/menus" },
  { id: "upload", label: "Menü Yükle", icon: Upload, href: "/admin/upload" },
  { id: "foods", label: "Yemekler", icon: Salad, href: "/admin/foods" },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!hasAdminToken()) {
        router.push("/admin/login");
        return;
      }

      const storedAdmin = getStoredAdmin();
      if (storedAdmin) {
        setAdmin(storedAdmin);
        setIsLoading(false);
        return;
      }

      try {
        const response = await adminAuthAPI.getMe();
        setAdmin(response.admin);
      } catch {
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await adminAuthAPI.logout();
    router.push("/admin/login");
  };

  const getActiveItem = () => {
    if (pathname === "/admin") return "dashboard";
    if (pathname?.startsWith("/admin/menus")) return "menus";
    if (pathname?.startsWith("/admin/upload")) return "upload";
    if (pathname?.startsWith("/admin/foods")) return "foods";
    return "dashboard";
  };

  const currentActive = getActiveItem();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-700 bg-slate-800/90 backdrop-blur px-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-500" />
          <span className="font-semibold text-white">Admin Panel</span>
        </div>
        <div className="w-10" />
      </header>

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-72 bg-slate-800 border-r border-slate-700 transition-transform duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Yemek KYK</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Admin Info */}
        {admin && (
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-emerald-400 font-bold">
                {admin.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{admin.name}</p>
                <p className="text-xs text-slate-400 truncate">{admin.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentActive === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-emerald-400" : "text-slate-500")} />
                {item.label}
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-5 w-5" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

