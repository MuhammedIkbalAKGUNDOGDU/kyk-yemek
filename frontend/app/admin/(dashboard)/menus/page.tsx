"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Check,
  Trash2,
  Eye,
  FileCheck,
  FileClock,
  Calendar,
  MapPin,
  Utensils,
} from "lucide-react";
import { menuAPI, Menu } from "@/lib/adminApi";
import { cities } from "@/data/menus";
import { cn } from "@/lib/utils";

export default function AdminMenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      const response = await menuAPI.getAll({
        city: selectedCity || undefined,
        status: selectedStatus || undefined,
        year: selectedYear,
        month: selectedMonth,
        page: pagination.page,
        limit: pagination.limit,
      });
      setMenus(response.menus);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Fetch menus error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [selectedCity, selectedStatus, selectedYear, selectedMonth, pagination.page]);

  const handleSelectAll = () => {
    if (selectedIds.length === menus.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(menus.map((m) => m.id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkPublish = async () => {
    if (selectedIds.length === 0) return;
    
    setIsPublishing(true);
    try {
      await menuAPI.bulkPublish(selectedIds);
      setSelectedIds([]);
      fetchMenus();
    } catch (error) {
      console.error("Bulk publish error:", error);
      alert("Yayınlama hatası: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishMonth = async () => {
    if (!selectedCity) {
      alert("Lütfen bir şehir seçin");
      return;
    }

    const cityName = cities.find(c => c.id === selectedCity)?.name || selectedCity;
    const monthName = months[selectedMonth - 1];
    
    if (!confirm(`${cityName} - ${monthName} ${selectedYear} için tüm taslak menüler yayınlanacak. Devam etmek istiyor musunuz?`)) {
      return;
    }

    setIsPublishing(true);
    try {
      const result = await menuAPI.publishMonth({
        city: selectedCity,
        year: selectedYear,
        month: selectedMonth,
      });
      alert(`✅ ${result.publishedCount} menü yayınlandı!`);
      fetchMenus();
    } catch (error) {
      alert("Yayınlama hatası: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu menüyü silmek istediğinize emin misiniz?")) return;
    
    try {
      await menuAPI.delete(id);
      fetchMenus();
    } catch (error) {
      alert("Silme hatası: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await menuAPI.publish(id);
      fetchMenus();
    } catch (error) {
      alert("Yayınlama hatası: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Menüler</h1>
          <p className="text-slate-400 mt-1">Tüm menüleri görüntüle ve yönet</p>
        </div>
        
        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkPublish}
            disabled={isPublishing}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            {isPublishing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FileCheck className="h-4 w-4" />
            )}
            {selectedIds.length} menüyü yayınla
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* City Filter */}
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="">Tüm Şehirler</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>{city.name}</option>
          ))}
        </select>

        {/* Year Filter */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          {[2024, 2025, 2026].map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        {/* Month Filter */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          {months.map((month, index) => (
            <option key={index} value={index + 1}>{month}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="">Tüm Durumlar</option>
          <option value="draft">Taslak</option>
          <option value="published">Yayında</option>
        </select>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Publish Month Button - Her zaman görünür */}
        <button
          onClick={handlePublishMonth}
          disabled={isPublishing}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 transition-all"
        >
          {isPublishing ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <FileCheck className="h-4 w-4" />
          )}
          {selectedCity 
            ? `${cities.find(c => c.id === selectedCity)?.name} - ${months[selectedMonth - 1]} Yayınla`
            : `${months[selectedMonth - 1]} Ayını Yayınla`
          }
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === menus.length && menus.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Tarih</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Şehir</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Öğün</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Yemekler</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Kalori</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Durum</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-4 py-4">
                      <div className="h-6 bg-slate-700 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : menus.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    Menü bulunamadı
                  </td>
                </tr>
              ) : (
                menus.map((menu) => (
                  <tr key={menu.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(menu.id)}
                        onChange={() => handleSelect(menu.id)}
                        className="rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-white">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {formatDate(menu.date)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-white">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {cities.find((c) => c.id === menu.cityId)?.name || menu.cityId}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                        menu.mealType === "breakfast"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-blue-500/10 text-blue-400"
                      )}>
                        <Utensils className="h-3 w-3" />
                        {menu.mealType === "breakfast" ? "Kahvaltı" : "Akşam"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-300 max-w-xs truncate">
                        {menu.items.slice(0, 3).join(", ")}
                        {menu.items.length > 3 && ` +${menu.items.length - 3}`}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-white">
                      {menu.totalCalories} kcal
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                        menu.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-slate-500/10 text-slate-400"
                      )}>
                        {menu.status === "published" ? (
                          <><FileCheck className="h-3 w-3" /> Yayında</>
                        ) : (
                          <><FileClock className="h-3 w-3" /> Taslak</>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {menu.status === "draft" && (
                          <>
                            <button
                              onClick={() => handlePublish(menu.id)}
                              className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                              title="Yayınla"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(menu.id)}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-700 px-4 py-3">
            <p className="text-sm text-slate-400">
              Toplam {pagination.total} menü
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-white">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

