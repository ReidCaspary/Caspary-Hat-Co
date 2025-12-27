// API Client for Caspary Hat Co. backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Token management
const getToken = () => localStorage.getItem('auth_token');
const setToken = (token) => localStorage.setItem('auth_token', token);
const removeToken = () => localStorage.removeItem('auth_token');

// Base fetch wrapper with auth
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    ...options.headers,
  };

  // Only add Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Auth API
export const User = {
  async login(email, password) {
    const result = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.token) {
      setToken(result.token);
    }
    return result.user;
  },

  async register(email, password, name) {
    const result = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (result.token) {
      setToken(result.token);
    }
    return result.user;
  },

  async me() {
    try {
      return await apiFetch('/api/auth/me');
    } catch (error) {
      return null;
    }
  },

  logout() {
    removeToken();
  },

  isLoggedIn() {
    return !!getToken();
  }
};

// Contact Inquiry API
export const ContactInquiry = {
  async create(data) {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        if (key === 'file' && data[key] instanceof File) {
          formData.append('file', data[key]);
        } else if (key === 'whiteboard_image') {
          formData.append('whiteboard_image', data[key]);
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    return apiFetch('/api/contact', {
      method: 'POST',
      body: formData,
    });
  },

  async findMany(options = {}) {
    const params = new URLSearchParams();
    if (options.status) params.append('status', options.status);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);

    const result = await apiFetch(`/api/inquiries?${params.toString()}`);
    return result.inquiries || [];
  },

  async findById(id) {
    return apiFetch(`/api/inquiries/${id}`);
  },

  async updateStatus(id, status) {
    return apiFetch(`/api/inquiries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async delete(id) {
    return apiFetch(`/api/inquiries/${id}`, {
      method: 'DELETE',
    });
  }
};

// Blog Post API
export const BlogPost = {
  async findMany(options = {}) {
    const params = new URLSearchParams();
    if (options.category) params.append('category', options.category);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);

    const endpoint = options.includeUnpublished ? '/api/blog/all' : '/api/blog';
    const result = await apiFetch(`${endpoint}?${params.toString()}`);
    return result.posts || [];
  },

  async findBySlug(slug) {
    return apiFetch(`/api/blog/${slug}`);
  },

  async create(data) {
    return apiFetch('/api/blog', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return apiFetch(`/api/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id) {
    return apiFetch(`/api/blog/${id}`, {
      method: 'DELETE',
    });
  }
};

// Newsletter Subscriber API
export const NewsletterSubscriber = {
  async subscribe(email) {
    return apiFetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async unsubscribe(email) {
    return apiFetch('/api/newsletter/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async findMany(options = {}) {
    const params = new URLSearchParams();
    if (options.active !== undefined) params.append('active', options.active);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);

    const result = await apiFetch(`/api/newsletter/subscribers?${params.toString()}`);
    return result.subscribers || [];
  },

  async delete(id) {
    return apiFetch(`/api/newsletter/subscribers/${id}`, {
      method: 'DELETE',
    });
  }
};

// Image/Media API
export const Image = {
  async findMany(options = {}) {
    const params = new URLSearchParams();
    if (options.category) params.append('category', options.category);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);

    const result = await apiFetch(`/api/images?${params.toString()}`);
    return result.images || [];
  },

  async findById(id) {
    return apiFetch(`/api/images/${id}`);
  },

  async upload(file, options = {}) {
    const formData = new FormData();
    formData.append('image', file);
    if (options.alt_text) formData.append('alt_text', options.alt_text);
    if (options.category) formData.append('category', options.category);

    return apiFetch('/api/images/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async uploadMultiple(files, options = {}) {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    if (options.category) formData.append('category', options.category);

    return apiFetch('/api/images/upload-multiple', {
      method: 'POST',
      body: formData,
    });
  },

  async update(id, data) {
    return apiFetch(`/api/images/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id) {
    return apiFetch(`/api/images/${id}`, {
      method: 'DELETE',
    });
  }
};

// Designer API (for hat designer tool)
export const DesignerAPI = {
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    return apiFetch('/api/designer/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async removeBackground(publicId) {
    return apiFetch('/api/designer/remove-background', {
      method: 'POST',
      body: JSON.stringify({ publicId }),
    });
  }
};

// Hat Configuration API (for admin and designer)
export const HatConfig = {
  // Public endpoint - get full config for designer
  async getConfig() {
    const response = await fetch(`${API_URL}/api/hat-config`);
    if (!response.ok) {
      throw new Error('Failed to fetch hat configuration');
    }
    return response.json();
  },

  // Admin endpoints - Hat Types
  async getHatTypes() {
    return apiFetch('/api/hat-config/hat-types');
  },

  async createHatType(data) {
    return apiFetch('/api/hat-config/hat-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateHatType(id, data) {
    return apiFetch(`/api/hat-config/hat-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteHatType(id) {
    return apiFetch(`/api/hat-config/hat-types/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin endpoints - Color Presets
  async getColorPresets() {
    return apiFetch('/api/hat-config/colors');
  },

  async createColorPreset(data) {
    return apiFetch('/api/hat-config/colors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateColorPreset(id, data) {
    return apiFetch(`/api/hat-config/colors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteColorPreset(id) {
    return apiFetch(`/api/hat-config/colors/${id}`, {
      method: 'DELETE',
    });
  },

  async reorderColorPresets(order) {
    return apiFetch('/api/hat-config/colors/reorder', {
      method: 'PUT',
      body: JSON.stringify({ order }),
    });
  },

  // Admin endpoints - Color Combinations
  async getColorCombinations() {
    return apiFetch('/api/hat-config/combinations');
  },

  async createColorCombination(data) {
    return apiFetch('/api/hat-config/combinations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateColorCombination(id, data) {
    return apiFetch(`/api/hat-config/combinations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteColorCombination(id) {
    return apiFetch(`/api/hat-config/combinations/${id}`, {
      method: 'DELETE',
    });
  }
};

// File upload utility (for contact form attachments)
export const UploadFile = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const result = await apiFetch('/api/images/upload', {
    method: 'POST',
    body: formData,
  });

  return { file_url: result.url };
};

export default {
  User,
  ContactInquiry,
  BlogPost,
  NewsletterSubscriber,
  Image,
  DesignerAPI,
  HatConfig,
  UploadFile,
};
