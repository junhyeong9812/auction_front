# Auction Frontend

해당 프로젝트는 **옥션(경매) 기본 로직**과 **WebSocket(STOMP) 기반의 실시간 경매 시스템**을 프로토타입으로 구현한 프론트엔드입니다.

- **주요 포인트**  
  - 경매 상품 목록 (예정/진행/종료 분류) 확인 및 실시간 입찰 기능 구현  
  - 로그인한 유저는 보유 포인트로 경매에 참여 가능  
  - *포인트 충전 시*, (테스트 결제 모듈: **PortOne**/아임포트 사용) → 충전 후 자동 환불 로직  
  - 백엔드(스프링 웹소켓)와의 통신은 SockJS + STOMP 프로토콜 사용  
  - 쿠키(HTTP Only) 기반 인증 적용

---

## 목차
1. [프로젝트 소개](#프로젝트-소개)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [환경 변수](#환경-변수)
5. [설치 및 실행](#설치-및-실행)
6. [주요 기능](#주요-기능)
7. [STOMP 클라이언트 사용](#stomp-클라이언트-사용)
8. [로그인 / 포인트 충전](#로그인--포인트-충전)
9. [주의 사항](#주의-사항)

---

## 프로젝트 소개
이 프로젝트는 경매 시스템의 프론트엔드 부분으로,
- **진행 중인 경매는 로그인 없이도 누구나 볼 수 있음**  
- **로그인된 사용자**는 현재 보유 포인트를 사용하여 실시간으로 경매에 참여 가능  
- **테스트 결제 모듈(PortOne / 아임포트)을 통해 포인트를 충전**할 수 있으며, 실제 결제는 테스트 모드로 수행 후 자동 환불 처리  
- WebSocket(STOMP)을 통해 현재 진행 중인 경매 입찰 정보를 실시간으로 반영

### 프로젝트 아키텍쳐
![image](https://github.com/user-attachments/assets/7bd04d40-40a0-4208-8bf0-183feafa33a7)





---

## 기술 스택
- **React** (Create React App 기반)
- **TypeScript**
- **Axios** (HTTP 요청)
- **SockJS + @stomp/stompjs** (WebSocket/STOMP 통신)
- **Ant Design (antd)** + **react-icons** (UI)
- 기타:  
  - `react-router-dom` (라우팅)  
  - (패키지 의존성: [package.json 참고](#))

> **참고**: `socket.io-client` 라이브러리가 `package.json`에 포함되어 있으나, 실질적인 로직에서는 SockJS + STOMP를 사용하고 있습니다. (socket.io 미사용)

---

## 프로젝트 구조
```
src/
├─ features
│  ├─ auctionItem
│  │  ├─ components
│  │  ├─ pages
│  │  ├─ services
│  │  ├─ types
│  │  └─ utils
│  ├─ auctionList
│  │  ├─ components
│  │  ├─ pages
│  │  ├─ services
│  │  ├─ types
│  │  └─ utils
│  └─ user
│      ├─ components
│      ├─ pages
│      ├─ services
│      ├─ types
│      └─ utils
└─ global
    ├─ components
    ├─ constants
    ├─ hooks
    ├─ services
    │  └─ stompClient.ts  // STOMP 웹소켓 로직
    ├─ types
    └─ utils

.env
package.json
...
```
- `features/auctionList`, `features/auctionItem`, `features/user` 등의 폴더에서 **비즈니스 로직별로** 컴포넌트, 페이지, 서비스 등을 분리  
- `global/` 폴더에는 **프로젝트 전반에서 공통으로 쓰이는** 컴포넌트, 훅, 유틸 함수, STOMP 클라이언트 설정 등이 위치  

---

## 환경 변수
`.env` 파일을 통해 **결제 모듈** 관련 키를 설정해야 합니다. (실제 사용 시 각자 발급받은 키를 입력)
```
REACT_APP_IMP_CHANNEL_KEY=YOUR_IMP_KEY
REACT_APP_PORTONE_CHANNEL_KEY=YOUR_PORTONE_KEY
REACT_APP_NICE_CHANNEL_KEY=YOUR_NICE_KEY
```
- **IMP(아임포트) / PortOne / NICE** 결제 모듈에서 제공된 채널 키를 사용
- 해당 변수들을 통해 **실제 결제** 기능을 사용하거나, **테스트 모드**로 포인트를 충전 가능

---

## 설치 및 실행
1. **레포지토리 클론**
   ```bash
   git clone <레포지토리 URL>
   cd auction_front
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```
   또는
   ```bash
   yarn
   ```

3. **개발 서버 실행**
   ```bash
   npm start
   ```
   - 기본적으로 http://localhost:3000 에서 앱이 구동됩니다.
   - 백엔드 서버(https://www.pinjun.xyz/api 등)와 연결되어야 정상 동작합니다.

4. **프로덕션 빌드**
   ```bash
   npm run build
   ```
   - 빌드 결과물이 `build/` 폴더에 생성됩니다.

> **주의**: 실행 전 `.env` 파일이 제대로 설정되어 있어야 결제 모듈, STOMP 엔드포인트 등이 정상 동작합니다.

---

## 주요 기능
1. **경매 목록 확인**
   - 예정된 경매 / 진행 중인 경매 / 종료된 경매를 각각 볼 수 있음
   - 진행 중인 경매는 로그인하지 않은 유저도 확인 가능

2. **경매 상세 / 입찰**
   - 로그인된 유저는 현재 보유 포인트를 사용해 **실시간 입찰** 가능
   - STOMP를 통해 현재 최고 입찰가나 낙찰 여부 등을 실시간으로 업데이트

3. **포인트 충전 (결제 모듈 연동)**
   - PortOne(아임포트) 테스트 모드를 사용
   - 충전 결제 후 자동으로 환불되는 시나리오로 구현(데모용)

4. **쿠키(HTTP Only) 인증**
   - 로그인 시, 선택한 이메일이 서버로 전달되어 **HTTP Only 쿠키**로 세션이 저장  
   - 브라우저 내에서 쿠키는 볼 수 없으며, Axios 요청 시 자동으로 쿠키가 포함됩니다. (`withCredentials: true`)

---

## STOMP 클라이언트 사용
프로젝트에서는 `SockJS + @stomp/stompjs`를 활용하여 **실시간 입찰**을 처리하고 있습니다.

- **`global/services/stompClient.ts`**  
  - `connectStomp()` : STOMP 연결을 생성  
  - `disconnectStomp()` : STOMP 연결 해제  
  - `getStompClient()` : 현재 STOMP Client 반환  
  - `subscribeUserErrors()` : 서버로부터 개인화된 에러 메시지("/user/queue/errors")를 구독  

- **구독/발행 예시** (`subscribeAuctionTopic` / `sendBid`)  
  ```ts
  // 1. 경매 채널 구독
  client.subscribe(`/topic/auction/${auctionId}`, (message) => {
    // message.body에 최신 입찰가, 사용자 정보 등이 담겨서 옴
  });

  // 2. 입찰 보내기
  client.publish({
    destination: `/app/auction/${auctionId}/bid`,
    body: JSON.stringify({ bidAmount }),
  });
  ```

백엔드(스프링 WebSocketConfig)에서 `/ws-stomp` 엔드포인트에 맞춰 연결하며, 클라이언트 측에서는 SockJS(`new SockJS("/ws-stomp")`)를 통해 통신합니다.

---

## 로그인 / 포인트 충전
- **로그인**  
  - 셀렉트 박스에서 이메일을 선택 → 서버로 해당 이메일 로그인 요청 → HTTP Only 쿠키를 통해 인증  
  - 브라우저 내에서 쿠키는 볼 수 없으며, Axios 요청 시 자동으로 쿠키가 포함됩니다. (`withCredentials: true`)

- **포인트 충전**  
  - 테스트 모드 결제: `REACT_APP_PORTONE_CHANNEL_KEY` 등을 통해 **PortOne(아임포트)** 플러그인 사용  
  - 실제 결제 후 자동으로 환불되는 시나리오로 구현(데모용)

---

## 주의 사항
1. **백엔드 서버 구동**  
   - 이 프론트엔드가 동작하려면 **백엔드 서버(예: Spring Boot)에서 WebSocket, REST API**가 정상적으로 구동 중이어야 합니다.  
   - 현재 `baseURL` 은 `https://www.pinjun.xyz/api` 로 설정되어 있으며, 필요 시 `api.ts` 에서 변경할 수 있습니다.

2. **결제 모듈 키(.env)**  
   - 결제 모듈 테스트를 위해서는 `.env`에 **실제 테스트용 키**가 필요합니다.  
   - 키가 없으면 결제 창 연동 시 에러가 발생할 수 있습니다.

3. **socket.io-client 미사용**  
   - `package.json`에 `socket.io-client`가 있으나, 현재 코드에서 **SockJS + STOMP**가 사용되고 있어 `socket.io` 관련 로직은 없습니다.

4. **개발용 환경**  
   - 데모/테스트에 초점을 맞춘 **프로토타입**으로, 실운영시 보안/성능/인증 방식 추가 검토가 필요합니다.

---



