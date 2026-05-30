import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies
});

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to construct profile image URL
export const getProfileImageUrl = (profileImg: string | null | undefined): string | null => {
  if (!profileImg) return null;
  
  // If it's already a full URL (http/https)
  if (profileImg.startsWith('http://') || profileImg.startsWith('https://')) {
    // If the URL contains the frontend dev server port (5173), replace it with backend port (3000)
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const backendBaseUrl = apiBase.replace('/api/v1', '');
    
    // Replace any localhost:5173 or similar frontend ports with the backend base URL
    return profileImg.replace(/http:\/\/localhost:\d+/, backendBaseUrl);
  }
  
  // If it's a relative path starting with /, prepend API base URL
  if (profileImg.startsWith('/')) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    return `${apiBase}${profileImg}`;
  }
  
  // If it's just a filename, construct the full API endpoint
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
  return `${apiBase}/user/profile/${profileImg}`;
};

export default axiosInstance;
