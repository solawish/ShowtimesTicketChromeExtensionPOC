# Project Context

## Purpose
ShowtimesTicket 是一個 Chrome 瀏覽器擴展，旨在協助使用者在秀泰影城（Showtimes Cinemas）網站上進行購票流程。擴展提供自動化輔助功能，簡化選票、選座、結帳等步驟，提升購票體驗。

## Tech Stack
- **Chrome Extension API** - 瀏覽器擴展核心功能
- **JavaScript/TypeScript** - 主要開發語言
- **Manifest V3** - Chrome 擴展清單格式（建議使用最新版本）
- **DOM Manipulation** - 與秀泰影城網站互動
- **Content Scripts** - 在網頁中注入腳本
- **Background Service Worker** - 後台服務（Manifest V3）

## Project Conventions

### Code Style
- 使用現代 JavaScript/TypeScript 語法
- 遵循 ESLint 和 Prettier 規範（如適用）
- 變數命名使用 camelCase
- 常數使用 UPPER_SNAKE_CASE
- 函數和類別使用 PascalCase（類別）或 camelCase（函數）
- 優先使用 const，需要重新賦值時使用 let，避免 var

### Architecture Patterns
- **Content Scripts** - 處理頁面互動邏輯
- **Background Service Worker** - 處理後台任務和狀態管理
- **Message Passing** - Content Scripts 與 Background 之間的通訊
- **Event-Driven** - 響應網頁 DOM 變化或用戶操作
- 模組化設計，功能分離

### Testing Strategy
- 手動測試：在秀泰影城實際網站上驗證功能
- 單元測試：核心邏輯函數測試（如適用）
- 整合測試：驗證與網站 DOM 的互動
- 注意：需考慮網站結構變更時的維護性

### Git Workflow
- 主分支：`main` 或 `master`
- 功能分支：`feature/[功能名稱]`
- 修復分支：`fix/[問題描述]`
- 提交訊息：使用清晰的描述，說明變更內容
- 建議使用 Conventional Commits 格式（可選）

## Domain Context
- **秀泰影城（Showtimes Cinemas）** - 台灣連鎖電影院品牌
- 購票流程通常包括：選擇電影 → 選擇場次 → 選擇座位 → 填寫資訊 → 付款
- 網站可能使用動態載入內容，需要等待 DOM 元素出現
- 需要處理各種購票狀態（座位已選、場次已滿等）
- 可能涉及會員登入、優惠券使用等額外功能

## Important Constraints
- **網站結構變更風險** - 秀泰影城網站更新可能導致擴展失效，需要維護
- **Chrome 擴展政策** - 需遵守 Chrome Web Store 政策，避免違反服務條款
- **使用者隱私** - 不應收集或儲存敏感個人資訊
- **穩定性** - 擴展不應影響網站正常功能，失敗時應優雅降級
- **Manifest V3 限制** - 需遵循 Chrome 最新的擴展規範
- **跨域限制** - 僅能在秀泰影城網站上運作（需在 manifest.json 中設定權限）

## External Dependencies
- **秀泰影城官方網站** - 主要互動目標網站
- **Chrome Extension APIs** - chrome.tabs, chrome.storage, chrome.runtime 等
- **DOM APIs** - 用於頁面元素選擇和操作
