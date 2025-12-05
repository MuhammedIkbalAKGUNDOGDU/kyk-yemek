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
    return data;
  },

  // Çıkış yap
  logout: async () => {
    await fetchAPI('/auth/logout', { method: 'POST' });
    removeToken();
  },

  // Aktif kullanıcı bilgisi
  getMe: async () => {
    return await fetchAPI('/auth/me');
  },
};

export default fetchAPI;

