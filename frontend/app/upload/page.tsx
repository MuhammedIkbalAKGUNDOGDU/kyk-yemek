"use client";

import { useState, useRef } from "react";
import { 
  Upload, 
  Image, 
  FileText, 
  CheckCircle, 
  XCircle,
  MapPin,
  Calendar,
  MessageSquare,
  Send,
  ArrowLeft,
  Info,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { cities } from "@/data/menus";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Maksimum dosya boyutu (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// İzin verilen dosya tipleri
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cityId, setCityId] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [note, setNote] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const handleFileSelect = (file: File) => {
    setError("");
    
    // Dosya tipi kontrolü
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Sadece JPEG, PNG, WebP ve PDF dosyaları kabul edilir.");
      return;
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      setError("Dosya boyutu 10MB'dan büyük olamaz.");
      return;
    }

    setSelectedFile(file);

    // Önizleme oluştur (sadece resimler için)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedFile) {
      setError("Lütfen bir dosya seçin");
      return;
    }

    if (!cityId) {
      setError("Lütfen şehir seçin");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('cityId', cityId);
      formData.append('year', year.toString());
      formData.append('month', month.toString());
      if (note) formData.append('note', note);

      // Token varsa ekle (giriş yapmış kullanıcılar için)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/submissions`, {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gönderim başarısız');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Başarılı gönderim ekranı
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Teşekkürler!
          </h1>
          <p className="text-gray-600 mb-6">
            Menü bilginiz başarıyla gönderildi. Yönetim ekibimiz inceledikten sonra yayınlanacaktır.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full py-3 px-4 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                clearFile();
                setNote("");
                setCityId("");
              }}
              className="block w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Yeni Menü Gönder
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Menü Gönder</h1>
            <p className="text-sm text-gray-500">Yurt menüsünü bizimle paylaşın</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-500" />
              Menü Görseli veya PDF
            </h2>

            {selectedFile ? (
              <div className="space-y-4">
                {/* Önizleme */}
                {preview && (
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <img src={preview} alt="Preview" className="w-full h-auto max-h-80 object-contain bg-gray-50" />
                  </div>
                )}
                
                {/* Dosya bilgisi */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-100">
                  <div className="flex items-center gap-3">
                    {selectedFile.type === 'application/pdf' ? (
                      <FileText className="h-8 w-8 text-red-500" />
                    ) : (
                      <Image className="h-8 w-8 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all",
                  isDragging
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 hover:border-green-300 hover:bg-green-50/50"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />
                <Upload className={cn(
                  "mx-auto h-12 w-12 mb-4",
                  isDragging ? "text-green-500" : "text-gray-400"
                )} />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Menü fotoğrafını veya PDF'ini yükleyin
                </p>
                <p className="text-xs text-gray-500">
                  Sürükle-bırak veya tıklayın • JPEG, PNG, WebP, PDF • Max 10MB
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-500">
                <XCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* City & Date */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              Konum ve Tarih
            </h2>

            <div className="space-y-4">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şehir *
                </label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-green-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
                >
                  <option value="">Şehir seçin</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              {/* Year & Month */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yıl
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-green-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
                  >
                    {[2024, 2025, 2026].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ay
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-green-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
                  >
                    {months.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              Not (Opsiyonel)
            </h2>
            <p className="text-sm text-gray-500 mb-4">Eklemek istediğiniz bir not var mı?</p>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Örn: Bu menü yurtumuzun ana yemekhanesinden"
              rows={3}
              maxLength={500}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-green-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100 resize-none"
            />
            <p className="text-xs text-gray-400 mt-2 text-right">{note.length}/500</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Bilgilendirme</p>
              <p>Gönderdiğiniz menü yönetim ekibimiz tarafından incelenecek ve uygun görülürse yayınlanacaktır. Bu süreç 1-2 iş günü alabilir.</p>
            </div>
          </div>

          {/* Security Info */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <Shield className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-medium text-slate-700">Güvenlik</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Maksimum dosya boyutu: 10MB</li>
                <li>Sadece JPEG, PNG, WebP ve PDF formatları kabul edilir</li>
                <li>Dosyalarınız güvenli bir şekilde saklanır</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedFile || !cityId || isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-4 text-white font-semibold shadow-lg shadow-green-500/25 transition-all hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Menüyü Gönder
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
