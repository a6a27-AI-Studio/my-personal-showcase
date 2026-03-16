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

### P0-3 Admin 後台 F5 重新整理誤判 403（阻斷性）
- [ ] 重現：登入後進 `/admin` OK，但 F5 會被導到 `/403`
- [ ] 修正 AuthContext / AdminGuard：在 admin 狀態「尚未確認」前顯示 Loading，而不是直接判定非 admin
  - [ ] AuthContext 新增 `adminLoading`（或等價機制）
  - [ ] AdminGuard 依 `loading || adminLoading` 顯示 Loading
  - [ ] 只在 `loading=false && adminLoading=false && isAdmin=false` 時才導到 `/403`
- [ ] 新增/更新測試：覆蓋「初始 isAdmin=false → async 確認後變 true」不應被導走

**驗證標準**
- [ ] 已登入管理員在 `/admin/*` F5 不會跳 `/403`
- [ ] 未登入或非 admin 才會被導到 `/403`
- [ ] `npm run build` 成功；CI 綠

---

## 3) P1 — 效能與穩定性（建議先做）

### P1-1 Bundle 瘦身（最有感）
- [x] `App.tsx` 對 admin pages 做 `React.lazy + Suspense`
  - [x] `AdminDashboard`
  - [x] `AboutEditor`
  - [x] `SkillsManager`
  - [x] `ServicesManager`
  - [x] `PortfolioManager`
  - [x] （已棄用）舊版 `ResumeManager`，改由 `ResumeExportSettings` 管理
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
- [x] 選型：採 `window.print` + print CSS（最快落地、相容性佳）
- [x] 建立 `ResumeExportPage`
- [x] 產出 A4 尺寸排版（字級、留白、列印樣式）
- [x] 支援下載檔名規則（`resume-a6a27-YYYYMMDD` via `document.title`）

### Stage R3 — 介面與操作流程
- [x] 在前台加入「匯出履歷 PDF」入口（按鈕）
- [x] 新增模板切換（Quick Scan / Brand）
- [x] 新增匯出前預覽（Preview）
- [x] 匯出 loading / error / success 狀態提示

### Stage R4 — 管理後台設定
- [x] Admin 新增履歷匯出設定（顯示區塊開關、聯絡資訊顯示控制）
- [x] 支援「隱私控制」欄位（電話/Email 可選顯示）
- [x] 設定儲存到 DB（新表 `resume_export_settings`）

### Stage R5 — QA 與交付驗收
- [x] 本機測試：`npm run test`
- [x] 本機建置：`npm run build`
- [x] 版面驗收：Chrome PDF 匯出（桌機/手機 viewport）
- [x] 可讀性驗收：5 秒掃描能看懂核心履歷（角色、年資、技能、代表作）
- [x] commit + push + GitHub Actions success + live health check
- [x] 舊版履歷下載/管理流程棄用，統一改為新匯出流程（/resume/export）

### 驗收標準（Done Definition）
- [x] 面試官在 30 秒內可掌握：你是誰、做過什麼、擅長什麼
- [x] PDF 在 A4 列印與螢幕閱讀皆清楚（無版面破碎）
- [x] 匯出流程 3 步內完成（進入頁面 → 選模板 → 下載）
- [x] Admin 可調整輸出內容，不需改程式碼

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

---

## 9) 首頁文案中文化 + 後台可編輯（Home Settings）

### Scope
- [ ] 首頁 `/` hero + 按鈕 + 三卡區塊 + 底部 CTA 的文案全部改為中文預設
- [ ] 這些文案改為可由 `/admin/home` 後台直接調整（不需改碼、不需重新部署）

### Stage H1 — Supabase 資料表 + RLS
- [x] 新增 `home_settings` migration
- [x] RLS：public read + admin write（沿用 `admin_users`）
- [x] seed 預設中文文案
- [x] `supabase db push` 套用到遠端

### Stage H2 — DataClient + 型別
- [x] `types` 新增 `HomeSettings`
- [x] `DataClient` 增加 `getHomeSettings` / `updateHomeSettings`
- [x] `SupabaseDataClient` 實作讀寫 `home_settings`

### Stage H3 — Admin UI
- [x] 新增 `/admin/home`（Home Settings 編輯器）
- [x] Admin Dashboard 增加 Home 入口

### Stage H4 — 首頁整合
- [x] `Index.tsx` 讀取 `home_settings` 並渲染
- [x] 若讀取失敗，使用 fallback 中文預設（避免空白）

### 預設中文文案（seed/fallback）
- Hero 主標：歡迎來到我的作品集
- Hero 副標：用現代技術打造優雅且可靠的解決方案
- 按鈕：
  - 查看作品（/portfolio）
  - 關於我（/about）
  - 履歷 PDF（/resume/export）
  - 聯絡我（/contact）
- 三卡：
  - 技能與專長：探索我在前端、後端與更多領域的技術能力。
  - 服務項目：看看我能如何把你的想法落地成產品。
  - 作品集：查看我近期的專案與案例整理。
- 底部 CTA：
  - 標題：準備開始一個專案？
  - 描述：我隨時歡迎討論新專案與創意想法，我們一起做出很棒的作品。
  - 按鈕：取得聯繫

### Stage H5 — 驗證與交付
- [x] `npm test`
- [x] `npm run build`
- [x] commit + push
- [ ] GitHub Actions success
- [ ] live site health check (`200`)


---

## 10) 新需求：`/skills` 黑色銀河地球儀球體（預設華麗模式，可切回傳統樣式）

### 現況判讀
- [x] 目前 `src/pages/SkillsPage.tsx` 為「上方 tag filter + 下方依 category 分組卡片」的靜態列表頁。
- [x] 目前 filter 來源為所有技能 `tags` 去重後產生，行為是篩掉不含該 tag 的 skills。
- [x] 目前 `Skill` 型別僅有 `name/category/level/tags/sortOrder/updatedAt`，沒有 globe 專用欄位（如座標、顏色、摘要、logo、featured）。
- [x] 目前 `SupabaseDataClient.listSkills()` 僅支援 category 篩選；tag 篩選在前端頁面處理。
- [x] 目前 `/admin/skills` 僅支援 CRUD 基本欄位與排序，不支援視覺化模式設定。
- [x] 目前 migration 只看到 `skills.level`、`skills.icon`、`skills.tags` 等基礎欄位調整，尚無 globe / display mode 專用 schema。

### 目標
- [ ] `/skills` 頁面改為「黑色銀河地球儀球體 + 技能光點 + 持續旋轉」的預設呈現。
- [ ] 保留上方 filter，不改掉既有篩選入口與使用習慣。
- [ ] filter 後球體上的光點數量會同步減少，只顯示符合條件的 skills。
- [ ] 滑鼠 hover 某技能光點時，球體停轉，並顯示該技能細節。
- [ ] 預設為華麗模式（globe），但使用者可切回傳統列表/卡片模式。
- [ ] 儘量沿用既有 skills 資料，不為了視覺效果先做過度 schema 膨脹。

### 風險 / 決策點
- [ ] **互動技術風險**：若採真 3D（three.js / react-three-fiber），效能、包體、SSR/CSR 行為、行動裝置體驗都要驗證。
- [ ] **可維護性風險**：若直接硬塞大量視覺邏輯進 `SkillsPage.tsx`，後續難維護，需拆成 view mode / globe scene / tooltip overlay。
- [ ] **資料表風險**：現有 skills 缺少 hover 詳情文案、星點權重、顏色等欄位；若需求要更精準內容控制，才考慮補 schema。
- [ ] **無障礙風險**：純 hover 對鍵盤/觸控不友善，需設計 focus / tap 替代互動。
- [ ] **降級風險**：若裝置效能弱或 `prefers-reduced-motion` 啟用，需能退回較輕量的呈現。

### 建議方案（先做、再擴充）
- [ ] **第一優先採「偽 3D / 數學投影球體」方案**：用 CSS + requestAnimationFrame + 2D/DOM/SVG/canvas 投影做球體旋轉，先避免引入重型 3D 依賴。
- [ ] 光點資料先由既有 `Skill` 衍生：
  - `name`：tooltip 標題
  - `category`：光點色系 / 群組樣式
  - `level`：光點大小 / 發光強度
  - `tags`：tooltip 補充資訊與 filter 來源
  - `sortOrder`：決定球面分布穩定順序（避免每次刷新亂跳）
- [ ] 「傳統樣式」沿用現有 grouped card UI，避免重做兩套資料流。
- [ ] 華麗模式切換狀態先放前端 local state / localStorage；若日後要後台可控，再補設定表。

### Stage S1 — 規格收斂與設計決策
- [ ] 確認華麗模式採「偽 3D」還是「three.js 真 3D」；未明確前預設偽 3D。
- [ ] 定義 hover/focus/tap 行為：停轉、tooltip 位置、離開後恢復旋轉。
- [ ] 定義 mode switch UX：`華麗模式 / 傳統模式` 切換位置、文案、預設值。
- [ ] 定義 reduced-motion / mobile 降級策略。

### Stage S2 — 前端架構調整
- [ ] 將 `SkillsPage` 拆為：filter 區、mode switch、globe 視圖、traditional 視圖、detail overlay。
- [ ] 建立 skills -> globe nodes 的衍生 mapper（由既有 `Skill` 生成球面座標與視覺權重）。
- [ ] 實作 filter 後共用同一份 `filteredSkills`，確保 globe 與 traditional view 同步。
- [ ] 實作旋轉動畫生命週期（自轉、hover 停轉、離開恢復）。

### Stage S3 — 互動與視覺驗證
- [ ] 黑色銀河背景、球體光暈、技能光點層次完成。
- [ ] hover/focus 單一光點時顯示技能名稱、category、level、tags。
- [ ] filter 切換時，球體光點數量、tooltip、空狀態皆正確。
- [ ] 傳統模式保留現有分類卡片瀏覽能力。

### Stage S4 — 資料層 / 後台評估（僅在需要時做）
- [ ] 先以現有 `skills` schema 完成第一版，不急著改 DB。
- [ ] 若 CEO 確認需要「每個光點自訂描述 / logo / 色彩 / featured 權重 / 固定座標」，再補：
  - [ ] `types.Skill` 擴充欄位
  - [ ] `DataClient` / `SupabaseDataClient` / `mockDataClient` / `apiDataClient` 同步
  - [ ] `/admin/skills` 編輯表單同步新增欄位
  - [ ] Supabase migration + `supabase db push --linked`

### 驗收方式
- [ ] `/skills` 預設進入即為華麗球體模式，不是舊卡片模式。
- [ ] 上方 filter 仍可操作，且切換後球體光點數量明顯隨資料減少。
- [ ] hover 任一光點時球體停止旋轉，且可見對應技能細節。
- [ ] 取消 hover / focus 後球體恢復旋轉。
- [ ] 使用者可手動切回傳統樣式，且傳統樣式仍可正常瀏覽分類技能卡。
- [ ] 無資料 / filter 無結果 / 載入失敗時，頁面有合理狀態，不出現壞掉的空白球體。
- [ ] 手機或低動態偏好環境至少可用，不會因動畫導致頁面不可操作。
