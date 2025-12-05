"use client";

import { useState, useRef } from "react";
import { Upload, FileImage, FileText, X, CheckCircle, Mail, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { AdBanner } from "@/components/AdBanner";
import { useCity } from "@/hooks/useCity";
import { cities } from "@/data/menus";
import { cn } from "@/lib/utils";

type FileType = "image" | "pdf" | null;

interface UploadedFile {
  file: File;
  type: FileType;
  preview?: string;
}

export default function UploadPage() {
  const { selectedCity, selectedCityName, setSelectedCity, isLoaded } = useCity();
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [email, setEmail] = useState("");
  const [menuCity, setMenuCity] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; file?: string; city?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleFileSelect = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    if (!isImage && !isPdf) {
      setErrors({ ...errors, file: "Sadece resim (JPG, PNG) veya PDF dosyası yükleyebilirsiniz." });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors({ ...errors, file: "Dosya boyutu 10MB'dan küçük olmalıdır." });
      return;
    }

    const uploadedFile: UploadedFile = {
      file,
      type: isImage ? "image" : "pdf",
    };

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedFile.preview = e.target?.result as string;
        setUploadedFile(uploadedFile);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedFile(uploadedFile);
    }

    setErrors({ ...errors, file: undefined });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { email?: string; file?: string; city?: string } = {};

    if (!email) {
      newErrors.email = "E-posta adresi gereklidir.";
    } else if (!validateEmail(email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz.";
    }

    if (!uploadedFile) {
      newErrors.file = "Lütfen bir dosya yükleyiniz.";
    }

    if (!menuCity) {
      newErrors.city = "Lütfen bir şehir seçiniz.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const resetForm = () => {
    setUploadedFile(null);
    setEmail("");
    setMenuCity("");
    setIsSuccess(false);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Don't render until localStorage is loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        selectedCity={selectedCity}
        selectedCityName={selectedCityName}
        onCityChange={setSelectedCity}
      />

      {/* Main Layout */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:w-60 lg:shrink-0">
            <div className="sticky top-[80px]">
              <Sidebar activeItem="upload" />
            </div>
          </div>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            {/* Page Title */}
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Upload className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                Menü Yükle
              </h1>
              <p className="mt-2 text-gray-500">
                Yurt menüsünü bizimle paylaşarak katkıda bulunun
              </p>
            </div>

            {isSuccess ? (
              /* Success State */
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Teşekkürler!
                </h2>
                <p className="text-gray-600 mb-6">
                  Menünüz başarıyla gönderildi. İncelendikten sonra siteye eklenecektir.
                </p>
                <button
                  onClick={resetForm}
                  className="rounded-full bg-green-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-600"
                >
                  Yeni Menü Yükle
                </button>
              </div>
            ) : (
              /* Upload Form */
              <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                {/* File Upload Area */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Menü Dosyası <span className="text-red-500">*</span>
                  </label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all",
                      isDragging
                        ? "border-green-500 bg-green-50"
                        : errors.file
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-gray-50 hover:border-green-300 hover:bg-green-50/50"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleInputChange}
                      className="hidden"
                    />

                    {uploadedFile ? (
                      <div className="flex flex-col items-center">
                        {uploadedFile.type === "image" && uploadedFile.preview ? (
                          <img
                            src={uploadedFile.preview}
                            alt="Preview"
                            className="mb-4 h-32 w-auto rounded-lg object-contain"
                          />
                        ) : (
                          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-red-100">
                            <FileText className="h-10 w-10 text-red-600" />
                          </div>
                        )}
                        <p className="text-sm font-medium text-gray-900">{uploadedFile.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                          className="mt-3 flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-200"
                        >
                          <X className="h-3 w-3" />
                          Kaldır
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 flex justify-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                            <FileImage className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                            <FileText className="h-6 w-6 text-red-600" />
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          Dosyayı sürükleyip bırakın veya tıklayın
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          JPG, PNG veya PDF (Maks. 10MB)
                        </p>
                      </>
                    )}
                  </div>
                  {errors.file && (
                    <p className="mt-2 text-sm text-red-500">{errors.file}</p>
                  )}
                </div>

                {/* City Selection */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <MapPin className="mr-1 inline h-4 w-4" />
                    Şehir <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={menuCity}
                    onChange={(e) => {
                      setMenuCity(e.target.value);
                      setErrors({ ...errors, city: undefined });
                    }}
                    className={cn(
                      "w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 transition-all focus:border-green-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100",
                      errors.city ? "border-red-300" : "border-gray-200"
                    )}
                  >
                    <option value="">Şehir seçiniz...</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                    <option value="other">Diğer (Listede yok)</option>
                  </select>
                  {errors.city && (
                    <p className="mt-2 text-sm text-red-500">{errors.city}</p>
                  )}
                </div>

                {/* Email Input */}
                <div className="mb-8">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <Mail className="mr-1 inline h-4 w-4" />
                    E-posta Adresi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({ ...errors, email: undefined });
                    }}
                    placeholder="ornek@email.com"
                    className={cn(
                      "w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-green-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100",
                      errors.email ? "border-red-300" : "border-gray-200"
                    )}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-500">{errors.email}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Menünüz onaylandığında size bilgi verilecektir.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-4 text-base font-medium text-white transition-colors hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      Menüyü Gönder
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Info Note */}
            <div className="mt-6 rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-blue-700">
                💡 <strong>İpucu:</strong> Menü fotoğrafını çekerken iyi aydınlatılmış bir ortamda, düz bir açıyla çekin. PDF formatı tercih edilir.
              </p>
            </div>
          </main>

          {/* Right Sidebar */}
          <div className="hidden xl:block xl:w-60 xl:shrink-0">
            <div className="sticky top-[80px] space-y-6">
              <AdBanner position="right" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

