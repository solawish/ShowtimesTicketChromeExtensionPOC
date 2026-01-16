## Purpose
在 Chrome Extension 的 popup 介面中提供五個級聯下拉選單，讓使用者依序選擇購票所需的各項參數（電影、場地、時間、票種、數量），以便後續自動化購票流程。
## Requirements
### Requirement: 購票配置介面
系統 SHALL 在 Chrome Extension 的 popup 介面中提供五個級聯下拉選單，讓使用者依序選擇電影、場地、時間、票種、數量。

#### Scenario: 開啟 popup 介面
- **WHEN** 使用者點擊 Extension 圖示開啟 popup
- **THEN** 顯示包含五個下拉選單的介面
- **AND** 電影選單為啟用狀態，其他選單為禁用狀態

#### Scenario: 選擇電影
- **WHEN** 使用者從電影下拉選單中選擇一部電影
- **THEN** 顯示載入狀態提示（例如：載入中...）
- **AND** 呼叫場地與時間 API `GET https://capi.showtimes.com.tw/1/events/listForProgram/{programId}?date={date}&forVista=false`（使用選定的電影 ID 作為 programId，使用今天的日期作為 date，格式為 `YYYY-MM-DD`，例如：`2026-01-14`）
- **AND** 場地下拉選單變為啟用狀態
- **AND** 場地選單載入 `payload.venues[]` 中的場地選項（使用 `venue.name` 作為顯示，`venue.id` 作為值）
- **AND** 時間、票種、數量選單保持禁用狀態並清空選項
- **AND** 所有下層選單的內部狀態（config 值）被重置為 null 或預設值
- **AND** 載入完成後隱藏載入提示

#### Scenario: 選擇場地
- **WHEN** 使用者已選擇電影並從場地下拉選單中選擇一個場地
- **THEN** 時間下拉選單變為啟用狀態
- **AND** 時間選單從已載入的 `payload.events[]` 中過濾出 `event.venueId === 選定的場地ID` 且 `event.status === "active"` 的場次
- **AND** 使用 `event.startedAt` 轉換為 GMT+8 時區格式（例如：`2026-01-17 13:45`）作為顯示，`event.id` 作為值
- **AND** 票種、數量選單保持禁用狀態並清空選項
- **AND** 所有下層選單的內部狀態（config 值）被重置為 null 或預設值

#### Scenario: 選擇時間
- **WHEN** 使用者已選擇電影、場地並從時間下拉選單中選擇一個時間
- **THEN** 顯示載入狀態提示（例如：載入中...）
- **AND** 呼叫票種 API `GET https://capi.showtimes.com.tw/1/ticketTypes/forEvent/{eventId}?includeGroupTicket=true&includeMemberRedeem=true&version=03.00.00`（使用選定的時間 ID 作為 eventId）
- **AND** 票種下拉選單變為啟用狀態
- **AND** 票種選單載入 `payload.ticketTypes[]` 中的票種選項（使用 `ticketType.title` 作為顯示，`ticketType.category` 作為值）
- **AND** 數量選單保持禁用狀態並清空選項
- **AND** 所有下層選單的內部狀態（config 值）被重置為 null 或預設值
- **AND** 載入完成後隱藏載入提示

#### Scenario: 選擇票種
- **WHEN** 使用者已選擇電影、場地、時間並從票種下拉選單中選擇一個票種
- **THEN** 數量下拉選單變為啟用狀態
- **AND** 數量選單顯示選項 1 到 6（顯示值為 `1`, `2`, `3`, `4`, `5`, `6`，選項值也為對應的數字）
- **AND** 數量選單預設值為 1

#### Scenario: 變更前置選擇
- **WHEN** 使用者變更已選擇的電影、場地、時間或票種
- **THEN** 所有後續選單的選擇被清空
- **AND** 所有後續選單的內部狀態（config 值）被重置為 null 或預設值
- **AND** 後續選單根據新的前置選擇重新載入選項
- **AND** 被清空的選單變為禁用狀態（直到新的前置選擇完成）
- **AND** 重置後的狀態立即儲存到 Chrome Storage，避免舊值被恢復

#### Scenario: 儲存選擇狀態
- **WHEN** 使用者在任何選單中做出選擇
- **THEN** 選擇狀態被儲存到 Chrome Storage
- **AND** 下次開啟 popup 時自動恢復上次的選擇
- **AND** 僅恢復適用於當前上層選擇的下層選擇（例如：如果電影改變，不恢復舊的場地、時間、票種、數量選擇）

#### Scenario: 載入電影選項
- **WHEN** popup 開啟時需要載入電影選單選項
- **THEN** 顯示載入狀態提示（例如：載入中...）
- **AND** 呼叫秀泰影城 Bootstrap API `GET https://capi.showtimes.com.tw/1/app/bootstrap?appVersion=2.9.200`（不使用快取，每次重新獲取）
- **AND** 解析回應中的 `payload.programs[]` 陣列
- **AND** 僅包含 `status === "active"` 的電影
- **AND** 使用 `program.name` 作為選單顯示文字，`program.id` 作為選項值
- **AND** 載入完成後更新電影選單選項並隱藏載入提示

#### Scenario: 載入場地與時間資料
- **WHEN** 使用者選擇電影後需要載入場地和時間選項
- **THEN** 顯示載入狀態提示（例如：載入中...）
- **AND** 呼叫場地與時間 API `GET https://capi.showtimes.com.tw/1/events/listForProgram/{programId}?date={date}&forVista=false`（使用今天的日期作為 date 參數，格式為 `YYYY-MM-DD`，例如：`2026-01-14`，不使用快取，每次重新獲取）
- **AND** 解析回應中的 `payload.venues[]` 作為場地選項
- **AND** 解析回應中的 `payload.events[]` 並暫存，待選擇場地後過濾使用
- **AND** 載入完成後更新場地選單選項並隱藏載入提示

#### Scenario: 載入票種資料
- **WHEN** 使用者選擇時間後需要載入票種選項
- **THEN** 顯示載入狀態提示（例如：載入中...）
- **AND** 呼叫票種 API `GET https://capi.showtimes.com.tw/1/ticketTypes/forEvent/{eventId}?includeGroupTicket=true&includeMemberRedeem=true&version=03.00.00`（使用選定的時間 ID 作為 eventId，不使用快取，每次重新獲取）
- **AND** 解析回應中的 `payload.ticketTypes[]` 作為票種選項
- **AND** 使用 `ticketType.title` 作為顯示，`ticketType.category` 作為值
- **AND** 載入完成後更新票種選單選項並隱藏載入提示

#### Scenario: 資料獲取失敗
- **WHEN** 系統嘗試獲取選單選項但失敗（網路錯誤、API 錯誤、格式錯誤等）
- **THEN** 顯示錯誤訊息（例如：「載入失敗，請稍後再試」）
- **AND** 相關選單保持禁用狀態
- **AND** 隱藏載入狀態提示
- **AND** 不提供自動重試機制（使用者需重新開啟 popup 以重試）

#### Scenario: 配置完成
- **WHEN** 使用者完成所有五個選單的選擇（電影、場地、時間、票種、數量）
- **THEN** 顯示配置完成狀態
- **AND** 配置資訊可供後續購票流程使用

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

