import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import api from "../services/axios";

interface HeaderProps {
  setSearchQuery: (query: string) => void;
}
interface UserEmailDto {
  email: string;
}

const Header: React.FC<HeaderProps> = ({ setSearchQuery }) => {
  const [inputValue, setInputValue] = useState<string>("");
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserEmailDto[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");

  // 컴포넌트 마운트 시 사용자 이메일 목록 불러오기
  useEffect(() => {
    api
      .get("/api/users")
      .then((res) => {
        // 구조가 { userList: [ {email:...}, {...} ] }
        setUsers(res.data.userList || []);
      })
      .catch((err) => console.error("유저 목록 불러오기 실패:", err));
  }, []);

  // emailLogin
  const handleEmailLogin = (email: string) => {
    api
      .post("/api/auth/emailLogin", { email })
      .then((res) => {
        console.log("이메일 로그인 성공:", res.data);
        alert(`이메일(${email})로 로그인 완료!`);
      })
      .catch((err) => {
        console.error("이메일 로그인 실패:", err);
        alert("로그인 실패: " + err?.response?.data || err.message);
      });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmail(e.target.value);
    // 사용자선택(placeholder)일 땐 로그인 안 하도록
    if (e.target.value && e.target.value !== "placeholder") {
      handleEmailLogin(e.target.value);
    }
  };

  const handleSearch = () => {
    setSearchQuery(inputValue);
    navigate("/");
  };

  return (
    <header
      style={{
        backgroundColor: "#eee",
        padding: "10px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "10px",
        borderBottom: "1px solid #ddd",
      }}
    >
      {/* 상단 네비게이션 */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
          gap: "10px",
        }}
      >
        <Link
          to="/customer-service"
          style={{ color: "black", fontSize: "12px", textDecoration: "none" }}
        >
          고객센터
        </Link>
        <Link
          to="/sell"
          style={{ color: "black", fontSize: "12px", textDecoration: "none" }}
        >
          판매하기
        </Link>
        <Link
          to="/my-info"
          style={{ color: "black", fontSize: "12px", textDecoration: "none" }}
        >
          내정보
        </Link>
        <Link
          to="/notifications"
          style={{ color: "black", fontSize: "12px", textDecoration: "none" }}
        >
          알림
        </Link>
        <Link
          to="/login"
          style={{ color: "black", fontSize: "12px", textDecoration: "none" }}
        >
          로그인
        </Link>
      </div>
      {/* 하단 검색창과 타이틀 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div>
          <h2 style={{ fontWeight: "bold", fontSize: "1.5rem" }}>Auction</h2>
          <select value={selectedEmail} onChange={handleSelectChange}>
            <option value="placeholder">사용자 선택</option>
            {users.map((u) => (
              <option key={u.email} value={u.email}>
                {u.email}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "2px solid black",
            borderRadius: "25px",
            padding: "5px 10px",
            backgroundColor: "#eee",
          }}
        >
          <input
            type="text"
            placeholder="검색어를 입력해주세요."
            value={inputValue}
            onFocus={() => setInputValue("")}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              fontSize: "1rem",
              flex: 1,
              backgroundColor: "#eee",
            }}
          />
          <FiSearch
            size={24}
            style={{ cursor: "pointer" }}
            onClick={() => console.log("Searching for:", inputValue)}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
