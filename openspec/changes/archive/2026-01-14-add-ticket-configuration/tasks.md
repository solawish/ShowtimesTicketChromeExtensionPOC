## 1. 基礎架構設置
- [x] 1.1 建立 manifest.json，配置 popup 入口點
- [x] 1.2 建立 popup.html 基本結構
- [x] 1.3 建立 popup.js 主要邏輯檔案
- [x] 1.4 建立 popup.css 樣式檔案（如需要）

## 2. UI 實作
- [x] 2.1 實作電影下拉選單
- [x] 2.2 實作場地下拉選單（依電影選擇顯示）
- [x] 2.3 實作時間下拉選單（依場地選擇顯示）
- [x] 2.4 實作票種下拉選單（依時間選擇顯示）
- [x] 2.5 實作數量下拉選單（依票種選擇顯示）
- [x] 2.6 實作選單禁用/啟用狀態（未選擇前置選項時禁用）

## 3. 資料處理
- [x] 3.1 實作 Bootstrap API 呼叫邏輯（`GET https://capi.showtimes.com.tw/1/app/bootstrap?appVersion=2.9.200`）
- [x] 3.2 實作電影資料解析（從 `payload.programs[]` 提取 `name` 和 `id`，過濾 `status === "active"`）
- [x] 3.3 實作日期格式化邏輯（取得今天的日期並格式化為 `YYYY-MM-DD` 格式，例如：`2026-01-14`）
- [x] 3.4 實作場地與時間 API 呼叫邏輯（`GET https://capi.showtimes.com.tw/1/events/listForProgram/{programId}?date={date}&forVista=false`，使用今天的日期作為 date 參數）
- [x] 3.5 實作場地資料解析（從 `payload.venues[]` 提取 `name` 作為顯示，`id` 作為值）
- [x] 3.6 實作時間資料解析（從 `payload.events[]` 過濾 `venueId === 選定的場地ID` 且 `status === "active"`）
- [x] 3.7 實作時間格式轉換（將 `event.startedAt` ISO 字串轉換為 GMT+8 時區格式，例如：`2026-01-17 13:45`）
- [x] 3.8 實作票種 API 呼叫邏輯（`GET https://capi.showtimes.com.tw/1/ticketTypes/forEvent/{eventId}?includeGroupTicket=true&includeMemberRedeem=true&version=03.00.00`，使用選定的時間 ID 作為 eventId）
- [x] 3.9 實作票種資料解析（從 `payload.ticketTypes[]` 提取 `title` 作為顯示，`category` 作為值）
- [x] 3.10 實作數量選項生成邏輯（固定選項 1 到 6，預設值為 1）
- [x] 3.11 處理 API 回應的錯誤情況（網路錯誤、格式錯誤等）

## 4. 狀態管理
- [x] 4.1 實作選擇狀態的儲存（使用 chrome.storage）
- [x] 4.2 實作選擇狀態的恢復（popup 開啟時）
- [x] 4.3 實作選擇變更時的狀態更新

## 5. 使用者體驗
- [x] 5.1 實作載入狀態提示（獲取資料時）
- [x] 5.2 實作錯誤處理（資料獲取失敗時直接顯示錯誤訊息，不提供重試）
- [x] 5.3 實作配置完成確認機制
- [x] 5.4 實作重置/清除選擇功能（可選）

## 6. 測試與驗證
- [ ] 6.1 測試各選單的級聯關係
- [ ] 6.2 測試狀態儲存與恢復
- [ ] 6.3 測試錯誤情況處理
- [ ] 6.4 在實際秀泰影城網站環境中驗證
