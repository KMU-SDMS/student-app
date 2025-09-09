import { Notice } from '../types/notice';

const BASE_URL = 'https://12y69ifvh1.execute-api.ap-northeast-2.amazonaws.com';

// The API now returns a direct array of notices.
export const getNotices = async (): Promise<Notice[]> => {
  try {
    const response = await fetch(`${BASE_URL}/notices`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });
      throw new Error(`Failed to fetch notices with status: ${response.status}`);
    }

    // The response is the array of notices directly.
    const notices: Notice[] = await response.json();
    console.log('Received notices from API:', notices);

    // Sort notices by date in descending order
    return notices.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Error in getNotices function:', error);
    // Return empty array on failure to prevent app crash and show empty state
    return [];
  }
};
