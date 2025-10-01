/* eslint-disable no-restricted-globals */

// Unified Service Worker for Firebase Push Notifications and PWA Caching

// --- Firebase Setup ---
// Firebase v10 compatibility scripts via importScripts
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyAYSlJ59fOJLaRsZjJr6JVBPoWEpwg3CFQ',
  authDomain: 'kmu-sdms.firebaseapp.com',
  projectId: 'kmu-sdms',
  storageBucket: 'kmu-sdms.firebasestorage.app',
  messagingSenderId: '793535204318',
  appId: '1:793535204318:web:2c563d91000239fd472b4f',
  measurementId: 'G-T3BH3K7GY6',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log('[sw.js] Firebase 초기화 완료');

// 서비스 워커 시작 시 캐시 정리만 수행 (알림 정리는 하지 않음)
self.addEventListener('activate', (event) => {
  console.log('[sw.js] Service Worker 활성화 중...');

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return undefined;
          }),
        ),
      )
      .then(() => {
        console.log('[sw.js] Service Worker 활성화 완료, clients.claim 호출');
        return self.clients.claim();
      }),
  );
});

// --- PWA Caching Setup ---
const CACHE_NAME = 'studentapp-static-v1';
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
];

self.addEventListener('install', (event) => {
  console.log('[sw.js] Service Worker 설치 중...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => {
        console.log('[sw.js] Service Worker 설치 완료, skipWaiting 호출');
        return self.skipWaiting();
      }),
  );
});

// Network-first for navigation, cache-first for others
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/')));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});

// --- Push Notification Handling ---

// 중복 알림 방지를 위한 전역 변수
const processedNotifications = new Set();
const lastNotificationTime = new Map(); // 제목별 마지막 알림 시간 추적
const processedPayloadHashes = new Set(); // 페이로드 해시 추적

// 디버깅을 위한 전역 함수 (브라우저 콘솔에서 호출 가능)
self.debugNotifications = () => {
  console.log('[sw.js] 디버그 정보:');
  console.log('- 처리된 알림 ID:', Array.from(processedNotifications));
  console.log('- 제목별 마지막 알림 시간:', Object.fromEntries(lastNotificationTime));
  return self.registration.getNotifications().then((notifications) => {
    console.log('- 현재 표시된 알림 개수:', notifications.length);
    notifications.forEach((notif, index) => {
      console.log(`- 알림 ${index + 1}:`, {
        title: notif.title,
        tag: notif.tag,
        data: notif.data,
      });
    });
    return notifications;
  });
};

// Background push handler (Firebase)
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Received background message from Firebase', payload);

  // 서버에서 notification 필드를 포함해 보낸 경우 브라우저가 자동 표시하므로
  // 중복 알림을 피하기 위해 수동 표시를 건너뜁니다.
  if (payload.notification) {
    console.log('[sw.js] notification payload detected, skip manual show to avoid duplicate');
    return;
  }

  // data-only 메시지 우선 사용
  const notificationTitle = payload.data?.title || payload.notification?.title || '새 알림';
  const currentTime = Date.now();

  // 페이로드 해시 생성 (중복 감지용)
  const payloadHash = JSON.stringify({
    title: payload.data?.title || payload.notification?.title,
    body: payload.data?.body || payload.notification?.body,
    data: payload.data,
  });

  // 중복 알림 방지를 위한 고유 ID 생성
  const notificationId =
    payload.data?.notificationId || payload.messageId || `${notificationTitle}-${currentTime}`;
  const tag = `notification-${notificationId}`;

  // 페이로드 해시 기반 중복 체크
  if (processedPayloadHashes.has(payloadHash)) {
    console.log('[sw.js] 중복 페이로드 감지, 무시:', payloadHash);
    return;
  }

  // 이미 처리된 알림인지 확인
  if (processedNotifications.has(notificationId)) {
    console.log('[sw.js] 중복 알림 감지 (ID), 무시:', notificationId);
    return;
  }

  // 같은 제목의 최근 알림 확인 (10초 이내)
  const lastTime = lastNotificationTime.get(notificationTitle);
  if (lastTime && currentTime - lastTime < 10000) {
    console.log('[sw.js] 같은 제목의 최근 알림 감지 (10초 이내), 무시:', notificationTitle);
    return;
  }

  // 처리된 알림으로 표시
  processedNotifications.add(notificationId);
  processedPayloadHashes.add(payloadHash);
  lastNotificationTime.set(notificationTitle, currentTime);

  // Extract notification data from the payload
  const notificationOptions = {
    body: payload.data?.body || payload.notification?.body || '새로운 메시지가 도착했습니다.',
    icon: payload.data?.icon || payload.notification?.icon || '/icons/icon-192.png',
    badge: payload.data?.badge || '/icons/icon-192.png',
    tag: tag, // 고유 태그로 중복 방지
    requireInteraction: false,
    silent: false,
    data: {
      url: payload.data?.url || '/',
      notificationId: notificationId,
      timestamp: Date.now(),
      payload: payload, // 전체 페이로드 저장
    },
  };

  // 기존 같은 제목의 알림 닫기
  self.registration.getNotifications().then((notifications) => {
    console.log('[sw.js] 기존 알림 개수:', notifications.length);

    // 같은 제목의 기존 알림만 닫기
    const sameTitleNotifications = notifications.filter(
      (notif) => notif.title === notificationTitle,
    );

    sameTitleNotifications.forEach((notification) => {
      console.log('[sw.js] 같은 제목의 기존 알림 닫기:', notification.title);
      notification.close();
    });

    // 새 알림 표시
    self.registration
      .showNotification(notificationTitle, notificationOptions)
      .then(() => {
        console.log('[sw.js] 알림 표시 성공:', notificationTitle);
      })
      .catch((error) => {
        console.error('[sw.js] 알림 표시 실패:', error);
        processedNotifications.delete(notificationId); // 실패 시 처리 취소
        processedPayloadHashes.delete(payloadHash); // 페이로드 해시도 삭제
        lastNotificationTime.delete(notificationTitle); // 시간 기록도 삭제
      });

    // 30분 후 처리 기록 삭제 (메모리 정리)
    setTimeout(
      () => {
        processedNotifications.delete(notificationId);
        processedPayloadHashes.delete(payloadHash);
      },
      30 * 60 * 1000,
    );

    // 10분 후 시간 기록 삭제
    setTimeout(
      () => {
        lastNotificationTime.delete(notificationTitle);
      },
      10 * 60 * 1000,
    );
  });
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[sw.js] 알림 클릭됨:', event.notification.data);

  // 알림 닫기
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';
  const notificationId = event.notification.data?.notificationId;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if a window is already open at the target URL
      for (const client of clientList) {
        const url = new URL(client.url);
        if (url.pathname === targetUrl) {
          // If so, focus it and send notification data
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            notificationId: notificationId,
            url: targetUrl,
            timestamp: Date.now(),
          });
          return client.focus();
        }
      }
      // Otherwise, open a new window
      return self.clients.openWindow(targetUrl).then((newClient) => {
        if (newClient && notificationId) {
          // 새 창에 알림 데이터 전송
          newClient.postMessage({
            type: 'NOTIFICATION_CLICKED',
            notificationId: notificationId,
            url: targetUrl,
            timestamp: Date.now(),
          });
        }
        return newClient;
      });
    }),
  );
});

// Optional: Background sync (placeholder)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-push-subscriptions') {
    // Implement if needed
  }
});
