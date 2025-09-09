import { Notice } from '../types/notice';

const BASE_URL = 'https://12y69ifvh1.execute-api.ap-northeast-2.amazonaws.com';

interface ApiResponse<T> {
  statusCode: number;
  headers: Record<string, string>;
  body: string; // The body is a JSON string
}

export const getNotices = async (): Promise<Notice[]> => {
  try {
    const response = await fetch(`${BASE_URL}/notices`);
    if (!response.ok) {
      throw new Error('Failed to fetch notices');
    }
    const data: ApiResponse<Notice[]> = await response.json();
    
    if (data.body) {
      // The actual notice data is in the 'body' property as a string
      const notices = JSON.parse(data.body);
      // Sort notices by created_at date in descending order
      return notices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching notices:', error);
    throw error;
  }
};
