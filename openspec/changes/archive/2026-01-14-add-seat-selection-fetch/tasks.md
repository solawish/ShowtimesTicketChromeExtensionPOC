## 1. 實作
- [ ] 1.1 從路由取得場次 ID（沿用既有流程）並串接座位 API URL
- [ ] 1.2 從 `https://www.showtimes.com.tw/` localStorage 讀取 `LoginStore.loggedInUser.*`，提取 `jwt` 作為 bearer token
- [ ] 1.3 呼叫 `GET /1/seats/listForEvent/{eventId}` 並驗證帶入 `Authorization: Bearer <token>`
- [ ] 1.4 解析回傳 `payload.seats[]`，挑選任一 `e === true` 的座位作為初步選位
- [ ] 1.5 處理失敗與無可用座位的提示或 fallback 行為

## 2. 驗證
- [ ] 2.1 在秀泰網站實際登入後驗證 localStorage 取 token 的行為
- [ ] 2.2 以有效場次 ID 實際呼叫 API，確認成功取得座位並選出一席
- [ ] 2.3 以缺 token 或無座位情境驗證錯誤處理顯示
