# KMU SDMS REST API 문서

## 개요

국민대학교 스마트 기숙사 관리 시스템의 REST API 문서입니다. Serverless Framework와 AWS Lambda를 기반으로 구현되었습니다.

## 기본 정보

- **Base URL**: `https://12y69ifvh1.execute-api.ap-northeast-2.amazonaws.com`
- **인증**: 현재 인증 없음
- **응답 형식**: JSON
- **에러 처리**: HTTP 상태 코드 기반

## 공통 응답 형식

### 성공 응답 (200 OK)

```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": "<데이터>"
}
```

### 에러 응답

```json
{
  "statusCode": <에러코드>,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": {
    "error": "<에러메시지>"
  }
}
```

## API 엔드포인트

### 1. 호실 관리 API

#### 모든 호실 조회

- **GET** `/rooms`
- **설명**: 생활관의 모든 호실 정보를 조회합니다.
- **핸들러**: `src.handlers.rooms_handler.get_all`
- **서비스**: `src.services.rooms_service.get_all_rooms`

**응답 예시:**

```json
[
  {
    "id": 1,
    "name": "101호",
    "capacity": 4,
    "floor": 1
  },
  {
    "id": 2,
    "name": "102호",
    "capacity": 4,
    "floor": 1
  }
]
```

**에러 응답:**

- `500`: 호실 정보를 가져오는 데 실패

### 2. 공지사항 관리 API

#### 모든 공지사항 조회

- **GET** `/notices`
- **설명**: 모든 공지사항을 날짜 내림차순으로 조회합니다.
- **핸들러**: `src.handlers.notices_handler.get_all`
- **서비스**: `src.services.notices_service.get_all_notices`

**응답 예시:**

```json
[
  {
    "id": 1,
    "title": "앱 업데이트 안내",
    "content": "새로운 기능이 추가되었습니다.",
    "created_at": "2024-01-15T10:30:00Z",
    "is_important": true
  },
  {
    "id": 2,
    "title": "서비스 점검 안내",
    "content": "1월 20일 오전 2시~4시 서비스 점검이 예정되어 있습니다.",
    "created_at": "2024-01-10T09:00:00Z",
    "is_important": false
  }
]
```

**에러 응답:**

- `500`: 공지사항 조회 실패

#### 단일 공지사항 조회

- **GET** `/notices/{id}`
- **설명**: ID로 특정 공지사항을 조회합니다.
- **핸들러**: `src.handlers.notices_handler.get_one`
- **서비스**: `src.services.notices_service.get_notice_by_id`

**URL 파라미터:**

- `id` (필수): 조회할 공지사항의 ID

**응답 예시:**

```json
{
  "id": 1,
  "title": "앱 업데이트 안내",
  "content": "새로운 기능이 추가되었습니다.",
  "created_at": "2024-01-15T10:30:00Z",
  "is_important": true
}
```

**에러 응답:**

- `400`: 잘못된 공지 ID입니다.
- `404`: 공지사항을 찾을 수 없습니다.
- `500`: 서버 내부 오류

## 데이터 모델

### Room (호실)

| 필드       | 타입   | 설명                 |
| ---------- | ------ | -------------------- |
| `id`       | number | 호실 고유 식별자     |
| `name`     | string | 호실명 (예: "101호") |
| `capacity` | number | 수용 인원            |
| `floor`    | number | 층수                 |

### Notice (공지사항)

| 필드           | 타입    | 설명                     |
| -------------- | ------- | ------------------------ |
| `id`           | number  | 공지사항 고유 식별자     |
| `title`        | string  | 공지사항 제목            |
| `content`      | string  | 공지사항 내용            |
| `created_at`   | string  | 생성일시 (ISO 8601 형식) |
| `is_important` | boolean | 중요 공지 여부           |

## 에러 코드

| 코드  | 설명                                   |
| ----- | -------------------------------------- |
| `200` | 성공                                   |
| `400` | 잘못된 요청 (Bad Request)              |
| `404` | 리소스를 찾을 수 없음 (Not Found)      |
| `500` | 서버 내부 오류 (Internal Server Error) |

## 개발 정보

### 아키텍처 패턴

1. **핸들러**: API Gateway 이벤트 수신 → 서비스 호출 → 응답 반환
2. **서비스**: Supabase 클라이언트를 통한 데이터 조회 및 비즈니스 로직
3. **유틸**: 공통 응답 포맷 및 Supabase 클라이언트 관리

### 데이터베이스

- **플랫폼**: Supabase (PostgreSQL)
- **스키마**: `core`
- **테이블**: `rooms`, `notice`

### 환경변수

- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_API_KEY`: Supabase API Key

## 테스트

### 로컬 테스트

```bash
# 로컬 서버 실행
npx serverless offline

# 테스트 엔드포인트
GET http://localhost:3000/dev/rooms
GET http://localhost:3000/dev/notices
GET http://localhost:3000/dev/notices/1
```

### 배포된 환경 테스트

```bash
# 배포
npx serverless deploy --stage dev --region ap-northeast-2

# 테스트 엔드포인트
GET https://12y69ifvh1.execute-api.ap-northeast-2.amazonaws.com/rooms
GET https://12y69ifvh1.execute-api.ap-northeast-2.amazonaws.com/notices
GET https://12y69ifvh1.execute-api.ap-northeast-2.amazonaws.com/notices/1
```

## 향후 확장 계획

- 인증/인가 시스템 추가
- 공지사항 CRUD API 확장
- 학생 관리 API
- 점호 관리 API
- 상벌점 관리 API
- 택배 관리 API
- 문의 및 채팅 API
