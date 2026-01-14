## Context
需要在 Chrome Extension 的 popup 介面中實作五個級聯下拉選單，讓使用者依序選擇電影、場地、時間、票種、數量。這個介面是購票自動化流程的配置入口，需要確保使用者體驗流暢且資料準確。

## Goals / Non-Goals
- Goals:
  - 提供直觀的級聯選單介面
  - 確保選單選項的準確性和即時性
  - 儲存使用者選擇以便後續使用
  - 處理選單之間的依賴關係

- Non-Goals:
  - 不在此階段實作實際購票流程（僅配置）
  - 不實作複雜的資料快取機制（初期版本）
  - 不實作多筆訂單配置（單一配置即可）

## Decisions
- Decision: 使用 Chrome Storage API 儲存選擇狀態
  - Alternatives considered: 
    - LocalStorage（popup 專用，但可能受限）
    - Memory only（關閉 popup 即消失）
  - Rationale: Chrome Storage API 可在 popup 和 content script 之間共享，且支援同步

- Decision: 選單選項從秀泰影城 API 動態獲取
  - 電影列表 API 端點: `GET https://capi.showtimes.com.tw/1/app/bootstrap?appVersion=2.9.200`
  - 電影資料格式: `payload.programs[]`，每個 program 包含 `name`（顯示值）和 `id`（選項值）
  - 不使用快取：每次開啟 popup 都重新獲取資料，確保資料即時性
  - Alternatives considered:
    - 靜態配置檔案（維護成本高）
    - 定期更新的快取（不採用，確保資料即時性）
    - 從網頁 DOM 解析（易受網站結構變更影響）
  - Rationale: API 資料結構穩定，每次重新獲取確保選項的準確性和即時性

- Decision: 錯誤處理策略
  - 資料獲取失敗時直接顯示錯誤訊息，不提供重試機制
  - 相關選單保持禁用狀態，直到使用者重新開啟 popup
  - Alternatives considered:
    - 自動重試機制（增加複雜度，不採用）
    - 允許手動輸入（增加實作複雜度，不採用）
  - Rationale: 簡化實作，錯誤時讓使用者知道問題所在，可透過重新開啟 popup 重試

- Decision: 使用級聯式選單（依序選擇）
  - Alternatives considered:
    - 單一表單輸入（使用者體驗差）
    - 並行選單（邏輯複雜）
  - Rationale: 符合購票流程的邏輯順序，降低使用者認知負擔

- Decision: API 呼叫方式
  - 所有 API 都直接從 Chrome Extension 的 popup 或 content script 呼叫，不透過 background script 代理
  - Alternatives considered:
    - 透過 background script 代理（增加複雜度，不採用）
    - 透過 content script 代理（不必要，不採用）
  - Rationale: 簡化架構，直接從 popup 呼叫 API，減少中間層級

## Risks / Trade-offs
- 網站結構變更風險 → 需要維護選項獲取邏輯，考慮加入錯誤處理和降級方案
- 資料獲取延遲 → 實作載入狀態提示，避免使用者困惑
- Popup 關閉後狀態 → 使用 Chrome Storage 持久化，但需注意隱私
- 選單選項過多 → 考慮加入搜尋功能（未來優化）

## Migration Plan
- 此為新功能，無需遷移
- 未來如需變更資料來源或儲存方式，可透過版本號管理

## API 規格

### 電影列表 API (Bootstrap)
- **端點**: `GET https://capi.showtimes.com.tw/1/app/bootstrap?appVersion=2.9.200`
- **參數**:
  - `appVersion`: 應用程式版本號（例如：`2.9.200`）
- **回應格式**:
```json
{
    "msg": "Success",
    "payload": {
        "programs": [
            {
                "name": "阿凡達：火與燼",
                "status": "active",
                "availableAt": "2025-12-17T00:00:00.000Z",
                "id": 12156
            }
        ]
    }
}
```
- **資料映射**:
  - 電影選單顯示值: `program.name`
  - 電影選單選項值: `program.id`
  - 僅顯示 `status === "active"` 的電影

### 場地與時間 API
- **端點**: `GET https://capi.showtimes.com.tw/1/events/listForProgram/{programId}?date={date}&forVista=false`
- **參數**:
  - `programId`: 電影 ID（從電影選單選擇的值）
  - `date`: 今天的日期，格式 `YYYY-MM-DD`（例如：`2026-01-14`）
  - `forVista`: 布林值，設為 `false`
- **回應格式**:
```json
{
    "msg": "Success",
    "payload": {
        "events": [
            {
                "id": 4539624,
                "venueId": 1138,
                "startedAt": "2026-01-17T05:45:00.000Z",
                "status": "active",
                ...
            }
        ],
        "venues": [
            {
                "id": 1138,
                "name": "高雄夢時代秀泰影城",
                ...
            }
        ]
    }
}
```
- **場地資料映射**:
  - 場地選單顯示值: `venue.name`
  - 場地選單選項值: `venue.id`
  - 資料來源: `payload.venues[]`
- **時間資料映射**:
  - 時間選單顯示值: `event.startedAt` 轉換為 GMT+8 時區格式（例如：`2026-01-17 13:45`）
  - 時間選單選項值: `event.id`
  - 資料來源: `payload.events[]`
  - 過濾條件: `event.venueId === 選定的場地ID` 且 `event.status === "active"`

### 票種 API
- **端點**: `GET https://capi.showtimes.com.tw/1/ticketTypes/forEvent/{eventId}?includeGroupTicket=true&includeMemberRedeem=true&version=03.00.00`
- **參數**:
  - `eventId`: 場次 ID（從時間選單選擇的值，即 `event.id`）
  - `includeGroupTicket`: 布林值，設為 `true`
  - `includeMemberRedeem`: 布林值，設為 `true`
  - `version`: 版本號，設為 `03.00.00`
- **回應格式**:
```json
{
    "msg": "Success",
    "payload": {
        "ticketTypes": [
            {
                "title": "《佐賀偶像是傳奇》特別場套票",
                "category": "set",
                "price": 600,
                "fee": 30,
                ...
            }
        ]
    }
}
```
- **資料映射**:
  - 票種選單顯示值: `ticketType.title`
  - 票種選單選項值: `ticketType.category`
  - 資料來源: `payload.ticketTypes[]`

### 數量選單
- **資料來源**: 固定選項，不需要 API 呼叫
- **選項範圍**: 1 到 6
- **預設值**: 1
- **資料映射**:
  - 數量選單顯示值: 數字本身（例如：`1`, `2`, `3`, `4`, `5`, `6`）
  - 數量選單選項值: 數字本身（例如：`1`, `2`, `3`, `4`, `5`, `6`）

## Open Questions
- 無