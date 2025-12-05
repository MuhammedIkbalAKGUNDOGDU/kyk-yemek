"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { cities } from "@/data/menus";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "E-posta adresi gereklidir.";
    } else if (!validateEmail(email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz.";
    }

    if (!password) {
      newErrors.password = "Şifre gereklidir.";
    } else if (password.length < 6) {
      newErrors.password = "Şifre en az 6 karakter olmalıdır.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For demo, just redirect to home
    setIsLoading(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-200 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-200 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500">
            <X className="h-6 w-6 text-white" strokeWidth={3} />
          </div>
          <span className="text-xl font-bold text-gray-900">Yemek KYK</span>
        </Link>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-green-100/50 border border-white/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Hoş Geldiniz!</h1>
            <p className="text-gray-500">Hesabınıza giriş yapın</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="ornek@email.com"
                  className={cn(
                    "w-full rounded-xl border bg-gray-50/50 pl-12 pr-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:bg-white focus:outline-none focus:ring-2",
                    errors.email 
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100" 
                      : "border-gray-200 focus:border-green-400 focus:ring-green-100"
                  )}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="••••••••"
                  className={cn(
                    "w-full rounded-xl border bg-gray-50/50 pl-12 pr-12 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:bg-white focus:outline-none focus:ring-2",
                    errors.password 
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100" 
                      : "border-gray-200 focus:border-green-400 focus:ring-green-100"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button type="button" className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
                Şifremi Unuttum
              </button>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-4 text-base font-semibold text-white transition-all hover:bg-green-600 hover:shadow-lg hover:shadow-green-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  Giriş Yap
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Hesabınız yok mu?{" "}
            <Link href="/register" className="font-semibold text-green-600 hover:text-green-700 transition-colors">
              Kayıt Ol
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <Link 
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}

