import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { usePushNotification } from '../hooks/usePushNotification';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { updateSubscriptionStatus, getSubscriptionStatus } from '@/services/apiService';

interface NotificationPermissionProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  showTitle?: boolean;
  compact?: boolean;
}

export const NotificationPermission: React.FC<NotificationPermissionProps> = ({
  onPermissionGranted,
  onPermissionDenied,
  showTitle = true,
  compact = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const accent = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint');

  const {
    isSupported,
    permission,
    subscription,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    getSubscriptionData,
  } = usePushNotification();

  // 구독 활성 상태 관리
  const [isSubscriptionActive, setIsSubscriptionActive] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);

  // FCM 토큰 가져오기 함수
  const getFcmToken = async (): Promise<string | null> => {
    try {
      const { getToken } = await import('firebase/messaging');
      const { getMessagingInstance } = await import('@/services/firebase');
      const vapidKey = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY || '';

      if (!vapidKey) {
        console.warn('VAPID 키가 설정되지 않았습니다.');
        return null;
      }

      const messaging = await getMessagingInstance();
      const registration = await navigator.serviceWorker.ready;
      const fcmToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });

      return fcmToken || null;
    } catch (error) {
      console.error('FCM 토큰 가져오기 오류:', error);
      return null;
    }
  };

  // 구독 상태 조회 함수 (브라우저 알림 허용이 되어있을 때만 사용)
  const fetchSubscriptionStatus = useCallback(async () => {
    if (permission !== 'granted') {
      return;
    }

    setIsLoadingStatus(true);
    try {
      const fcmToken = await getFcmToken();
      if (!fcmToken) {
        console.warn('FCM 토큰을 가져올 수 없어 구독 상태를 조회할 수 없습니다.');
        setIsLoadingStatus(false);
        return;
      }

      const status = await getSubscriptionStatus(fcmToken);
      if (status) {
        setIsSubscriptionActive(status.active);
        console.log('구독 상태 조회 성공:', status);
      } else {
        console.warn('구독 상태를 조회할 수 없습니다. 기본값(false)을 사용합니다.');
        setIsSubscriptionActive(false);
      }
    } catch (error) {
      console.error('구독 상태 조회 오류:', error);
      setIsSubscriptionActive(false);
    } finally {
      setIsLoadingStatus(false);
    }
  }, [permission]);

  // 브라우저 알림 허용이 되어있을 때 백엔드 구독 상태 조회
  useEffect(() => {
    if (permission === 'granted') {
      fetchSubscriptionStatus();
    }
  }, [permission, fetchSubscriptionStatus]);

  const handleRequestPermission = async () => {
    try {
      console.log('권한 요청 시작...');
      const granted = await requestPermission();
      console.log('권한 요청 결과:', granted);

      if (granted) {
        console.log('권한 허용됨, 구독 시도 중...');

        // 약간의 지연을 두어 상태 업데이트가 완료되도록 함
        await new Promise((resolve) => setTimeout(resolve, 100));

        const newSubscription = await subscribe();
        console.log('구독 결과:', newSubscription);

        if (newSubscription) {
          const subscriptionData = getSubscriptionData();
          console.log('구독 데이터:', subscriptionData);

          // 구독 성공 후 백엔드 구독 상태 조회
          await fetchSubscriptionStatus();

          Alert.alert(
            '알림 설정 완료',
            '새로운 공지사항이 등록되면 푸시 알림을 받으실 수 있습니다.',
            [{ text: '확인' }],
          );

          onPermissionGranted?.();
        } else {
          console.error('구독 생성 실패');
          Alert.alert(
            '구독 실패',
            '푸시 알림 구독에 실패했습니다. 설정에 문제가 있을 수 있습니다. 관리자에게 문의하거나 잠시 후 다시 시도해주세요.',
            [{ text: '확인' }],
          );
        }
      } else {
        console.log('권한 거부됨');
        Alert.alert(
          '알림 권한 필요',
          '새로운 공지사항 알림을 받으려면 브라우저에서 알림을 허용해주세요.\n\n설정 > 사이트 설정 > 알림에서 변경할 수 있습니다.',
          [{ text: '확인' }],
        );

        onPermissionDenied?.();
      }
    } catch (err) {
      console.error('알림 권한 요청 오류:', err);
      Alert.alert(
        '오류',
        `알림 설정 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
      );
    }
  };

  const handleUnsubscribe = async () => {
    Alert.alert('알림 해제', '푸시 알림을 해제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '해제',
        style: 'destructive',
        onPress: async () => {
          const success = await unsubscribe();
          if (success) {
            Alert.alert('알림 해제 완료', '푸시 알림이 해제되었습니다.');
          }
        },
      },
    ]);
  };

  // 백엔드 구독 상태 활성화 핸들러 (브라우저 알림 허용되어 있고 백엔드 상태가 false일 때 사용)
  const handleActivateBackendSubscription = async () => {
    console.log('백엔드 구독 활성화 시도');

    setIsUpdatingStatus(true);
    try {
      await updateSubscriptionStatus(true);
      console.log('백엔드 구독 상태 활성화 성공');
      setIsSubscriptionActive(true);

      // 상태 업데이트 후 다시 조회하여 동기화
      await fetchSubscriptionStatus();

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('구독 활성화 완료\n알림 구독이 활성화되었습니다.');
      } else {
        Alert.alert('구독 활성화 완료', '알림 구독이 활성화되었습니다.', [{ text: '확인' }]);
      }
    } catch (err) {
      console.error('백엔드 구독 상태 활성화 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(`구독 활성화 중 오류가 발생했습니다: ${errorMessage}`);
      } else {
        Alert.alert('오류', `구독 활성화 중 오류가 발생했습니다: ${errorMessage}`);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getPermissionStatus = () => {
    if (!isSupported) {
      return { text: '지원되지 않음', color: colors.text, disabled: true };
    }

    switch (permission) {
      case 'granted':
        if (subscription && isSubscriptionActive) {
          return { text: '구독 중', color: '#10B981', disabled: false };
        }
        return subscription
          ? { text: '구독 필요', color: '#F59E0B', disabled: false }
          : { text: '구독 필요', color: '#F59E0B', disabled: false };
      case 'denied':
        return { text: '알림 차단됨', color: '#EF4444', disabled: true };
      default:
        return { text: '알림 허용 필요', color: colors.text, disabled: false };
    }
  };

  const getUnsupportedMessage = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !isChrome;

    if (isIOS) {
      const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
      if (match) {
        const majorVersion = parseInt(match[1], 10);
        const minorVersion = parseInt(match[2], 10);

        if (majorVersion < 16 || (majorVersion === 16 && minorVersion < 4)) {
          return `iOS ${majorVersion}.${minorVersion}에서는 푸시 알림을 지원하지 않습니다. iOS 16.4 이상으로 업데이트해주세요.`;
        }
      }

      if (!isSafari && !isChrome) {
        return 'iOS에서는 Safari 또는 Chrome 브라우저에서만 푸시 알림을 지원합니다.';
      }

      return 'iOS에서 푸시 알림을 사용하려면 홈 화면에 앱을 추가하거나 Safari에서 사용해주세요.';
    }

    if (isAndroid && isChrome) {
      return '안드로이드 Chrome에서 푸시 알림이 지원되지 않는 경우, 브라우저를 최신 버전으로 업데이트해주세요.';
    }

    return '이 브라우저는 푸시 알림을 지원하지 않습니다. Chrome, Firefox, Edge 또는 Safari를 사용해주세요.';
  };

  const status = getPermissionStatus();

  if (!isSupported) {
    return (
      <ThemedView
        style={{
          padding: compact ? 12 : 16,
          backgroundColor: colors.background,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.text + '20',
        }}
      >
        <ThemedText
          style={{
            fontSize: compact ? 13 : 14,
            color: colors.text,
            textAlign: 'center',
            lineHeight: compact ? 18 : 20,
          }}
        >
          {getUnsupportedMessage()}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={{
        padding: compact ? 12 : 16,
        backgroundColor: colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.text + '20',
      }}
    >
      {showTitle && (
        <ThemedText
          style={{
            fontSize: compact ? 16 : 18,
            fontWeight: '600',
            marginBottom: compact ? 8 : 12,
            color: colors.text,
          }}
        >
          📱 푸시 알림 설정
        </ThemedText>
      )}

      <View style={{ marginBottom: compact ? 8 : 12 }}>
        <ThemedText
          style={{
            fontSize: compact ? 13 : 14,
            color: colors.text,
            marginBottom: 4,
          }}
        >
          상태: <Text style={{ color: status.color, fontWeight: '500' }}>{status.text}</Text>
        </ThemedText>

        {!compact && (
          <ThemedText
            style={{
              fontSize: 12,
              color: colors.text + 'CC',
              lineHeight: 16,
            }}
          >
            새로운 공지사항이 등록되면 즉시 알림을 받을 수 있습니다.
          </ThemedText>
        )}
      </View>

      {error && (
        <View
          style={{
            backgroundColor: '#FEF2F2',
            borderColor: '#FECACA',
            borderWidth: 1,
            borderRadius: 6,
            padding: 8,
            marginBottom: compact ? 8 : 12,
          }}
        >
          <ThemedText
            style={{
              fontSize: 12,
              color: '#DC2626',
              lineHeight: 16,
            }}
          >
            {error}
          </ThemedText>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {permission !== 'granted' ? (
          // 1차: 브라우저 알림 허용이 안되어있으면 기존 방식대로 알림 구독까지 진행
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: accent,
              paddingVertical: compact ? 8 : 12,
              paddingHorizontal: 16,
              borderRadius: 6,
              alignItems: 'center',
              opacity: status.disabled || isLoading ? 0.5 : 1,
            }}
            onPress={handleRequestPermission}
            disabled={status.disabled || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: compact ? 13 : 14,
                  fontWeight: '500',
                }}
              >
                {permission === 'default' ? '알림 허용하기' : '다시 시도'}
              </Text>
            )}
          </TouchableOpacity>
        ) : permission === 'granted' && !subscription ? (
          // 브라우저 알림 허용은 되어있지만 구독이 없는 경우
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: accent,
              paddingVertical: compact ? 8 : 12,
              paddingHorizontal: 16,
              borderRadius: 6,
              alignItems: 'center',
              opacity: status.disabled || isLoading ? 0.5 : 1,
            }}
            onPress={handleRequestPermission}
            disabled={status.disabled || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: compact ? 13 : 14,
                  fontWeight: '500',
                }}
              >
                구독하기
              </Text>
            )}
          </TouchableOpacity>
        ) : permission === 'granted' && subscription && isSubscriptionActive === false ? (
          // 2차: 브라우저 알림 허용되어 있고 구독도 있지만 백엔드 상태가 false인 경우
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: accent,
              paddingVertical: compact ? 8 : 12,
              paddingHorizontal: 16,
              borderRadius: 6,
              alignItems: 'center',
              opacity: isUpdatingStatus || isLoadingStatus ? 0.5 : 1,
            }}
            onPress={handleActivateBackendSubscription}
            disabled={isUpdatingStatus || isLoadingStatus}
          >
            {isUpdatingStatus || isLoadingStatus ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: compact ? 13 : 14,
                  fontWeight: '500',
                }}
              >
                구독하기
              </Text>
            )}
          </TouchableOpacity>
        ) : permission === 'granted' && subscription && isSubscriptionActive === true ? (
          // 브라우저 알림 허용되어 있고 구독도 있고 백엔드 상태가 true인 경우 - 구독 중 표시
          <View
            style={{
              flex: 1,
              backgroundColor: colors.background,
              paddingVertical: compact ? 8 : 12,
              paddingHorizontal: 16,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#10B981',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: '#10B981',
                fontSize: compact ? 13 : 14,
                fontWeight: '600',
              }}
            >
              구독 중
            </Text>
          </View>
        ) : null}

        {permission === 'denied' && (
          <TouchableOpacity
            style={{
              paddingVertical: compact ? 8 : 12,
              paddingHorizontal: 16,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.text + '40',
              alignItems: 'center',
            }}
            onPress={() => {
              Alert.alert(
                '알림 설정 방법',
                '브라우저 주소창 옆의 🔒 아이콘을 클릭하여 알림을 허용으로 변경해주세요.\n\n또는 브라우저 설정 > 사이트 설정 > 알림에서 변경할 수 있습니다.',
                [{ text: '확인' }],
              );
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: compact ? 13 : 14,
                fontWeight: '500',
              }}
            >
              도움말
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 구독 상태 토글 버튼 (구독이 활성화된 경우에만 표시) */}
      {/* {permission === 'granted' && subscription && (
        <View style={{ marginTop: compact ? 8 : 12 }}>
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.text + '20',
              padding: compact ? 10 : 12,
              marginBottom: compact ? 6 : 8,
            }}
          >
            <ThemedText
              style={{
                fontSize: compact ? 12 : 13,
                color: colors.text + 'CC',
                marginBottom: 4,
              }}
            >
              백엔드 구독 상태:{' '}
              {isLoadingStatus ? (
                <Text style={{ color: colors.text + '99' }}>조회 중...</Text>
              ) : (
                <Text
                  style={{ color: isSubscriptionActive ? '#10B981' : '#F59E0B', fontWeight: '500' }}
                >
                  {isSubscriptionActive ? '활성화' : '비활성화'}
                </Text>
              )}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 11,
                color: colors.text + '99',
                lineHeight: 14,
              }}
            >
              백엔드의 구독 토큰 관리 상태를 변경합니다.
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[
              {
                backgroundColor: isSubscriptionActive ? '#F59E0B' : '#10B981',
                paddingVertical: compact ? 8 : 12,
                paddingHorizontal: 16,
                borderRadius: 6,
                alignItems: 'center',
                opacity: isUpdatingStatus ? 0.5 : 1,
              },
              Platform.OS === 'web' &&
                ({
                  cursor: isUpdatingStatus ? 'not-allowed' : 'pointer',
                } as any),
            ]}
            onPress={handleToggleSubscriptionStatus}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: compact ? 13 : 14,
                  fontWeight: '500',
                }}
              >
                {isSubscriptionActive ? '구독 비활성화' : '구독 활성화'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )} */}
    </ThemedView>
  );
};

export default NotificationPermission;
