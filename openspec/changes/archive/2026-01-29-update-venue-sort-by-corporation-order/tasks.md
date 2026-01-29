## 1. Implementation
- [x] 1.1 在 `loadMovies()` 中，bootstrap 成功後將 `data.payload.corporations` 存入 `config.corporations`（若 API 有回傳）
- [x] 1.2 在 `loadVenuesAndTimes()` 中，建立 venue 名稱到所屬 corporation 的對應（透過 events 的 venueId 與 corporationId，或 API 提供的對應）
- [x] 1.3 場地選單選項依所屬影城的 `sortOrder` 降序排序（與 ButtonsSelectorRow 一致）
- [x] 1.4 無法對應至影城或影城無 sortOrder 的場地排在已排序項目之後
- [x] 1.5 若 bootstrap 未提供 corporations 或 listForProgram 無法取得 venue–corporation 對應，則 fallback 為 API 回傳順序

## 2. Validation
- [x] 2.1 驗證場地選單順序與官網影城按鈕順序一致（同電影、同日）
- [x] 2.2 驗證無對應影城之場地排在最後
- [x] 2.3 驗證 fallback 情境下選單仍正常顯示
