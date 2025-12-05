const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Admin token yönetimi
const getAdminToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminToken');
  }
  return null;
};

export const setAdminToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminToken', token);
  }
};

export const removeAdminToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }
};

export const getStoredAdmin = () => {
  if (typeof window !== 'undefined') {
    const adminStr = localStorage.getItem('adminUser');
    if (adminStr) {
      try {
        return JSON.parse(adminStr);
      } catch {
        return null;
      }
    }
  }
  return null;
};

export const setStoredAdmin = (admin: AdminUser) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminUser', JSON.stringify(admin));
  }
};

export const hasAdminToken = () => {
  return !!getAdminToken();
};

// Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface Menu {
  id: string;
  cityId: string;
  date: string;
  mealType: 'breakfast' | 'dinner';
  items: string[];
  totalCalories: number;
  status: 'draft' | 'published';
  createdBy?: string;
  createdAt: string;
  publishedAt?: string;
}

export interface Food {
  id: string;
  name: string;
  likes: number;
  dislikes: number;
  createdAt: string;
}

// API isteği gönder
async function adminFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAdminToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Bir hata oluştu');
  }

  return data;
}

// Admin Auth API
export const adminAuthAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const data = await adminFetch('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.token) {
      setAdminToken(data.token);
    }
    if (data.admin) {
      setStoredAdmin(data.admin);
    }
    return data;
  },

  logout: async () => {
    try {
      await adminFetch('/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    removeAdminToken();
  },

  getMe: async (): Promise<{ admin: AdminUser }> => {
    return await adminFetch('/admin/me');
  },
};

// Menu API
export const menuAPI = {
  // Tüm menüleri getir (admin)
  getAll: async (params?: {
    city?: string;
    year?: number;
    month?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ menus: Menu[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
    const searchParams = new URLSearchParams();
    if (params?.city) searchParams.append('city', params.city);
    if (params?.year) searchParams.append('year', params.year.toString());
    if (params?.month) searchParams.append('month', params.month.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    return await adminFetch(`/menus?${searchParams.toString()}`);
  },

  // Tek menü getir
  getById: async (id: string): Promise<{ menu: Menu }> => {
    return await adminFetch(`/menus/${id}`);
  },

  // Yeni menü oluştur
  create: async (menu: {
    cityId: string;
    date: string;
    mealType: 'breakfast' | 'dinner';
    items: string[];
    totalCalories: number;
  }): Promise<{ message: string; menu: Menu }> => {
    return await adminFetch('/menus', {
      method: 'POST',
      body: JSON.stringify(menu),
    });
  },

  // Toplu menü yükle
  bulkUpload: async (data: {
    city: string;
    year: number;
    month: number;
    menus: Array<{
      day: number;
      breakfast?: { items: string[]; calories: number };
      dinner?: { items: string[]; calories: number };
    }>;
  }): Promise<{ message: string; results: { created: number; skipped: number; errors: string[]; newFoods: string[] } }> => {
    return await adminFetch('/menus/bulk-upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Menü güncelle
  update: async (id: string, data: { items?: string[]; totalCalories?: number }): Promise<{ message: string; menu: Menu }> => {
    return await adminFetch(`/menus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Menü yayınla
  publish: async (id: string): Promise<{ message: string; menu: Menu }> => {
    return await adminFetch(`/menus/${id}/publish`, { method: 'POST' });
  },

  // Toplu yayınla (ID listesiyle)
  bulkPublish: async (ids: string[]): Promise<{ message: string; publishedIds: string[] }> => {
    return await adminFetch('/menus/bulk-publish', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  // Aylık toplu yayınla
  publishMonth: async (data: { city: string; year: number; month: number }): Promise<{ message: string; publishedCount: number }> => {
    return await adminFetch('/menus/publish-month', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Menü sil
  delete: async (id: string): Promise<{ message: string }> => {
    return await adminFetch(`/menus/${id}`, { method: 'DELETE' });
  },
};

// Food API
export const foodAPI = {
  // Tüm yemekleri getir (admin)
  getAll: async (params?: {
    search?: string;
    sort?: string;
    order?: string;
    page?: number;
    limit?: number;
  }): Promise<{ foods: Food[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.order) searchParams.append('order', params.order);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    return await adminFetch(`/foods?${searchParams.toString()}`);
  },
};

