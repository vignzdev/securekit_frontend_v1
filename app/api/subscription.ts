import api from "@/lib/api";
import { PlanFeatures } from "@/lib/auth";

export interface PlanDescription {
  short: string;
  benefits: string[];
  features: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthly_price: string;
  checks_limit: number;
  lemon_squeezy_variant_id: string | null;
  created_at: string;
  billing_period: "MONTHLY" | "YEARLY";
  features: PlanFeatures;
  plan_description: PlanDescription;
}

export interface GetSubscriptionPlansResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SubscriptionPlan[];
  timestamp: string;
}

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const res = await api.get<GetSubscriptionPlansResponse>(
    "/subscription/plans"
  );
  // Handle response: data can be an array directly or wrapped in an object
  if (Array.isArray(res.data.data)) {
    return res.data.data;
  }
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return [];
};

export interface CreateCheckoutPayload {
  variantId?: string;
  planName: string;
}

export interface CreateCheckoutResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  checkoutUrl?: string;
  data?: {
    checkoutUrl?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export const createCheckout = async (
  payload: CreateCheckoutPayload
): Promise<CreateCheckoutResponse> => {
  const res = await api.post<CreateCheckoutResponse>(
    "/subscription/create-checkout",
    payload
  );
  // Handle response: checkoutUrl can be in data or at root level
  if (res.data.data?.checkoutUrl) {
    return { ...res.data, checkoutUrl: res.data.data.checkoutUrl };
  }
  return res.data;
};
