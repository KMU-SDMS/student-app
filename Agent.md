# PostScan PWA 전환 Agent 가이드

## 프로젝트 개요
PostScan은 React Native Expo 기반의 송장 스캔 애플리케이션으로, PWA(Progressive Web App)로 전환하여 웹 환경에서도 네이티브 앱과 유사한 사용자 경험을 제공하는 것이 목표입니다.

## 현재 기술 스택
- **프레임워크**: React Native (Expo SDK 54)
- **라우팅**: Expo Router
- **상태 관리**: React Hooks
- **UI 라이브러리**: React Navigation
- **카메라**: Expo Camera
- **이미지 처리**: Expo Image Manipulator
- **안전영역**: react-native-safe-area-context

## PWA 전환 목표

### 1. 핵심 기능 유지
- 송장 스캔 및 분석 기능
- 카메라 접근 및 이미지 캡처
- 다크/라이트 테마 지원
- 하단 탭 네비게이션

### 2. 웹 최적화
- 반응형 디자인 구현
- 터치 제스처 지원
- 오프라인 기능 (Service Worker)
- 앱 설치 가능 (PWA 설치 프롬프트)

### 3. 크로스 플랫폼 호환성
- Android/iOS 네이티브 앱 유지
- 웹 브라우저 지원 추가
- 플랫폼별 최적화된 UI/UX

## 주요 도전과제

### 1. 카메라 API 차이점
- **네이티브**: Expo Camera (고성능)
- **웹**: getUserMedia API (제한적 기능)
- **해결방안**: 플랫폼별 조건부 렌더링

### 2. 안전영역 처리
- **Android**: Edge-to-edge 디자인, 시스템 바 고려
- **iOS**: 노치, 홈 인디케이터, 다이나믹 아일랜드 고려
- **웹**: CSS env() 함수 활용

### 3. 터치 제스처
- **네이티브**: react-native-gesture-handler
- **웹**: CSS touch-action, JavaScript 이벤트

## 구현 전략

### Phase 1: 웹 지원 기반 구축
1. PWA 매니페스트 설정
2. Service Worker 구현
3. 웹 전용 컴포넌트 분리
4. 반응형 레이아웃 적용

### Phase 2: 플랫폼별 최적화
1. 안전영역 처리 개선
2. 카메라 기능 웹 대응
3. 터치 제스처 통합
4. 성능 최적화

### Phase 3: 고급 기능
1. 오프라인 지원
2. 푸시 알림 (웹)
3. 앱 설치 UX 개선
4. 접근성 향상

## 기술적 고려사항

### 1. 안전영역 처리
```typescript
// Android/iOS/Web 공통 안전영역 훅
const useSafeArea = () => {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  
  return {
    top: isWeb ? 0 : insets.top,
    bottom: isWeb ? 0 : insets.bottom,
    left: isWeb ? 0 : insets.left,
    right: isWeb ? 0 : insets.right,
  };
};
```

### 2. 카메라 플랫폼 분기
```typescript
// 플랫폼별 카메라 컴포넌트
const CameraComponent = () => {
  if (Platform.OS === 'web') {
    return <WebCamera />;
  }
  return <ExpoCamera />;
};
```

### 3. 반응형 디자인
```typescript
// 화면 크기별 레이아웃 조정
const useResponsiveLayout = () => {
  const { width, height } = useWindowDimensions();
  
  return {
    isSmallScreen: height < 700,
    isMediumScreen: height >= 700 && height < 900,
    isLargeScreen: height >= 900,
  };
};
```

## 성능 최적화

### 1. 번들 크기 최적화
- 플랫폼별 코드 분할
- 사용하지 않는 라이브러리 제거
- 이미지 최적화

### 2. 로딩 성능
- 지연 로딩 (Lazy Loading)
- 프리로딩 전략
- 캐싱 최적화

### 3. 런타임 성능
- 메모이제이션 활용
- 불필요한 리렌더링 방지
- 애니메이션 최적화

## 테스트 전략

### 1. 단위 테스트
- 컴포넌트별 테스트
- 훅 테스트
- 유틸리티 함수 테스트

### 2. 통합 테스트
- 플랫폼별 기능 테스트
- 라우팅 테스트
- 상태 관리 테스트

### 3. E2E 테스트
- 사용자 시나리오 테스트
- 크로스 브라우저 테스트
- 모바일/데스크톱 테스트

## 배포 전략

### 1. 네이티브 앱
- Google Play Store (Android)
- Apple App Store (iOS)

### 2. PWA
- 웹 호스팅 (Vercel/Netlify)
- 도메인 설정
- HTTPS 필수

### 3. CI/CD
- GitHub Actions
- 자동화된 빌드/배포
- 환경별 설정 관리

## 모니터링 및 분석

### 1. 성능 모니터링
- Core Web Vitals
- 앱 성능 메트릭
- 사용자 경험 지표

### 2. 에러 추적
- 크래시 리포팅
- 사용자 피드백
- 로그 분석

### 3. 사용자 분석
- 사용 패턴 분석
- 플랫폼별 사용률
- 기능별 사용 통계

## 보안 고려사항

### 1. 데이터 보호
- 개인정보 처리 방침
- 암호화 통신
- 로컬 스토리지 보안

### 2. 권한 관리
- 카메라 권한 요청
- 위치 정보 처리
- 알림 권한

### 3. 웹 보안
- CSP (Content Security Policy)
- HTTPS 강제
- XSS 방지

## 유지보수 계획

### 1. 정기 업데이트
- 의존성 업데이트
- 보안 패치
- 기능 개선

### 2. 사용자 피드백
- 버그 리포트 처리
- 기능 요청 검토
- 사용성 개선

### 3. 문서화
- API 문서 유지
- 사용자 가이드 업데이트
- 개발자 문서 관리

---

이 가이드는 PostScan PWA 전환 프로젝트의 전체적인 방향성과 기술적 접근 방법을 제시합니다. 각 단계별로 세부 구현 사항은 Task.md에서 확인할 수 있습니다.
