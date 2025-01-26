// global/services/stompClient.ts
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient: Client | null = null;

/**
 * STOMP 연결 시도
 * - 최초에만 호출하거나, 필요시 재연결
 * - 반환: Promise<void>
 */
export function connectStomp(): Promise<void> {
  return new Promise((resolve, reject) => {
    // SockJS 엔드포인트 (스프링 WebSocketConfig에서 .addEndpoint("/ws-stomp")에 맞춤)
    // const sock = new SockJS("http://localhost:8000/ws-stomp");
    // const sock = new SockJS("http://pinjun.xyz:8000/ws-stomp");
    const sock = new SockJS("/ws-stomp");
    stompClient = new Client({
      // 실제 웹소켓을 SockJS가 대체
      webSocketFactory: () => sock as any,
      debug: (str: string) => {
        console.log("[STOMP]", str);
      },
      onConnect: (frame) => {
        console.log("STOMP connected!");
        resolve();
      },
      onStompError: (frame) => {
        console.error("Broker error:", frame.headers["message"], frame.body);
        reject(frame.body);
      },
      onWebSocketError: (event) => {
        console.error("WebSocket Error", event);
        reject(event);
      },
    });

    stompClient.activate(); // 내부적으로 웹소켓 연결
  });
}

/**
 * STOMP 연결 해제
 */
export function disconnectStomp(): void {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
}

/**
 * STOMP Client 객체 반환 (연결 후에만 유효)
 */
export function getStompClient(): Client | null {
  return stompClient;
}

/**
 * 사용자(본인) 전용 에러 채널("/user/queue/errors") 구독
 * @param onError callback: 서버에서 보낸 에러 payload를 처리
 */
export function subscribeUserErrors(onError: (errPayload: any) => void) {
  if (!stompClient || !stompClient.connected) {
    console.warn("STOMP not connected, can't subscribe /user/queue/errors");
    return;
  }
  stompClient.subscribe("/user/queue/errors", (message) => {
    if (message.body) {
      const payload = JSON.parse(message.body);
      onError(payload);
    }
  });
}
