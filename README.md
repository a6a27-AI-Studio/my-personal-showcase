# 個人作品集（my-personal-showcase）

這是一個以 **React + TypeScript + Vite + Supabase** 建置的個人作品集專案，包含前台展示與後台內容管理。

## 技術棧

- React 18
- TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Supabase（Auth / Database）
- Vitest

## 本機開發

```bash
# 1) 安裝依賴
npm install

# 2) 啟動開發伺服器
npm run dev
```

預設開發網址：`http://localhost:5173`

## 環境變數

請建立 `.env.local`（可參考 `.env.local.example`），至少包含：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL`

## 安全注意事項（必讀）

- **不要提交機敏檔案**（例如 `client_secret*.json`、`.env*`、`supabase/.temp/*`）
- 若懷疑金鑰外洩，請先在雲端端輪替憑證，再更新 GitHub secrets
- PR 前請先用 `git status` / `git diff --name-only` 確認沒有敏感檔進入變更集

## 測試與建置

```bash
npm run test
npm run build
```

## 故障排查（快速）

### 1) Google 登入在 LINE 內失敗（403 `disallowed_useragent`）

原因：Google 對內建 WebView 有安全政策限制。

處理：
- 改用外部瀏覽器（Chrome/Safari）開啟再登入
- 專案已內建 WebView 偵測與外開引導

### 2) 呼叫 Supabase function 出現 401 / Invalid JWT

優先檢查：
- 前端是否已 refresh session
- request header 是否帶 `Authorization: Bearer <token>` 與 `apikey`
- 是否在測試舊版前端 bundle

### 3) 線上部署異常

- 檢查 GitHub Actions 最新 run 是否 success
- 檢查 Pages 網址是否可回應 200
- 重新確認 repository secrets 值是否正確

更多維運細節：
- `docs/ARCHITECTURE.md`
- `docs/OPERATIONS.md`

## GitHub Pages 部署

本專案已配置 GitHub Actions 自動部署：

- Workflow: `.github/workflows/deploy-gh-pages.yml`
- 觸發：push 到 `main`

### 部署前設定

1. GitHub repository secrets 新增：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. GitHub Repo 設定：
   - `Settings → Pages → Source = GitHub Actions`

3. Supabase Auth redirect URLs 新增：
   - `https://a6a27-ai-studio.github.io/my-personal-showcase/auth/callback`
   - `http://localhost:5173/auth/callback`（本機開發）

## 專案路由

- 前台：`/`, `/about`, `/skills`, `/services`, `/portfolio`, `/contact`
- OAuth callback：`/auth/callback`
- 後台：`/admin/*`（需登入與權限）
