import api from "@/lib/api";

export interface CustomListEntry {
  id: string;
  category: "allowlist" | "blocklist";
  type: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomListPayload {
  value: string;
  category: "allowlist" | "blocklist";
}

export interface CreateCustomListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: CustomListEntry;
  timestamp: string;
}

export interface GetCustomListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    entries: CustomListEntry[];
    count: number;
  };
  timestamp: string;
}

export interface GetCustomListParams {
  category?: "allowlist" | "blocklist";
  limit?: number;
  offset?: number;
}

export const createCustomListEntry = async (
  payload: CreateCustomListPayload
): Promise<CreateCustomListResponse> => {
  const res = await api.post<CreateCustomListResponse>(
    "/custom-list/create",
    payload
  );
  return res.data;
};

export const getCustomListEntries = async (
  params?: GetCustomListParams
): Promise<GetCustomListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append("category", params.category);
  if (params?.limit !== undefined)
    queryParams.append("limit", params.limit.toString());
  if (params?.offset !== undefined)
    queryParams.append("offset", params.offset.toString());

  const queryString = queryParams.toString();
  const url = `/custom-list/get${queryString ? `?${queryString}` : ""}`;

  const res = await api.get<GetCustomListResponse>(url);
  return res.data;
};
