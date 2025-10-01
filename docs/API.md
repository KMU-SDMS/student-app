백엔드 API 명세 (src.mdc 기반)

본 문서는 `src/` 구조와 `src.mdc` 요약을 바탕으로 현재 개발된 API를 정리합니다. 각 항목은 path, 기능, request, method, response 형식으로 기술합니다.

공통

- Base URL: API Gateway 배포 주소에 따라 상이
- Content-Type: application/json; charset=utf-8
- 성공 응답 포맷: utils/responses.create_success_response(data) 표준
- 에러 응답 포맷: utils/responses.create_error_response(message, statusCode) 표준

에러 코드 정책

- 400: 잘못된 요청 (ID 형식 오류, 잘못된 파라미터, 필수 필드 누락)
- 404: 리소스 없음
- 500: 서버 내부 오류

성공 응답 형식

json
{
"statusCode": 200,
"headers": {
"Content-Type": "application/json",
"Access-Control-Allow-Origin": "\*"
},
"body": "데이터"
}

에러 응답 형식

json
{
"statusCode": 400,
"headers": {
"Content-Type": "application/json",
"Access-Control-Allow-Origin": "\*"
},
"body": "{\"error\": \"에러 메시지\"}"
}

공지사항 API

1. 공지사항 페이지네이션 조회

- path: /notices
- 기능: 공지사항 목록을 페이지네이션하여 조회합니다. (페이지당 10개 고정)
- request
  - 쿼리 파라미터: page (기본값: 1)
  - 예: /notices?page=1
- method: GET
- response

{
"notices": [
{
"id": 1,
"title": "페이지네이션 테스트 데이터 1",
"content": "첫 번째 페이지의 첫 번째 공지사항입니다.",
"date": "2025-09-10T00:47:54.838984+00:00",
"is_important": false
},
{
"id": 2,
"title": "중요 공지",
"content": "이것은 중요 공지사항입니다.",
"date": "2025-09-09T00:47:54.838984+00:00",
"is_important": true
}
],
"page_info": {
"total_page": 2,
"total_notice": 20,
"now_page": 1
}
}

- 에러 예시 (잘못된 페이지 번호 입력)

{ "error": "Page number must be greater than 0." }
{ "error": "Invalid page number format." }

2. 공지사항 단건 조회

- path: /notice
- 기능: 공지사항 ID로 단건 조회
- request
  - 쿼리 파라미터: id (필수)
  - 예: /notice?id=1
- method: GET
- response

{
"id": 1,
"title": "앱 업데이트 안내",
"content": "새로운 기능이 추가되었습니다...",
"date": "2024-01-15T00:47:54.838984+00:00",
"is_important": true
}

- 에러 예시

{ "error": "Notice ID is required." }
{ "error": "Notice not found" }

캘린더 API

1. 일정 조회

- path: /calendar
- 기능: 전체 또는 특정 날짜의 일정 조회
- request
  - 쿼리 파라미터: date (선택)
  - 예: /calendar (전체)
  - 예: /calendar?date=2025-09-20 (2025년 9월 20일의 일정을 조회)
- method: GET
- 전체 일정 response

[
{
"id": 2,
"date": "2025-09-19",
"rollCallType": null,
"paymentType": "가스"
},
{
"id": 6,
"date": "2025-09-29",
"rollCallType": "일반",
"paymentType": "수도"
}
]

- date 파라미터 사용 response

[
{
"id": 2,
"date": "2025-09-19",
"rollCallType": null,
"paymentType": "가스"
}
]

물론 하루에 일정이 두 개일 경우도 존재한다.

알림 API

1. 알림 구독 생성

- path: /subscriptions
- method: POST
- 기능: FCM 토큰을 등록하여 새로운 학생의 알림 구독 활성화
- request

{
"fcm_token": "fcm_token_example_12345",
"student_no": "20243105",
"platform": "web"
}

    * fcm_token : 사용자가 알림 기능을 허용한 뒤에 발급 가능합니다.
    * student_no: 개발 중인 현재는 임의, 나중에 로그인 기능 추가 시 실제 지정 가능
    * platform : 웹 앱이므로 사실상 web 고정

- response

{  
 "id": 1,
"fcm_token": "fcm_token_example_12345",
"student_no": "20243105",
"is_active": true,
"platform": "ios",
"created_at": "2024-09-01T10:00:00Z",
"updated_at": "2024-09-01T10:00:00Z"
}

2. 알림 구독 조회

- path : /subscriptions/status
- method : GET
- 기능 : FCM 토큰을 통해 대상 학생의 구독 정보 확인
- request
  - 쿼리 파라미터: fcm_token
  - 예: /subscriptions/status?fcm_token=fcm_token_example_12345
- response

{
"active": true,
"subscription_id": 1,
"student_no": "20243105",
"platform": "ios",
"created_at": "2024-09-01T10:00:00Z",
"updated_at": "2024-09-01T10:00:00Z"
}

3. 알림 수동 전송 (이 API를 사용할 지 확실하지 않다)

- path: /notifications
- method: POST
- 기능: 관리자가 모든 학생에게 수동으로 공지를 전송
- request

{
"title": "긴급 공지",
"content": "제2정릉생활관 정보자원관리원 화재 안내",
"notice_id": 123
}

    * 내용 모두 직접 작성합니다.

- response

{
"success": true,
"total_subscriptions": 150,
"success_count": 145,
"failure_count": 5,
"invalid_tokens": [
"token1",
"token2"
],
"failed_tokens": [
"token3"
]
}

    * 전송 성공 및 실패 현황
