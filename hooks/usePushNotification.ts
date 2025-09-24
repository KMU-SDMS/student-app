import { useState, useEffect, useCallback } from 'react';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  isLoading: boolean;
  error: string | null;
}

export interface UsePushNotificationReturn extends PushNotificationState {
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<PushSubscription | null>;
  unsubscribe: () => Promise<boolean>;
  getSubscriptionData: () => PushSubscriptionData | null;
}

/**
 * PWA 푸시 알림을 관리하는 커스텀 훅
 * 브라우저 지원 확인, 권한 요청, 구독 관리 기능 제공
 */
export const usePushNotification = (): UsePushNotificationReturn => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    subscription: null,
    isLoading: false,
    error: null,
  });

  // 브라우저 푸시 알림 지원 여부 확인
  const checkSupport = useCallback(() => {
    // 디버깅을 위한 브라우저 정보 출력
    console.log('브라우저 정보:', {
      userAgent: navigator.userAgent,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasPushManager: 'PushManager' in window,
      hasNotification: 'Notification' in window,
      notificationPermission: 'Notification' in window ? Notification.permission : 'N/A',
    });

    // 기본 API 지원 확인
    const hasBasicSupport =
      'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

    if (!hasBasicSupport) {
      setState((prev) => ({
        ...prev,
        isSupported: false,
        permission: 'denied',
      }));
      return false;
    }

    // 브라우저별 특별 처리
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !isChrome;

    // iOS에서의 처리
    if (isIOS) {
      // iOS Chrome은 실제로는 Safari WebKit을 사용하므로 Safari와 동일한 제약이 있음
      if (isSafari || isChrome) {
        const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
        if (match) {
          const majorVersion = parseInt(match[1], 10);
          const minorVersion = parseInt(match[2], 10);

          // iOS 16.4 미만은 푸시 알림 지원하지 않음
          if (majorVersion < 16 || (majorVersion === 16 && minorVersion < 4)) {
            setState((prev) => ({
              ...prev,
              isSupported: false,
              permission: 'denied',
            }));
            return false;
          }
        }
      } else {
        // iOS에서 Safari/Chrome이 아닌 다른 브라우저는 지원하지 않음
        setState((prev) => ({
          ...prev,
          isSupported: false,
          permission: 'denied',
        }));
        return false;
      }
    }

    // Android Chrome은 일반적으로 잘 지원됨
    // 추가 검증 없이 통과

    // 실제 PushManager 기능 테스트
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const hasSubscribe =
          typeof (window as any).PushManager?.prototype?.subscribe === 'function';
        if (hasSubscribe) {
          setState((prev) => ({
            ...prev,
            isSupported: true,
            permission: Notification.permission,
          }));
          return true;
        }
      }
    } catch (error) {
      console.warn('푸시 알림 지원 확인 중 오류:', error);
    }

    // 모든 검사를 통과하면 지원됨
    setState((prev) => ({
      ...prev,
      isSupported: true,
      permission: Notification.permission,
    }));

    return true;
  }, []);

  // 서비스 워커 등록
  const registerServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('서비스 워커를 지원하지 않는 브라우저입니다.');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('서비스 워커 등록 성공:', registration);
      return registration;
    } catch (error) {
      console.error('서비스 워커 등록 실패:', error);
      throw new Error('서비스 워커 등록에 실패했습니다.');
    }
  }, []);

  // 알림 권한 요청
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState((prev) => ({ ...prev, error: '푸시 알림을 지원하지 않는 브라우저입니다.' }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 서비스 워커 등록
      await registerServiceWorker();

      // 알림 권한 요청
      const permission = await Notification.requestPermission();

      setState((prev) => ({
        ...prev,
        permission,
        isLoading: false,
      }));

      if (permission === 'granted') {
        console.log('푸시 알림 권한이 허용되었습니다.');
        // 권한 허용 후 즉시 상태 업데이트
        setState((prev) => ({
          ...prev,
          permission: 'granted',
        }));
        return true;
      } else {
        const errorMsg =
          permission === 'denied'
            ? '푸시 알림 권한이 거부되었습니다. 브라우저 설정에서 알림을 허용해주세요.'
            : '푸시 알림 권한 요청이 취소되었습니다.';

        setState((prev) => ({ ...prev, error: errorMsg }));
        return false;
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : '알림 권한 요청 중 오류가 발생했습니다.';
      setState((prev) => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
      return false;
    }
  }, [state.isSupported, registerServiceWorker]);

  // 푸시 구독 생성
  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    // 실제 브라우저 권한 상태를 직접 확인 (상태 업데이트 지연 방지)
    const currentPermission = 'Notification' in window ? Notification.permission : 'denied';

    console.log('구독 시도 - 현재 권한:', currentPermission, '상태 권한:', state.permission);

    if (currentPermission !== 'granted') {
      const errorMsg = `알림 권한이 필요합니다. 현재 상태: ${currentPermission}`;
      setState((prev) => ({ ...prev, error: errorMsg }));
      return null;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('서비스 워커 준비 대기 중...');
      const registration = await navigator.serviceWorker.ready;
      console.log('서비스 워커 준비 완료:', registration);

      // 기존 구독 확인
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('기존 구독 발견:', existingSubscription);
        setState((prev) => ({
          ...prev,
          subscription: existingSubscription,
          isLoading: false,
        }));
        return existingSubscription;
      }

      // VAPID 공개 키 설정에서 로드 (app.json -> expo.extra.vapidPublicKey)
      const vapidPublicKey =
        (globalThis as any).expo?.extra?.vapidPublicKey ||
        (typeof window !== 'undefined' && (window as any).expo?.extra?.vapidPublicKey) ||
        '';

      if (!vapidPublicKey) {
        console.warn(
          'VAPID 공개 키가 설정되지 않았습니다. app.json의 expo.extra.vapidPublicKey를 설정하세요.',
        );
        setState((prev) => ({
          ...prev,
          error: '푸시 알림 설정 오류: VAPID 공개 키가 누락되었습니다.',
          isLoading: false,
        }));
        return null;
      }

      console.log('새 구독 생성 중... VAPID 키 길이:', vapidPublicKey.length);

      // VAPID 키를 Uint8Array로 변환
      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      console.log('변환된 VAPID 키:', applicationServerKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });
      console.log('새 구독 생성 완료:', subscription);

      setState((prev) => ({
        ...prev,
        subscription,
        isLoading: false,
      }));

      console.log('푸시 구독 생성 성공:', subscription);
      return subscription;
    } catch (error) {
      console.error('푸시 구독 생성 오류:', error);

      let errorMsg = '푸시 구독 생성 중 오류가 발생했습니다.';

      if (error instanceof Error) {
        if (error.name === 'NotSupportedError') {
          errorMsg = '이 브라우저에서는 푸시 알림을 지원하지 않습니다.';
        } else if (error.name === 'NotAllowedError') {
          errorMsg = '푸시 알림 권한이 거부되었습니다.';
        } else if (error.name === 'AbortError') {
          errorMsg = '푸시 구독이 취소되었습니다.';
        } else if (error.message.includes('VAPID')) {
          errorMsg = 'VAPID 키 설정에 문제가 있습니다.';
        } else {
          errorMsg = `구독 오류: ${error.message}`;
        }
      }

      setState((prev) => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
      return null;
    }
  }, []); // state.permission 의존성 제거 - 직접 Notification.permission 확인

  // 푸시 구독 해제
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) {
      return true;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const success = await state.subscription.unsubscribe();

      if (success) {
        setState((prev) => ({
          ...prev,
          subscription: null,
          isLoading: false,
        }));
        console.log('푸시 구독 해제 성공');
      }

      return success;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : '푸시 구독 해제 중 오류가 발생했습니다.';
      setState((prev) => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
      return false;
    }
  }, [state.subscription]);

  // 구독 데이터 추출 (서버 전송용)
  const getSubscriptionData = useCallback((): PushSubscriptionData | null => {
    if (!state.subscription) {
      return null;
    }

    try {
      const p256dh = state.subscription.getKey('p256dh');
      const auth = state.subscription.getKey('auth');

      if (!p256dh || !auth) {
        return null;
      }

      return {
        endpoint: state.subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dh))),
          auth: btoa(String.fromCharCode(...new Uint8Array(auth))),
        },
      };
    } catch (error) {
      console.error('구독 데이터 추출 오류:', error);
      return null;
    }
  }, [state.subscription]);

  // 기존 구독 확인
  const checkExistingSubscription = useCallback(async () => {
    if (!state.isSupported) return;

    try {
      // 서비스 워커가 등록되어 있는지 먼저 확인
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length === 0) {
        console.log('등록된 서비스 워커가 없음');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      // 현재 권한 상태도 함께 업데이트
      const currentPermission = Notification.permission;

      setState((prev) => ({
        ...prev,
        subscription,
        permission: currentPermission,
      }));

      console.log('기존 구독 확인 완료:', { subscription, permission: currentPermission });
    } catch (error) {
      console.error('기존 구독 확인 오류:', error);
    }
  }, [state.isSupported]);

  // 초기화
  useEffect(() => {
    if (checkSupport()) {
      checkExistingSubscription();
    }
  }, [checkSupport, checkExistingSubscription]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    getSubscriptionData,
  };
};

export default usePushNotification;
