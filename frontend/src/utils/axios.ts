import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login page if not already on it
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
    }

    // Show a toast notification for other errors
    const errorMessage = error.response?.data?.error || error.message || "An unexpected error occurred";
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export default api;
