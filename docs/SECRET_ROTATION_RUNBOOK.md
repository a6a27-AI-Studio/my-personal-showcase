# SECRET_ROTATION_RUNBOOK.md

## 目的

本文件提供 P0-1（憑證輪替）的可執行步驟，讓手動雲端操作可一次完成並可回溯。

## 範圍

- Google OAuth Client Secret
- Supabase Auth 設定（redirect / provider）
- GitHub Actions Secrets

## Step 1 — 旋轉 Google OAuth Secret（手動）

1. 進入 Google Cloud Console → APIs & Services → Credentials。
2. 找到目前 Web OAuth Client（此專案使用）。
3. 建立新 secret（或重建 client，視政策）。
4. 記錄新值（不要寫進 repo）。
5. 確認 Authorized redirect URI 包含：
   - `https://a6a27-ai-studio.github.io/my-personal-showcase/auth/callback`
   - `http://localhost:5173/auth/callback`

## Step 2 — 檢查 Supabase Auth（手動）

1. Supabase Dashboard → Authentication → Providers → Google。
2. 更新 Google client id/secret（若有變更）。
3. 確認 Site URL 與 Redirect URLs 正確。

## Step 3 — 更新 GitHub Secrets（手動）

Repo → Settings → Secrets and variables → Actions：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

> 若本次有變更 Supabase 專案或 key，務必更新。

## Step 4 — 重新部署與驗證

1. push 任意 commit（或 re-run deploy workflow）。
2. 確認 Actions success。
3. 驗證線上站點 `200`。
4. 線上做一次 Google 登入：
   - 外部瀏覽器流程正常
   - callback 無 401/403

## Step 5 — 驗證舊憑證失效（手動）

- 用舊配置嘗試應失敗（符合預期）。
- 新配置成功。

## 回報格式（一次帶齊）

- Request URL
- Status code
- Response body
- Authorization/apikey header 是否存在
- 當前 deployed commit / Actions run id
