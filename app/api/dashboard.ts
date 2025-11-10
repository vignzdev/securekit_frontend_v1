import api from "@/lib/api";

export interface TimelineItem {
  id: string;
  check_type: string;
  checked_value: string;
  action: string;
  score: number;
  reasons: string[];
  created_at: string;
  api_key: {
    id: string;
    name: string;
  };
}

export interface TilesData {
  totalRequests: number;
  totalHighRisk: number;
  totalMediumRisk: number;
  apiCount: number;
}

export interface TimelineResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    data: TimelineItem[];
    total: number;
    limit: number;
    offset: number;
    tiles?: TilesData;
  };
  tiles?: TilesData;
  timestamp: string;
}

export interface TimelineParams {
  check_type?: string;
  limit?: number;
  offset?: number;
  start_date?: string;
  end_date?: string;
}

export const getTimelineData = async (
  params?: TimelineParams
): Promise<TimelineResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.check_type) queryParams.append("check_type", params.check_type);
  if (params?.limit !== undefined)
    queryParams.append("limit", params.limit.toString());
  if (params?.offset !== undefined)
    queryParams.append("offset", params.offset.toString());
  if (params?.start_date) queryParams.append("start_date", params.start_date);
  if (params?.end_date) queryParams.append("end_date", params.end_date);

  const queryString = queryParams.toString();
  const url = `/usage-analytics/dashboard${
    queryString ? `?${queryString}` : ""
  }`;

  const res = await api.get<TimelineResponse>(url);
  return res.data;
};

export interface BlocksChallengesDataPoint {
  period: string;
  allow: number;
  challenge: number;
  block: number;
  total: number;
}

export interface BlocksChallengesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    data: BlocksChallengesDataPoint[];
    group_by: string;
    total: number;
  };
  timestamp: string;
}

export interface BlocksChallengesParams {
  user_id?: string;
  check_type?: string;
  start_date?: string;
  end_date?: string;
  group_by?: "day" | "week" | "month";
}

export const getBlocksChallengesOverTime = async (
  params: BlocksChallengesParams
): Promise<BlocksChallengesResponse> => {
  const queryParams = new URLSearchParams();
  if (params.user_id) queryParams.append("user_id", params.user_id);
  if (params.check_type) queryParams.append("check_type", params.check_type);
  if (params.start_date) queryParams.append("start_date", params.start_date);
  if (params.end_date) queryParams.append("end_date", params.end_date);
  if (params.group_by) queryParams.append("group_by", params.group_by);

  const queryString = queryParams.toString();
  const url = `/usage-analytics/blocks-challenges-over-time${
    queryString ? `?${queryString}` : ""
  }`;

  const res = await api.get<BlocksChallengesResponse>(url);
  return res.data;
};
