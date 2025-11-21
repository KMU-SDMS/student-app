import { Notice, NoticesResponse, PageInfo } from '../types/notice';
import { CalendarResponse } from '../types/calendar';

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL as string) || 'http://localhost:3000';

function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//.test(path);
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = isAbsoluteUrl(path) ? path : path.startsWith('/') ? path : `/${path}`;
  const url = isAbsoluteUrl(path) ? normalizedPath : `${API_BASE}${normalizedPath}`;

  const mergedHeaders: HeadersInit = { ...(init?.headers ?? {}) };
  // 기본 Accept 헤더 지정 (서버가 JSON 에러를 반환할 때 도움)
  if (!(mergedHeaders as Record<string, string>)['Accept']) {
    (mergedHeaders as Record<string, string>)['Accept'] = 'application/json, text/plain, */*';
  }
  const bodyValue: any = init?.body as any;
  const hasBody = bodyValue !== undefined && bodyValue !== null;
  const isFormData = typeof FormData !== 'undefined' && hasBody && bodyValue instanceof FormData;
  const isUrlEncoded =
    typeof URLSearchParams !== 'undefined' && hasBody && bodyValue instanceof URLSearchParams;
  const isBlob = typeof Blob !== 'undefined' && hasBody && bodyValue instanceof Blob;
  const isArrayBuffer =
    typeof ArrayBuffer !== 'undefined' && hasBody && bodyValue instanceof ArrayBuffer;
  const isReadable =
    typeof ReadableStream !== 'undefined' && hasBody && bodyValue instanceof ReadableStream;
  const isJsonCandidate =
    hasBody && !isFormData && !isUrlEncoded && !isBlob && !isArrayBuffer && !isReadable;
  if (isJsonCandidate && !(mergedHeaders as Record<string, string>)['Content-Type']) {
    (mergedHeaders as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    credentials: 'include',
    headers: mergedHeaders,
    ...init,
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    let errorText = '';
    let errorJson: any = undefined;
    try {
      if (contentType.includes('application/json')) {
        errorJson = await response.json();
      } else {
        errorText = await response.text();
      }
    } catch {
      // no-op
    }

    const serverMessage =
      (errorJson && (errorJson.message || errorJson.error)) || errorText || response.statusText;
    const err: any = new Error(`HTTP ${response.status}: ${serverMessage}`);
    err.status = response.status;
    err.body = errorJson ?? errorText;
    err.url = url;
    throw err;
  }

  const contentType = response.headers.get('content-type') || '';
  if (response.status === 204 || contentType === '') {
    return undefined as unknown as T;
  }
  if (contentType.includes('application/json')) {
    try {
      const data = await response.json();
      return data as T;
    } catch {
      const text = await response.text();
      return text as unknown as T;
    }
  }
  const text = await response.text();
  return text as unknown as T;
}

export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

function apiGet<T>(path: string, params?: Record<string, any>) {
  const queryString = params ? buildQueryString(params) : '';
  return request<T>(`${path}${queryString}`);
}

function apiPost<T>(path: string, data?: any) {
  return request<T>(path, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

function apiPatch<T>(path: string, data?: any) {
  return request<T>(path, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// 페이지네이션된 공지사항 조회
export const getNotices = async (page: number = 1): Promise<NoticesResponse> => {
  try {
    const result = await apiGet<{ notices: Notice[]; page_info: PageInfo }>(`/api/notices`, {
      page,
    });
    if (result && (result as any).notices && (result as any).page_info) {
      return {
        notices: (result as any).notices,
        page_info: (result as any).page_info,
      };
    }
    throw new Error('Unexpected API response format');
  } catch (error) {
    return {
      notices: [],
      page_info: {
        total_page: 0,
        total_notice: 0,
        now_page: 1,
      },
    };
  }
};

// 공지사항 단건 조회
export const getNoticeById = async (id: number): Promise<Notice | null> => {
  try {
    const result = await apiGet<Notice>(`/api/notice`, { id });
    if ((result as any)?.id) return result as Notice;
    throw new Error('Unexpected API response format');
  } catch (error) {
    return null;
  }
};

// 캘린더 일정 조회 (전체 또는 특정 날짜)
export const getCalendarEvents = async (date?: string): Promise<CalendarResponse> => {
  try {
    const result = await apiGet<CalendarResponse>(`/api/calendar`, date ? { date } : undefined);
    return result;
  } catch (error) {
    return [];
  }
};

// --- 푸시 알림 관련 함수 추가 ---

interface SubscriptionPayload {
  fcm_token: string;
  platform: string;
}

export const subscribeToPushNotifications = async (payload: SubscriptionPayload) => {
  return apiPost<any>(`/api/subscriptions`, payload);
};

// 구독 상태 조회
export interface SubscriptionStatusResponse {
  active: boolean;
  subscription_id: number;
  student_no: string;
  platform: string;
  created_at: string;
  updated_at: string;
}

export const getSubscriptionStatus = async (
  fcmToken: string,
): Promise<SubscriptionStatusResponse | null> => {
  try {
    const result = await apiGet<SubscriptionStatusResponse>(`/api/subscriptions/status`, {
      fcm_token: fcmToken,
    });
    return result;
  } catch (error) {
    console.error('구독 상태 조회 오류:', error);
    return null;
  }
};

// 구독 상태 업데이트 (active: true/false)
interface SubscriptionStatusUpdate {
  active: boolean;
}

export const updateSubscriptionStatus = async (active: boolean): Promise<void> => {
  return apiPatch<void>(`/api/subscriptions`, { active });
};

// 외박계 신청
interface OvernightStayRequest {
  startDate: string; // YYYY-MM-DD 형식
  endDate: string; // YYYY-MM-DD 형식
  reason: string;
  semester: string; // YYYY-S 형식 (예: "2025-2")
}

export const submitOvernightStay = async (payload: OvernightStayRequest) => {
  return apiPost<any>(`/api/overnight-stay`, payload);
};

// 외박계 신청 내역 조회
export interface OvernightStayItem {
  id: number;
  studentIdNum: string;
  studentName: string;
  roomNumber: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  semester: string;
  createdAt: string;
}

export interface OvernightStaySummary {
  currentSemester: string;
  approvedCount: number;
  remainingCount: number;
}

export interface OvernightStayResponse {
  data: OvernightStayItem[];
  summary: OvernightStaySummary;
}

export const getOvernightStayHistory = async (): Promise<OvernightStayResponse | null> => {
  try {
    const result = await apiGet<OvernightStayResponse>(`/api/overnight-stay`);
    return result;
  } catch (error) {
    console.error('Error fetching overnight stay history:', error);
    return null;
  }
};

// 관리비 조회
export interface BankInfo {
  bank_name: string;
  bank_number: string;
}

export interface BillResponse {
  id: number;
  studentNo: string;
  type: string; // 'water', 'electric', 'gas' 등
  amount: number;
  endDate: string; // YYYY-MM-DD 형식
  bankInfo: BankInfo[];
  is_paid: boolean;
}

export const getBills = async (): Promise<BillResponse[]> => {
  try {
    // API 응답이 { "학번": [...] } 형태이므로 Record<string, BillResponse[]> 타입으로 받음
    const result = await apiGet<Record<string, BillResponse[]>>(`/api/bill`);

    if (!result) return [];

    // 객체의 값들 중 첫 번째 배열을 추출 (학번 키를 몰라도 동작)
    const bills = Object.values(result)[0];

    return Array.isArray(bills) ? bills : [];
  } catch (error) {
    console.error('관리비 조회 오류:', error);
    return [];
  }
};

// 관리비 납부 완료 처리
export interface UpdateBillRequest {
  type: string;
  is_paid: boolean;
}

export const updateBillPaymentStatus = async (data: UpdateBillRequest): Promise<void> => {
  return apiPatch<void>(`/api/bill`, data);
};
