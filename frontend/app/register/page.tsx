"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, Eye, EyeOff, User, ArrowRight, CheckCircle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { cities } from "@/data/menus";

export default function RegisterPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    nickname?: string;
    email?: string;
    city?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateNickname = (nickname: string) => {
    // Only letters, numbers and underscore, 3-20 characters
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(nickname);
  };

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["", "Çok Zayıf", "Zayıf", "Orta", "Güçlü", "Çok Güçlü"];
  const strengthColors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-400", "bg-green-600"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: typeof errors = {};

    if (!nickname) {
      newErrors.nickname = "Kullanıcı adı gereklidir.";
    } else if (!validateNickname(nickname)) {
      newErrors.nickname = "Kullanıcı adı 3-20 karakter, sadece harf, rakam ve alt çizgi içerebilir.";
    }

    if (!email) {
      newErrors.email = "E-posta adresi gereklidir.";
    } else if (!validateEmail(email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz.";
    }

    if (!city) {
      newErrors.city = "Lütfen şehrinizi seçiniz.";
    }

    if (!password) {
      newErrors.password = "Şifre gereklidir.";
    } else if (password.length < 6) {
      newErrors.password = "Şifre en az 6 karakter olmalıdır.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Şifre tekrarı gereklidir.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Şifreler eşleşmiyor.";
    }

    if (!acceptTerms) {
      newErrors.terms = "Kullanım koşullarını kabul etmelisiniz.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Simulate registration
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For demo, redirect to login
    setIsLoading(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4 py-12">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-40 right-20 w-72 h-72 bg-emerald-200 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-green-200 rounded-full blur-3xl" />
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Hesap Oluştur</h1>
            <p className="text-gray-500">Topluluğumuza katılın</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setErrors({ ...errors, nickname: undefined });
                  }}
                  placeholder="kullanici_adi"
                  className={cn(
                    "w-full rounded-xl border bg-gray-50/50 pl-12 pr-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:bg-white focus:outline-none focus:ring-2",
                    errors.nickname 
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100" 
                      : "border-gray-200 focus:border-green-400 focus:ring-green-100"
                  )}
                />
              </div>
              {errors.nickname && (
                <p className="mt-2 text-sm text-red-500">{errors.nickname}</p>
              )}
            </div>

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

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Okuduğunuz / Yaşadığınız Şehir
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setErrors({ ...errors, city: undefined });
                  }}
                  className={cn(
                    "w-full rounded-xl border bg-gray-50/50 pl-12 pr-4 py-3.5 text-sm text-gray-900 transition-all focus:bg-white focus:outline-none focus:ring-2 appearance-none cursor-pointer",
                    errors.city 
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100" 
                      : "border-gray-200 focus:border-green-400 focus:ring-green-100",
                    !city && "text-gray-400"
                  )}
                >
                  <option value="">Şehir seçiniz...</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.city && (
                <p className="mt-2 text-sm text-red-500">{errors.city}</p>
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
              
              {/* Password Strength */}
              {password && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-colors",
                          level <= passwordStrength ? strengthColors[passwordStrength] : "bg-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn(
                    "text-xs font-medium",
                    passwordStrength <= 2 ? "text-red-500" : passwordStrength <= 3 ? "text-yellow-600" : "text-green-600"
                  )}>
                    Şifre Gücü: {strengthLabels[passwordStrength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre Tekrar
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  placeholder="••••••••"
                  className={cn(
                    "w-full rounded-xl border bg-gray-50/50 pl-12 pr-12 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:bg-white focus:outline-none focus:ring-2",
                    errors.confirmPassword 
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100" 
                      : password && confirmPassword && password === confirmPassword
                      ? "border-green-300 focus:border-green-400 focus:ring-green-100"
                      : "border-gray-200 focus:border-green-400 focus:ring-green-100"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {password && confirmPassword && password === confirmPassword && (
                  <CheckCircle className="absolute right-12 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    setErrors({ ...errors, terms: undefined });
                  }}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">
                  <Link href="/terms" className="text-green-600 hover:text-green-700 font-medium">
                    Kullanım Koşulları
                  </Link>
                  {" "}ve{" "}
                  <Link href="/privacy" className="text-green-600 hover:text-green-700 font-medium">
                    Gizlilik Politikası
                  </Link>
                  'nı okudum ve kabul ediyorum.
                </span>
              </label>
              {errors.terms && (
                <p className="mt-2 text-sm text-red-500">{errors.terms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-4 text-base font-semibold text-white transition-all hover:bg-green-600 hover:shadow-lg hover:shadow-green-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none mt-6"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Kayıt yapılıyor...
                </>
              ) : (
                <>
                  Kayıt Ol
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="font-semibold text-green-600 hover:text-green-700 transition-colors">
              Giriş Yap
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

