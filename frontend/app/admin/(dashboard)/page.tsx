"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Salad,
  FileCheck,
  FileClock,
  TrendingUp,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { menuAPI, foodAPI } from "@/lib/adminApi";

interface Stats {
  totalMenus: number;
  publishedMenus: number;
  draftMenus: number;
  totalFoods: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalMenus: 0,
    publishedMenus: 0,
    draftMenus: 0,
    totalFoods: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Menü istatistikleri
        const allMenus = await menuAPI.getAll({ limit: 1 });
        const publishedMenus = await menuAPI.getAll({ status: "published", limit: 1 });
        const draftMenus = await menuAPI.getAll({ status: "draft", limit: 1 });

        // Yemek sayısı
        const foods = await foodAPI.getAll({ limit: 1 });

        setStats({
          totalMenus: allMenus.pagination.total,
          publishedMenus: publishedMenus.pagination.total,
          draftMenus: draftMenus.pagination.total,
          totalFoods: foods.pagination.total,
        });
      } catch (error) {
        console.error("Stats fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Toplam Menü",
      value: stats.totalMenus,
      icon: UtensilsCrossed,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
    },
    {
      label: "Yayında",
      value: stats.publishedMenus,
      icon: FileCheck,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
    },
    {
      label: "Taslak",
      value: stats.draftMenus,
      icon: FileClock,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-400",
    },
    {
      label: "Yemek Çeşidi",
      value: stats.totalFoods,
      icon: Salad,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
    },
  ];

  const quickActions = [
    {
      label: "Menü Yükle",
      description: "JSON ile toplu menü yükleyin",
      href: "/admin/upload",
      icon: Calendar,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Menüleri Görüntüle",
      description: "Tüm menüleri listeleyin",
      href: "/admin/menus",
      icon: UtensilsCrossed,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Yemekleri Görüntüle",
      description: "Yemek istatistiklerini görün",
      href: "/admin/foods",
      icon: Salad,
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Yemek KYK yönetim paneline hoş geldiniz</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/50 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  {isLoading ? (
                    <div className="h-9 w-16 bg-slate-700 rounded animate-pulse mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
              {/* Gradient Line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          Hızlı İşlemler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/50 p-6 transition-all hover:border-slate-600 hover:bg-slate-800"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{action.label}</h3>
                <p className="text-sm text-slate-400">{action.description}</p>
                <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Sistem Bilgisi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">Platform</span>
            <span className="text-white">Yemek KYK</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">Versiyon</span>
            <span className="text-white">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">API Durumu</span>
            <span className="text-emerald-400">Aktif</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">Son Güncelleme</span>
            <span className="text-white">{new Date().toLocaleDateString("tr-TR")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

