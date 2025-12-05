"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { AdBanner } from "@/components/AdBanner";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: "1",
    question: "Bütün yurtlarda menüler aynı mı?",
    answer:
      "Hayır, menüler her il için ayrı ayrı hazırlanmaktadır. Her şehirdeki yurtların yemek listesi farklılık gösterebilir. Bu nedenle kendi ilinizi seçerek size özel menüyü görüntülemenizi öneririz.",
  },
  {
    id: "2",
    question: "Yemekhanede burada belirtilenden farklı bir yemek var, sebebi nedir?",
    answer:
      "Yemeklerin tükenmesi durumunda veya yemek firmasının ekstra bir yemek sunması sebebiyle yemekhanede farklı bir yemekle karşılaşabilirsiniz. Özellikle akşam geç saatlerde bu durumla karşılaşma ihtimaliniz daha yüksektir. Anlayışınız için teşekkür ederiz.",
  },
  {
    id: "3",
    question: "Yorum yapabilmek için neden üye olmam gerekiyor?",
    answer:
      "Kaynağı belirsiz yorumların önüne geçmek ve daha kaliteli bir ortam sağlamak amacıyla yorum yapabilmek için üyelik zorunluluğu bulunmaktadır. Ayrıca üyelerimizin gizliliğini korumak adına yorumlarda yalnızca kullanıcı adınız (nick) görüntülenir. Ancak bu durum her şeyi yazabileceğiniz anlamına gelmez. Siteye eklediğiniz tüm yorumların yasal sorumluluğu size aittir.",
  },
  {
    id: "4",
    question: "Yorum yapma kuralları nelerdir?",
    answer:
      "Irk, cinsiyet, din, dil, milliyet, yaş veya herhangi bir kişisel özellik üzerinden ayrımcılık içeren, nefret söylemi barındıran ve argo ifadeler içeren yorumlar kesinlikle yasaktır. Bu kurallara uymayan yorumlar silinecek ve gerekli durumlarda hesaplar askıya alınacaktır.",
  },
  {
    id: "5",
    question: "Sitenizde neden tüm illerin yemek listesi bulunmuyor?",
    answer:
      "Maalesef tüm illerin yemek listesine erişim imkanımız bulunmamaktadır. Eğer elinizde farklı bir ile ait güncel yemek listesi varsa, menü yükleme sayfasından veya iletisim@kykyemek.com adresinden bizimle paylaşabilirsiniz. Katkılarınız için şimdiden teşekkür ederiz!",
  },
  {
    id: "6",
    question: "Menüler ne zaman güncellenir?",
    answer:
      "Menüler genellikle her ayın sonunda bir sonraki ay için güncellenir. Günlük değişiklikler olması durumunda en kısa sürede sitemize yansıtılmaktadır. Güncel bilgiler için sitemizi düzenli takip etmenizi öneririz.",
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-gray-50"
      >
        <span className="text-base font-medium text-gray-900">{item.question}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180 text-green-500"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-5">
            <p className="text-sm leading-relaxed text-gray-600">{item.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [selectedCity, setSelectedCity] = useState("istanbul");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />

      {/* Main Layout */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:w-60 lg:shrink-0">
            <div className="sticky top-[80px]">
              <Sidebar activeItem="faq" />
            </div>
          </div>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            {/* Page Title */}
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <HelpCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                Sıkça Sorulan Sorular
              </h1>
              <p className="mt-2 text-gray-500">
                Merak ettiğiniz soruların cevaplarını burada bulabilirsiniz
              </p>
            </div>

            {/* FAQ List */}
            <div className="flex flex-col gap-4">
              {faqItems.map((item) => (
                <FAQAccordion key={item.id} item={item} />
              ))}
            </div>

            {/* Contact Section */}
            <div className="mt-10 rounded-2xl bg-green-50 p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Sorunuz hala cevapsız mı?
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Bize e-posta göndererek sorularınızı iletebilirsiniz.
              </p>
              <a
                href="mailto:iletisim@kykyemek.com"
                className="inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-600"
              >
                iletisim@kykyemek.com
              </a>
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

