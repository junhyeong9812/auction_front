import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8000", // 백엔드 주소
//   // baseURL: "http://pinjun.xyz:8000",
//   withCredentials: true, // 쿠키 전송 허용
// });

// export default api;

const api = axios.create({
  // baseURL에 절대 주소 대신 "/api" 같은 상대 경로
  baseURL: "/api",
  withCredentials: true,
});

export default api;
