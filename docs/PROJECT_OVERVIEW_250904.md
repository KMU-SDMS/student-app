# PostScan 프로젝트 개요

본 문서는 React Native(Expo) 기반 PostScan 앱의 폴더 구조, 각 폴더 역할, 현재 구현된 기능을 요약합니다.

## 폴더 구조와 역할
```
PostScan/
  app/
    _layout.tsx               // 앱 루트 레이아웃 (Stack + ThemeProvider)
    (tabs)/
      _layout.tsx             // 하단 탭 레이아웃 (Home, Scan)
      index.tsx               // Home 탭 (현재 빈 화면)
      scan.tsx                // Scan 탭 (카메라/촬영 UI)
    +not-found.tsx            // 라우팅 404 화면
  assets/
    fonts/                    // 앱 폰트 리소스
    images/                   // 아이콘/스플래시/로고 등 이미지 리소스
  components/
    ui/                       // 탭바 배경, 아이콘 등 UI 유틸 컴포넌트
    Collapsible.tsx 등        // ThemedText/ThemedView 등 테마 컴포넌트
  constants/
    Colors.ts                 // 테마 색상 정의
  hooks/
    useColorScheme*.ts        // 다크/라이트 모드 관련 훅
  scripts/
    reset-project.js          // 템플릿 초기화 스크립트
  app.json                    // Expo 앱 설정(iOS 권한 등)
  package.json                // 의존성/스크립트 정의
  tsconfig.json               // TypeScript 설정
  eslint.config.js            // ESLint 설정
```

### 주요 폴더 설명
- `app/`: 화면(라우트) 소스. Expo Router 규칙을 따릅니다.
- `app/(tabs)/`: 하단 탭 네비게이션(홈/스캔) 화면.
- `components/`: 재사용 UI 컴포넌트.
- `assets/`: 정적 리소스(폰트/이미지).
- `hooks/`: 공용 커스텀 훅.
- `constants/`: 상수/테마 값.
- `scripts/`: 개발 편의 스크립트.

## 현재까지 구현된 기능
- 하단 탭 구조
  - `Home` 탭: 현재 빈 화면(향후 위젯/알림 배치 예정)
  - `Scan` 탭: 카메라 스캔 화면
- 스캔 화면(Scan)
  - 카메라 미리보기 전체 화면 표시
  - 플래시 토글(켜기/끄기)
  - 촬영 버튼(하단 중앙 원형)
  - 하단 탭 바/세이프영역을 고려한 컨트롤 위치 보정
  - 안내 텍스트(프레임 중앙 정렬 가이드)
- 권한 처리
  - 카메라 접근 권한 요청 및 상태별 안내 UI
  - iOS 권한 문구 설정(`app.json`의 `NSCameraUsageDescription`)
- 탐색(Explore) 탭 완전 제거(파일 삭제 및 탭 미노출)

## 실행 방법
```
cd PostScan
npm start
```
- 에뮬레이터/디바이스에서 하단 `Home | Scan` 확인
- `Scan` 탭에서 카메라 프리뷰/플래시/촬영 버튼 동작 확인

## 다음 단계(제안)
- QR/바코드 실시간 인식(애니메이션 포함)
- 촬영 이미지 전처리 및 업로드(사전서명 URL) 연동
- Supabase/백엔드 API 연동(OCR/대조/승인)
- Home 탭에 최근 스캔/공지 위젯 추가
