import { useState, useEffect, useCallback } from 'react';
import { getCalendarEvents } from '../services/apiService';
import { CalendarEvent } from '../types/calendar';

// 로컬 날짜를 YYYY-MM-DD 형식으로 변환하는 함수
const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 전체 일정 로드
  const loadAllEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allEvents = await getCalendarEvents();
      setEvents(allEvents);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '캘린더 일정을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('Error loading calendar events:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 특정 날짜의 일정 로드
  const loadEventsByDate = useCallback(async (date: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const dateEvents = await getCalendarEvents(date);
      setEvents(dateEvents);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '해당 날짜의 일정을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('Error loading calendar events by date:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 특정 날짜에 일정이 있는지 확인
  const hasEventOnDate = useCallback(
    (date: Date): boolean => {
      const dateString = formatDateToYYYYMMDD(date); // YYYY-MM-DD 형식
      return events.some((event) => event.date === dateString);
    },
    [events],
  );

  // 특정 날짜의 일정 정보 가져오기
  const getEventsOnDate = useCallback(
    (date: Date): CalendarEvent[] => {
      const dateString = formatDateToYYYYMMDD(date); // YYYY-MM-DD 형식
      return events.filter((event) => event.date === dateString);
    },
    [events],
  );

  // 특정 날짜에 점호가 있는지 확인
  const hasRollCallOnDate = useCallback(
    (date: Date): boolean => {
      const dateEvents = getEventsOnDate(date);
      return dateEvents.some((event) => event.rollCallType !== null);
    },
    [getEventsOnDate],
  );

  // 특정 날짜에 관비 납부 마감이 있는지 확인
  const hasPaymentOnDate = useCallback(
    (date: Date): boolean => {
      const dateEvents = getEventsOnDate(date);
      return dateEvents.some((event) => event.paymentType !== null);
    },
    [getEventsOnDate],
  );

  // 특정 날짜의 점호 타입 가져오기
  const getRollCallTypeOnDate = useCallback(
    (date: Date): string | null => {
      const dateEvents = getEventsOnDate(date);
      const rollCallEvent = dateEvents.find((event) => event.rollCallType !== null);
      return rollCallEvent?.rollCallType || null;
    },
    [getEventsOnDate],
  );

  // 특정 날짜의 관비 납부 마감 타입 가져오기
  const getPaymentTypeOnDate = useCallback(
    (date: Date): string | null => {
      const dateEvents = getEventsOnDate(date);
      const paymentEvent = dateEvents.find((event) => event.paymentType !== null);
      return paymentEvent?.paymentType || null;
    },
    [getEventsOnDate],
  );

  // 초기 로드
  useEffect(() => {
    loadAllEvents();
  }, [loadAllEvents]);

  return {
    events,
    isLoading,
    error,
    loadAllEvents,
    loadEventsByDate,
    hasEventOnDate,
    getEventsOnDate,
    hasRollCallOnDate,
    hasPaymentOnDate,
    getRollCallTypeOnDate,
    getPaymentTypeOnDate,
  } as const;
}
