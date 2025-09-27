import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';

export interface AppInitializationState {
  isLoading: boolean;
  error: string | null;
  initializationProgress: number;
}

export interface AppInitializationConfig {
  minLoadingTime?: number; // 최소 로딩 시간 (밀리초)
  enableProgressTracking?: boolean; // 진행률 추적 활성화
}

export function useAppInitialization(config: AppInitializationConfig = {}) {
  const {
    minLoadingTime = 2000, // 기본 2초
    enableProgressTracking = true,
  } = config;

  const [state, setState] = useState<AppInitializationState>({
    isLoading: true,
    error: null,
    initializationProgress: 0,
  });

  const initializeApp = useCallback(async () => {
    const startTime = Date.now();

    try {
      logger.info('앱 초기화 시작', { event: 'app_initialization_start' });

      setState((prev) => ({ ...prev, error: null }));

      // 1. 환경 변수 및 기본 설정 확인
      if (enableProgressTracking) {
        setState((prev) => ({ ...prev, initializationProgress: 10 }));
      }
      await new Promise((resolve) => setTimeout(resolve, 200)); // 짧은 지연

      // 2. 서비스 워커 등록 확인 (웹에서만)
      if (enableProgressTracking) {
        setState((prev) => ({ ...prev, initializationProgress: 20 }));
      }

      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            logger.info('서비스 워커 등록 확인됨', { event: 'sw_registered' });
          }
        } catch (swError) {
          logger.warn('서비스 워커 확인 중 오류', swError);
        }
      }

      // 3. API 연결 테스트 및 데이터 미리 로드
      if (enableProgressTracking) {
        setState((prev) => ({ ...prev, initializationProgress: 40 }));
      }

      // API 베이스 URL 확인
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl) {
        logger.warn('API 베이스 URL이 설정되지 않음', { event: 'api_url_missing' });
      } else {
        logger.info('API 베이스 URL 확인됨', {
          event: 'api_url_verified',
          url: apiBaseUrl,
        });

        // 홈 화면에 필요한 API 데이터 미리 로드
        try {
          const { getNotices, getCalendarEvents } = await import('@/services/apiService');

          // 공지사항과 캘린더 데이터 병렬 로드
          const [noticesResponse, calendarResponse] = await Promise.allSettled([
            getNotices(),
            getCalendarEvents(),
          ]);

          // 로컬 스토리지에 데이터 저장
          if (noticesResponse.status === 'fulfilled') {
            localStorage.setItem('preloaded_notices', JSON.stringify(noticesResponse.value));
            logger.info('공지사항 데이터 미리 로드 완료', {
              event: 'notices_preloaded',
              count: noticesResponse.value.notices.length,
            });
          }

          if (calendarResponse.status === 'fulfilled') {
            localStorage.setItem('preloaded_calendar', JSON.stringify(calendarResponse.value));
            logger.info('캘린더 데이터 미리 로드 완료', {
              event: 'calendar_preloaded',
              count: Array.isArray(calendarResponse.value) ? calendarResponse.value.length : 0,
            });
          }
        } catch (apiError) {
          logger.warn('API 데이터 미리 로드 중 오류', apiError, { event: 'api_preload_error' });
        }
      }

      // 4. 로컬 스토리지 초기화 (웹에서만)
      if (enableProgressTracking) {
        setState((prev) => ({ ...prev, initializationProgress: 60 }));
      }

      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          // 기본 설정값들 확인/설정
          const defaultSettings = {
            theme: 'auto',
            language: 'ko',
            notifications: true,
          };

          const existingSettings = localStorage.getItem('app_settings');
          if (!existingSettings) {
            localStorage.setItem('app_settings', JSON.stringify(defaultSettings));
            logger.info('기본 앱 설정 초기화', { event: 'settings_initialized' });
          }
        } catch (storageError) {
          logger.warn('로컬 스토리지 초기화 중 오류', storageError);
        }
      }

      // 5. 폰트 로딩 확인 (React Native Web에서)
      if (enableProgressTracking) {
        setState((prev) => ({ ...prev, initializationProgress: 80 }));
      }

      // 폰트 로딩은 이미 _layout.tsx에서 처리되므로 여기서는 확인만
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 6. 최소 로딩 시간 보장
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      if (remainingTime > 0) {
        if (enableProgressTracking) {
          setState((prev) => ({ ...prev, initializationProgress: 95 }));
        }
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      // 7. 초기화 완료
      if (enableProgressTracking) {
        setState((prev) => ({ ...prev, initializationProgress: 100 }));
      }

      logger.info('앱 초기화 완료', {
        event: 'app_initialization_complete',
        duration: Date.now() - startTime,
      });

      // 최종 상태 업데이트
      setState((prev) => ({
        ...prev,
        isLoading: false,
        initializationProgress: 100,
      }));
    } catch (error) {
      logger.error('앱 초기화 중 오류 발생', error, { event: 'app_initialization_error' });

      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        isLoading: false,
      }));
    }
  }, [minLoadingTime, enableProgressTracking]);

  // 앱 초기화 시작
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // 초기화 재시도 함수
  const retryInitialization = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      initializationProgress: 0,
    }));
    initializeApp();
  }, [initializeApp]);

  return {
    ...state,
    retryInitialization,
  };
}
