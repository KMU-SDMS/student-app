# StudentApp PWA 전환 작업 목록

## 📋 전체 작업 개요
StudentApp을 PWA로 전환하면서 Android/iOS 디바이스별 안전영역과 노치를 고려한 반응형 디자인을 구현합니다. 공지사항 기능을 중심으로 한 학생용 교육 플랫폼으로 발전시킵니다.

---

## 🚀 Phase 1: PWA 기반 설정

### 1.1 PWA 매니페스트 설정
- [ ] `app.json`에 PWA 설정 추가
  - [ ] `web.manifest` 속성 구성
  - [ ] 아이콘 설정 (다양한 크기)
  - [ ] 테마 색상 설정
  - [ ] 시작 URL 설정
  - [ ] 디스플레이 모드 설정 (`standalone`, `fullscreen`)

### 1.2 Service Worker 구현
- [ ] `public/sw.js` 파일 생성
- [ ] 캐싱 전략 구현
  - [ ] 정적 자산 캐싱
  - [ ] API 응답 캐싱
  - [ ] 오프라인 페이지 제공
- [ ] 업데이트 알림 기능

### 1.3 웹 최적화 설정
- [ ] `expo.json` 웹 설정 개선
- [ ] 메타 태그 최적화
- [ ] SEO 설정
- [ ] 성능 최적화

---

## 📱 Phase 2: 공지사항 기능 최적화

### 2.1 공지사항 API 웹 최적화

#### 2.1.1 공지사항 데이터 관리 개선
- [ ] `hooks/useNotices.ts` 생성
  - [ ] 기존 API 연동 유지
  - [ ] 웹 환경 최적화
  - [ ] 캐싱 전략 구현
  - [ ] 오프라인 지원

```typescript
// hooks/useNotices.ts 예시 구조
export const useNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchNotices = async () => {
    setLoading(true);
    try {
      const response = await apiService.getNotices();
      setNotices(response.data);
      // 로컬 스토리지에 캐싱
      await AsyncStorage.setItem('notices', JSON.stringify(response.data));
    } catch (error) {
      setError(error);
      // 오프라인 시 캐시된 데이터 사용
      const cached = await AsyncStorage.getItem('notices');
      if (cached) setNotices(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };
  
  return { notices, loading, error, fetchNotices };
};
```

#### 2.1.2 공지사항 UI 컴포넌트 개선
- [ ] `components/NoticeCard.tsx` 반응형 개선
- [ ] `components/NoticeList.tsx` 웹 최적화
- [ ] `components/NoticeDetail.tsx` 모바일/웹 통합

### 2.2 안전영역 처리 시스템 구축

#### 2.2.1 공통 안전영역 훅 생성
- [ ] `hooks/useSafeArea.ts` 생성
  - [ ] Android Edge-to-edge 지원
  - [ ] iOS 노치/다이나믹 아일랜드 대응
  - [ ] 웹 CSS env() 함수 활용
  - [ ] 플랫폼별 조건부 처리

#### 2.2.2 안전영역 컴포넌트 생성
- [ ] `components/SafeAreaView.tsx` 생성
  - [ ] 플랫폼별 안전영역 적용
  - [ ] 커스터마이징 옵션 제공
  - [ ] 애니메이션 지원

#### 2.2.3 레이아웃 상수 업데이트
- [ ] `constants/layoutConstants.ts` 확장
  - [ ] 안전영역 기반 오프셋 계산
  - [ ] 화면 크기별 임계값 조정
  - [ ] 플랫폼별 특수 값 추가

### 2.3 반응형 디자인 시스템

#### 2.3.1 반응형 훅 생성
- [ ] `hooks/useResponsiveLayout.ts` 생성
  - [ ] 화면 크기 분류 (small, medium, large)
  - [ ] 디바이스 타입 감지 (phone, tablet, desktop)
  - [ ] 방향 변경 감지

#### 2.3.2 반응형 컴포넌트 생성
- [ ] `components/ResponsiveContainer.tsx` 생성
- [ ] `components/ResponsiveText.tsx` 생성
- [ ] `components/ResponsiveButton.tsx` 생성

#### 2.3.3 스타일 시스템 업데이트
- [ ] `styles/responsiveStyles.ts` 생성
  - [ ] 화면 크기별 스타일 정의
  - [ ] 플랫폼별 스타일 변형
  - [ ] 테마별 반응형 스타일

---

## 🏠 Phase 3: 홈 화면 중심 UI/UX 개선

### 3.1 홈 화면 최적화
- [ ] `app/(tabs)/index.tsx` 개선
  - [ ] 공지사항 우선 표시
  - [ ] 학생 중심 레이아웃
  - [ ] 반응형 카드 디자인
  - [ ] 빠른 액세스 버튼

### 3.2 공지사항 홈 통합
- [ ] 홈 화면에 공지사항 미리보기
- [ ] 중요 공지사항 하이라이트
- [ ] 최신 공지사항 알림 표시
- [ ] 공지사항 카테고리 필터링

### 3.3 학생용 UI 컴포넌트
- [ ] `components/StudentCard.tsx` 생성
- [ ] `components/QuickAction.tsx` 생성
- [ ] `components/NoticePreview.tsx` 생성
- [ ] `components/StudentHeader.tsx` 생성

---

## 🎨 Phase 4: UI/UX 개선

### 4.1 탭바 안전영역 대응
- [ ] `app/(tabs)/_layout.tsx` 수정
  - [ ] iOS 홈 인디케이터 고려
  - [ ] Android 네비게이션 바 고려
  - [ ] 웹 하단 여백 조정
  - [ ] 공지사항 탭 우선 표시

### 4.2 공지사항 화면 최적화
- [ ] `app/notices.tsx` 개선
  - [ ] 안전영역 기반 레이아웃 조정
  - [ ] 검색 및 필터링 UI 개선
  - [ ] 무한 스크롤 구현
  - [ ] 새로고침 제스처 지원

### 4.3 공지사항 상세 화면 개선
- [ ] `app/notice-detail.tsx` 개선
  - [ ] 반응형 텍스트 레이아웃
  - [ ] 이미지 확대/축소 기능
  - [ ] 공유 기능 추가
  - [ ] 북마크 기능

---

## 🔧 Phase 5: 플랫폼별 최적화

### 5.1 Android 최적화
- [ ] Edge-to-edge 디자인 적용
- [ ] 시스템 바 투명도 처리
- [ ] 제스처 네비게이션 대응
- [ ] 다크 테마 시스템 바 색상

### 5.2 iOS 최적화
- [ ] 노치 영역 처리
- [ ] 다이나믹 아일랜드 대응
- [ ] 홈 인디케이터 고려
- [ ] Safe Area Insets 활용

### 5.3 웹 최적화
- [ ] CSS Grid/Flexbox 레이아웃
- [ ] 터치 제스처 지원
- [ ] 키보드 네비게이션
- [ ] 접근성 개선
- [ ] 공지사항 웹 전용 기능 (인쇄, 공유)

---

## 🧪 Phase 6: 테스트 및 검증

### 6.1 단위 테스트
- [ ] 안전영역 훅 테스트
- [ ] 반응형 컴포넌트 테스트
- [ ] 공지사항 API 훅 테스트
- [ ] 유틸리티 함수 테스트

### 6.2 통합 테스트
- [ ] 플랫폼별 렌더링 테스트
- [ ] 라우팅 테스트
- [ ] 상태 관리 테스트
- [ ] 공지사항 API 통합 테스트

### 6.3 E2E 테스트
- [ ] 공지사항 조회 시나리오 테스트
- [ ] 크로스 브라우저 테스트
- [ ] 모바일 디바이스 테스트
- [ ] 성능 테스트

---

## 📦 Phase 7: 빌드 및 배포

### 7.1 빌드 설정
- [ ] 웹 빌드 최적화
- [ ] 번들 크기 최적화
- [ ] 코드 분할 설정
- [ ] 이미지 최적화

### 7.2 배포 설정
- [ ] PWA 배포 설정
- [ ] 도메인 및 HTTPS 설정
- [ ] CDN 설정
- [ ] 캐싱 전략 적용

### 7.3 모니터링 설정
- [ ] 성능 모니터링
- [ ] 에러 추적
- [ ] 사용자 분석
- [ ] PWA 메트릭

---

## 🔍 Phase 8: 품질 보증

### 8.1 접근성 검증
- [ ] 스크린 리더 호환성
- [ ] 키보드 네비게이션
- [ ] 색상 대비 검증
- [ ] 터치 타겟 크기 검증

### 8.2 성능 검증
- [ ] Core Web Vitals 측정
- [ ] 로딩 시간 최적화
- [ ] 메모리 사용량 최적화
- [ ] 배터리 사용량 최적화

### 8.3 사용성 검증
- [ ] 사용자 테스트
- [ ] A/B 테스트
- [ ] 피드백 수집
- [ ] 개선사항 적용

---

## 📊 우선순위 및 일정

### 높은 우선순위 (1-2주)
1. PWA 매니페스트 설정
2. 공지사항 API 웹 최적화
3. 홈 화면 중심 UI 개선

### 중간 우선순위 (3-4주)
1. 안전영역 처리 시스템 구축
2. 반응형 디자인 적용
3. 플랫폼별 최적화

### 낮은 우선순위 (5-6주)
1. 고급 기능 구현 (오프라인 지원, 푸시 알림)
2. 테스트 및 검증
3. 성능 최적화

---

## 🛠️ 기술적 고려사항

### 안전영역 처리
- **Android**: `edgeToEdgeEnabled: true` 설정 활용
- **iOS**: `react-native-safe-area-context` 라이브러리 활용
- **웹**: CSS `env(safe-area-inset-*)` 함수 활용

### 반응형 디자인
- **Breakpoints**: 320px, 768px, 1024px, 1440px
- **접근 방식**: Mobile-first, Progressive Enhancement
- **단위**: rem, em, vw, vh, % 활용

### 성능 최적화
- **코드 분할**: 플랫폼별 번들 분리
- **이미지 최적화**: WebP, AVIF 포맷 활용
- **캐싱**: Service Worker 기반 캐싱 전략
- **공지사항 최적화**: API 응답 캐싱, 무한 스크롤

### 공지사항 특화 기능
- **실시간 업데이트**: 새 공지사항 알림
- **오프라인 지원**: 캐시된 공지사항 조회
- **검색 및 필터링**: 카테고리별, 날짜별 필터
- **공유 기능**: 웹/모바일 공유 최적화

---

이 작업 목록을 통해 StudentApp을 PWA로 성공적으로 전환하고, 공지사항 기능을 중심으로 한 학생용 교육 플랫폼으로 발전시킬 수 있습니다.
