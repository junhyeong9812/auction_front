import { getStompClient } from "../../../global/services/stompClient";

/**
 * /topic/auction/{auctionId} 구독
 * - 서버에서 convertAndSend("/topic/auction/{auctionId}", payload)
 *   하면 이 콜백이 호출됨
 */
export function subscribeAuctionTopic(
  auctionId: string,
  onMessage: (payload: any) => void
) {
  const client = getStompClient();
  if (!client || !client.connected) {
    console.warn("STOMP not connected, can't subscribe.");
    return;
  }

  client.subscribe(`/topic/auction/${auctionId}`, (message) => {
    if (message.body) {
      const parsed = JSON.parse(message.body);
      onMessage(parsed);
    }
  });
}

/**
 * 입찰 보내기
 * - @MessageMapping("/auction/{auctionId}/bid") 로 보내기
 */
export function sendBid(auctionId: string, bidAmount: number) {
  const client = getStompClient();
  if (!client || !client.connected) {
    console.warn("STOMP not connected!");
    return;
  }

  const payload = {
    bidAmount: bidAmount,
  };

  // 예: @MessageMapping("/auction/{auctionId}/bid")
  client.publish({
    destination: `/app/auction/${auctionId}/bid`,
    body: JSON.stringify(payload),
  });
}
