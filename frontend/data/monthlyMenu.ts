import type { Comment } from "./menus";

export interface DailyMenu {
  date: number;
  day: string;
  breakfast: string[];
  dinner: string[];
  comments: Comment[];
}

// Dinamik olarak bu ayı ve yılı al
export function getCurrentMonth(): string {
  return new Date().toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
  });
}

// Ayın gün sayısını al
export function getDaysInMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

// Günün adını al
function getDayName(date: Date): string {
  return date.toLocaleDateString("tr-TR", { weekday: "long" });
}

// Dinamik aylık menü oluştur
export function generateMonthlyMenu(): DailyMenu[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = getDaysInMonth();

  const breakfastOptions = [
    ["Beyaz Peynir", "Zeytin", "Domates", "Yumurta", "Çay"],
    ["Kaşar Peynir", "Reçel", "Tereyağı", "Ekmek", "Çay"],
    ["Sucuklu Yumurta", "Peynir", "Zeytin", "Domates", "Çay"],
    ["Menemen", "Beyaz Peynir", "Bal", "Ekmek", "Çay"],
    ["Haşlanmış Yumurta", "Zeytin", "Domates", "Peynir", "Çay"],
    ["Poğaça", "Kaşar Peynir", "Zeytin", "Domates", "Çay"],
    ["Simit", "Peynir", "Zeytin", "Yumurta", "Çay"],
    ["Börek", "Beyaz Peynir", "Zeytin", "Domates", "Çay"],
    ["Gözleme", "Ayran", "Zeytin", "Domates", "Çay"],
    ["Kahvaltı Tabağı", "Yumurta", "Peynir", "Zeytin", "Çay"],
  ];

  const dinnerOptions = [
    ["Mercimek Çorbası", "Izgara Köfte", "Pilav", "Yoğurt"],
    ["Ezogelin Çorbası", "Kuru Fasulye", "Bulgur Pilavı", "Cacık"],
    ["Domates Çorbası", "Tavuk Sote", "Makarna", "Ayran"],
    ["Yayla Çorbası", "Etli Nohut", "Pirinç Pilavı", "Salata"],
    ["Tarhana Çorbası", "Izgara Tavuk", "Patates Püresi", "Yoğurt"],
    ["Mercimek Çorbası", "Balık", "Pilav", "Salata"],
    ["Şehriye Çorbası", "Karnıyarık", "Bulgur Pilavı", "Cacık"],
    ["Ezogelin Çorbası", "Döner", "Pilav", "Ayran"],
    ["Mercimek Çorbası", "Tas Kebabı", "Pirinç Pilavı", "Yoğurt"],
    ["Domates Çorbası", "Sebzeli Tavuk", "Makarna", "Salata"],
  ];

  const menu: DailyMenu[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayName = getDayName(date);
    
    menu.push({
      date: day,
      day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      breakfast: breakfastOptions[(day - 1) % breakfastOptions.length],
      dinner: dinnerOptions[(day - 1) % dinnerOptions.length],
      comments: [],
    });
  }

  return menu;
}

// Statik export için (ilk yükleme)
export const monthlyMenu = generateMonthlyMenu();
export const currentMonth = getCurrentMonth();
