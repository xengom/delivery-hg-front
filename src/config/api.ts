// API configuration
export const API_URL = process.env.REACT_APP_API_URL || '/api';

// Helper function for API calls
export const apiUrl = (path: string) => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_URL}/${cleanPath}`;
};