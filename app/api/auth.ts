import api from "@/lib/api";

interface LoginResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  timestamp: string;
}

// Helper to set a readable cookie for accessToken (in case backend sets httpOnly cookies)
const setAccessTokenCookie = (token: string) => {
  if (typeof document === "undefined") return;
  // Set cookie with 24 hours expiry (adjust based on your token expiry)
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + 24 * 60 * 60 * 1000);
  document.cookie = `accessToken=${encodeURIComponent(
    token
  )}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
};

// Helper to clear the accessToken cookie
const clearAccessTokenCookie = () => {
  if (typeof document === "undefined") return;
  document.cookie = `accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>(
    "/auth/login",
    { email, password },
    { withCredentials: true }
  );

  // Store accessToken in a readable cookie for the interceptor to use
  // This ensures we can send it as Bearer token even if backend cookies are httpOnly
  if (res.data?.data?.accessToken) {
    setAccessTokenCookie(res.data.data.accessToken);
  }

  return res.data;
};

export const register = async (
  email: string,
  password: string,
  name: string
) => {
  const res = await api.post(
    "/auth/register",
    { email, password, name },
    { withCredentials: true }
  );
  return res.data;
};

export const logout = async () => {
  try {
    const res = await api.post("/auth/logout");
    // Clear the accessToken cookie
    clearAccessTokenCookie();
    return res.data;
  } catch (error) {
    // Even if logout fails on backend, clear the cookie locally
    clearAccessTokenCookie();
    throw error;
  }
};

export const initiateGoogleAuth = () => {
  // Redirect to backend Google OAuth endpoint
  // The backend will handle the OAuth flow and redirect to /auth/callback
  // Backend uses FRONTEND_URL environment variable to determine redirect URL
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  // Simply redirect to the backend Google OAuth endpoint
  // Backend will redirect to FRONTEND_URL/auth/callback after authentication
  window.location.href = `${baseURL}/auth/google`;
};
