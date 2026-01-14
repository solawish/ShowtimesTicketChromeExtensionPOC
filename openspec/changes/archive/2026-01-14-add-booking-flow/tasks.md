## 1. 資料結構擴展
- [x] 1.1 修改票種選單選項，儲存完整的票種物件而不僅是 category
- [x] 1.2 在 config 中新增 selectedTicketType 欄位儲存選定的完整票種物件

## 2. 鎖定座位 API 實作
- [x] 2.1 實作 `lockSeatsForEvent()` 函數，呼叫 `POST https://capi.showtimes.com.tw/1/seats/lockForEvent/{eventId}`
- [x] 2.2 在請求標頭加入 `Authorization: Bearer <jwt>`
- [x] 2.3 建構請求 body，包含 seats、orderGuid、selectedTicketTypes
- [x] 2.4 實作 GUID 產生函數
- [x] 2.5 從選定的票種物件建構 selectedTicketTypes 陣列，加入 selectedTtCount 屬性
- [x] 2.6 處理 API 回應，取得 reservationKey 和 orderNo

## 3. 建立訂單 API 實作
- [x] 3.1 實作 `createOrder()` 函數，呼叫 `POST https://capi.showtimes.com.tw/1/orders`
- [x] 3.2 在請求標頭加入 `Authorization: Bearer <jwt>`
- [x] 3.3 建構請求 body，包含 concessionCount、items、meta、email、payWith、fee
- [x] 3.4 從 localStorage 取得 email 和 phone（從秀泰網站的 localStorage）
- [x] 3.5 計算訂單金額（票價 × 數量 + 手續費 × 數量）
- [x] 3.6 建構 ticketTypeCount 物件（使用 category + subCategory 作為 key）
- [x] 3.7 使用鎖定座位 API 回傳的 orderNo 填入 meta.sources.vista.orderNo

## 4. 流程整合
- [x] 4.1 修改 `handleBookClick()` 函數，在取得座位後呼叫鎖定座位 API
- [x] 4.2 鎖定座位成功後呼叫建立訂單 API
- [x] 4.3 更新狀態訊息，顯示訂票進度
- [x] 4.4 處理錯誤情況，提供適當的錯誤訊息

## 5. 測試與驗證
- [x] 5.1 驗證鎖定座位 API 請求格式正確
- [x] 5.2 驗證建立訂單 API 請求格式正確
- [x] 5.3 驗證從 localStorage 正確取得 email 和 phone
- [x] 5.4 驗證訂單金額計算正確
- [x] 5.5 驗證錯誤處理機制正常運作
