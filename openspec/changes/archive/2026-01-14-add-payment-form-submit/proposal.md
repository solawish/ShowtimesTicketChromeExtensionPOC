# Change: 新增付款表單提交功能

## Why
目前系統在建立訂單後，需要將使用者導向付款頁面。訂單 API 的回應中包含付款所需的資訊，需要動態建立表單並自動提交到中國信託的付款頁面。

## What Changes
- 在取得訂單 API 回應後，從 `payload.order.payment.clientFormInputs.URLEnc` 取得 URLEnc 參數
- 在 popup.html 中動態建立一個 form 元素
- 設定 form 的 action 為 `https://epos.ctbcbank.com/auth/SSLAuthUI.jsp`
- 設定 form 的 method 為 POST
- 設定 form 的 enctype 為 `application/x-www-form-urlencoded`
- 加入隱藏的 input 欄位：URLEnc（從訂單回應取得）和 merID（固定為 86511）
- 自動提交表單

## Impact
- Affected specs: booking (MODIFIED)
- Affected code: popup.js (handleBookClick 函數擴展，新增付款表單提交函數), popup.html (動態新增 form 元素)
