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
    const errorText = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
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
