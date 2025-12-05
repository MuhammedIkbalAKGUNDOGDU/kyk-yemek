"use client";

import Link from "next/link";
import { X, ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
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
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gizlilik Politikası</h1>
          <p className="text-gray-500">Son güncelleme: Aralık 2024</p>
        </div>

        {/* Privacy Content */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Giriş</h2>
            <p className="text-gray-600 leading-relaxed">
              Yemek KYK olarak gizliliğinize önem veriyoruz. Bu gizlilik politikası, 
              platformumuzu kullanırken topladığımız kişisel verilerin nasıl işlendiğini, 
              saklandığını ve korunduğunu açıklamaktadır.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Toplanan Veriler</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Platformumuzu kullanırken aşağıdaki veriler toplanabilir:
            </p>
            <div className="space-y-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <h3 className="font-medium text-gray-900 mb-2">Hesap Bilgileri</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                  <li>Kullanıcı adı (nickname)</li>
                  <li>E-posta adresi</li>
                  <li>Şifre (şifrelenmiş olarak)</li>
                  <li>Bulunduğunuz şehir</li>
                </ul>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <h3 className="font-medium text-gray-900 mb-2">Kullanım Verileri</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                  <li>Ziyaret edilen sayfalar</li>
                  <li>Yapılan yorumlar</li>
                  <li>Beğeni/beğenmeme oyları</li>
                  <li>Tercih edilen şehir</li>
                </ul>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <h3 className="font-medium text-gray-900 mb-2">Teknik Veriler</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                  <li>IP adresi</li>
                  <li>Tarayıcı türü ve sürümü</li>
                  <li>Cihaz bilgileri</li>
                  <li>Çerez verileri</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Verilerin Kullanım Amaçları</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Topladığımız veriler aşağıdaki amaçlarla kullanılmaktadır:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Hesap oluşturma ve kimlik doğrulama</li>
              <li>Şehrinize özel menülerin gösterilmesi</li>
              <li>Platform güvenliğinin sağlanması</li>
              <li>Hizmet kalitesinin iyileştirilmesi</li>
              <li>Kullanıcı desteği sağlanması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Veri Güvenliği</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Verilerinizin güvenliği için aşağıdaki önlemler alınmaktadır:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>SSL şifreleme ile güvenli veri iletimi</li>
              <li>Şifrelerin hash algoritması ile saklanması</li>
              <li>Düzenli güvenlik güncellemeleri</li>
              <li>Erişim kontrolü ve yetkilendirme</li>
              <li>Güvenlik duvarı koruması</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Çerezler (Cookies)</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Platformumuz, daha iyi bir deneyim sunmak için çerezler kullanmaktadır:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Zorunlu Çerezler:</strong> Platformun çalışması için gerekli</li>
              <li><strong>Tercih Çerezleri:</strong> Şehir seçimi gibi tercihlerinizi hatırlar</li>
              <li><strong>Analitik Çerezler:</strong> Platform kullanımını anlamamıza yardımcı olur</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Tarayıcı ayarlarınızdan çerezleri yönetebilir veya devre dışı bırakabilirsiniz.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Veri Paylaşımı</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Kişisel verileriniz aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Açık rızanızın bulunması</li>
              <li>Yasal zorunluluklar (mahkeme kararı vb.)</li>
              <li>Hizmet sağlayıcılarımız (güvenli şekilde)</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              <strong>Not:</strong> Verileriniz hiçbir koşulda reklam amaçlı satılmaz veya paylaşılmaz.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Kullanıcı Hakları</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              KVKK kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenen verileriniz hakkında bilgi talep etme</li>
              <li>Verilerin işlenme amacını öğrenme</li>
              <li>Eksik veya yanlış verilerin düzeltilmesini isteme</li>
              <li>Verilerin silinmesini veya yok edilmesini isteme</li>
              <li>İşlemenin kısıtlanmasını isteme</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Veri Saklama Süresi</h2>
            <p className="text-gray-600 leading-relaxed">
              Kişisel verileriniz, hizmetlerimizi kullandığınız süre boyunca ve hesabınızı 
              silmenizin ardından yasal yükümlülüklerimiz çerçevesinde makul bir süre 
              saklanır. Hesap silme talebiniz üzerine verileriniz 30 gün içinde silinir.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Çocukların Gizliliği</h2>
            <p className="text-gray-600 leading-relaxed">
              Platformumuz 13 yaş altındaki çocuklara yönelik değildir. 13 yaş altındaki 
              kullanıcılardan bilerek kişisel veri toplamıyoruz. Ebeveynler veya veliler, 
              çocuklarının platformumuzu kullanması durumunda bizimle iletişime geçebilir.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Politika Değişiklikleri</h2>
            <p className="text-gray-600 leading-relaxed">
              Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler 
              yapıldığında e-posta veya platform üzerinden bildirim yapılacaktır. 
              Güncellenmiş politikayı düzenli olarak kontrol etmenizi öneririz.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. İletişim</h2>
            <p className="text-gray-600 leading-relaxed">
              Gizlilik politikası hakkında sorularınız veya veri talepleriniz için:
            </p>
            <div className="mt-4 rounded-xl bg-green-50 p-4">
              <p className="text-sm text-gray-700">
                <strong>E-posta:</strong>{" "}
                <a href="mailto:gizlilik@yemekkyk.com" className="text-green-600 hover:text-green-700">
                  gizlilik@yemekkyk.com
                </a>
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <strong>Genel İletişim:</strong>{" "}
                <a href="mailto:iletisim@yemekkyk.com" className="text-green-600 hover:text-green-700">
                  iletisim@yemekkyk.com
                </a>
              </p>
            </div>
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

