## 1. 實作修復
- [x] 1.1 修改 `handleMovieChange()` 函數：當電影改變為新值時，重置 config.venueId, config.eventId, config.ticketTypeCategory, config.quantity
- [x] 1.2 修改 `handleVenueChange()` 函數：當場地改變為新值時，重置 config.eventId, config.ticketTypeCategory, config.quantity
- [x] 1.3 修改 `handleTimeChange()` 函數：當時間改變為新值時，重置 config.ticketTypeCategory, config.quantity
- [x] 1.4 修改 `handleTicketTypeChange()` 函數：當票種改變為新值時，重置 config.quantity
- [x] 1.5 確保所有重置操作後立即呼叫 `saveState()` 以更新儲存狀態

## 2. 驗證
- [ ] 2.1 測試：選擇電影 A → 選擇場地 → 選擇時間 → 切換到電影 B，確認所有下層選單的 config 值被重置
- [ ] 2.2 測試：選擇場地 A → 選擇時間 → 切換到場地 B，確認時間、票種、數量的 config 值被重置
- [ ] 2.3 測試：選擇時間 A → 選擇票種 → 切換到時間 B，確認票種、數量的 config 值被重置
- [ ] 2.4 測試：選擇票種 A → 選擇數量 → 切換到票種 B，確認數量的 config 值被重置
- [ ] 2.5 驗證：重新開啟 popup 時，不會恢復不適用於當前上層選擇的舊下層選擇
