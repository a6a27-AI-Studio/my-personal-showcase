# API Layer Notes (P2-2)

## ✅ Current canonical path (in use)

UI pages/components should access data via:

- `src/api/dataClient.ts` (`DataClient` interface)
- `src/api/supabaseDataClient.ts` (current production implementation)
- `src/contexts/DataClientContext.tsx` (injection point)

This gives one stable contract for UI and keeps provider/backend switchable.

## ⚠️ Legacy direct-Supabase modules (not wired into UI)

These files still exist but are **legacy** and should not be used for new features:

- `aboutApi.ts`
- `adminApi.ts`
- `skillsApi.ts`
- `servicesApi.ts`
- `portfolioApi.ts`
- `messagesApi.ts`
- `resumeApi.ts`

Reason:

- They bypass the `DataClient` abstraction.
- They duplicate behavior already covered by `SupabaseDataClient`.
- Some still use older return conventions and schemas.

## Rules for future changes

1. Add/modify data behavior in `DataClient` + `SupabaseDataClient` first.
2. UI code should only call `useDataClient()` methods.
3. Do not import legacy `*Api.ts` files in pages/components.
4. When safe, remove legacy modules in a dedicated cleanup PR.

## Optional clients

- `apiDataClient.ts`: placeholder for future backend/DMZ OpenAPI integration.
- `src/mock/mockDataClient.ts`: local mock implementation for testing/dev scenarios.
