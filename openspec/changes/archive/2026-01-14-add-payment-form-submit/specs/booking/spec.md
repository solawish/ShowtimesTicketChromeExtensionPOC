## MODIFIED Requirements
### Requirement: 建立訂單
系統 SHALL 在成功鎖定座位後，透過訂單 API 建立訂單，然後動態建立付款表單並自動提交到付款頁面，完成訂票流程。

#### Scenario: 呼叫建立訂單 API
- **WHEN** 系統已成功鎖定座位並取得 reservationKey 和 orderNo
- **THEN** 呼叫 `POST https://capi.showtimes.com.tw/1/orders`
- **AND** 在請求標頭加入 `Authorization: Bearer <jwt>`（從秀泰網站的 localStorage 取得）
- **AND** 請求 body 包含以下結構：
  - `concessionCount`: 空物件 `{}`
  - `items`: 陣列，包含單一物件：
    - `event.id`: 場次 ID
    - `ticketTypeCount`: 物件，key 為票種的 `category + subCategory` 組合（例如：`"set.0283"`），value 為票的數量
    - `seats`: 陣列，包含選取的座位物件
    - `amount`: 選取的票種的 `(price + fee) × 票數`
  - `meta.sources.vista.orderNo`: 鎖定座位 API 回傳的 orderNo
  - `meta.receiptRequest`: 固定使用範例格式（type: "love", data: "919", email: 從 localStorage 取得的 email）
  - `meta.contact.email`: 從 localStorage 取得的 email
  - `meta.contact.phone`: 從 localStorage 取得的 phone
  - `email`: 從 localStorage 取得的 email
  - `payWith`: 固定為 `"chinaTrustUrl"`
  - `fee`: 票種的 `fee × 票的數量`
- **AND** 成功建立訂單
- **AND** 從訂單回應的 `payload.order.payment.clientFormInputs.URLEnc` 取得 URLEnc 值

#### Scenario: 動態建立並提交付款表單
- **WHEN** 系統已成功建立訂單並取得 URLEnc
- **THEN** 在 popup.html 中動態建立一個 form 元素
- **AND** 設定 form 的 action 為 `https://epos.ctbcbank.com/auth/SSLAuthUI.jsp`
- **AND** 設定 form 的 method 為 POST
- **AND** 設定 form 的 enctype 為 `application/x-www-form-urlencoded`
- **AND** 加入隱藏的 input 欄位：
  - `URLEnc`: 值為從訂單回應取得的 `payload.order.payment.clientFormInputs.URLEnc`
  - `merID`: 值為固定值 `86511`
- **AND** 將 form 加入到 popup.html 的 body 中
- **AND** 自動提交表單，將使用者導向付款頁面

#### Scenario: 取得使用者聯絡資訊
- **WHEN** 系統需要建立訂單
- **THEN** 從 `https://www.showtimes.com.tw/` 的 localStorage 取得 email 和 phone 屬性值
- **AND** 如果無法取得 email 或 phone，顯示錯誤訊息並中止訂單建立流程

#### Scenario: 建立訂單失敗處理
- **WHEN** 建立訂單 API 呼叫失敗（網路錯誤、API 錯誤等）
- **THEN** 顯示錯誤訊息
- **AND** 座位可能仍處於鎖定狀態（需由使用者手動處理）

#### Scenario: 付款表單建立失敗處理
- **WHEN** 訂單回應中缺少 `payload.order.payment.clientFormInputs.URLEnc`
- **THEN** 顯示錯誤訊息
- **AND** 不建立付款表單
