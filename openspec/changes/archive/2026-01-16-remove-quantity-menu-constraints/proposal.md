# Change: 移除數量下拉選單的約束

## Why
目前數量下拉選單只有在選擇票種後才會啟用，這限制了使用者的操作彈性。移除這個約束可以讓使用者在任何時候都能選擇數量，提升使用體驗。

## What Changes
- 數量下拉選單在 popup 開啟時即為啟用狀態
- 移除數量選單對票種選擇的依賴關係
- 數量選單不會因為前置選單（電影、場地、時間、票種）的變更而被禁用
- 數量選單的選項（1-6）始終可用

## Impact
- Affected specs: `ticket-configuration`
- Affected code: `popup.html`, `popup.js`
