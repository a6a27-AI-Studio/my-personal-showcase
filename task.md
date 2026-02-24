# task.md — my-personal-showcase 詳細作業清單（可中斷續作）

> 目標：把專案從「可用」推進到「可穩定維運／可持續交付」
> 原則：每個任務都可獨立完成、可驗證、可回報，避免中斷後斷線。

---

## 0) 當前狀態快照（2026-02-24）

### 已完成（P0 第一階段）
- [x] 修正 `AdminGuard` 載入欄位錯誤：`isLoading -> loading`
- [x] `.gitignore` 新增：`client_secret*.json`、`supabase/.temp/`
- [x] 將已追蹤的 `client_secret_*.json` 從 git 移除
- [x] 建立 `docs/PR_FIX_CHECKLIST.md`
- [x] Build 通過
- [x] Test 通過

### 尚未完成（P0 第二階段）
- [ ] 在雲端端（Google/Supabase）輪替可能暴露的 OAuth secrets
- [ ] 確認 CI/CD secrets 使用的是新值

---

## 1) 作業總覽（優先序）

- **P0（安全與阻斷性問題）**：必做
- **P1（效能與穩定性）**：本週完成
- **P2（可維護性）**：排程完成

---

## 2) P0 — 安全與阻斷性修復

### P0-1 憑證輪替（手動外部操作）
- [ ] 旋轉 Google OAuth client secret
- [ ] 檢查 Supabase Auth 設定與 Redirect URL 無誤
- [ ] 更新 GitHub Actions secrets：
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] 重新部署並驗證 OAuth callback 正常

**驗證標準**
- [ ] 使用新憑證可正常登入
- [ ] 舊憑證不可再用
- [ ] `/auth/callback` 不出現授權錯誤

### P0-2 Repo 衛生
- [ ] 確認 `git status` 無新增敏感檔
- [ ] 確認 `.gitignore` 規則生效（`client_secret*.json`, `supabase/.temp/`）
- [ ] 補一段 README 安全說明（不要提交機敏檔）

**驗證標準**
- [ ] 新增同類檔案不會被追蹤

---

## 3) P1 — 效能與穩定性（建議先做）

### P1-1 Bundle 瘦身（最有感）
- [x] `App.tsx` 對 admin pages 做 `React.lazy + Suspense`
  - [x] `AdminDashboard`
  - [x] `AboutEditor`
  - [x] `SkillsManager`
  - [x] `ServicesManager`
  - [x] `PortfolioManager`
  - [x] `ResumeManager`
- [x] 視情況對大頁（如 Portfolio/Contact）再拆分
- [x] 重新 build，記錄 chunk 大小前後差異

**驗證標準**
- [ ] 首屏 JS 明顯下降（重點看主 chunk）
- [ ] admin 路由可正常載入

### P1-2 錯誤可觀測化
- [ ] 將 `console.error + return []` 的靜默失敗改為可見狀態
- [~] 關鍵頁面顯示錯誤訊息（toast 或 inline alert）※ Contact/About/Skills/Services/PortfolioList 已完成
- [~] 區分「沒資料」vs「請求失敗」※ Contact/About/Skills/Services/PortfolioList 已完成

**驗證標準**
- [ ] 人為斷網/錯 token 時，UI 可正確顯示錯誤

### P1-3 測試補強（目前只有 1 個測試）
- [ ] 新增 AuthContext 行為測試
- [ ] 新增 AdminGuard 路由保護測試
- [ ] 新增 messages 流程測試（建立/更新/刪除）

**驗證標準**
- [ ] `vitest` 至少 6~10 個核心測試

---

## 4) P2 — 可維護性提升

### P2-1 型別收斂
- [ ] `tsconfig` 分階段收緊：先開 `noImplicitAny`
- [ ] 清除核心路徑的 `any`
- [ ] 補齊 DataClient 型別一致性

### P2-2 架構一致性整理
- [ ] 檢查 `RouteGuards.tsx` 是否仍需保留
  - [ ] 若不用：刪除
  - [ ] 若要用：修正 import 與行為，統一 guard 入口
- [ ] API 檔案（legacy vs current）整理與註記

### P2-3 文件化
- [ ] README 增加「本機啟動、部署、故障排查」
- [ ] 新增 `docs/ARCHITECTURE.md`
- [ ] 新增 `docs/OPERATIONS.md`（包含 OAuth 問題排查）

---

## 5) 建議 PR 切分

### PR-A（P0）
- Guard 修正 + secret hygiene + 安全文件

### PR-B（P1）
- lazy loading + chunk 優化

### PR-C（P1）
- 錯誤處理可觀測化 + 關鍵流程測試

### PR-D（P2）
- 型別與架構整理 + 文件補齊

---

## 6) 每次續作 SOP（防中斷）

1. 開始前執行：
   - [ ] `git status`
   - [ ] `npm run test`
2. 選一個最小任務（單一 checkbox 群）
3. 完成後執行：
   - [ ] `npm run build`
   - [ ] `npm run test`
4. 更新本檔進度（把完成項打勾）
5. 提交 commit（小步提交）

---

## 7) 下一步（我建議）

- [ ] 先完成 **P0-1 憑證輪替**（你操作雲端，我協助逐步驗證）
- [ ] 然後我直接開做 **P1-1 lazy loading 拆包**

