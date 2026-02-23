# 修復 PR 清單（my-personal-showcase）

## PR-1（P0）權限守衛修復 + 敏感檔治理

### 目標
- 修正 Admin 路由守衛使用錯誤欄位造成的風險
- 避免敏感憑證與本機暫存檔進入版本控制

### 變更項目
- [x] `src/components/guards/AdminGuard.tsx`
  - `isLoading` -> `loading`（對齊 `AuthContext` 型別）
- [x] `.gitignore`
  - 新增 `client_secret*.json`
  - 新增 `supabase/.temp/`
- [ ] 移除 git 已追蹤的 client secret 檔（需執行 `git rm --cached`）
- [ ] 在 Google Cloud/Supabase 端輪替相關 OAuth secret

### 驗證
- [ ] `npm run build`
- [ ] `npm run test`
- [ ] 手動測試：未登入/非 admin/admin 訪問 `/admin` 行為正確

---

## PR-2（P1）Bundle 瘦身與路由拆包
- [ ] admin routes 改 `React.lazy + Suspense`
- [ ] 針對大型頁/圖表元件拆 chunk
- [ ] 比對 `dist/assets/*.js` 大小下降幅度

## PR-3（P1）錯誤處理可觀測化
- [ ] 將 `console.error + return []` 改為顯示 UI error state/toast
- [ ] 在 data client 層區分「空資料」與「請求失敗」

## PR-4（P2）型別安全強化
- [ ] 分階段開啟 TS 嚴格規則（先開 `noImplicitAny`）
- [ ] 清理 `any`、修正舊 guard 檔一致性

---

## 建議分支命名
- `fix/p0-adminguard-secrets-hygiene`

## 建議 commit 訊息
- `fix(auth): use loading in AdminGuard and harden gitignore for secrets/temp`
