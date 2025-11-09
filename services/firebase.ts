import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase Console에서 복사한 설정 값으로 이 부분을 채워주세요.
const firebaseConfig = {
  apiKey: 'AIzaSyCoUOH_JRlgDQdvaKx0aQbRL7sqmtZVUfg',
  authDomain: 'kmu-sdms-df745.firebaseapp.com',
  projectId: 'kmu-sdms-df745',
  storageBucket: 'kmu-sdms-df745.firebasestorage.app',
  messagingSenderId: '590694661305',
  appId: '1:590694661305:web:6878ee3d9f12bba0a96f68',
  measurementId: 'G-4QV0KQR41E',
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
