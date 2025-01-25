import api from "../../../global/services/axios";
import { AuctionListItem } from "../types/auctionList";

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // 현재 페이지 (0-based)
  size: number;
  // ... 등등 필요한 필드
}

export async function fetchAuctionList(
  status: string | null,
  keyword: string,
  page: number = 0,
  size: number = 20
): Promise<PageResponse<AuctionListItem>> {
  const params: any = { page, size };
  if (status) params.status = status;
  if (keyword) params.keyword = keyword;

  const res = await api.get<PageResponse<AuctionListItem>>(
    "/api/auctions/search",
    {
      params,
    }
  );
  return res.data;
}
