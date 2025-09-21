export interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  is_important: boolean;
}

export interface PageInfo {
  total_page: number;
  total_notice: number;
  now_page: number;
}

export interface NoticesResponse {
  notices: Notice[];
  page_info: PageInfo;
}
