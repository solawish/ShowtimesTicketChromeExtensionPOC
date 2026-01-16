## ADDED Requirements
### Requirement: 票種重新讀取功能
系統 SHALL 在票種下拉選單旁邊提供一個「重新讀取」按鈕，讓使用者可以手動重新載入票種資料。

#### Scenario: 顯示重新讀取按鈕
- **WHEN** 使用者已選擇時間且票種選單已啟用
- **THEN** 「重新讀取」按鈕顯示在票種下拉選單旁邊
- **AND** 按鈕為啟用狀態（可點擊）

#### Scenario: 按鈕禁用狀態
- **WHEN** 使用者尚未選擇時間或票種選單為禁用狀態
- **THEN** 「重新讀取」按鈕為禁用狀態（不可點擊）

#### Scenario: 重新載入票種資料
- **WHEN** 使用者點擊「重新讀取」按鈕
- **THEN** 顯示載入狀態提示（例如：載入中...）
- **AND** 呼叫票種 API `GET https://capi.showtimes.com.tw/1/ticketTypes/forEvent/{eventId}?includeGroupTicket=true&includeMemberRedeem=true&version=03.00.00`（使用當前選定的時間 ID 作為 eventId，不使用快取，每次重新獲取）
- **AND** 更新票種下拉選單的選項
- **AND** 如果當前選定的票種仍存在於新的資料中，則保留該選擇
- **AND** 如果當前選定的票種不存在於新的資料中，則清空選擇並顯示預設選項
- **AND** 載入完成後隱藏載入狀態提示

#### Scenario: 重新載入失敗
- **WHEN** 使用者點擊「重新讀取」按鈕但 API 呼叫失敗
- **THEN** 顯示錯誤訊息（例如：「載入失敗，請稍後再試」）
- **AND** 隱藏載入狀態提示
- **AND** 票種選單保持當前狀態（不變更選項）
