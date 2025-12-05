"use client";

import Link from "next/link";
import { X, ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
              <X className="h-5 w-5 text-white" strokeWidth={3} />
            </div>
            <span className="text-lg font-bold text-gray-900">Yemek KYK</span>
          </Link>
          <Link 
            href="/register"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kayıt Sayfasına Dön
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Title */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kullanım Koşulları</h1>
          <p className="text-gray-500">Son güncelleme: Aralık 2024</p>
        </div>

        {/* Terms Content */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Genel Hükümler</h2>
            <p className="text-gray-600 leading-relaxed">
              Yemek KYK platformuna ("Platform") erişerek veya bu platformu kullanarak, aşağıdaki 
              kullanım koşullarını kabul etmiş sayılırsınız. Bu koşulları kabul etmiyorsanız, 
              lütfen platformumuzu kullanmayınız.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Hizmet Tanımı</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Yemek KYK, Kredi ve Yurtlar Kurumu yurtlarında sunulan günlük yemek menülerinin 
              paylaşıldığı bir topluluk platformudur. Platform aşağıdaki hizmetleri sunmaktadır:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Günlük ve aylık yemek menülerinin görüntülenmesi</li>
              <li>Kullanıcıların menüler hakkında yorum yapabilmesi</li>
              <li>Menülere beğeni/beğenmeme oy verebilme</li>
              <li>Tahmini kalori bilgilerinin sunulması</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Kullanıcı Sorumlulukları</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Platformumuzu kullanırken aşağıdaki kurallara uymayı kabul edersiniz:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Doğru ve güncel bilgiler sağlamak</li>
              <li>Hesap bilgilerinizi güvende tutmak</li>
              <li>Başkalarının haklarına saygı göstermek</li>
              <li>Yasalara aykırı içerik paylaşmamak</li>
              <li>Platformun işleyişini bozmamak</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Yorum Kuralları</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Yorum yaparken aşağıdaki kurallara uymanız gerekmektedir:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Irk, cinsiyet, din, dil, milliyet ayrımı yapan ifadeler yasaktır</li>
              <li>Nefret söylemi ve hakaret içeren yorumlar yasaktır</li>
              <li>Argo ve küfürlü ifadeler yasaktır</li>
              <li>Reklam ve spam içerikli yorumlar yasaktır</li>
              <li>Kişisel bilgi paylaşımı (telefon, adres vb.) yasaktır</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              <strong>Not:</strong> Kurallara uymayan yorumlar silinir ve gerekli hallerde 
              hesabınız askıya alınabilir.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. İçerik Sorumluluğu</h2>
            <p className="text-gray-600 leading-relaxed">
              Platformda paylaşılan menü bilgileri resmi KYK kaynaklarından veya kullanıcı 
              katkılarından elde edilmektedir. Menülerde değişiklik olabilir ve gerçek menü 
              yemekhanelerde farklılık gösterebilir. Kalori bilgileri tahmini olup, kesin 
              beslenme değeri için uzman görüşü alınmalıdır. Platform, içeriklerin doğruluğu 
              konusunda garanti vermemektedir.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Fikri Mülkiyet</h2>
            <p className="text-gray-600 leading-relaxed">
              Platform üzerindeki tüm içerikler, tasarımlar, logolar ve yazılımlar Yemek KYK'e 
              aittir ve telif hakkı ile korunmaktadır. İzinsiz kopyalama, dağıtma veya 
              değiştirme yasaktır.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Hesap Sonlandırma</h2>
            <p className="text-gray-600 leading-relaxed">
              Kullanım koşullarına aykırı davranan hesaplar önceden haber vermeksizin 
              askıya alınabilir veya silinebilir. Ayrıca kullanıcılar istedikleri zaman 
              hesaplarını silme hakkına sahiptir.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Değişiklikler</h2>
            <p className="text-gray-600 leading-relaxed">
              Bu kullanım koşulları zaman zaman güncellenebilir. Önemli değişiklikler 
              yapıldığında kullanıcılarımıza bildirim yapılacaktır. Platformu kullanmaya 
              devam etmeniz, güncellenmiş koşulları kabul ettiğiniz anlamına gelir.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. İletişim</h2>
            <p className="text-gray-600 leading-relaxed">
              Kullanım koşulları hakkında sorularınız için bizimle iletişime geçebilirsiniz:
            </p>
            <p className="mt-2">
              <a href="mailto:iletisim@yemekkyk.com" className="text-green-600 hover:text-green-700 font-medium">
                iletisim@yemekkyk.com
              </a>
            </p>
          </section>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Kayıt Sayfasına Dön
          </Link>
        </div>
      </main>
    </div>
  );
}

