import React, { useState } from "react";
import "./App.css"; // 스타일은 필요에 따라 수정
import { Routes, Route } from "react-router-dom";
// 컴포넌트 import
import Header from "./global/components/Header";
import Footer from "./global/components/Footer";
import Sidebar from "./global/components/Sidebar";
import AuctionList from "./features/auctionList/pages/AuctionList";
import AuctionItem from "./features/auctionItem/pages/AuctionItem";

function App() {
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  return (
    <div className="App">
      {/* 상단 헤더 */}
      <Header setSearchQuery={setSearchQuery} />

      {/* 메인 영역: 사이드바 + 컨텐츠 */}
      <div className="main">
        <Sidebar setFilter={setFilter} />
        <div className="content">
          {/* 실제 라우팅에 의한 화면 변환은 이 영역에서 일어나도록 할 예정 */}
          <Routes>
            <Route
              path="/"
              element={
                <AuctionList filter={filter} searchQuery={searchQuery} />
              }
            />
            <Route path="/auction/:id" element={<AuctionItem />} />
          </Routes>
        </div>
      </div>

      {/* 하단 푸터 */}
      <Footer />
    </div>
  );
}

export default App;
