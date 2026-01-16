## MODIFIED Requirements
### Requirement: 購票配置介面
系統 SHALL 在 Chrome Extension 的 popup 介面中提供五個級聯下拉選單，讓使用者依序選擇電影、場地、時間、票種、數量。

#### Scenario: 開啟 popup 介面
- **WHEN** 使用者點擊 Extension 圖示開啟 popup
- **THEN** 顯示包含五個下拉選單的介面
- **AND** 電影選單為啟用狀態，其他選單為禁用狀態
- **AND** 數量選單為啟用狀態，顯示選項 1 到 6（顯示值為 `1`, `2`, `3`, `4`, `5`, `6`，選項值也為對應的數字）
- **AND** 數量選單預設值為 1

#### Scenario: 選擇電影
- **WHEN** 使用者從電影下拉選單中選擇一部電影
- **THEN** 顯示載入狀態提示（例如：載入中...）
- **AND** 呼叫場地與時間 API `GET https://capi.showtimes.com.tw/1/events/listForProgram/{programId}?date={date}&forVista=false`（使用選定的電影 ID 作為 programId，使用今天的日期作為 date，格式為 `YYYY-MM-DD`，例如：`2026-01-14`）
- **AND** 場地下拉選單變為啟用狀態
- **AND** 場地選單載入 `payload.venues[]` 中的場地選項（使用 `venue.name` 作為顯示，`venue.id` 作為值）
- **AND** 時間、票種選單保持禁用狀態並清空選項
- **AND** 數量選單保持啟用狀態（不受影響）
- **AND** 所有下層選單的內部狀態（config 值）被重置為 null 或預設值（數量除外）

#### Scenario: 選擇場地
- **WHEN** 使用者已選擇電影並從場地下拉選單中選擇一個場地
- **THEN** 時間下拉選單變為啟用狀態
- **AND** 時間選單從已載入的 `payload.events[]` 中過濾出 `event.venueId === 選定的場地ID` 且 `event.status === "active"` 的場次
- **AND** 使用 `event.startedAt` 轉換為 GMT+8 時區格式（例如：`2026-01-17 13:45`）作為顯示，`event.id` 作為值
- **AND** 票種選單保持禁用狀態並清空選項
- **AND** 數量選單保持啟用狀態（不受影響）
- **AND** 所有下層選單的內部狀態（config 值）被重置為 null 或預設值（數量除外）

#### Scenario: 選擇時間
- **WHEN** 使用者已選擇電影、場地並從時間下拉選單中選擇一個時間
- **THEN** 顯示載入狀態提示（例如：載入中...）
- **AND** 呼叫票種 API `GET https://capi.showtimes.com.tw/1/ticketTypes/forEvent/{eventId}?includeGroupTicket=true&includeMemberRedeem=true&version=03.00.00`（使用選定的時間 ID 作為 eventId）
- **AND** 票種下拉選單變為啟用狀態
- **AND** 票種選單載入 `payload.ticketTypes[]` 中的票種選項（使用 `ticketType.title` 作為顯示，`ticketType.category` 作為值）
- **AND** 數量選單保持啟用狀態（不受影響）
- **AND** 所有下層選單的內部狀態（config 值）被重置為 null 或預設值（數量除外）
- **AND** 載入完成後隱藏載入提示

#### Scenario: 選擇票種
- **WHEN** 使用者已選擇電影、場地、時間並從票種下拉選單中選擇一個票種
- **THEN** 數量下拉選單保持啟用狀態（不受影響）

#### Scenario: 變更前置選擇
- **WHEN** 使用者變更已選擇的電影、場地、時間或票種
- **THEN** 所有後續選單的選擇被清空（數量選單除外）
- **AND** 所有後續選單的內部狀態（config 值）被重置為 null 或預設值（數量除外）
- **AND** 後續選單根據新的前置選擇重新載入選項
- **AND** 被清空的選單變為禁用狀態（直到新的前置選擇完成，數量選單除外）
- **AND** 數量選單保持啟用狀態（不受影響）
- **AND** 重置後的狀態立即儲存到 Chrome Storage，避免舊值被恢復
