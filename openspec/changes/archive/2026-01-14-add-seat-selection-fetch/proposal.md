# Change: 加入場次座位取得與初步選位

## Why
目前尚未支援依場次呼叫座位 API 並攜帶登入權杖，導致無法自動挑選可用座位。

## What Changes
- 呼叫 `GET https://capi.showtimes.com.tw/1/seats/listForEvent/{eventId}` 並使用路由中的場次 ID 作為參數
- 從 `https://www.showtimes.com.tw/` 的 localStorage 取得登入使用者的 JWT，於 `Authorization: Bearer <token>` 中送出
- 取得座位清單後，先挑選 `payload.seats[]` 中任一 `e === true` 的座位作為初步選位（詳細規則後續補充）

## Impact
- Affected specs: seat-selection
- Affected code: 擴展座位選擇流程（content script / background 與路由參數處理）
