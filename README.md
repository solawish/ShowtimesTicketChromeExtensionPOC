# ShowtimesTicket - 秀泰影城購票輔助工具

Chrome Extension 用於協助在秀泰影城網站上進行購票配置與自動訂票。

## 功能

### 票種配置
- 五個級聯下拉選單：電影 → 場地 → 時間 → 票種 → 數量
- 自動從秀泰影城 API 載入選項
- 選擇狀態自動儲存與恢復
- 配置完成提示
- **票種排序**：票種選單按照 API 回應的 `sortOrder` 欄位進行升序排序，確保顯示順序與 API 設計一致
- **票種關鍵詞自動選票**：可輸入關鍵詞並啟用自動選票功能，系統會依關鍵字 → 全票 → 單人套票 → 排除敬老／愛心後取第一個的優先順序自動選擇票種
- **票種重新讀取**：提供重新讀取按鈕，可手動重新載入票種資料

### 自動訂票
- 自動取得登入權杖（JWT）
- 自動取得並選擇可用座位
- 自動鎖定座位
- 自動建立訂單
- 自動提交付款表單，導向付款頁面

## 安裝方式

1. 開啟 Chrome 瀏覽器
2. 前往 `chrome://extensions/`
3. 開啟「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇此專案資料夾

## 使用方式

### 前置準備
1. 在 Chrome 瀏覽器中開啟並登入 [秀泰影城網站](https://www.showtimes.com.tw/)
2. 確保已登入帳號（擴展需要從 localStorage 取得登入資訊）
3. **重要**：請保持秀泰網站的分頁開啟，並在該分頁上點擊 Extension 圖示，這樣擴展才能正確存取該分頁的 localStorage

### 購票流程
1. **重要**：請確保已在秀泰影城網站登入，並且在秀泰網站的分頁上點擊 Extension 圖示開啟 popup（擴展需要從該分頁的 localStorage 取得登入資訊）
2. 依序選擇：電影 → 場地 → 時間 → 票種 → 數量
3. **票種關鍵詞自動選票（選填）**：
   - 可輸入票種關鍵詞（例如：「學生」、「優惠」等）
   - 勾選「啟用依關鍵詞自動選票」後，系統會在按下訂票時自動依優先順序選擇票種
   - 優先順序：關鍵字匹配 → 全票 → 單人套票 → 排除敬老／愛心後取第一個
   - 啟用此功能後，不需手動選擇票種下拉選單
4. **票種重新讀取**：若票種資料需要更新，可點擊票種選單旁的「重新讀取」按鈕
5. 配置完成後，點擊「訂票」按鈕
6. 擴展會自動執行以下步驟：
   - 取得登入權杖
   - 若啟用自動選票，則先自動選擇票種
   - 取得可用座位並自動選擇
   - 鎖定選定的座位
   - 建立訂單
   - 自動提交付款表單，導向付款頁面
7. 在付款頁面完成付款即可

### 狀態儲存
- 選擇狀態會自動儲存，下次開啟 popup 時會自動恢復
- 可隨時修改選擇，狀態會即時更新

## 檔案結構

```
ShowtimesTicket/
├── manifest.json      # Extension 設定檔（Manifest V3）
├── popup.html         # Popup 介面
├── popup.js           # 主要邏輯（票種配置 + 訂票流程）
├── popup.css          # 樣式
├── README.md          # 說明文件
└── openspec/          # 規格文件目錄
    ├── project.md     # 專案背景與技術棧
    ├── AGENTS.md      # AI 助手指引
    └── specs/         # 功能規格
        ├── booking/           # 訂票流程規格
        ├── seat-selection/    # 座位選擇規格
        └── ticket-configuration/  # 票種配置規格
```

## 技術細節

### API 端點
- 應用程式初始化（取得電影列表）：`GET https://capi.showtimes.com.tw/1/app/bootstrap?appVersion=2.9.200`
- 場地和場次列表：`GET https://capi.showtimes.com.tw/1/events/listForProgram/{movieId}?date={date}&forVista=false`
- 票種列表：`GET https://capi.showtimes.com.tw/1/ticketTypes/forEvent/{eventId}?includeGroupTicket=true&includeMemberRedeem=true&version=03.00.00`
- 座位列表：`GET https://capi.showtimes.com.tw/1/seats/listForEvent/{eventId}`
- 鎖定座位：`POST https://capi.showtimes.com.tw/1/seats/lockForEvent/{eventId}`
- 建立訂單：`POST https://capi.showtimes.com.tw/1/orders`

### 權限說明
- `storage`: 儲存使用者選擇狀態
- `scripting`: 從秀泰網站取得登入資訊
- `tabs`: 查詢並操作分頁
- `host_permissions`: 允許存取秀泰影城 API 和網站

## 注意事項

- **需要網路連線**：所有功能都需要呼叫秀泰影城 API
- **需要登入**：訂票功能需要先在秀泰網站登入，並且**必須在開啟秀泰網站的分頁上點擊 Extension 圖示**，擴展才能從該分頁的 localStorage 取得登入權杖。如果不在秀泰網站頁面上開啟 extension，將無法取得 localStorage 中的登入資訊，導致訂票功能無法正常運作
- **票種關鍵詞自動選票**：
  - 啟用後，系統會在訂票時自動選擇票種，不需手動選擇
  - 自動選票優先順序：關鍵字匹配 → 全票 → 單人套票 → 排除敬老／愛心後取第一個
  - 若所有條件都不符合，系統會顯示錯誤提示
- **自動選座**：系統會自動從可用座位中隨機選擇指定數量的座位
- **付款流程**：訂單建立後會自動導向中國信託付款頁面，需在該頁面完成付款
- **網站變更風險**：秀泰影城網站結構或 API 變更可能導致擴展失效，需要維護
- **圖示檔案**：圖示檔案（icon16.png, icon48.png, icon128.png）為可選，不影響功能
- **Manifest V3**：使用 Chrome Extension Manifest V3 規範

## 開發資訊

本專案使用 OpenSpec 進行規格驅動開發，相關規格文件位於 `openspec/` 目錄。

### 主要功能模組
- **票種配置**：五級聯動下拉選單，自動載入與狀態管理
  - 票種關鍵詞自動選票：支援關鍵詞輸入與自動選票邏輯
  - 票種重新讀取：手動重新載入票種資料
- **訂票流程**：自動化座位選擇、鎖定、訂單建立與付款表單提交
  - 支援自動選票模式（依關鍵詞或預設優先順序）
- **狀態管理**：使用 Chrome Storage API 儲存使用者選擇（包含關鍵詞與自動選票設定）
