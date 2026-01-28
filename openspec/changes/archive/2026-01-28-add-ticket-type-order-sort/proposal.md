# Change: 票種選單依 API order 排序

## Why
目前票種下拉選單在顯示時未進行排序，直接使用 API 回應的順序。為確保票種選單的顯示順序與 API 設計的順序一致，應按照 API response 中的 `order` 欄位進行排序。

## What Changes
- 票種選單在載入時，按照 `ticketType.sortOrder` 欄位進行升序排序
- 適用於初始載入和重新讀取兩種情況

## Impact
- Affected specs: `ticket-configuration`
- Affected code: `popup.js` 中的 `loadTicketTypes()` 函數
