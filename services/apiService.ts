import { Notice, NoticesResponse } from '../types/notice';

const BASE_URL = 'https://12y69ifvh1.execute-api.ap-northeast-2.amazonaws.com';

// 캐시 저장소 인터페이스
interface CacheEntry {
  data: any;
  etag?: string;
  lastModified?: string;
  cacheControl?: string;
  timestamp: number;
}

// 메모리 기반 캐시 저장소
class CacheManager {
  private cache = new Map<string, CacheEntry>();

  // 캐시 키 생성
  private getCacheKey(url: string): string {
    return `cache_${url}`;
  }

  // 캐시 저장
  set(url: string, data: any, headers: Headers): void {
    const cacheKey = this.getCacheKey(url);
    const entry: CacheEntry = {
      data,
      etag: headers.get('etag') || undefined,
      lastModified: headers.get('last-modified') || undefined,
      cacheControl: headers.get('cache-control') || undefined,
      timestamp: Date.now(),
    };
    this.cache.set(cacheKey, entry);
    // console.log(`캐시 저장: ${url}`, { etag: entry.etag, cacheControl: entry.cacheControl });
  }

  // 캐시 조회
  get(url: string): CacheEntry | undefined {
    const cacheKey = this.getCacheKey(url);
    const entry = this.cache.get(cacheKey);

    if (entry && this.isValid(entry)) {
      console.log(`캐시 히트: ${url}`);
      return entry;
    }

    if (entry) {
      console.log(`캐시 만료: ${url}`);
      this.cache.delete(cacheKey);
    }

    return undefined;
  }

  // 조건부 요청 헤더 생성
  getConditionalHeaders(url: string): HeadersInit {
    const cacheKey = this.getCacheKey(url);
    const entry = this.cache.get(cacheKey);
    const headers: HeadersInit = {};

    if (entry) {
      if (entry.etag) {
        headers['If-None-Match'] = entry.etag;
      }
      if (entry.lastModified) {
        headers['If-Modified-Since'] = entry.lastModified;
      }
    }

    return headers;
  }

  // 캐시 유효성 검사
  private isValid(entry: CacheEntry): boolean {
    if (!entry.cacheControl) return false;

    const maxAge = this.parseMaxAge(entry.cacheControl);
    if (maxAge === null) return false;

    const age = (Date.now() - entry.timestamp) / 1000;
    return age < maxAge;
  }

  // Cache-Control에서 max-age 파싱
  private parseMaxAge(cacheControl: string): number | null {
    const match = cacheControl.match(/max-age=(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  // 캐시 클리어
  clear(): void {
    this.cache.clear();
    console.log('캐시 전체 삭제');
  }
}

// 전역 캐시 매니저 인스턴스
const cacheManager = new CacheManager();

// 페이지네이션된 공지사항 조회 (캐싱 지원)
export const getNotices = async (
  page: number = 1,
  forceRefresh: boolean = false,
): Promise<NoticesResponse> => {
  const url = `${BASE_URL}/notices?page=${page}`;

  try {
    // 강제 새로고침이 아닌 경우 캐시 확인
    if (!forceRefresh) {
      const cachedData = cacheManager.get(url);
      if (cachedData) {
        console.log(`캐시된 공지사항 반환 (페이지 ${page})`);
        return cachedData.data as NoticesResponse;
      }
    }

    // 조건부 요청 헤더 생성
    const conditionalHeaders = cacheManager.getConditionalHeaders(url);
    const headers: HeadersInit = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...conditionalHeaders,
    };

    console.log(`공지사항 API 요청 (페이지 ${page})`, { headers });
    const response = await fetch(url, { headers });

    // 304 Not Modified 응답 처리
    if (response.status === 304) {
      console.log(`304 Not Modified - 캐시된 데이터 사용 (페이지 ${page})`);
      const cachedData = cacheManager.get(url);
      if (cachedData) {
        return cachedData.data as NoticesResponse;
      }
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });

      // 에러 시 캐시된 데이터가 있으면 반환
      const cachedData = cacheManager.get(url);
      if (cachedData) {
        console.log('API 에러 - 캐시된 데이터 사용');
        return cachedData.data as NoticesResponse;
      }

      throw new Error(`Failed to fetch notices with status: ${response.status}`);
    }

    const result = await response.json();
    // console.log('Received notices from API:', result);

    // 새로운 API 응답 형식에 맞게 처리
    if (result.notices && result.page_info) {
      const noticesResponse: NoticesResponse = {
        notices: result.notices,
        page_info: result.page_info,
      };

      // 응답 헤더에 캐싱 정보가 있으면 캐시에 저장
      const cacheControl = response.headers.get('cache-control');
      const etag = response.headers.get('etag');
      const lastModified = response.headers.get('last-modified');

      if (cacheControl || etag || lastModified) {
        cacheManager.set(url, noticesResponse, response.headers);
      } else {
        // 서버에서 캐싱 헤더를 제공하지 않는 경우 기본 캐싱 적용 (5분)
        const mockHeaders = new Headers();
        mockHeaders.set('cache-control', 'max-age=300'); // 5분
        mockHeaders.set('etag', `"notices-page-${page}-${Date.now()}"`);
        cacheManager.set(url, noticesResponse, mockHeaders);
      }

      return noticesResponse;
    } else {
      throw new Error('Unexpected API response format');
    }
  } catch (error) {
    console.error('Error in getNotices function:', error);

    // 에러 시 캐시된 데이터가 있으면 반환
    const cachedData = cacheManager.get(url);
    if (cachedData) {
      console.log('에러 발생 - 캐시된 데이터 사용');
      return cachedData.data as NoticesResponse;
    }

    // 캐시된 데이터도 없으면 빈 응답 반환
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

// 공지사항 단건 조회 (캐싱 지원)
export const getNoticeById = async (
  id: number,
  forceRefresh: boolean = false,
): Promise<Notice | null> => {
  const url = `${BASE_URL}/notice?id=${id}`;

  try {
    // 강제 새로고침이 아닌 경우 캐시 확인
    if (!forceRefresh) {
      const cachedData = cacheManager.get(url);
      if (cachedData) {
        console.log(`캐시된 공지사항 상세 반환 (ID: ${id})`);
        return cachedData.data as Notice;
      }
    }

    // 조건부 요청 헤더 생성
    const conditionalHeaders = cacheManager.getConditionalHeaders(url);
    const headers: HeadersInit = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...conditionalHeaders,
    };

    console.log(`공지사항 상세 API 요청 (ID: ${id})`, { headers });
    const response = await fetch(url, { headers });

    // 304 Not Modified 응답 처리
    if (response.status === 304) {
      console.log(`304 Not Modified - 캐시된 상세 데이터 사용 (ID: ${id})`);
      const cachedData = cacheManager.get(url);
      if (cachedData) {
        return cachedData.data as Notice;
      }
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });

      // 에러 시 캐시된 데이터가 있으면 반환
      const cachedData = cacheManager.get(url);
      if (cachedData) {
        console.log('API 에러 - 캐시된 상세 데이터 사용');
        return cachedData.data as Notice;
      }

      throw new Error(`Failed to fetch notice with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Received notice from API:', result);

    // 공지사항 단건 조회 응답 처리
    if (result.id && result.title && result.content) {
      const notice = result as Notice;

      // 응답 헤더에 캐싱 정보가 있으면 캐시에 저장
      const cacheControl = response.headers.get('cache-control');
      const etag = response.headers.get('etag');
      const lastModified = response.headers.get('last-modified');

      if (cacheControl || etag || lastModified) {
        cacheManager.set(url, notice, response.headers);
      } else {
        // 서버에서 캐싱 헤더를 제공하지 않는 경우 기본 캐싱 적용 (10분)
        const mockHeaders = new Headers();
        mockHeaders.set('cache-control', 'max-age=600'); // 10분
        mockHeaders.set('etag', `"notice-${id}-${Date.now()}"`);
        cacheManager.set(url, notice, mockHeaders);
      }

      return notice;
    } else {
      throw new Error('Unexpected API response format');
    }
  } catch (error) {
    console.error('Error in getNoticeById function:', error);

    // 에러 시 캐시된 데이터가 있으면 반환
    const cachedData = cacheManager.get(url);
    if (cachedData) {
      console.log('에러 발생 - 캐시된 상세 데이터 사용');
      return cachedData.data as Notice;
    }

    return null;
  }
};

// 캐시 관리 함수들 내보내기
export const clearCache = () => {
  cacheManager.clear();
};

export const getCacheStats = () => {
  return {
    size: cacheManager['cache'].size,
    entries: Array.from(cacheManager['cache'].keys()),
  };
};
