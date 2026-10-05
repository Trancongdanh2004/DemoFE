import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Bộ đón chặn yêu cầu (Request interceptor): đính kèm mã xác thực Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Bộ đón chặn phản hồi (Response interceptor): xử lý lỗi 401 khi hết phiên đăng nhập
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/admin/login')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      // Nếu đang ở trang quản trị, chuyển hướng người dùng về trang đăng nhập
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);
