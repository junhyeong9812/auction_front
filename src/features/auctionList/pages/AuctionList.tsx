import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuctionListItem, AuctionListProps } from "../types/auctionList";
import { fetchAuctionList } from "../services/auctionListService";

const AuctionList: React.FC<AuctionListProps> = ({ filter, searchQuery }) => {
  const [auctions, setAuctions] = useState<AuctionListItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadAuctions();
  }, [filter, searchQuery, page]);

  async function loadAuctions() {
    try {
      const data = await fetchAuctionList(filter, searchQuery, page, 20);
      setAuctions(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("경매 목록 조회 실패:", error);
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div>
      <h2>경매 목록</h2>

      {auctions.length === 0 ? (
        <div style={{ textAlign: "center", margin: "20px" }}>
          해당 경매가 없습니다.
        </div>
      ) : (
        <ul>
          {auctions.map((auction) => (
            <li key={auction.auctionId}>
              <Link to={`/auction/${auction.auctionId}`}>{auction.title}</Link>
              {" - "}
              {auction.status} / {auction.price}원 / {auction.endTime}
              <br />
              <img
                src={`http://localhost:8080/api/auction/image/${auction.image}`}
                alt={auction.title}
                style={{ width: "80px", height: "80px" }}
              />
            </li>
          ))}
        </ul>
      )}

      {/* 페이징 */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={() => handlePageChange(page - 1)}>이전</button>
        <span style={{ margin: "0 8px" }}>
          {page + 1} / {totalPages}
        </span>
        <button onClick={() => handlePageChange(page + 1)}>다음</button>
      </div>
    </div>
  );
};

export default AuctionList;
