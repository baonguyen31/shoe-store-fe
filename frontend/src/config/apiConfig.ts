export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://shoe-store-be-o0fn.onrender.com',
};

export const API_ENDPOINTS = {
  AUTH: {
    ME: `${API_CONFIG.BASE_URL}/api/auth/me`,
    LOGIN: `${API_CONFIG.BASE_URL}/login`,
    REGISTER: `${API_CONFIG.BASE_URL}/register/customers`,
    FORGOT_PASSWORD: `${API_CONFIG.BASE_URL}/forgot-password`,
  },
  PRODUCTS: {
    LIST: `${API_CONFIG.BASE_URL}/api/products`,
    BEST_SELLERS: `${API_CONFIG.BASE_URL}/api/products/best-sellers`,
  },
  EMPLOYERS: {
    LIST: `${API_CONFIG.BASE_URL}/api/employers`,
  },
  PAYMENT: {
    MOMO_CREATE: `${API_CONFIG.BASE_URL}/api/payment/momo/create_payment`,
    MOMO_SYNC: `${API_CONFIG.BASE_URL}/api/payment/momo/sync`,
  },
  CUSTOMERS: {
    DETAIL: (id: string | number) => `${API_CONFIG.BASE_URL}/api/customers/${id}`,
  },
};
