import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  connectStomp,
  disconnectStomp,
  subscribeUserErrors,
} from "../../../global/services/stompClient";
import {
  subscribeAuctionTopic,
  sendBid,
} from "../services/AuctionStompService";
import { fetchAuctionItem } from "../services/auctionItemService";
import { Auction } from "../types/auction";

interface ErrorResponse {
  message: string;
  code?: number;
}

const AuctionItem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<Auction | null>(null);

  // 소켓(=STOMP)으로부터 수신한 현재 입찰가
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  // endTime(문자열) + 카운트다운 텍스트
  const [endTime, setEndTime] = useState<string | null>(null);
  const [countdownText, setCountdownText] = useState<string>("...");

  // 입찰 금액
  const [bidAmount, setBidAmount] = useState<number>(0);

  // 모달 (오류 안내)
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // 구독 해제를 위한 Subscription ref
  const subscriptionRef = useRef<any>(null);
  // 에러 구독 해제를 위한 ref (원하면)
  const errorSubscriptionRef = useRef<any>(null);

  // 1) 경매 상세 & STOMP 연결
  useEffect(() => {
    if (!id) return;

    // (1) STOMP 연결 → 성공 후 경매 구독
    connectStomp()
      .then(() => {
        console.log("STOMP connect OK, now subscribe /topic/auction/", id);
        subscriptionRef.current = subscribeAuctionTopic(id, (payload) => {
          // 서버가 /topic/auction/{id}로 보낸 메시지 수신
          console.log("Received from server:", payload);

          if (payload.success === false) {
            // 에러 케이스
            setModalMessage(payload.message || "에러 발생");
            setShowModal(true);
          } else {
            // 예: 입찰 성공, 가격 갱신, endTime 연장 등
            if (payload.highestPrice) {
              setCurrentPrice(payload.highestPrice);
            }
            if (payload.newEndTime !== null) {
              setEndTime(payload.newEndTime);
            }
          }
        });

        // (B) 에러 전용: /user/queue/errors 구독 (내 전용)
        errorSubscriptionRef.current = subscribeUserErrors((errorPayload) => {
          console.log("Personal error:", errorPayload);
          setModalMessage(errorPayload.message || "입찰 실패");
          setShowModal(true);
        });
      })
      .catch((err) => {
        console.error("STOMP connect fail:", err);
      });

    // (2) 경매 상세 로드
    const loadAuction = async () => {
      try {
        const data = await fetchAuctionItem(id);
        setAuction(data);
        setCurrentPrice(data.startPrice); // 초기값
        setEndTime(data.endTime);
      } catch (error) {
        console.error("경매 상세 조회 실패:", error);
        setAuction(null);
      }
    };
    loadAuction();

    // 언마운트 시
    return () => {
      // 구독 해제
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      // STOMP 연결 해제 (원한다면)
      disconnectStomp();
    };
  }, [id]);

  // 2) 카운트다운
  useEffect(() => {
    if (!endTime) {
      setCountdownText("...");
      return;
    }

    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setCountdownText("종료되었습니다");
        clearInterval(intervalId);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        let text = "";
        if (hours > 0) text += `${hours}시간 `;
        text += `${minutes}분 ${seconds}초`;
        setCountdownText(text);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [endTime]);

  // 3) 입찰 버튼
  const handleBid = () => {
    if (!auction || !id) return;

    // 그냥 STOMP publish
    sendBid(id, bidAmount);
    // 실제 실패/성공 메시지는 서버가 /topic/auction/{id}로 내려줄 때 받음
  };

  if (!auction) {
    return <div>해당 경매를 불러올 수 없습니다.</div>;
  }

  const displayPrice =
    currentPrice !== null ? currentPrice : auction.startPrice;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>{auction.title}</h1>
      <img
        src={`http://localhost:8080/api/auction/image/${auction.image}`}
        alt={auction.title}
        style={{ maxWidth: "100%", borderRadius: "10px" }}
      />

      <div style={{ marginTop: "20px" }}>
        <p>상태: {auction.status}</p>

        {auction.status === "ONGOING" && (
          <>
            <p>현재가: {displayPrice.toLocaleString()}원</p>
            <p>남은 시간: {countdownText}</p>

            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              placeholder="입찰가"
            />
            <button onClick={handleBid}>입찰하기</button>
          </>
        )}

        {auction.status === "SCHEDULED" && (
          <>
            <p>시작 시간: {auction.startTime}</p>
            <p>시작 가격: {auction.startPrice.toLocaleString()}원</p>
          </>
        )}

        {auction.status === "ENDED" && (
          <>
            <p>
              낙찰가: {auction.finalPrice?.toLocaleString() || displayPrice}
            </p>
            <p>종료 시간: {auction.endTime}</p>
          </>
        )}

        <p>판매자: {auction.sellerEmail || "알 수 없음"}</p>
        <p>낙찰자: {auction.winnerEmail || "없음"}</p>
      </div>

      {/* 모달 (에러 안내) */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <p>{modalMessage}</p>
            <button onClick={() => setShowModal(false)}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionItem;
