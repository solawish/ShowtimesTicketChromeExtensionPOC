# booking Specification

## Purpose
TBD - created by archiving change add-booking-flow. Update Purpose after archive.
## Requirements
### Requirement: 鎖定座位
系統 SHALL 在取得座位後，透過鎖定座位 API 鎖定選定的座位，以保留座位供後續訂單建立使用。

#### Scenario: 呼叫鎖定座位 API
- **WHEN** 系統已取得可用座位並完成票種配置
- **THEN** 呼叫 `POST https://capi.showtimes.com.tw/1/seats/lockForEvent/{eventId}`，使用場次 ID 作為路由參數
- **AND** 在請求標頭加入 `Authorization: Bearer <jwt>`（從秀泰網站的 localStorage 取得）
- **AND** 請求 body 包含以下結構：
  - `seats`: 陣列，包含前一步驟選取的座位物件
  - `orderGuid`: 系統產生的 GUID 字串
  - `selectedTicketTypes`: 陣列，包含選定的票種物件，每個物件包含：
    - 從票種選單取得的完整票種物件屬性（sortOrder、category、subCategory、title、price、fee、ticketCount、restriction、meta 等）
    - `selectedTtCount`: 票種選單中選定的數量
- **AND** 成功取得回應中的 `payload.reservationKey` 和 `payload.orderNo`

#### Scenario: 鎖定座位失敗處理
- **WHEN** 鎖定座位 API 呼叫失敗（網路錯誤、API 錯誤等）
- **THEN** 顯示錯誤訊息
- **AND** 不繼續執行後續的訂單建立流程

### Requirement: 建立訂單
系統 SHALL 在成功鎖定座位後，透過訂單 API 建立訂單，完成訂票流程。

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
    - `amount`: 選取的票種的 `price × 票數`
  - `meta.sources.vista.orderNo`: 鎖定座位 API 回傳的 orderNo
  - `meta.receiptRequest`: 固定使用範例格式（type: "love", data: "919", email: 從 localStorage 取得的 email）
  - `meta.contact.email`: 從 localStorage 取得的 email
  - `meta.contact.phone`: 從 localStorage 取得的 phone
  - `email`: 從 localStorage 取得的 email
  - `payWith`: 固定為 `"chinaTrustUrl"`
  - `fee`: `30 × 票的數量`
- **AND** 成功建立訂單

#### Scenario: 取得使用者聯絡資訊
- **WHEN** 系統需要建立訂單
- **THEN** 從 `https://www.showtimes.com.tw/` 的 localStorage 取得 email 和 phone 屬性值
- **AND** 如果無法取得 email 或 phone，顯示錯誤訊息並中止訂單建立流程

#### Scenario: 建立訂單失敗處理
- **WHEN** 建立訂單 API 呼叫失敗（網路錯誤、API 錯誤等）
- **THEN** 顯示錯誤訊息
- **AND** 座位可能仍處於鎖定狀態（需由使用者手動處理）

