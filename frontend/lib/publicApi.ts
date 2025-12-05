const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Types
export interface PublicMenu {
  id: string;
  cityId: string;
  date: string;
  mealType: 'breakfast' | 'dinner';
  items: string[];
  totalCalories: number;
}

export interface DailyMenu {
  date: string;
  breakfast: { items: string[]; calories: number } | null;
  dinner: { items: string[]; calories: number } | null;
}

// Bugünün menülerini getir
export async function getTodayMenus(city: string): Promise<PublicMenu[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const response = await fetch(
    `${API_URL}/menus/public?city=${city}&date=${today}`,
    { cache: 'no-store' }
  );
  
  if (!response.ok) {
    throw new Error('Menüler alınamadı');
  }
  
  const data = await response.json();
  return data.menus || [];
}

// Aylık menüleri getir
export async function getMonthlyMenus(
  city: string, 
  year: number, 
  month: number
): Promise<DailyMenu[]> {
  const response = await fetch(
    `${API_URL}/menus/public/monthly?city=${city}&year=${year}&month=${month}`,
    { cache: 'no-store' }
  );
  
  if (!response.ok) {
    throw new Error('Aylık menü alınamadı');
  }
  
  const data = await response.json();
  return data.menus || [];
}

// Yemek beğeni bilgisi
export async function getFoodStats(name: string): Promise<{ likes: number; dislikes: number }> {
  const response = await fetch(
    `${API_URL}/foods/stats?name=${encodeURIComponent(name)}`,
    { cache: 'no-store' }
  );
  
  if (!response.ok) {
    return { likes: 0, dislikes: 0 };
  }
  
  const data = await response.json();
  return { likes: data.likes || 0, dislikes: data.dislikes || 0 };
}

// Toplu yemek beğeni bilgisi
export async function getBulkFoodStats(
  names: string[]
): Promise<Record<string, { likes: number; dislikes: number }>> {
  const response = await fetch(`${API_URL}/foods/bulk-stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ names }),
  });
  
  if (!response.ok) {
    return {};
  }
  
  const data = await response.json();
  const result: Record<string, { likes: number; dislikes: number }> = {};
  
  if (data.stats) {
    data.stats.forEach((stat: { name: string; likes: number; dislikes: number }) => {
      result[stat.name] = { likes: stat.likes, dislikes: stat.dislikes };
    });
  }
  
  return result;
}

