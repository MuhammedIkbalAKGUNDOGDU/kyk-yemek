"use client";

import { useState, useRef } from "react";
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
  Shield,
  FileWarning,
  Trash2,
  File,
  Mail,
  Image,
  FileText,
  Send,
  MessageSquare,
  Info,
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

interface SecurityCheck {
  passed: boolean;
  message: string;
}

// Maksimum dosya boyutu (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Zararlı içerik pattern'leri
const SUSPICIOUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+=/i,
  /eval\(/i,
  /base64/i,
  /data:/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
  /document\./i,
  /window\./i,
  /alert\(/i,
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// İzin verilen görsel/PDF dosya tipleri
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const getAdminToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminToken');
  }
  return null;
};

export default function AdminUploadPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'json' | 'image'>('json');

  // Shared state
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // JSON upload state
  const [jsonText, setJsonText] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [parseError, setParseError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [showExample, setShowExample] = useState(false);
  const [copied, setCopied] = useState(false);
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [jsonFileName, setJsonFileName] = useState<string | null>(null);
  const [isDraggingJson, setIsDraggingJson] = useState(false);
  
  // Image/PDF upload state
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);
  const [note, setNote] = useState("");
  
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

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

  // Güvenlik kontrolü yap
  const performSecurityChecks = (text: string, fileSize?: number): SecurityCheck[] => {
    const checks: SecurityCheck[] = [];

    // 1. Dosya boyutu kontrolü
    if (fileSize !== undefined) {
      const sizeMB = (fileSize / (1024 * 1024)).toFixed(2);
      if (fileSize > MAX_FILE_SIZE) {
        checks.push({
          passed: false,
          message: `Dosya boyutu çok büyük (${sizeMB}MB). Maksimum 10MB izin veriliyor.`
        });
      } else {
        checks.push({
          passed: true,
          message: `Dosya boyutu: ${sizeMB}MB ✓`
        });
      }
    }

    // 2. İçerik boyutu kontrolü
    const contentSize = new Blob([text]).size;
    if (contentSize > MAX_FILE_SIZE) {
      checks.push({
        passed: false,
        message: `İçerik boyutu limiti aşıyor (10MB)`
      });
    } else {
      checks.push({
        passed: true,
        message: `İçerik boyutu: ${(contentSize / 1024).toFixed(2)}KB ✓`
      });
    }

    // 3. Zararlı içerik kontrolü
    let hasSuspiciousContent = false;
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(text)) {
        hasSuspiciousContent = true;
        break;
      }
    }
    
    if (hasSuspiciousContent) {
      checks.push({
        passed: false,
        message: "Zararlı içerik tespit edildi! Dosya reddedildi."
      });
    } else {
      checks.push({
        passed: true,
        message: "Zararlı içerik taraması: Temiz ✓"
      });
    }

    // 4. JSON formatı kontrolü
    try {
      const data = JSON.parse(text);
      if (data.menus && Array.isArray(data.menus)) {
        checks.push({
          passed: true,
          message: `JSON formatı: Geçerli (${data.menus.length} gün) ✓`
        });
      } else {
        checks.push({
          passed: false,
          message: "JSON 'menus' array içermeli"
        });
      }
    } catch {
      checks.push({
        passed: false,
        message: "JSON formatı: Geçersiz"
      });
    }

    // 5. Karakter seti kontrolü
    const hasInvalidChars = /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text);
    if (hasInvalidChars) {
      checks.push({
        passed: false,
        message: "Geçersiz kontrol karakterleri tespit edildi"
      });
    } else {
      checks.push({
        passed: true,
        message: "Karakter seti: Temiz ✓"
      });
    }

    return checks;
  };

  const handleJsonChange = (text: string, fileSize?: number) => {
    setJsonText(text);
    setParseError("");
    setParsedData(null);
    setUploadResult(null);

    if (!text.trim()) {
      setSecurityChecks([]);
      return;
    }

    // Güvenlik kontrollerini yap
    const checks = performSecurityChecks(text, fileSize);
    setSecurityChecks(checks);

    // Herhangi bir güvenlik kontrolü başarısızsa dur
    const hasSecurityIssue = checks.some(c => !c.passed);
    if (hasSecurityIssue) {
      setParseError("Güvenlik kontrolü başarısız");
      return;
    }

    try {
      const data = JSON.parse(text);
      if (!data.menus || !Array.isArray(data.menus)) {
        setParseError("JSON 'menus' array içermeli");
        return;
      }

      // Her menüyü doğrula
      for (const menu of data.menus) {
        if (typeof menu.day !== "number" || menu.day < 1 || menu.day > 31) {
          setParseError(`Geçersiz gün numarası: ${menu.day}`);
          return;
        }
        if (!menu.breakfast && !menu.dinner) {
          setParseError(`Gün ${menu.day}: Kahvaltı veya akşam yemeği tanımlanmalı`);
          return;
        }

        // Yemek isimlerini kontrol et
        const items = [...(menu.breakfast?.items || []), ...(menu.dinner?.items || [])];
        for (const item of items) {
          if (typeof item !== "string" || item.length > 100) {
            setParseError(`Gün ${menu.day}: Yemek ismi geçersiz veya çok uzun`);
            return;
          }
        }
      }

      setParsedData(data);
    } catch {
      setParseError("Geçersiz JSON formatı");
    }
  };

  // JSON dosya yükleme işlemi
  const handleJsonFileUpload = (file: File) => {
    // Dosya tipi kontrolü
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setParseError("Sadece JSON dosyaları kabul edilir");
      setSecurityChecks([{
        passed: false,
        message: "Geçersiz dosya tipi. Sadece .json uzantılı dosyalar kabul edilir."
      }]);
      return;
    }

    // Boyut kontrolü
    if (file.size > MAX_FILE_SIZE) {
      setParseError("Dosya boyutu 10MB'dan büyük olamaz");
      setSecurityChecks([{
        passed: false,
        message: `Dosya boyutu çok büyük (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maksimum 10MB.`
      }]);
      return;
    }

    setJsonFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleJsonChange(content, file.size);
    };
    reader.onerror = () => {
      setParseError("Dosya okunamadı");
    };
    reader.readAsText(file);
  };

  // Görsel/PDF dosya yükleme işlemi
  const handleImageFileUpload = (file: File) => {
    setImageUploadError("");

    // Dosya tipi kontrolü
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageUploadError("Sadece JPEG, PNG, WebP ve PDF dosyaları kabul edilir.");
      return;
    }

    // Boyut kontrolü
    if (file.size > MAX_FILE_SIZE) {
      setImageUploadError("Dosya boyutu 10MB'dan büyük olamaz.");
      return;
    }

    setSelectedImageFile(file);

    // Önizleme oluştur (sadece resimler için)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Görsel/PDF gönderme
  const handleImageUpload = async () => {
    if (!selectedImageFile || !selectedCity) {
      setImageUploadError("Lütfen dosya ve şehir seçin");
      return;
    }

    setIsUploadingImage(true);
    setImageUploadError("");
    setImageUploadSuccess(false);

    try {
      const token = getAdminToken();
      const formData = new FormData();
      formData.append('file', selectedImageFile);
      formData.append('cityId', selectedCity);
      formData.append('year', selectedYear.toString());
      formData.append('month', selectedMonth.toString());
      if (note) formData.append('note', note);

      const response = await fetch(`${API_URL}/submissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gönderim başarısız');
      }

      setImageUploadSuccess(true);
      // Formu temizle
      setTimeout(() => {
        setSelectedImageFile(null);
        setImagePreview(null);
        setNote("");
        setImageUploadSuccess(false);
      }, 3000);
    } catch (err) {
      setImageUploadError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // JSON sürükle-bırak işlemleri
  const handleJsonDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingJson(true);
  };

  const handleJsonDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingJson(false);
  };

  const handleJsonDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingJson(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleJsonFileUpload(files[0]);
    }
  };

  // Görsel/PDF sürükle-bırak işlemleri
  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(true);
  };

  const handleImageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageFileUpload(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedCity || !parsedData) return;

    // Son bir güvenlik kontrolü daha
    const finalChecks = performSecurityChecks(jsonText);
    if (finalChecks.some(c => !c.passed)) {
      setParseError("Güvenlik kontrolü başarısız");
      return;
    }

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
    } catch (error: any) {
      if (error.message?.includes('Güvenlik')) {
        setParseError(error.message);
      } else {
        setParseError(error instanceof Error ? error.message : "Yükleme hatası");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const copyExample = () => {
    navigator.clipboard.writeText(exampleJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearJsonFile = () => {
    setJsonFileName(null);
    setJsonText("");
    setParsedData(null);
    setSecurityChecks([]);
    setParseError("");
    setUploadResult(null);
    if (jsonFileInputRef.current) {
      jsonFileInputRef.current.value = "";
    }
  };

  const clearImageFile = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    setImageUploadError("");
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = "";
    }
  };

  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const allChecksPassed = securityChecks.length > 0 && securityChecks.every(c => c.passed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Menü Yükle</h1>
        <p className="text-slate-400 mt-1">JSON veya görsel/PDF formatında menü yükleyin</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('json')}
          className={cn(
            "px-6 py-3 text-sm font-medium transition-colors border-b-2",
            activeTab === 'json'
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-300"
          )}
        >
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            JSON Yükle
          </div>
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={cn(
            "px-6 py-3 text-sm font-medium transition-colors border-b-2",
            activeTab === 'image'
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-300"
          )}
        >
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Görsel/PDF Yükle
          </div>
        </button>
      </div>

      {/* JSON Upload Tab */}
      {activeTab === 'json' && (
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

          {/* File Upload Zone */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileJson className="h-5 w-5 text-emerald-400" />
              JSON Dosyası
            </h2>

            {/* Dosya seçili ise */}
            {jsonFileName ? (
              <div className="mb-4 rounded-xl bg-slate-700/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                      <File className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{jsonFileName}</p>
                      <p className="text-xs text-slate-400">
                        {parsedData ? `${parsedData.menus.length} günlük menü` : "İşleniyor..."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearJsonFile}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Sürükle-Bırak Alanı */
              <div
                onDragOver={handleJsonDragOver}
                onDragLeave={handleJsonDragLeave}
                onDrop={handleJsonDrop}
                onClick={() => jsonFileInputRef.current?.click()}
                className={cn(
                  "mb-4 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all",
                  isDraggingJson
                    ? "border-emerald-400 bg-emerald-500/10"
                    : "border-slate-600 hover:border-slate-500 hover:bg-slate-700/30"
                )}
              >
                <input
                  ref={jsonFileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleJsonFileUpload(file);
                  }}
                  className="hidden"
                />
                <Upload className={cn(
                  "mx-auto h-10 w-10 mb-3",
                  isDraggingJson ? "text-emerald-400" : "text-slate-500"
                )} />
                <p className="text-sm font-medium text-white mb-1">
                  {isDraggingJson ? "Dosyayı bırakın" : "JSON dosyası yükleyin"}
                </p>
                <p className="text-xs text-slate-400">
                  Sürükle-bırak veya tıklayın • Maksimum 10MB
                </p>
              </div>
            )}

            {/* Veya manuel giriş */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-800 px-3 text-slate-400">veya manuel girin</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">JSON Verisi</label>
              <button
                onClick={() => setShowExample(!showExample)}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
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
              className="w-full h-48 rounded-xl border border-slate-600 bg-slate-700 p-4 text-sm text-white font-mono placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
            />

            {parseError && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
                <XCircle className="h-4 w-4 flex-shrink-0" />
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

          {/* Security Checks */}
          {securityChecks.length > 0 && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className={cn(
                  "h-5 w-5",
                  allChecksPassed ? "text-emerald-400" : "text-red-400"
                )} />
                Güvenlik Kontrolleri
              </h2>

              <div className="space-y-2">
                {securityChecks.map((check, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3",
                      check.passed ? "bg-emerald-500/10" : "bg-red-500/10"
                    )}
                  >
                    {check.passed ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <FileWarning className="h-4 w-4 text-red-400 flex-shrink-0" />
                    )}
                    <span className={cn(
                      "text-sm",
                      check.passed ? "text-emerald-300" : "text-red-300"
                    )}>
                      {check.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedCity || !parsedData || isUploading || !allChecksPassed}
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

          {/* Security Info */}
          <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400 space-y-1">
                <p className="font-medium text-slate-300">Güvenlik Önlemleri</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Maksimum dosya boyutu: 10MB</li>
                  <li>Sadece JSON formatı kabul edilir</li>
                  <li>Zararlı içerik taraması yapılır</li>
                  <li>Script ve executable içerikler engellenir</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-300">
                  Bir hata ile karşılaşırsanız mail üzerinden iletebilirsiniz:
                </p>
                <a 
                  href="mailto:destek@kykyemek.com" 
                  className="inline-flex items-center gap-1.5 mt-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  destek@kykyemek.com
                </a>
              </div>
            </div>
          </div>
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
                      {uploadResult.newFoods.slice(0, 15).map((food, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-lg bg-purple-500/10 text-xs text-purple-300"
                        >
                          {food}
                        </span>
                      ))}
                      {uploadResult.newFoods.length > 15 && (
                        <span className="px-2 py-1 rounded-lg bg-slate-700 text-xs text-slate-400">
                          +{uploadResult.newFoods.length - 15} daha
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {uploadResult.errors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Hatalar ({uploadResult.errors.length})
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {uploadResult.errors.map((error, i) => (
                        <p key={i} className="text-xs text-slate-400">
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-lg bg-emerald-500/10 p-4">
                  <p className="text-sm text-emerald-300">
                    💡 Menüler taslak olarak kaydedildi. 
                    <br />
                    <span className="text-emerald-400 font-medium">Menüler</span> sayfasından yayınlayabilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No data state */}
          {!parsedData && !uploadResult && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-12 text-center">
              <FileJson className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">Önizleme</h3>
              <p className="text-sm text-slate-500">
                JSON verisi yüklendiğinde burada görünecek
              </p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Image/PDF Upload Tab */}
      {activeTab === 'image' && (
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
                      required
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

            {/* File Upload Zone */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Image className="h-5 w-5 text-emerald-400" />
                Menü Görseli veya PDF
              </h2>

              {selectedImageFile ? (
                <div className="space-y-4">
                  {/* Önizleme */}
                  {imagePreview && (
                    <div className="rounded-xl overflow-hidden border border-slate-600">
                      <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-80 object-contain bg-slate-900" />
                    </div>
                  )}
                  
                  {/* Dosya bilgisi */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/50 border border-slate-600">
                    <div className="flex items-center gap-3">
                      {selectedImageFile.type === 'application/pdf' ? (
                        <FileText className="h-8 w-8 text-red-400" />
                      ) : (
                        <Image className="h-8 w-8 text-emerald-400" />
                      )}
                      <div>
                        <p className="font-medium text-white text-sm">{selectedImageFile.name}</p>
                        <p className="text-xs text-slate-400">
                          {(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearImageFile}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleImageDragOver}
                  onDragLeave={handleImageDragLeave}
                  onDrop={handleImageDrop}
                  onClick={() => imageFileInputRef.current?.click()}
                  className={cn(
                    "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all",
                    isDraggingImage
                      ? "border-emerald-400 bg-emerald-500/10"
                      : "border-slate-600 hover:border-slate-500 hover:bg-slate-700/30"
                  )}
                >
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFileUpload(file);
                    }}
                    className="hidden"
                  />
                  <Upload className={cn(
                    "mx-auto h-12 w-12 mb-4",
                    isDraggingImage ? "text-emerald-400" : "text-slate-500"
                  )} />
                  <p className="text-sm font-medium text-white mb-1">
                    {isDraggingImage ? "Dosyayı bırakın" : "Menü fotoğrafını veya PDF'ini yükleyin"}
                  </p>
                  <p className="text-xs text-slate-400">
                    Sürükle-bırak veya tıklayın • JPEG, PNG, WebP, PDF • Max 10MB
                  </p>
                </div>
              )}

              {imageUploadError && (
                <div className="mt-4 flex items-center gap-2 text-sm text-red-400">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  {imageUploadError}
                </div>
              )}

              {imageUploadSuccess && (
                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  Menü başarıyla gönderildi! Gönderiler sayfasından inceleyebilirsiniz.
                </div>
              )}
            </div>

            {/* Note */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-400" />
                Not (Opsiyonel)
              </h2>
              <p className="text-sm text-slate-400 mb-4">Eklemek istediğiniz bir not var mı?</p>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Örn: Bu menü yurtumuzun ana yemekhanesinden"
                rows={3}
                maxLength={500}
                className="w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
              />
              <p className="text-xs text-slate-400 mt-2 text-right">{note.length}/500</p>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleImageUpload}
              disabled={!selectedImageFile || !selectedCity || isUploadingImage}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-4 text-white font-medium transition-all hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploadingImage ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Menüyü Gönder
                </>
              )}
            </button>

            {/* Info */}
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Bilgilendirme</p>
                  <p>Gönderdiğiniz menü <span className="font-medium text-blue-400">Gönderiler</span> sayfasında görünecek ve inceleyebilirsiniz.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="space-y-6">
            {selectedImageFile ? (
              <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Önizleme</h2>
                {imagePreview ? (
                  <div className="rounded-xl overflow-hidden border border-slate-600">
                    <img src={imagePreview} alt="Preview" className="w-full h-auto object-contain" />
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-600 bg-slate-900 p-12 text-center">
                    <FileText className="mx-auto h-16 w-16 text-red-400 mb-4" />
                    <p className="text-slate-300 mb-2">{selectedImageFile.name}</p>
                    <p className="text-sm text-slate-400">PDF dosyası önizlenemez</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-12 text-center">
                <Image className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-400 mb-2">Önizleme</h3>
                <p className="text-sm text-slate-500">
                  Dosya yüklendiğinde burada görünecek
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
