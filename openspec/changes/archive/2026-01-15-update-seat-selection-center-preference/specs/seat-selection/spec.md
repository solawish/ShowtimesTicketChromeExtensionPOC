## MODIFIED Requirements
### Requirement: 取得場次座位並挑選可用座位
系統 SHALL 透過帶權杖的座位 API 取得場次座位並挑選可用座位供後續流程使用。選取邏輯應優先選擇靠近中間位置的座位，以提供較佳的觀影體驗。

#### Scenario: 帶權杖呼叫座位 API
- **WHEN** 擴展持有座位選擇路由上的場次 ID
- **THEN** 呼叫 `GET https://capi.showtimes.com.tw/1/seats/listForEvent/{eventId}`，使用該 ID 置入路由參數
- **AND** 從 `https://www.showtimes.com.tw/` 的 localStorage 取得唯一鍵 `LoginStore.loggedInUser.*` 條目中的 `jwt` 值
- **AND** 在請求標頭加入 `Authorization: Bearer <jwt>`
- **AND** 成功取得回應中的 `payload.seats[]`

#### Scenario: 選擇可用座位（單張票）
- **WHEN** 回應中的 `payload.seats[]` 含有可用座位
- **THEN** 系統 SHALL 先找出陣列中全部最大的 `r` 和 `c` 值作為座位範圍大小
- **AND** 過濾掉陣列中沒有 `e` 屬性的座位
- **AND** 過濾掉 `e === false` 的座位（僅保留 `e === true` 的可用座位）
- **AND** 計算 `c` 的中間值（例如：最大 `c` 為 8 則選 4，最大 `c` 為 9 則選 5）
- **AND** 優先選擇 `c` 值最接近中間值的座位
- **AND** 在相同 `c` 值中，優先選擇 `r` 值最接近中間值的座位
- **AND** 保存所選座位的座標或識別資訊以供後續流程使用

#### Scenario: 選擇可用座位（多張票）
- **WHEN** 需要選取多張票（quantity > 1）
- **THEN** 系統 SHALL 對每張票重複執行單張票的選取邏輯
- **AND** 每選取一張票後，排除該座位以避免重複選取
- **AND** 繼續使用相同的中間偏好邏輯選取下一張票
- **AND** 保存所有所選座位的座標或識別資訊以供後續流程使用

