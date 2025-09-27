import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface SplashScreenProps {
  onFinish: () => void;
  isVisible: boolean;
  progress?: number;
}

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish, isVisible, progress = 0 }: SplashScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // 적절한 아이콘 크기 선택 (화면 크기에 따라)
  const getAppIcon = () => {
    // PWA 매니페스트의 아이콘 중에서 적절한 크기 선택
    // 모바일에서는 더 작은 아이콘을 우선 사용
    const isMobile = width < 768;
    return isMobile ? '/icons/icon-192.png' : '/icons/icon-512.png';
  };

  // 간단하고 직접적인 아이콘 경로들
  const fallbackIcons = [
    // 가장 간단한 경로부터 시도
    { type: 'uri', source: '/icons/icon-192.png' },
    { type: 'uri', source: '/icons/icon-512.png' },
    // 캐시 버스터 추가
    { type: 'uri', source: `/icons/icon-192.png?t=${Date.now()}` },
    { type: 'uri', source: `/icons/icon-512.png?t=${Date.now()}` },
    // 절대 경로 (웹에서 확실한 방법)
    ...(typeof window !== 'undefined'
      ? [
          { type: 'uri', source: `${window.location.origin}/icons/icon-192.png` },
          { type: 'uri', source: `${window.location.origin}/icons/icon-512.png` },
        ]
      : []),
  ];

  // 애니메이션 값들
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;

  // 아이콘 로딩 상태
  const [iconLoaded, setIconLoaded] = useState(false);
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const [showFallbackSVG, setShowFallbackSVG] = useState(false);
  const [forcePNG, setForcePNG] = useState(true); // PNG 강제 표시

  useEffect(() => {
    if (!isVisible) return;

    // 전체 애니메이션 시퀀스
    const animationSequence = Animated.sequence([
      // 1. 배경 페이드 인
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // 2. 로고 애니메이션 (스케일 + 페이드)
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // 3. 텍스트 페이드 인
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // 4. 로고 회전 애니메이션 (선택적)
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    // 애니메이션 시작
    animationSequence.start();

    // 2.5초 후 페이드 아웃 시작
    const timer = setTimeout(() => {
      // 페이드 아웃 애니메이션
      Animated.timing(fadeOutAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // 페이드 아웃 완료 후 메인 앱으로 전환
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, rotateAnim, logoOpacity, textOpacity, fadeOutAnim, onFinish, isVisible]);

  // 회전 애니메이션 인터폴레이션
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // 스플래시 스크린이 보이지 않으면 렌더링하지 않음
  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.background },
        { opacity: Animated.multiply(fadeAnim, fadeOutAnim) },
      ]}
    >
      {/* 배경 그라디언트 효과 (웹에서 더 부드럽게) */}
      <View style={[styles.backgroundGradient, { backgroundColor: colors.background }]} />

      {/* 메인 콘텐츠 */}
      <View style={styles.content}>
        {/* 로고 영역 */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: scaleAnim }, { rotate: rotateInterpolate }],
            },
          ]}
        >
          {/* 앱 아이콘 (PNG 이미지) */}
          <View style={styles.logoIcon}>
            {!showFallbackSVG && forcePNG ? (
              <>
                {/* React Native Image (모바일 앱용) */}
                <Image
                  source={{ uri: fallbackIcons[currentIconIndex].source }}
                  style={[styles.logoImage, { opacity: iconLoaded ? 1 : 0.3 }]}
                  resizeMode="contain"
                  onLoad={() => {
                    setIconLoaded(true);
                    console.log('PNG 아이콘 로드 성공:', fallbackIcons[currentIconIndex]);
                  }}
                  onError={(error) => {
                    console.log('PNG 아이콘 로드 실패:', fallbackIcons[currentIconIndex], error);
                    // 다음 아이콘으로 시도
                    if (currentIconIndex < fallbackIcons.length - 1) {
                      setCurrentIconIndex(currentIconIndex + 1);
                    } else {
                      // 모든 PNG 아이콘 로드 실패 시 SVG 폴백 사용
                      console.log('모든 PNG 아이콘 로드 실패, SVG 폴백 사용');
                      setShowFallbackSVG(true);
                    }
                  }}
                />
                {/* 웹용 HTML img 태그 (백업) */}
                {typeof window !== 'undefined' && (
                  <img
                    src={fallbackIcons[currentIconIndex].source}
                    alt="App Icon"
                    style={{
                      width: 60,
                      height: 60,
                      opacity: iconLoaded ? 1 : 0.3,
                      display: 'none', // React Native Image가 우선
                    }}
                    onLoad={() => {
                      setIconLoaded(true);
                      console.log('HTML img 로드 성공:', fallbackIcons[currentIconIndex]);
                    }}
                    onError={(error) => {
                      console.log('HTML img 로드 실패:', fallbackIcons[currentIconIndex], error);
                    }}
                  />
                )}
              </>
            ) : (
              // PNG 로딩 실패 시 SVG 폴백
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill={colors.tint} opacity="0.1" />
                <path
                  d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                  fill={colors.tint}
                  stroke={colors.tint}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" fill={colors.background} />
              </svg>
            )}
          </View>
        </Animated.View>

        {/* 앱 이름 */}
        <Animated.Text style={[styles.appName, { color: colors.text }, { opacity: textOpacity }]}>
          국민대학교 SDS
        </Animated.Text>

        {/* 로딩 인디케이터 */}
        <Animated.View style={[styles.loadingContainer, { opacity: textOpacity }]}>
          <View style={[styles.loadingDots, { borderColor: colors.tint }]}>
            <Animated.View style={[styles.dot, { backgroundColor: colors.tint }]} />
            <Animated.View style={[styles.dot, { backgroundColor: colors.tint }]} />
            <Animated.View style={[styles.dot, { backgroundColor: colors.tint }]} />
          </View>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            {progress > 0 ? `로딩 중... ${progress}%` : '로딩 중...'}
          </Text>
        </Animated.View>
      </View>

      {/* 하단 버전 정보 */}
      <Animated.View style={[styles.versionContainer, { opacity: textOpacity }]}>
        <Text style={[styles.versionText, { color: colors.text }]}>v1.0.0</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999, // Android에서도 zIndex 보장
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.95,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoIcon: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 40,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    opacity: 0.6,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.6,
  },
});
