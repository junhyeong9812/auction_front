export interface Auction {
  auctionId: number;
  title: string;
  viewCount: number;
  startPrice: number;
  startTime: string;
  endTime: string;
  image: string;
  description: string;
  species: string;
  gender: string;
  size: string;
  sellerLocation: string;
  status: "SCHEDULED" | "ONGOING" | "ENDED" | "CANCELED";
  finalPrice?: number;
  finalEndTime?: string;
  sellerEmail?: string; // 판매자 이메일
  winnerEmail?: string; // 낙찰자 이메일

  // price: 목록 용 or 실시간 갱신용
  // 여기서는 optional
  price?: number;
}
