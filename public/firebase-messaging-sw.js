// 그냥 sw.js만 남기면 script fetch 404 오류가 나서
// 파일 이름을 이걸로 하고 sw.js 스크립트를 불러오는 방식으로 함.
// public/firebase-messaging-sw.js
// This file acts as a wrapper to load the main service worker.
importScripts('/sw.js');
