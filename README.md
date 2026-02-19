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

## 測試與建置

```bash
npm run test
npm run build
```

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
