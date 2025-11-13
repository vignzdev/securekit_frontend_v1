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

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const res = await api.get<UserResponse>("/users/me");
    // API returns data nested in data.data
    return res.data.data;
  } catch {
    return null;
  }
};

export const isAuthenticated = async (): Promise<{
  authenticated: boolean;
  user: UserProfile | null;
}> => {
  const user = await getCurrentUser();
  return { authenticated: !!user, user };
};
