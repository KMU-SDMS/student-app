export interface CalendarEvent {
  id: number;
  date: string; // YYYY-MM-DD 형식
  rollCallType: string | null; // "일반" 또는 null
  paymentType: string | null; // "가스", "수도" 등
}

export interface CalendarResponse extends Array<CalendarEvent> {}
