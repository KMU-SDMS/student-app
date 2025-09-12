# PostScan 📦

React Native 앱으로 Expo SDK 54를 사용하여 개발된 송장 스캔 및 분석 프로젝트입니다.

## 🚀 주요 기능

- **카메라 스캔**: 송장 촬영 및 이미지 처리
- **AI 분석**: 촬영된 송장의 텍스트 분석 및 데이터 추출
- **공지사항**: 중요 공지사항 및 일반 공지사항 관리
- **결제 관리**: 유지보수 결제 및 구독 관리
- **탭 기반 네비게이션**: 직관적인 사용자 인터페이스
- **크로스 플랫폼**: iOS, Android, Web 지원

## 🛠 기술 스택

- **Frontend**: React Native 0.81.4, Expo SDK 54
- **Language**: TypeScript 5.8.3
- **Navigation**: React Navigation 7.x
- **UI Components**: Expo Vector Icons, Custom Themed Components
- **Camera**: Expo Camera, Expo Image Picker
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Package Manager**: pnpm

## 📋 사전 요구사항

- Node.js 18+ 
- pnpm (권장) 또는 npm
- Expo CLI
- iOS Simulator (iOS 개발용)
- Android Studio (Android 개발용)

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone [repository-url]
cd postscan
```

### 2. 의존성 설치
```bash
# pnpm 사용 (권장)
pnpm install

# 또는 npm 사용
npm install
```

### 3. 앱 실행
```bash
# 개발 서버 시작
npx expo start

# 웹에서 실행
npx expo start --web

# iOS 시뮬레이터에서 실행
npx expo start --ios

# Android 에뮬레이터에서 실행
npx expo start --android
```

## 📱 사용법

1. **스캔 탭**: 송장을 카메라로 촬영하여 스캔
2. **분석 탭**: 촬영된 이미지의 분석 결과 확인
3. **공지사항 탭**: 중요 공지사항 및 일반 공지사항 조회
4. **결제 탭**: 유지보수 결제 및 구독 관리

## 🏗 프로젝트 구조

```
postscan/
├── app/                    # 앱 페이지 (Expo Router)
│   ├── (tabs)/            # 탭 네비게이션
│   ├── analysis.tsx       # 분석 페이지
│   ├── notices.tsx        # 공지사항 페이지
│   └── payment.tsx        # 결제 페이지
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

## 📦 패키지 관리

이 프로젝트는 **pnpm**을 사용하여 패키지를 관리합니다.

```bash
# 새 패키지 추가
pnpm add [패키지명]

# 개발 의존성 추가
pnpm add -D [패키지명]

# 패키지 제거
pnpm remove [패키지명]

# 패키지 업데이트
pnpm update
```

## 🐛 문제 해결

### Expo SDK 버전 충돌
```bash
# node_modules 정리 후 재설치
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Metro 캐시 문제
```bash
# Metro 캐시 정리
npx expo start --clear
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
