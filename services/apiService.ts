import { Notice, NoticesResponse } from '../types/notice';

const BASE_URL = 'https://12y69ifvh1.execute-api.ap-northeast-2.amazonaws.com';

// 페이지네이션된 공지사항 조회
export const getNotices = async (page: number = 1): Promise<NoticesResponse> => {
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

    // 새로운 API 응답 형식에 맞게 처리
    if (result.notices && result.page_info) {
      return {
        notices: result.notices,
        page_info: result.page_info
      };
    } else {
      throw new Error('Unexpected API response format');
    }
  } catch (error) {
    console.error('Error in getNotices function:', error);
    // 에러 시 빈 응답 반환
    return {
      notices: [],
      page_info: {
        total_page: 0,
        total_notice: 0,
        now_page: 1
      }
    };
  }
};

// 공지사항 단건 조회
export const getNoticeById = async (id: number): Promise<Notice | null> => {
  try {
    const response = await fetch(`${BASE_URL}/notice?id=${id}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });
      throw new Error(`Failed to fetch notice with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Received notice from API:', result);

    // 공지사항 단건 조회 응답 처리
    if (result.id && result.title && result.content) {
      return result as Notice;
    } else {
      throw new Error('Unexpected API response format');
    }
  } catch (error) {
    console.error('Error in getNoticeById function:', error);
    return null;
  }
};
