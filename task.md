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
- [x] 在雲端端（Google/Supabase）輪替可能暴露的 OAuth secrets
- [x] 確認 CI/CD secrets 使用的是新值

---

## 1) 作業總覽（優先序）

- **P0（安全與阻斷性問題）**：必做
- **P1（效能與穩定性）**：本週完成
- **P2（可維護性）**：排程完成

---

## 2) P0 — 安全與阻斷性修復

### P0-1 憑證輪替（手動外部操作）
- [x] 旋轉 Google OAuth client secret
- [x] 檢查 Supabase Auth 設定與 Redirect URL 無誤
- [x] 更新 GitHub Actions secrets：
  - [x] `VITE_SUPABASE_URL`
  - [x] `VITE_SUPABASE_ANON_KEY`
- [x] 重新部署並驗證 OAuth callback 正常
- [x] 建立輪替操作手冊：`docs/SECRET_ROTATION_RUNBOOK.md`

**驗證標準**
- [x] 使用新憑證可正常登入
- [x] 舊憑證不可再用
- [x] `/auth/callback` 不出現授權錯誤

### P0-2 Repo 衛生
- [x] 確認 `git status` 無新增敏感檔
- [x] 確認 `.gitignore` 規則生效（`client_secret*.json`, `supabase/.temp/`）
- [x] 補一段 README 安全說明（不要提交機敏檔）

**驗證標準**
- [x] 新增同類檔案不會被追蹤

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
- [x] 將 `console.error + return []` 的靜默失敗改為可見狀態（SupabaseDataClient + legacy API list/search 已完成）
- [x] 關鍵頁面顯示錯誤訊息（toast 或 inline alert）※ Contact/About/Skills/Services/PortfolioList + Admin Skills/Services/Portfolio 已完成
- [x] 區分「沒資料」vs「請求失敗」※ 主要頁面已完成，API 層會拋出具體錯誤供 UI 捕捉

**驗證標準**
- [ ] 人為斷網/錯 token 時，UI 可正確顯示錯誤

### P1-3 測試補強（目前只有 1 個測試）
- [x] 新增 AuthContext 行為測試
- [x] 新增 AdminGuard 路由保護測試
- [x] 新增 messages 流程測試（建立/更新/刪除）

**驗證標準**
- [x] `vitest` 至少 6~10 個核心測試（目前 10 個）

---

## 4) P2 — 可維護性提升

### P2-1 型別收斂
- [x] `tsconfig` 分階段收緊：先開 `noImplicitAny`
- [x] 清除核心路徑的 `any`（src/*.ts, src/*.tsx 已清空）
- [x] 補齊 DataClient 型別一致性（Mock/Api/Supabase 對齊 `includeAll` 等契約）

### P2-2 架構一致性整理
- [x] 檢查 `RouteGuards.tsx` 是否仍需保留
  - [x] 若不用：刪除
  - [ ] 若要用：修正 import 與行為，統一 guard 入口
- [x] API 檔案（legacy vs current）整理與註記（新增 `src/api/README.md`）

### P2-3 文件化
- [x] README 增加「本機啟動、部署、故障排查」
- [x] 新增 `docs/ARCHITECTURE.md`
- [x] 新增 `docs/OPERATIONS.md`（包含 OAuth 問題排查）

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

- [x] 先完成 **P0-1 憑證輪替**（你操作雲端，我協助逐步驗證）
- [x] 然後我直接開做 **P1-1 lazy loading 拆包**
- [x] 本輪任務清單已全數完成（待後續新需求）

---

## 9) 新需求：履歷 PDF 匯出（面試官一目瞭然）

### UX/UI 設計分析與決策
- [x] 方案 A：純文字 ATS 版（可讀性高、但品牌感較弱）
- [x] 方案 B：重視視覺設計版（美觀、但可能犧牲掃描效率）
- [x] 方案 C：**Hybrid 雙模式**（推薦）
  - Recruiter Quick Scan：單欄、重點數字/技能/時間軸快速掃描
  - Portfolio Brand：保留視覺風格與作品連結
- [x] 決策：先做 **Hybrid（同資料來源，兩種模板）**

### Stage R1 — 需求與內容模型
- [x] 定義 PDF 區塊：Header / Summary / Experience / Skills / Projects / Contact
- [x] 定義「必顯示」欄位與「可選」欄位（避免資訊過載）
- [x] 補齊 DataClient 層對匯出資料的整合 DTO（單一資料入口）

### Stage R2 — 匯出引擎選型與實作
- [ ] 選型：`react-to-print` + print CSS（最快）或 `@react-pdf/renderer`（控制更高）
- [ ] 建立 `ResumeExportPage` 或隱藏匯出元件
- [ ] 產出 A4 尺寸排版（中英文、分頁、字級、留白）
- [ ] 支援下載檔名規則（例如 `resume-a6a27-YYYYMMDD.pdf`）

### Stage R3 — 介面與操作流程
- [ ] 在前台加入「匯出履歷 PDF」入口（按鈕）
- [ ] 新增模板切換（Quick Scan / Brand）
- [ ] 新增匯出前預覽（Preview）
- [ ] 匯出 loading / error / success 狀態提示

### Stage R4 — 管理後台設定
- [ ] Admin 新增履歷匯出設定（顯示區塊開關、排序、聯絡資訊顯示控制）
- [ ] 支援「隱私控制」欄位（電話/Email 可選顯示）
- [ ] 設定儲存到 DB（新表或現有設定表）

### Stage R5 — QA 與交付驗收
- [ ] 本機測試：`npm run test`
- [ ] 本機建置：`npm run build`
- [ ] 版面驗收：Chrome PDF 匯出（桌機/手機 viewport）
- [ ] 可讀性驗收：5 秒掃描能看懂核心履歷（角色、年資、技能、代表作）
- [ ] commit + push + GitHub Actions success + live health check

### 驗收標準（Done Definition）
- [ ] 面試官在 30 秒內可掌握：你是誰、做過什麼、擅長什麼
- [ ] PDF 在 A4 列印與螢幕閱讀皆清楚（無版面破碎）
- [ ] 匯出流程 3 步內完成（進入頁面 → 選模板 → 下載）
- [ ] Admin 可調整輸出內容，不需改程式碼

---

## 8) 新需求：經歷頁面（Public + Admin）

### UX/UI 設計方向分析（先採用）
- [x] 方案 A：卡片列表（易讀但視覺記憶點較弱）
- [x] 方案 B：垂直時間軸（資訊層次清楚、行動版可讀性高、最符合經歷敘事）
- [ ] 方案 C：左右交錯時間軸（視覺強，但手機可用性與維護成本較高）
- [x] 決策：先採 **方案 B 垂直時間軸 + 卡片**（兼顧設計感與可維護性）

### Stage E1 — 資料層與資料庫
- [x] 新增 `experiences` 資料表 migration
- [x] 建立 RLS policy（public read + admin write）
- [x] 匯入初始經歷資料（取代測試內容）
- [x] `supabase db push --linked` 套用到遠端

### Stage E2 — 前端 Public 頁面
- [x] 新增 `/experiences` 路由
- [x] 新增導覽列「經歷」入口
- [x] 新增 `ExperiencesPage`（時間軸設計 + 響應式）
- [x] 載入/錯誤/空狀態處理

### Stage E3 — Admin 管理頁面
- [x] 新增 `/admin/experiences` 路由與 dashboard 入口
- [x] 新增 `ExperiencesManager`（CRUD + 排序）
- [x] 欄位編輯：role/company/location/start/end/isCurrent/summary/highlights/techStack/sortOrder

### Stage E4 — DataClient 整合
- [x] `types` 新增 `Experience`
- [x] `DataClient` 介面新增 list + CRUD 經歷方法
- [x] `SupabaseDataClient` 實作 list + CRUD
- [x] `mockDataClient` / `apiDataClient` 同步介面

### Stage E5 — 驗證與交付
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] commit + push
- [ ] GitHub Actions success
- [ ] live site health check (`200`)

