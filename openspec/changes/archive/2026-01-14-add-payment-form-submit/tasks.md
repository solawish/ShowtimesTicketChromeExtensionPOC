## 1. 解析訂單回應
- [x] 1.1 在 `createOrder()` 函數中，確認訂單回應包含 `payload.order.payment.clientFormInputs.URLEnc`
- [x] 1.2 從訂單回應中提取 URLEnc 值

## 2. 動態建立付款表單
- [x] 2.1 實作 `submitPaymentForm()` 函數，接收 URLEnc 參數
- [x] 2.2 動態建立 form 元素
- [x] 2.3 設定 form 的 action 為 `https://epos.ctbcbank.com/auth/SSLAuthUI.jsp`
- [x] 2.4 設定 form 的 method 為 POST
- [x] 2.5 設定 form 的 enctype 為 `application/x-www-form-urlencoded`
- [x] 2.6 建立隱藏的 input 欄位 URLEnc，值為從訂單回應取得的 URLEnc
- [x] 2.7 建立隱藏的 input 欄位 merID，值為固定值 86511
- [x] 2.8 將 form 加入到 popup.html 的 body 中
- [x] 2.9 自動提交表單

## 3. 流程整合
- [x] 3.1 修改 `handleBookClick()` 函數，在建立訂單成功後呼叫 `submitPaymentForm()`
- [x] 3.2 處理訂單回應中缺少 URLEnc 的情況，顯示錯誤訊息

## 4. 測試與驗證
- [x] 4.1 驗證表單正確建立並包含正確的參數
- [x] 4.2 驗證表單正確提交到付款頁面
- [x] 4.3 驗證錯誤處理機制正常運作
