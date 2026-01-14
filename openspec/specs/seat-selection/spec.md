# seat-selection Specification

## Purpose
TBD - created by archiving change add-seat-selection-fetch. Update Purpose after archive.
## Requirements
### Requirement: 取得場次座位並挑選可用座位
系統 SHALL 透過帶權杖的座位 API 取得場次座位並挑選一席可用座位供後續流程使用。

#### Scenario: 帶權杖呼叫座位 API
- **WHEN** 擴展持有座位選擇路由上的場次 ID
- **THEN** 呼叫 `GET https://capi.showtimes.com.tw/1/seats/listForEvent/{eventId}`，使用該 ID 置入路由參數
- **AND** 從 `https://www.showtimes.com.tw/` 的 localStorage 取得唯一鍵 `LoginStore.loggedInUser.*` 條目中的 `jwt` 值
- **AND** 在請求標頭加入 `Authorization: Bearer <jwt>`
- **AND** 成功取得回應中的 `payload.seats[]`

#### Scenario: 選擇可用座位
- **WHEN** 回應中的 `payload.seats[]` 含有 `e === true` 的座位
- **THEN** 系統 SHALL 選擇其中任一席作為初步選位（目前可選擇第一筆符合者）
- **AND** 保存所選座位的座標或識別資訊以供後續流程使用

