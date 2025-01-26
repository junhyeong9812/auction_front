const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // (1) /api 경로 → 백엔드 프록시
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://www.pinjun.xyz:8000",
      changeOrigin: true,
    })
  );

  // (2) /ws-stomp 경로 → 웹소켓 STOMP 프록시
  app.use(
    "/ws-stomp",
    createProxyMiddleware({
      target: "http://www.pinjun.xyz:8000",
      changeOrigin: true,
      ws: true, // WebSocket 프록시를 활성화
    })
  );
};
