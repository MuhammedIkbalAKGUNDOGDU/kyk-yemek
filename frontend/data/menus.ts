export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
}

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
  comments: Comment[];
}

export interface City {
  id: string;
  name: string;
}

// Tüm Türkiye illeri
export const cities: City[] = [
  { id: "adana", name: "Adana" },
  { id: "adiyaman", name: "Adıyaman" },
  { id: "afyonkarahisar", name: "Afyonkarahisar" },
  { id: "agri", name: "Ağrı" },
  { id: "aksaray", name: "Aksaray" },
  { id: "amasya", name: "Amasya" },
  { id: "ankara", name: "Ankara" },
  { id: "antalya", name: "Antalya" },
  { id: "ardahan", name: "Ardahan" },
  { id: "artvin", name: "Artvin" },
  { id: "aydin", name: "Aydın" },
  { id: "balikesir", name: "Balıkesir" },
  { id: "bartin", name: "Bartın" },
  { id: "batman", name: "Batman" },
  { id: "bayburt", name: "Bayburt" },
  { id: "bilecik", name: "Bilecik" },
  { id: "bingol", name: "Bingöl" },
  { id: "bitlis", name: "Bitlis" },
  { id: "bolu", name: "Bolu" },
  { id: "burdur", name: "Burdur" },
  { id: "bursa", name: "Bursa" },
  { id: "canakkale", name: "Çanakkale" },
  { id: "cankiri", name: "Çankırı" },
  { id: "corum", name: "Çorum" },
  { id: "denizli", name: "Denizli" },
  { id: "diyarbakir", name: "Diyarbakır" },
  { id: "duzce", name: "Düzce" },
  { id: "edirne", name: "Edirne" },
  { id: "elazig", name: "Elazığ" },
  { id: "erzincan", name: "Erzincan" },
  { id: "erzurum", name: "Erzurum" },
  { id: "eskisehir", name: "Eskişehir" },
  { id: "gaziantep", name: "Gaziantep" },
  { id: "giresun", name: "Giresun" },
  { id: "gumushane", name: "Gümüşhane" },
  { id: "hakkari", name: "Hakkari" },
  { id: "hatay", name: "Hatay" },
  { id: "igdir", name: "Iğdır" },
  { id: "isparta", name: "Isparta" },
  { id: "istanbul", name: "İstanbul" },
  { id: "izmir", name: "İzmir" },
  { id: "kahramanmaras", name: "Kahramanmaraş" },
  { id: "karabuk", name: "Karabük" },
  { id: "karaman", name: "Karaman" },
  { id: "kars", name: "Kars" },
  { id: "kastamonu", name: "Kastamonu" },
  { id: "kayseri", name: "Kayseri" },
  { id: "kilis", name: "Kilis" },
  { id: "kirikkale", name: "Kırıkkale" },
  { id: "kirklareli", name: "Kırklareli" },
  { id: "kirsehir", name: "Kırşehir" },
  { id: "kocaeli", name: "Kocaeli" },
  { id: "konya", name: "Konya" },
  { id: "kutahya", name: "Kütahya" },
  { id: "malatya", name: "Malatya" },
  { id: "manisa", name: "Manisa" },
  { id: "mardin", name: "Mardin" },
  { id: "mersin", name: "Mersin" },
  { id: "mugla", name: "Muğla" },
  { id: "mus", name: "Muş" },
  { id: "nevsehir", name: "Nevşehir" },
  { id: "nigde", name: "Niğde" },
  { id: "ordu", name: "Ordu" },
  { id: "osmaniye", name: "Osmaniye" },
  { id: "rize", name: "Rize" },
  { id: "sakarya", name: "Sakarya" },
  { id: "samsun", name: "Samsun" },
  { id: "sanliurfa", name: "Şanlıurfa" },
  { id: "siirt", name: "Siirt" },
  { id: "sinop", name: "Sinop" },
  { id: "sirnak", name: "Şırnak" },
  { id: "sivas", name: "Sivas" },
  { id: "tekirdag", name: "Tekirdağ" },
  { id: "tokat", name: "Tokat" },
  { id: "trabzon", name: "Trabzon" },
  { id: "tunceli", name: "Tunceli" },
  { id: "usak", name: "Uşak" },
  { id: "van", name: "Van" },
  { id: "yalova", name: "Yalova" },
  { id: "yozgat", name: "Yozgat" },
  { id: "zonguldak", name: "Zonguldak" },
];

export const mockMenus: Menu[] = [
  {
    id: "1",
    title: "Akşam Yemeği Menüsü",
    type: "dinner",
    totalCalories: 750,
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
    comments: [
      {
        id: "c1",
        author: "Ahmet Y",
        text: "Bugunki menu cok guzeldi elinize saglik",
        timestamp: new Date(2024, 11, 5, 19, 30),
      },
      {
        id: "c2",
        author: "Zeynep K",
        text: "Mercimek corbasi harikaydı",
        timestamp: new Date(2024, 11, 5, 20, 15),
      },
      {
        id: "c3",
        author: "Mehmet A",
        text: "Sutlac biraz daha sekerli olabilirdi",
        timestamp: new Date(2024, 11, 5, 20, 45),
      },
    ],
  },
  {
    id: "2",
    title: "Kahvaltı Menüsü",
    type: "breakfast",
    totalCalories: 1550,
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
    comments: [
      {
        id: "c4",
        author: "Elif S",
        text: "Kahvalti cesitleri cok zengin tesekkurler",
        timestamp: new Date(2024, 11, 5, 8, 30),
      },
      {
        id: "c5",
        author: "Can D",
        text: "Borek cok lezzetliydi 10 uzerinden 10",
        timestamp: new Date(2024, 11, 5, 9, 0),
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
