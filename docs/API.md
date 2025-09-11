## 백엔드 API 명세 (src.mdc 기반)

본 문서는 `src/` 구조와 `src.mdc` 요약을 바탕으로 현재 개발된 API를 정리합니다. 각 항목은 path, 기능, request, method, response 형식으로 기술합니다.

### 공통

- **Base URL**: API Gateway 배포 주소에 따라 상이
- **Content-Type**: `application/json; charset=utf-8`
- **성공 응답 포맷**: `utils/responses.create_success_response(data)` 표준
- **에러 응답 포맷**: `utils/responses.create_error_response(message, statusCode)` 표준

```json
{
  "status": "success",
  "data": {}
}
```

```json
{
  "status": "error",
  "message": "에러 메세지",
  "statusCode": 400
}
```

---

### 공지사항 API

1. 공지사항 페이지네이션 조회

- **path**: `/notices`
- **기능**: 공지사항 목록을 페이지네이션하여 조회합니다. 페이지당 10개 고정.
- **request**:
  - 쿼리 파라미터: `page` (기본값: 1)
  - 예: `/notices?page=1`
- **method**: `GET`
- **response**:

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "페이지네이션 테스트 데이터 1",
      "content": "첫 번째 페이지의 첫 번째 공지사항입니다.",
      "date": "2025-09-10",
      "is_important": false
    },
    {
      "id": 2,
      "title": "중요 공지",
      "content": "이것은 중요 공지사항입니다.",
      "date": "2025-09-09",
      "is_important": true
    }
  ]
}
```

에러 예시 (잘못된 page 값)

```json
{
  "status": "error",
  "message": "Invalid page parameter",
  "statusCode": 400
}
```

2. 공지사항 단건 조회

- **path**: `/notice`
- **기능**: 공지사항 ID로 단건을 조회합니다.
- **request**:
  - 쿼리 파라미터: `id` (필수)
  - 예: `/notice?id=1`
- **method**: `GET`
- **response**:

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "title": "앱 업데이트 안내",
    "content": "새로운 기능이 추가되었습니다...",
    "date": "2024-01-15",
    "is_important": true
  }
}
```

에러 예시 (ID 형식 오류)

```json
{
  "status": "error",
  "message": "Invalid ID format",
  "statusCode": 400
}
```

에러 예시 (리소스 없음)

```json
{
  "status": "error",
  "message": "Notice not found",
  "statusCode": 404
}
```

---

### 에러 코드 정책

- 400: 잘못된 요청 (예: ID 형식 오류, 유효하지 않은 쿼리 파라미터)
- 404: 리소스를 찾을 수 없음
- 500: 서버 내부 오류

---

### 참고 소스 경로

- 핸들러: `src/handlers/rooms_handler.py`, `src/handlers/notices_handler.py`, `src/handlers/students_handler.py`
- 서비스: `src/services/rooms_service.py`, `src/services/notices_service.py`, `src/services/students_service.py`
- DTO: `src/dto/room_dto.py`, `src/dto/notice_dto.py`, `src/dto/student_dto.py`
- 응답 유틸: `src/utils/responses.py`
