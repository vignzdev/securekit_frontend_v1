import api from "@/lib/api";

export interface PlanFeatures {
  geoData: boolean;
  webhooks: boolean;
  analytics: "basic" | "full";
  rateLimit: number;
  teamAccess: boolean;
  customLists: boolean;
  prioritySupport: boolean;
}

export interface Plan {
  id: string;
  name: string;
  monthly_price: string;
  checks_limit: number;
  billing_period: string;
  features: PlanFeatures;
}

export interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  createdAt: string;
  plan: Plan;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  profile_image?: string | null;
  subscription?: Subscription;
}

interface UserResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: UserProfile;
  timestamp: string;
}

// Helper function to check if auth token exists in cookies (no API call)
const hasAuthToken = (): boolean => {
  if (typeof document === "undefined") return false;
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [name] = cookie.trim().split("=");
    if (name === "accessToken") {
      return true;
    }
  }
  return false;
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const res = await api.get<UserResponse>("/users/me");
    // API returns data nested in data.data
    return res.data.data;
  } catch {
    return null;
  }
};

// Lightweight check that only verifies token exists (no API call)
export const hasAuthTokenSync = (): boolean => {
  return hasAuthToken();
};

// Full authentication check that fetches user profile
export const isAuthenticated = async (): Promise<{
  authenticated: boolean;
  user: UserProfile | null;
}> => {
  const user = await getCurrentUser();
  return { authenticated: !!user, user };
};
