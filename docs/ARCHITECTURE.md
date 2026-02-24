# ARCHITECTURE.md

## 1) 系統概覽

本專案採用前後端分離的前端應用架構：

- Frontend: React + Vite + TypeScript
- Data Access Contract: `DataClient` 介面（`src/api/dataClient.ts`）
- Production Data Provider: `SupabaseDataClient`（`src/api/supabaseDataClient.ts`）
- Context Injection: `DataClientProvider`（`src/contexts/DataClientContext.tsx`）
- Auth: Supabase Auth + OAuth callback route

## 2) 分層設計

### UI Layer

- `src/pages/*`：頁面元件
- `src/components/*`：共用元件（含 shadcn/ui）

UI **不得直接呼叫 legacy `*Api.ts`**，必須透過 `useDataClient()`。

### Domain/Contract Layer

- `src/types/index.ts`：主要型別定義
- `src/api/dataClient.ts`：統一資料操作契約

### Infra Layer

- `src/api/supabaseDataClient.ts`：以 Supabase 實作 `DataClient`
- `src/lib/supabaseClient.ts`：Supabase client 初始化
- `src/contexts/AuthContext.tsx`：登入狀態與管理員判斷

## 3) 路由與權限

- Public routes: `/`, `/about`, `/skills`, `/services`, `/portfolio`, `/contact`
- Auth callback: `/auth/callback`
- Admin routes: `/admin/*`
- Admin guard: `src/components/guards/AdminGuard.tsx`

> 先前未使用的 `RouteGuards.tsx` 已移除，避免雙軌 guard 行為。

## 4) 資料流（Data Flow）

1. Page/Component 呼叫 `useDataClient()`。
2. `DataClientProvider` 注入 `SupabaseDataClient`。
3. `SupabaseDataClient` 呼叫 Supabase table / edge function。
4. 回傳前轉換為 `src/types/index.ts` 定義的前端型別。

## 5) Messages 特殊路徑

留言 CRUD 走 edge function (`messages`)：

- `list/create/update/reply/delete`
- 會附帶 access token 與 apikey header
- 若無有效 session token，會丟出明確錯誤

## 6) 錯誤處理策略

- API/Data 層不再使用 `console.error + return []` 靜默失敗。
- 改為丟錯，讓 UI 能區分：
  - 空資料（正常）
  - 請求失敗（可顯示錯誤 UI）

## 7) 其他 DataClient 實作

- `src/mock/mockDataClient.ts`：本地 mock 行為
- `src/api/apiDataClient.ts`：未來接 DMZ/OpenAPI 的佔位實作

三者需保持 `DataClient` 契約一致。