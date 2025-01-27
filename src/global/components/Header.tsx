import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import api from "../services/axios";

declare global {
  interface Window {
    IMP?: any; // iamport 전역 객체
  }
}

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
  // 모달 열림 여부
  const [isModalOpen, setIsModalOpen] = useState(false);
  const portOnechannelKey = process.env.REACT_APP_IMP_CHANNEL_KEY;

  // 모달에서 입력받을 결제 정보 (이름, 전화, 주소, 우편번호)
  const [buyerName, setBuyerName] = useState("");
  const [buyerTel, setBuyerTel] = useState("");
  const [buyerAddr, setBuyerAddr] = useState("");
  const [buyerPostcode, setBuyerPostcode] = useState("");

  // 컴포넌트 마운트 시 사용자 이메일 목록 불러오기
  useEffect(() => {
    api
      .get("/users")
      .then((res) => {
        // 구조가 { userList: [ {email:...}, {...} ] }
        setUsers(res.data.userList || []);
      })
      .catch((err) => console.error("유저 목록 불러오기 실패:", err));
  }, []);

  // emailLogin
  const handleEmailLogin = (email: string) => {
    api
      .post("/auth/emailLogin", { email })
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

  // 결제하기 버튼 클릭 -> 모달창 열기
  const openPaymentModal = () => {
    if (!selectedEmail || selectedEmail === "placeholder") {
      alert("먼저 로그인을 위한 이메일을 선택해주세요.");
      return;
    }
    setIsModalOpen(true);
  };

  // 모달창 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    // 혹시 폼 초기화가 필요하다면 여기서 state 초기화
    setBuyerName("");
    setBuyerTel("");
    setBuyerAddr("");
    setBuyerPostcode("");
  };

  // 결제 요청 함수
  const handleRequestPay = () => {
    if (!window.IMP) {
      alert("IMP 로드 실패");
      return;
    }

    // IMP.request_pay 파라미터
    const data = {
      channelKey: portOnechannelKey,
      pg: "nice",
      pay_method: "card",
      merchant_uid: `payment-${crypto.randomUUID()}`, // 주문 고유 번호
      name: "포인트 충전", // 결제창에 표시될 상품명
      amount: 100, // 실제로는 모달창에서 입력받을 수도 있음
      buyer_email: selectedEmail, // 선택된 유저 이메일
      buyer_name: buyerName,
      buyer_tel: buyerTel,
      buyer_addr: buyerAddr,
      buyer_postcode: buyerPostcode,
    };

    // 결제 요청
    window.IMP.request_pay(data, async (response: any) => {
      if (response.error_code) {
        // 에러가 있으면 결제 실패
        alert(`결제에 실패했습니다: ${response.error_msg}`);
        return;
      }

      // 결제 성공 시 서버에 결제정보 전송
      try {
        const res = await fetch("/payment/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            impUid: response.imp_uid, // 아임포트 결제고유번호
            merchantUid: response.merchant_uid, // 주문번호
            email: selectedEmail, // 어떤 유저인지 식별
            amount: data.amount,
            // 필요하다면 모달창에서 입력받은 정보 등을 추가로 보내도 됨
            // name: buyerName,
            // tel: buyerTel,
            // address: buyerAddr,
            // postCode: buyerPostcode,
          }),
        });

        if (!res.ok) {
          const errMsg = await res.text();
          alert(`서버 결제 처리 오류: ${errMsg}`);
          return;
        }

        const result = await res.json();
        alert("결제가 완료되었습니다!");
        // 이후 포인트 잔액 갱신 로직이 필요하다면,
        // result로부터 받은 데이터로 앱 상태를 업데이트하거나
        // 다시 유저 정보를 불러오는 API 호출 등 추가 구현
      } catch (error) {
        console.error("결제 완료 통신 에러:", error);
        alert("결제는 완료되었으나, 서버 통신에 실패했습니다.");
      } finally {
        // 결제 프로세스 후 모달창 닫기
        closeModal();
      }
    });
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
          {/* 포인트 결제하기 버튼 */}
          <button onClick={openPaymentModal} style={{ marginLeft: "8px" }}>
            포인트 결제하기
          </button>
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
      {/* 모달창 */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h2>결제 정보 입력</h2>
            <label>
              이름:
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
            </label>
            <label>
              전화번호:
              <input
                type="text"
                value={buyerTel}
                onChange={(e) => setBuyerTel(e.target.value)}
              />
            </label>
            <label>
              주소:
              <input
                type="text"
                value={buyerAddr}
                onChange={(e) => setBuyerAddr(e.target.value)}
              />
            </label>
            <label>
              우편번호:
              <input
                type="text"
                value={buyerPostcode}
                onChange={(e) => setBuyerPostcode(e.target.value)}
              />
            </label>

            <div style={{ marginTop: "20px" }}>
              <button onClick={handleRequestPay}>결제하기</button>
              <button onClick={closeModal} style={{ marginLeft: "10px" }}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

// 링크 스타일 (공통)
const linkStyle: React.CSSProperties = {
  color: "black",
  fontSize: "12px",
  textDecoration: "none",
};

// 모달 오버레이 스타일
const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

// 모달 컨테이너 스타일
const modalStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  minWidth: "300px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};
