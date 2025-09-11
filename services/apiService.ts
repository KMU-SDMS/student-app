import { Notice } from '../types/notice';

const BASE_URL = 'https://12y69ifvh1.execute-api.ap-northeast-2.amazonaws.com';

// 페이지네이션된 공지사항 조회
export const getNotices = async (page: number = 1): Promise<Notice[]> => {
  try {
    const response = await fetch(`${BASE_URL}/notices?page=${page}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });
      throw new Error(`Failed to fetch notices with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Received notices from API:', result);

    // API 응답이 { status: "success", data: [...] } 형태인지 확인
    if (result.status === 'success' && Array.isArray(result.data)) {
      return result.data;
    } else if (Array.isArray(result)) {
      // 기존 형태의 배열 응답도 지원
      return result;
    } else {
      throw new Error('Unexpected API response format');
    }
  } catch (error) {
    console.error('Error in getNotices function:', error);
    // Return empty array on failure to prevent app crash and show empty state
    return [];
  }
};
