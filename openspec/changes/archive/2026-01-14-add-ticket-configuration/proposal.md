# Change: 新增購票配置功能

## Why
使用者需要在 Chrome Extension 的 popup 介面中，透過下拉式選單依序選擇購票所需的各項參數（電影、場地、時間、票種、數量），以便後續自動化購票流程。這個功能是整個購票自動化系統的核心配置介面。

## What Changes
- 新增 popup.html 介面，包含五個級聯下拉選單
- 實作選單之間的依賴關係（選擇電影後載入場地選項，依此類推）
- 建立選項資料的獲取機制（從秀泰影城 Bootstrap API 獲取電影列表）
  - API: `GET https://capi.showtimes.com.tw/1/app/bootstrap?appVersion=2.9.200`
  - 解析 `payload.programs[]`，使用 `name` 作為顯示值，`id` 作為選項值
- 實作使用者選擇狀態的儲存與恢復
- 提供配置完成後的確認機制

## Impact
- Affected specs: 新增 `ticket-configuration` capability
- Affected code: 
  - `popup.html` - 新增 popup 介面
  - `popup.js` - 處理選單邏輯和資料載入（直接呼叫 API）
  - `manifest.json` - 新增 popup 配置和 API 權限
  - `styles.css` - popup 樣式（如需要）
- API 依賴:
  - 秀泰影城 Bootstrap API: `https://capi.showtimes.com.tw/1/app/bootstrap?appVersion=2.9.200`（取得電影列表）
  - 場地與時間 API: `https://capi.showtimes.com.tw/1/events/listForProgram/{programId}?date={date}&forVista=false`（取得場地和時間選項）
  - 票種 API: `https://capi.showtimes.com.tw/1/ticketTypes/forEvent/{eventId}?includeGroupTicket=true&includeMemberRedeem=true&version=03.00.00`（取得票種選項）