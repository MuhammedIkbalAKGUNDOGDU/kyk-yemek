const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Token'ı localStorage'dan al
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Token'ı localStorage'a kaydet
export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

// Token'ı sil
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Kullanıcı bilgisini localStorage'a kaydet
export const setStoredUser = (user: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Kullanıcı bilgisini localStorage'dan al
export const getStoredUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
};

// Kullanıcı bilgisini sil
export const removeStoredUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

// API isteği gönder
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  
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

// User tipi
export interface User {
  id: string;
  fullName: string;
  nickname: string;
  email: string;
  cityId: string;
  avatarId: string | null;
  role: string;
  isVerified?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

// Token var mı kontrol et
export const hasToken = () => {
  return !!getToken();
};

// AUTH API
export const authAPI = {
  // Kayıt ol
  register: async (userData: {
    fullName: string;
    nickname: string;
    email: string;
    password: string;
    cityId: string;
  }) => {
    const data = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      setToken(data.token);
    }
    if (data.user) {
      setStoredUser(data.user);
    }
    return data;
  },

  // Giriş yap
  login: async (credentials: { email: string; password: string }) => {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.token) {
      setToken(data.token);
    }
    if (data.user) {
      setStoredUser(data.user);
    }
    return data;
  },

  // Çıkış yap
  logout: async () => {
    try {
      await fetchAPI('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    removeToken();
    removeStoredUser();
  },

  // Aktif kullanıcı bilgisi
  getMe: async (): Promise<{ user: User }> => {
    const data = await fetchAPI('/auth/me');
    if (data.user) {
      setStoredUser(data.user);
    }
    return data;
  },

  // Profil güncelle (e-posta hariç)
  updateProfile: async (profileData: {
    fullName?: string;
    nickname?: string;
    cityId?: string;
    avatarId?: string;
  }): Promise<{ message: string; user: User }> => {
    const data = await fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    if (data.user) {
      setStoredUser(data.user);
    }
    return data;
  },

  // Şifre değiştir
  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    return await fetchAPI('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    });
  },

  // Kullanıcının yorumlarını getir
  getMyComments: async (): Promise<{ comments: UserComment[] }> => {
    return await fetchAPI('/auth/my-comments');
  },

  // Kullanıcının beğenilerini getir
  getMyVotes: async (): Promise<{
    likes: UserVote[];
    dislikes: UserVote[];
    totalLikes: number;
    totalDislikes: number;
  }> => {
    return await fetchAPI('/auth/my-votes');
  },

  // Kullanıcı istatistikleri
  getMyStats: async (): Promise<{
    commentCount: number;
    likeCount: number;
    dislikeCount: number;
  }> => {
    return await fetchAPI('/auth/my-stats');
  },
};

// Kullanıcı yorumu tipi
export interface UserComment {
  id: string;
  text: string;
  createdAt: string;
  menuId: string;
  cityId: string;
  menuDate: string;
  mealType: 'breakfast' | 'dinner';
}

// Kullanıcı beğeni tipi
export interface UserVote {
  foodId: string;
  foodName: string;
  totalLikes: number;
  totalDislikes: number;
  votedAt: string;
}

export default fetchAPI;

