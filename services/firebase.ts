import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase Console에서 복사한 설정 값으로 이 부분을 채워주세요.
const firebaseConfig = {
  apiKey: 'AIzaSyAYSlJ59fOJLaRsZjJr6JVBPoWEpwg3CFQ',
  authDomain: 'kmu-sdms.firebaseapp.com',
  projectId: 'kmu-sdms',
  storageBucket: 'kmu-sdms.firebasestorage.app',
  messagingSenderId: '793535204318',
  appId: '1:793535204318:web:2c563d91000239fd472b4f',
  measurementId: 'G-T3BH3K7GY6',
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// 메시징 지원 확인 후 초기화
export const getMessagingInstance = async () => {
  const supported = await isSupported();
  if (supported) {
    return getMessaging(app);
  } else {
    throw new Error('Firebase 메시징이 지원되지 않는 환경입니다.');
  }
};

// 기본 메시징 인스턴스 (호환성을 위해 유지)
export const messaging = getMessaging(app);
