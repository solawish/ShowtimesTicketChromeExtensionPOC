# Design: 場地選單依影城 sortOrder 排序

## Context
- 官網 ButtonsSelectorRow 的 options 來自 Redux `site.corporations`（bootstrap API），排序為 `sort((a, b) => b.sortOrder - a.sortOrder)`（corporation.sortOrder 降序）
- Popup 僅呼叫 bootstrap（載入電影）與 listForProgram（載入場地與場次）；listForProgram 回傳 `payload.venues[]` 與 `payload.events[]`
- 需在不改變現有 API 使用方式的前提下，讓場地選單順序與官網影城按鈕順序一致

## Goals / Non-Goals
- Goals: 場地選單順序與官網 ButtonsSelectorRow options 一致（依影城 sortOrder 降序）
- Non-Goals: 不新增 API、不改變選單顯示內容（仍為 venue.name）

## Decisions
- **暫存 corporations**：在 `loadMovies()` 取得 bootstrap 回應後，將 `data.payload.corporations` 存入 `config.corporations`，供 `loadVenuesAndTimes()` 使用
- **場地對應影城**：依 listForProgram 回傳資料決定。若 `event` 含 `corporationId`，則以 `event.venueId` → `event.corporationId` 建立 venue 與 corporation 對應；若 API 無 corporationId，則 fallback 為不排序或依 API 回傳順序
- **排序規則**：與官網一致，`sort((a, b) => corporationB.sortOrder - corporationA.sortOrder)`（降序）；無對應影城或影城無 sortOrder 者排在最後

## Risks / Trade-offs
- **listForProgram 的 event 是否含 corporationId**：若不含，需在實作時以 fallback 處理（例如依 venue 在 API 中的順序或跳過依 sortOrder 排序）

## Open Questions
- 無
