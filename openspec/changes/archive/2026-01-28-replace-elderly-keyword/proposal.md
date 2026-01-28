# Change: 將「老人」關鍵字改為「敬老」

## Why
目前系統使用「老人」作為排除票種的關鍵字，為符合更正式與友善的用語，應將「老人」改為「敬老」，以提升使用者體驗。

## What Changes
- 將所有程式碼、規格文件與說明文件中的「老人」關鍵字統一改為「敬老」
- 影響範圍包括：
  - `popup.js`：選票邏輯中的過濾條件
  - `popup.html`：UI 說明文字
  - `openspec/specs/ticket-configuration/spec.md`：規格文件
  - `README.md`：說明文件

## Impact
- Affected specs: ticket-configuration
- Affected code: `popup.js`, `popup.html`, `README.md`
