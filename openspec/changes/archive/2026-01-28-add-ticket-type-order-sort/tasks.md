## 1. Implementation
- [x] 1.1 修改 `loadTicketTypes()` 函數，在載入票種後按照 `ticketType.order` 進行升序排序
- [x] 1.2 確保排序邏輯同時適用於初始載入和重新讀取的情況
- [x] 1.3 處理 `order` 欄位可能為 undefined 或 null 的情況（將這些項目排在最後）

## 2. Validation
- [x] 2.1 驗證票種選單選項按照 order 升序顯示
- [x] 2.2 驗證重新讀取後排序仍然正確
- [x] 2.3 驗證缺少 order 欄位的票種正確處理
