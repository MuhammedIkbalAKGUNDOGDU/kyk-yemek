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
  breakfastId: string | null;
  dinnerId: string | null;
}

// Bugünün menülerini getir
export async function getTodayMenus(city: string): Promise<PublicMenu[]> {
  // Yerel tarih kullan (UTC değil)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  
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

// Token al (localStorage'dan)
function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// Yemek beğen
export async function likeFood(name: string): Promise<{ likes: number; dislikes: number; userVote: string | null }> {
  const token = getToken();
  if (!token) {
    throw new Error('Giriş yapmalısınız');
  }

  const response = await fetch(`${API_URL}/foods/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Beğeni işlemi başarısız');
  }

  return response.json();
}

// Yemek beğenme
export async function dislikeFood(name: string): Promise<{ likes: number; dislikes: number; userVote: string | null }> {
  const token = getToken();
  if (!token) {
    throw new Error('Giriş yapmalısınız');
  }

  const response = await fetch(`${API_URL}/foods/dislike`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Beğenmeme işlemi başarısız');
  }

  return response.json();
}

// Kullanıcının oyunu al
export async function getUserVote(name: string): Promise<string | null> {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/foods/user-vote?name=${encodeURIComponent(name)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.userVote;
  } catch {
    return null;
  }
}

// Toplu kullanıcı oylarını al
export async function getBulkUserVotes(names: string[]): Promise<Record<string, string | null>> {
  const token = getToken();
  if (!token) {
    return {};
  }

  // Her yemek için ayrı ayrı sor (bulk endpoint yoksa)
  const result: Record<string, string | null> = {};
  
  await Promise.all(
    names.map(async (name) => {
      result[name] = await getUserVote(name);
    })
  );

  return result;
}

// =============================================
// YORUM API
// =============================================

export interface CommentData {
  id: string;
  text: string;
  author: string;
  avatarId: string;
  createdAt: string;
}

// Menü yorumlarını getir (şehir + tarih + öğün ile)
export async function getMenuComments(
  city: string,
  date: string,
  mealType: 'breakfast' | 'dinner'
): Promise<{ menuId: string | null; comments: CommentData[] }> {
  const response = await fetch(
    `${API_URL}/comments/by-menu?city=${city}&date=${date}&mealType=${mealType}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    return { menuId: null, comments: [] };
  }

  return response.json();
}

// Menü ID ile yorumları getir
export async function getCommentsByMenuId(menuId: string): Promise<CommentData[]> {
  const response = await fetch(`${API_URL}/comments/menu/${menuId}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.comments || [];
}

// Yorum ekle
export async function addComment(
  menuId: string,
  text: string
): Promise<CommentData> {
  const token = getToken();
  if (!token) {
    throw new Error('Giriş yapmalısınız');
  }

  const response = await fetch(`${API_URL}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ menuId, text }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Yorum eklenemedi');
  }

  const data = await response.json();
  return data.comment;
}

// Yorum sil
export async function deleteComment(commentId: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Giriş yapmalısınız');
  }

  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Yorum silinemedi');
  }
}

// Yorum sayısını getir
export async function getCommentCount(menuId: string): Promise<number> {
  const response = await fetch(`${API_URL}/comments/menu/${menuId}/count`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    return 0;
  }

  const data = await response.json();
  return data.count || 0;
}

