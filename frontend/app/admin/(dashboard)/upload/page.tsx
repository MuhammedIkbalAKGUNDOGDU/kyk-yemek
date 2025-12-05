"use client";

import { useState } from "react";
import {
  Upload,
  FileJson,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Salad,
  ChevronDown,
  Copy,
  Check,
} from "lucide-react";
import { menuAPI } from "@/lib/adminApi";
import { cities } from "@/data/menus";
import { cn } from "@/lib/utils";

interface UploadResult {
  created: number;
  skipped: number;
  errors: string[];
  newFoods: string[];
}

export default function AdminUploadPage() {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [jsonText, setJsonText] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [parseError, setParseError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [showExample, setShowExample] = useState(false);
  const [copied, setCopied] = useState(false);

  const exampleJson = `{
  "menus": [
    {
      "day": 1,
      "breakfast": {
        "items": ["Beyaz Peynir", "Siyah Zeytin", "Domates", "Salatalık", "Tereyağı", "Bal", "Çay"],
        "calories": 450
      },
      "dinner": {
        "items": ["Mercimek Çorbası", "Pirinç Pilavı", "Tavuk Sote", "Cacık", "Ekmek"],
        "calories": 920
      }
    },
    {
      "day": 2,
      "breakfast": {
        "items": ["Kaşar Peyniri", "Yeşil Zeytin", "Haşlanmış Yumurta", "Reçel", "Çay"],
        "calories": 480
      },
      "dinner": {
        "items": ["Ezogelin Çorbası", "Bulgur Pilavı", "Kuru Fasulye", "Turşu", "Ayran"],
        "calories": 880
      }
    }
  ]
}`;

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    setParseError("");
    setParsedData(null);
    setUploadResult(null);

    if (!text.trim()) return;

    try {
      const data = JSON.parse(text);
      if (!data.menus || !Array.isArray(data.menus)) {
        setParseError("JSON 'menus' array içermeli");
        return;
      }

      // Validate each menu
      for (const menu of data.menus) {
        if (typeof menu.day !== "number") {
          setParseError(`Gün numarası eksik veya hatalı`);
          return;
        }
        if (!menu.breakfast && !menu.dinner) {
          setParseError(`Gün ${menu.day}: Kahvaltı veya akşam yemeği tanımlanmalı`);
          return;
        }
      }

      setParsedData(data);
    } catch (e) {
      setParseError("Geçersiz JSON formatı");
    }
  };

  const handleUpload = async () => {
    if (!selectedCity || !parsedData) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const result = await menuAPI.bulkUpload({
        city: selectedCity,
        year: selectedYear,
        month: selectedMonth,
        menus: parsedData.menus,
      });
      setUploadResult(result.results);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Yükleme hatası");
    } finally {
      setIsUploading(false);
    }
  };

  const copyExample = () => {
    navigator.clipboard.writeText(exampleJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Menü Yükle</h1>
        <p className="text-slate-400 mt-1">JSON formatında toplu menü yükleyin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* Settings */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-400" />
              Ayarlar
            </h2>

            <div className="space-y-4">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Şehir *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-600 bg-slate-700 pl-12 pr-4 py-3 text-white appearance-none cursor-pointer focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Şehir seçin</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Year & Month */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Yıl
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-white appearance-none cursor-pointer focus:border-emerald-500 focus:outline-none"
                  >
                    {[2024, 2025, 2026].map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ay
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-white appearance-none cursor-pointer focus:border-emerald-500 focus:outline-none"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* JSON Input */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileJson className="h-5 w-5 text-emerald-400" />
                JSON Verisi
              </h2>
              <button
                onClick={() => setShowExample(!showExample)}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {showExample ? "Örneği Gizle" : "Örnek Göster"}
              </button>
            </div>

            {showExample && (
              <div className="mb-4 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                  <span className="text-xs text-slate-400">Örnek JSON</span>
                  <button
                    onClick={copyExample}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Kopyalandı" : "Kopyala"}
                  </button>
                </div>
                <pre className="p-4 text-xs text-slate-300 overflow-x-auto">
                  {exampleJson}
                </pre>
              </div>
            )}

            <textarea
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder="JSON verisini buraya yapıştırın..."
              className="w-full h-64 rounded-xl border border-slate-600 bg-slate-700 p-4 text-sm text-white font-mono placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
            />

            {parseError && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
                <XCircle className="h-4 w-4" />
                {parseError}
              </div>
            )}

            {parsedData && !parseError && (
              <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                {parsedData.menus.length} günlük menü hazır
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedCity || !parsedData || isUploading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-4 text-white font-medium transition-all hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Yükleniyor...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Menüleri Yükle (Taslak)
              </>
            )}
          </button>
        </div>

        {/* Right: Preview & Results */}
        <div className="space-y-6">
          {/* Preview */}
          {parsedData && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Önizleme</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {parsedData.menus.slice(0, 5).map((menu: any, index: number) => (
                  <div key={index} className="rounded-xl bg-slate-700/50 p-4">
                    <p className="text-sm font-medium text-white mb-2">
                      {menu.day}. Gün
                    </p>
                    {menu.breakfast && (
                      <div className="mb-2">
                        <span className="text-xs text-amber-400">Kahvaltı:</span>
                        <p className="text-xs text-slate-300 mt-1">
                          {menu.breakfast.items.join(", ")}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {menu.breakfast.calories} kcal
                        </p>
                      </div>
                    )}
                    {menu.dinner && (
                      <div>
                        <span className="text-xs text-blue-400">Akşam:</span>
                        <p className="text-xs text-slate-300 mt-1">
                          {menu.dinner.items.join(", ")}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {menu.dinner.calories} kcal
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                {parsedData.menus.length > 5 && (
                  <p className="text-center text-sm text-slate-400">
                    +{parsedData.menus.length - 5} gün daha...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {uploadResult && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                Yükleme Sonucu
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-emerald-500/10 p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{uploadResult.created}</p>
                    <p className="text-sm text-slate-400">Oluşturuldu</p>
                  </div>
                  <div className="rounded-xl bg-amber-500/10 p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">{uploadResult.skipped}</p>
                    <p className="text-sm text-slate-400">Atlandı</p>
                  </div>
                </div>

                {uploadResult.newFoods.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <Salad className="h-4 w-4 text-purple-400" />
                      Yeni Yemekler ({uploadResult.newFoods.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {uploadResult.newFoods.map((food, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-lg bg-purple-500/10 text-xs text-purple-300"
                        >
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {uploadResult.errors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Hatalar ({uploadResult.errors.length})
                    </p>
                    <div className="space-y-1">
                      {uploadResult.errors.map((error, i) => (
                        <p key={i} className="text-xs text-slate-400">
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-slate-400 mt-4">
                  💡 Menüler taslak olarak kaydedildi. Yayınlamak için Menüler sayfasına gidin.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

