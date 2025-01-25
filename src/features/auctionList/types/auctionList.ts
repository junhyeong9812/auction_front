export interface Auction {
  id: number;
  name: string;
  status: string;
}
export interface AuctionListItem {
  auctionId: number;
  title: string;
  status: "SCHEDULED" | "ONGOING" | "ENDED" | "CANCELED";
  image: string; // 이미지 파일명
  price: number; // 목록에 표시할 현재가 (ONGOING이면 Redis값)
  endTime: string; // 표시할 시간(시작시간 or 종료시간 등)
}

export interface AuctionListProps {
  filter: string | null; // "SCHEDULED", "ONGOING", "ENDED" ...
  searchQuery: string; // 검색어
}
