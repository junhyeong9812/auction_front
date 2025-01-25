import { getSocket } from "../../../global/services/socket";
interface ErrorResponse {
  message: string;
  code?: number;
}
/**
 * 경매 방에 입장
 */
export const joinAuction = (auctionId: string) => {
  const socket = getSocket();
  if (!socket) return;
  socket.emit("joinAuction", { auctionId });
};

/**
 * 경매 방에서 나가기
 */
export const leaveAuction = (auctionId: string) => {
  const socket = getSocket();
  if (!socket) return;
  socket.emit("leaveAuction", { auctionId });
  socket.off("updatePrice");
  socket.off("updateTime");
};

/**
 * 가격 업데이트 수신
 */
export const listenToPriceUpdates = (callback: (price: number) => void) => {
  const socket = getSocket();
  if (!socket) return;
  socket.on("updatePrice", callback);
};

/**
 * 시간 업데이트 수신
 */
export const listenToTimeUpdates = (callback: (time: string) => void) => {
  const socket = getSocket();
  if (!socket) return;
  socket.on("updateTime", callback);
};

/**
 * 입찰 (placeBid) 전송
 * 서버 측에서 인증 실패 시 에러를 내려준다 가정
 */
export const placeBidSocket = (
  auctionId: string,
  bidAmount: number,
  callback: (err: ErrorResponse | null, successMsg?: string) => void
) => {
  const socket = getSocket();
  if (!socket) return;

  socket.emit(
    "placeBid",
    { auctionId, bidAmount },
    (response: { success: boolean; message?: string; code?: number }) => {
      if (!response.success) {
        callback({
          message: response.message || "입찰 실패",
          code: response.code,
        });
      } else {
        callback(null, response.message);
      }
    }
  );
};
