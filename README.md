# ShowtimesTicket - 秀泰影城購票輔助工具

Chrome Extension 用於協助在秀泰影城網站上進行購票配置。

## 功能

- 五個級聯下拉選單：電影 → 場地 → 時間 → 票種 → 數量
- 自動從秀泰影城 API 載入選項
- 選擇狀態自動儲存與恢復
- 配置完成提示

## 安裝方式

1. 開啟 Chrome 瀏覽器
2. 前往 `chrome://extensions/`
3. 開啟「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇此專案資料夾

## 使用方式

1. 點擊 Extension 圖示開啟 popup
2. 依序選擇：電影 → 場地 → 時間 → 票種 → 數量
3. 配置完成後會顯示「配置完成！」訊息
4. 選擇狀態會自動儲存，下次開啟時會自動恢復

## 檔案結構

```
ShowtimesTicket/
├── manifest.json      # Extension 設定檔
├── popup.html         # Popup 介面
├── popup.js           # 主要邏輯
├── popup.css          # 樣式
└── README.md          # 說明文件
```

## 注意事項

- 需要網路連線以呼叫秀泰影城 API
- 圖示檔案（icon16.png, icon48.png, icon128.png）為可選，不影響功能
- 所有 API 直接從 popup 呼叫，無需 background script
