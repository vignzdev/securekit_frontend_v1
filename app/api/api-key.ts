import api from "@/lib/api";

export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key_preview?: string;
  api_key_hash?: string;
  is_active: boolean;
  usage_count?: number;
  last_used_at?: string | null;
  created_at: string;
  updated_at?: string;
  revoked_at?: string | null;
}

export interface CreateApiKeyPayload {
  name: string;
  description: string;
}

export interface CreateApiKeyResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    api_key?: string;
    id?: string;
    name?: string;
    [key: string]: any;
  };
  api_key?: string;
  id?: string;
  name?: string;
  [key: string]: any;
}

export interface RevokeApiKeyPayload {
  apiKeyId: string;
}

export interface ListApiKeysResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?:
    | ApiKey[]
    | {
        total_count?: number;
        api_keys?: ApiKey[];
      };
  total_count?: number;
  api_keys?: ApiKey[];
  timestamp?: string;
}

export const listApiKeys = async (): Promise<ApiKey[]> => {
  const res = await api.get<ListApiKeysResponse>("/api-keys/list");
  // Handle response: data can be an array directly or wrapped in an object
  if (Array.isArray(res.data.data)) {
    return res.data.data;
  }
  if (res.data.data?.api_keys && Array.isArray(res.data.data.api_keys)) {
    return res.data.data.api_keys;
  }
  if (Array.isArray(res.data.api_keys)) {
    return res.data.api_keys;
  }
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return [];
};

export const createApiKey = async (
  payload: CreateApiKeyPayload
): Promise<CreateApiKeyResponse> => {
  const res = await api.post<CreateApiKeyResponse>("/api-keys/create", payload);
  // Handle both wrapped and unwrapped responses
  if (res.data.data) {
    return res.data.data;
  }
  return res.data;
};

export const revokeApiKey = async (
  payload: RevokeApiKeyPayload
): Promise<void> => {
  await api.post("/api-keys/revoke", payload);
};
