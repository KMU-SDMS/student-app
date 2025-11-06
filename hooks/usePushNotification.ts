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
// VAPID 키를 Uint8Array로 변환하는 헬퍼 함수
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

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
      console.log('서비스 워커 등록 시작...');

      // 먼저 기존 서비스 워커 확인
      const existingRegistrations = await navigator.serviceWorker.getRegistrations();
      console.log('기존 서비스 워커 개수:', existingRegistrations.length);

      // 동일한 스크립트 URL을 가진 서비스 워커만 필터링
      const currentScriptRegistrations = existingRegistrations.filter(
        (reg) => reg.active && reg.active.scriptURL.includes('/sw.js'),
      );

      if (currentScriptRegistrations.length > 0) {
        console.log('동일한 서비스 워커 발견, 기존 것 사용:', currentScriptRegistrations[0]);
        return currentScriptRegistrations[0];
      }

      // 다른 서비스 워커들이 있다면 정리
      if (existingRegistrations.length > 0) {
        console.log('다른 서비스 워커 발견, 정리 중...');
        await Promise.all(existingRegistrations.map((reg) => reg.unregister()));
        console.log('기존 서비스 워커 해제 완료');
      }

      // 새로운 서비스 워커 등록
      console.log('새 서비스 워커 등록 중...');
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('서비스 워커 등록 성공:', registration);

      // 서비스 워커가 활성화될 때까지 대기
      console.log('서비스 워커 활성화 대기 중...');
      const readyRegistration = await navigator.serviceWorker.ready;
      console.log('서비스 워커 활성화 완료:', readyRegistration);

      // 활성 서비스 워커 확인
      if (readyRegistration.active) {
        console.log('활성 서비스 워커 확인됨:', readyRegistration.active);
      } else {
        console.warn('활성 서비스 워커가 없습니다');
      }

      return readyRegistration;
    } catch (error) {
      console.error('서비스 워커 등록 실패:', error);
      throw new Error(
        `서비스 워커 등록에 실패했습니다: ${error instanceof Error ? error.message : String(error)}`,
      );
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
      // 서비스 워커 등록 (재시도 로직 포함)
      let registration = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`서비스 워커 등록 시도 ${attempt}/3`);
          registration = await registerServiceWorker();

          // 등록 후 활성 서비스 워커 확인
          if (registration && registration.active) {
            console.log('서비스 워커 등록 및 활성화 성공');
            break;
          } else {
            throw new Error('서비스 워커가 활성화되지 않음');
          }
        } catch (error) {
          console.error(`서비스 워커 등록 시도 ${attempt} 실패:`, error);
          if (attempt === 3) throw error;
          // 2초 대기 후 재시도 (시간을 늘림)
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

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

  // 푸시 구독 생성 (Firebase SDK 사용)
  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    const currentPermission = 'Notification' in window ? Notification.permission : 'denied';
    if (currentPermission !== 'granted') {
      const errorMsg = `알림 권한이 필요합니다. 현재 상태: ${currentPermission}`;
      setState((prev) => ({ ...prev, error: errorMsg }));
      return null;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { getToken } = await import('firebase/messaging');
      const { getMessagingInstance } = await import('@/services/firebase');
      // apiService는 필요 시점에서 import
      const { subscribeToPushNotifications } = await import('@/services/apiService');

      // VAPID 키는 Firebase Console > 프로젝트 설정 > 클라우드 메시징 > 웹 푸시 인증서에서 확인
      const vapidKey = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY || '';
      if (!vapidKey) {
        throw new Error('VAPID 공개 키가 설정되지 않았습니다.');
      }

      console.log('FCM 토큰 요청 중...');
      const messaging = await getMessagingInstance();
      // Firebase SDK가 별도의 서비스 워커(firebase-messaging-sw.js)를 자동 등록해
      // 중복 알림이 발생하지 않도록, 명시적으로 현재 등록된 서비스 워커를 전달한다.
      const registration = await navigator.serviceWorker.ready;
      const fcmToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (fcmToken) {
        console.log('FCM 토큰 발급 성공:', fcmToken);

        // 백엔드 API에 맞게 fcm_token 전송 (학번은 백엔드에서 세션으로 추출)
        await subscribeToPushNotifications({
          fcm_token: fcmToken,
          platform: 'web',
        });

        console.log('FCM 토큰을 서버에 성공적으로 등록했습니다.');

        // FCM 토큰 발급 후 실제 푸시 구독 생성
        console.log('서비스 워커 준비 상태 확인 중...');
        console.log('서비스 워커 ready 상태:', registration);

        // 서비스 워커 활성 상태 재확인
        if (!registration.active) {
          console.error('활성 서비스 워커가 없음:', registration);
          throw new Error('활성 서비스 워커가 없습니다. 서비스 워커 등록을 다시 시도해주세요.');
        }

        // PushManager 지원 확인
        if (!registration.pushManager) {
          console.error('PushManager가 지원되지 않음');
          throw new Error('PushManager를 지원하지 않는 브라우저입니다.');
        }

        console.log('활성 서비스 워커 확인됨:', registration.active);
        console.log('PushManager 지원 확인됨:', !!registration.pushManager);

        const vapidKey = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY || '';

        // VAPID 키를 Uint8Array로 변환
        const vapidKeyBuffer = urlBase64ToUint8Array(vapidKey);

        console.log('푸시 구독 생성 중...', {
          originalVapidKey: vapidKey,
          vapidKeyLength: vapidKey.length,
          vapidKeyBuffer: vapidKeyBuffer,
          vapidKeyBufferLength: vapidKeyBuffer.length,
          serviceWorkerActive: !!registration.active,
          pushManagerSupported: 'pushManager' in registration,
        });

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: new Uint8Array(vapidKeyBuffer),
        });

        console.log('구독 결과:', subscription);

        if (subscription) {
          console.log('푸시 구독 성공:', {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.getKey('p256dh'),
              auth: subscription.getKey('auth'),
            },
          });
        }

        // 상태 업데이트
        setState((prev) => {
          console.log('상태 업데이트 전:', prev.subscription);
          const newState = {
            ...prev,
            subscription,
            isLoading: false,
          };
          console.log('상태 업데이트 후:', newState.subscription);
          return newState;
        });

        return subscription;
      } else {
        throw new Error('FCM 토큰을 발급받지 못했습니다. 권한을 확인하세요.');
      }
    } catch (error) {
      console.error('FCM 토큰 생성 및 구독 오류:', error);

      let errorMsg = 'FCM 토큰 생성 중 오류가 발생했습니다.';

      if (error instanceof Error) {
        errorMsg = error.message;

        // 특정 에러에 대한 더 자세한 메시지
        if (error.message.includes('messaging/unsupported-browser')) {
          errorMsg = '현재 브라우저는 FCM을 지원하지 않습니다.';
        } else if (error.message.includes('messaging/permission-blocked')) {
          errorMsg = '푸시 알림 권한이 차단되었습니다. 브라우저 설정에서 허용해주세요.';
        } else if (error.message.includes('messaging/permission-default')) {
          errorMsg = '푸시 알림 권한을 먼저 요청해주세요.';
        } else if (error.message.includes('VAPID')) {
          errorMsg = 'VAPID 키 설정에 문제가 있습니다. 환경변수를 확인해주세요.';
        }
      }

      setState((prev) => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
      return null;
    }
  }, []);

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
    console.log('getSubscriptionData 호출됨, 현재 상태:', {
      hasSubscription: !!state.subscription,
      subscription: state.subscription,
      stateKeys: Object.keys(state),
    });

    if (!state.subscription) {
      console.log('구독 데이터 추출 실패: subscription이 없음');
      return null;
    }

    try {
      console.log('구독 객체 분석:', {
        endpoint: state.subscription.endpoint,
        options: state.subscription.options,
        hasGetKey: typeof state.subscription.getKey === 'function',
      });

      const p256dh = state.subscription.getKey('p256dh');
      const auth = state.subscription.getKey('auth');

      console.log('키 추출 결과:', { p256dh: !!p256dh, auth: !!auth });

      if (!p256dh || !auth) {
        console.log('키 추출 실패 - p256dh 또는 auth가 없음');
        return null;
      }

      const subscriptionData = {
        endpoint: state.subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dh))),
          auth: btoa(String.fromCharCode(...new Uint8Array(auth))),
        },
      };

      console.log('구독 데이터 추출 성공:', subscriptionData);
      return subscriptionData;
    } catch (error) {
      console.error('구독 데이터 추출 오류:', error);
      return null;
    }
  }, [state]);

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

  // 구독 상태가 변경될 때마다 구독 데이터 확인
  useEffect(() => {
    if (state.subscription) {
      console.log('구독 상태 변경됨, 구독 데이터 확인:', getSubscriptionData());
    }
  }, [state.subscription, getSubscriptionData]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    getSubscriptionData,
  };
};

export default usePushNotification;
