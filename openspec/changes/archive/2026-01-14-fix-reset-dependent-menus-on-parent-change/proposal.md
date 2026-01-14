# Change: 修復上層下拉選單切換後下層資料未重置的問題

## Why
當使用者變更上層下拉選單（例如：電影、場地、時間、票種）的值時，下層選單的資料應該被重置。目前實作中，雖然下層選單的 UI 會被清空並禁用，但內部狀態（config 物件中的值）沒有被正確重置，導致：
1. 下層選單的 config 值仍保留舊的選擇
2. 當下層選單重新載入時，可能會嘗試恢復不適用於新上層選擇的舊值
3. 可能導致資料不一致或錯誤的狀態恢復

## What Changes
- 修改 `handleMovieChange()`：當電影改變為新值時，重置所有下層選單的 config 值（venueId, eventId, ticketTypeCategory, quantity）
- 修改 `handleVenueChange()`：當場地改變為新值時，重置所有下層選單的 config 值（eventId, ticketTypeCategory, quantity）
- 修改 `handleTimeChange()`：當時間改變為新值時，重置所有下層選單的 config 值（ticketTypeCategory, quantity）
- 修改 `handleTicketTypeChange()`：當票種改變為新值時，重置數量選單的 config 值（quantity）
- 確保重置 config 值後立即儲存狀態，避免舊值被恢復

## Impact
- Affected specs: `ticket-configuration`
- Affected code: `popup.js` (handleMovieChange, handleVenueChange, handleTimeChange, handleTicketTypeChange 函數)
