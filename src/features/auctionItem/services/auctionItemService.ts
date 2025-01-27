import api from "../../../global/services/axios";
import { Auction } from "../types/auction";

export async function fetchAuctionItem(
  auctionId: string | number
): Promise<Auction> {
  const res = await api.get<Auction>(`/auctions/${auctionId}`);
  return res.data;
}
