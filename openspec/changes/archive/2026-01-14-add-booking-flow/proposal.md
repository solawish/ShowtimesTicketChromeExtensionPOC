# Change: 新增訂票流程

## Why
目前系統僅能取得座位，但無法完成實際的訂票流程。需要在取得座位後，透過鎖定座位 API 和訂單 API 完成完整的訂票流程。

## What Changes
- 在取得座位流程後，新增呼叫鎖定座位 API `POST https://capi.showtimes.com.tw/1/seats/lockForEvent/{eventId}`
- 鎖定座位成功後，呼叫建立訂單 API `POST https://capi.showtimes.com.tw/1/orders`
- 需要從票種選單中取得完整的票種物件資料（包含 category、subCategory、price、fee 等）
- 需要從 localStorage 取得 email 和 phone 資訊用於訂單建立
- 需要產生 GUID 作為 orderGuid
- 需要計算訂單金額（票價 × 數量 + 手續費 × 數量）

## Impact
- Affected specs: booking (ADDED)
- Affected code: popup.js (handleBookClick 函數擴展，新增鎖定座位和建立訂單函數)
