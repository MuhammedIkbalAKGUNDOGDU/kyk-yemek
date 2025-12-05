export interface FoodItem {
  id: string;
  name: string;
  description: string;
  calories: number;
  likes: number;
  dislikes: number;
}

export interface Menu {
  id: string;
  title: string;
  type: "breakfast" | "dinner";
  items: FoodItem[];
  totalCalories: number;
  comments: number;
}

export interface City {
  id: string;
  name: string;
}

export const cities: City[] = [
  { id: "istanbul", name: "Istanbul" },
  { id: "ankara", name: "Ankara" },
  { id: "izmir", name: "Izmir" },
  { id: "bursa", name: "Bursa" },
  { id: "antalya", name: "Antalya" },
];

export const mockMenus: Menu[] = [
  {
    id: "1",
    title: "Akşam Yemeği Menüsü",
    type: "dinner",
    totalCalories: 750,
    comments: 24,
    items: [
      {
        id: "1a",
        name: "Mercimek Çorbası",
        description: "Taze ve sıcak servis edilir",
        calories: 150,
        likes: 45,
        dislikes: 3,
      },
      {
        id: "1b",
        name: "Izgara Tavuk",
        description: "Özel sos ile marine edilmiş",
        calories: 350,
        likes: 67,
        dislikes: 8,
      },
      {
        id: "1c",
        name: "Sütlaç",
        description: "Geleneksel lezzet",
        calories: 250,
        likes: 89,
        dislikes: 2,
      },
    ],
  },
  {
    id: "2",
    title: "Kahvaltı Menüsü",
    type: "breakfast",
    totalCalories: 1550,
    comments: 18,
    items: [
      {
        id: "2a",
        name: "Serpme Kahvaltı",
        description: "2 Kişilik Zengin Çeşit",
        calories: 800,
        likes: 120,
        dislikes: 5,
      },
      {
        id: "2b",
        name: "Sucuklu Yumurta",
        description: "Sıcak ve lezzetli",
        calories: 450,
        likes: 95,
        dislikes: 7,
      },
      {
        id: "2c",
        name: "Peynirli Börek",
        description: "Çıtır çıtır",
        calories: 300,
        likes: 78,
        dislikes: 4,
      },
    ],
  },
];

export const sidebarNavItems = [
  { id: "faq", label: "Sıkça Sorulan Sorular", icon: "help-circle" },
  { id: "monthly", label: "Aylık Menü", icon: "calendar" },
  { id: "upload", label: "Menü Yükle", icon: "upload" },
  { id: "login", label: "Giriş Yap", icon: "log-in" },
];
