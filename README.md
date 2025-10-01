# student-app 🎓

스마트 기숙사 시스템을 위한 학생용 애플리케이션입니다. React Native(Expo) 기반으로 개발되었으며, 현재는 `react-native-web`을 통해 PWA(Web) 중심으로 배포할 수 있도록 구성되어 있습니다. iOS/Android 실행도 가능합니다.

## 🚀 주요 기능

- **공지사항**: 중요/일반 공지 조회 및 상세 확인
- **점호 일정 캘린더**: 월간/주간 캘린더로 점호 일정 확인
- **관비 납부**: 납부 내역 확인 및 결제 흐름 연동
- **탭 기반 네비게이션**: 직관적인 하단 탭 UI
- **PWA 배포**: `react-native-web` + Expo Router를 활용한 웹 앱 배포

## 🛠 기술 스택

- **Runtime/Framework**: React Native 0.81.4, Expo SDK 54
- **Language**: TypeScript 5.8.x
- **Navigation**: React Navigation 7.x, Expo Router 6.x
- **Web**: react-native-web 0.21.x, Expo Webpack
- **UI**: Expo Vector Icons, 커스텀 Themed 컴포넌트
- **State**: React Hooks
- **HTTP Client**: Axios
- **Package Manager**: pnpm

## 📋 사전 요구사항

- Node.js 18+
- pnpm 9+
- Expo CLI

## 🚀 설치 및 실행

### 1. 저장소 클론

```bash
git clone [repository-url]
cd student-app
```

### 2. 의존성 설치 (pnpm)

```bash
pnpm install
```

### 3. 개발 서버 실행

```bash
# Expo 개발 서버
pnpm start

# Web(PWA)로 실행
pnpm web

# iOS 시뮬레이터로 실행 (옵션)
pnpm ios

# Android 에뮬레이터로 실행 (옵션)
pnpm android
```

## 🌐 PWA 빌드 & 배포

현재는 Web(PWA) 중심 배포를 지향합니다.

```bash
# 정적 웹 산출물 생성 (dist/)
pnpm exec expo export --platform web

# 생성 경로: dist/
```

- 생성된 `dist/` 폴더를 정적 호스팅(예: Vercel, Netlify, S3/CloudFront)에 업로드하면 배포가 완료됩니다.
- 저장소에 `vercel.json`이 포함되어 있다면, Vercel을 통해 정적 배포 구성이 가능합니다.

## 📱 사용법(핵심 플로우)

1. **공지사항**: 최신 공지 확인 → 상세 보기
2. **점호 캘린더**: 월간/주간 보기에서 일정 확인
3. **관비 납부**: 납부 정보 확인 및 결제 흐름 진행

## 🏗 프로젝트 구조

```
student-app/
├── app/                    # 앱 페이지 (Expo Router)
│   ├── (tabs)/            # 탭 네비게이션
│   ├── notices.tsx        # 공지사항 페이지
│   └── payment.tsx        # 관비 납부 페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # UI 컴포넌트
│   └── form/             # 폼 컴포넌트
├── hooks/                # 커스텀 훅
├── services/             # API 서비스
├── types/                # TypeScript 타입 정의
├── utils/                # 유틸리티 함수
└── styles/               # 스타일 정의
```

## 🔧 개발 명령어

```bash
# 개발 서버 시작
pnpm start

# 린팅 실행
pnpm lint

# 린팅 자동 수정
pnpm lint:fix

# 코드 포맷팅
pnpm format

# 코드 포맷팅 검사
pnpm format:check
```

## 📦 패키지 관리 (pnpm)

이 프로젝트는 **pnpm**을 사용하여 패키지를 관리합니다.

```bash
# 패키지 추가
pnpm add <패키지명>

# 개발 의존성 추가
pnpm add -D <패키지명>

# 패키지 제거
pnpm remove <패키지명>

# 패키지 업데이트
pnpm update
```

## 🐛 문제 해결

### Expo SDK/의존성 충돌

```bash
# 의존성 초기화 후 재설치
rimraf node_modules pnpm-lock.yaml
pnpm install
```

### Metro 캐시 문제

```bash
# Metro 캐시 정리
pnpm exec expo start --clear
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요.
