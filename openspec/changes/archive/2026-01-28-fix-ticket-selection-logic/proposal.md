# Change: 修正選票邏輯

## Why
目前的選票邏輯有兩個問題需要修正：
1. 當使用者勾選「關鍵詞選票」時，系統允許關鍵字為空，這可能導致使用者誤以為已設定自動選票但實際上無法正確運作
2. 選票順序不符合預期：應該先排除老人/愛心票種，然後才開始關鍵字匹配等後續規則，以確保不會選到不適合的票種

## What Changes
- **關鍵字必填驗證**：當勾選「啟用依關鍵詞自動選票」時，系統 SHALL 要求「票種關鍵詞」輸入框必須有值（trim 後非空），否則訂票按鈕應保持禁用狀態，並顯示適當的提示訊息
- **選票順序調整**：自動選票邏輯的優先順序改為：先排除老人/愛心票種 → 關鍵字匹配 → 全票 → 單人套票 → 第一個

## Impact
- Affected specs: ticket-configuration
- Affected code: `popup.js`（`selectTicketByKeyword` 函數與 `updateBookButtonState` 函數）
