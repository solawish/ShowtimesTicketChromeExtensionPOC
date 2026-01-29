# Change: 場地選單排序與官網 ButtonsSelectorRow 一致

## Why
目前 popup 的場地（影城）下拉選單使用 API 回傳的 venues 順序，與 showtimes.com.tw 官網「選擇影城」按鈕列（ButtonsSelectorRow 的 options）的排序方式不一致。官網的 options 來自 corporations，並依 `corporation.sortOrder` 降序排序（數字大的在前）。為保持與官網一致的用戶體驗，場地選單應採用相同邏輯：依所屬影城（corporation）的 sortOrder 降序排序。

## What Changes
- 載入電影時，從 bootstrap API 回應中暫存 `payload.corporations`（含 `id`、`name`、`sortOrder`），供後續場地排序使用
- 載入場地時，利用 listForProgram 回傳的 `events`（若含 `corporationId`）或 venues 與 corporations 的對應關係，決定每個場地所屬影城
- 場地選單選項依所屬影城的 `sortOrder` 降序排序（與 ButtonsSelectorRow 的 `sort((a, b) => b.sortOrder - a.sortOrder)` 一致）
- 無法對應至影城或影城無 sortOrder 的場地排在已排序項目之後

## Impact
- Affected specs: `ticket-configuration`
- Affected code: `popup.js` 的 `loadMovies()`（暫存 corporations）、`loadVenuesAndTimes()`（場地排序邏輯）
