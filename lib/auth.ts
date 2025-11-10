import api from "@/lib/api";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  profile_image?: string | null;
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
