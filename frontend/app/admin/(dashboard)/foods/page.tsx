"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Salad,
} from "lucide-react";
import { foodAPI, Food } from "@/lib/adminApi";
import { cn } from "@/lib/utils";

type SortField = "name" | "likes" | "dislikes" | "created_at";
type SortOrder = "asc" | "desc";

export default function AdminFoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("likes");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchFoods = async () => {
    setIsLoading(true);
    try {
      const response = await foodAPI.getAll({
        search: searchQuery || undefined,
        sort: sortField,
        order: sortOrder,
        page: pagination.page,
        limit: pagination.limit,
      });
      setFoods(response.foods);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Fetch foods error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchFoods();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, sortField, sortOrder, pagination.page]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Yemekler</h1>
          <p className="text-slate-400 mt-1">Tüm yemekler ve beğeni istatistikleri</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Yemek ara..."
            className="w-full sm:w-64 rounded-xl border border-slate-600 bg-slate-800 pl-12 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10">
            <Salad className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{pagination.total}</p>
            <p className="text-sm text-slate-400">Toplam Yemek</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10">
            <ThumbsUp className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {foods.reduce((sum, f) => sum + f.likes, 0)}
            </p>
            <p className="text-sm text-slate-400">Toplam Beğeni</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/10">
            <ThumbsDown className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {foods.reduce((sum, f) => sum + f.dislikes, 0)}
            </p>
            <p className="text-sm text-slate-400">Toplam Beğenmeme</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800">
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Yemek Adı
                    <ArrowUpDown className={cn(
                      "h-4 w-4",
                      sortField === "name" && "text-emerald-400"
                    )} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("likes")}
                    className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Beğeni
                    <ArrowUpDown className={cn(
                      "h-4 w-4",
                      sortField === "likes" && "text-emerald-400"
                    )} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("dislikes")}
                    className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Beğenmeme
                    <ArrowUpDown className={cn(
                      "h-4 w-4",
                      sortField === "dislikes" && "text-emerald-400"
                    )} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
                  Oran
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("created_at")}
                    className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Eklenme Tarihi
                    <ArrowUpDown className={cn(
                      "h-4 w-4",
                      sortField === "created_at" && "text-emerald-400"
                    )} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-4">
                      <div className="h-6 bg-slate-700 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : foods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    Yemek bulunamadı
                  </td>
                </tr>
              ) : (
                foods.map((food) => {
                  const total = food.likes + food.dislikes;
                  const likeRatio = total > 0 ? Math.round((food.likes / total) * 100) : 0;

                  return (
                    <tr key={food.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-white font-medium">{food.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">{food.likes}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ThumbsDown className="h-4 w-4 text-red-400" />
                          <span className="text-red-400 font-medium">{food.dislikes}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {total > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  likeRatio >= 70 ? "bg-emerald-500" :
                                  likeRatio >= 40 ? "bg-amber-500" : "bg-red-500"
                                )}
                                style={{ width: `${likeRatio}%` }}
                              />
                            </div>
                            <span className={cn(
                              "text-sm font-medium",
                              likeRatio >= 70 ? "text-emerald-400" :
                              likeRatio >= 40 ? "text-amber-400" : "text-red-400"
                            )}>
                              %{likeRatio}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm">
                        {formatDate(food.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-700 px-4 py-3">
            <p className="text-sm text-slate-400">
              Toplam {pagination.total} yemek
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

