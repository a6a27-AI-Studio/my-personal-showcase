# OPERATIONS.md

## 1) 日常操作（本機）

```bash
npm install
npm run test
npm run build
npm run dev
```

## 2) 部署流程（GitHub Pages）

- Workflow: `.github/workflows/deploy-gh-pages.yml`
- Trigger: push 到 `main`
- 部署完成後檢查：
  - GitHub Actions run 結果為 success
  - `https://a6a27-ai-studio.github.io/my-personal-showcase/` 回應 200

## 3) 必備 Secrets / 設定

GitHub repository secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Supabase Auth redirect URLs:

- `https://a6a27-ai-studio.github.io/my-personal-showcase/auth/callback`
- `http://localhost:5173/auth/callback`

## 4) OAuth 常見問題排查

### 問題 A：401 Unauthorized / Invalid JWT

請一次蒐集：

1. Request URL
2. Status code
3. Response body（是否 `Invalid JWT`）
4. Request headers 是否有 `Authorization` / `apikey`
5. 當前前端 bundle 是否為最新部署

排查順序：

1. 先 refresh session（避免舊 token）
2. 確認前端實際部署版本已更新
3. 確認呼叫 edge function 有帶 `Authorization` + `apikey`
4. 必要時於 function 內二次驗證使用者與權限

### 問題 B：Google 登入 403 `disallowed_useragent`

現象：在 LINE/Facebook 等內建 WebView 中，Google OAuth 被政策阻擋。

處理方式：

- 偵測 WebView 後，引導使用者外部瀏覽器開啟再登入（已實作）
- 若仍失敗，請在 Chrome/Safari 直接開啟站點重試

## 5) 回歸檢查清單（每次改動後）

1. `npm run test`
2. `npm run build`
3. push `main`
4. 等待 Actions success
5. 線上 URL 健康檢查（HTTP 200）

## 6) 風險提醒

- 不要提交機敏檔（client secret、supabase temp 檔）
- 任何憑證外洩疑慮，一律先輪替再驗證
