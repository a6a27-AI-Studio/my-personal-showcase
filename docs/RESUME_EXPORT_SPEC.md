# Resume Export Spec (R1)

## Goals

- Let interviewers understand profile in 30 seconds.
- Keep one unified data source from current CMS/DB.
- Support future dual templates (Quick Scan / Brand).

## Export sections

1. Header
2. Summary
3. Experiences
4. Skills
5. Projects
6. Contact

## Required fields

- `profile.fullName`
- `profile.title`
- `about.bio`
- `experiences[]`:
  - `role`, `company`, `startDate`, `isCurrent|endDate`, `summary`
- `skills[]`:
  - `name`, `level`, `category`
- `portfolio[]` (top representative):
  - `title`, `summary`, `techStack`

## Optional fields

- `profile.contactEmail`
- `profile.contactPhone`
- `profile.location`
- `experiences[].highlights`
- `experiences[].techStack`
- `about.links`
- `resumeMeta.pdfUrl`

## Data source (current)

- `site_about`
- `experiences`
- `skills`
- `portfolio_items`
- `services` (optional usage)
- `resume_export_settings`（設定來源）

## Aggregation

Use `buildResumeExportData(dataClient)` in `src/lib/resumeExport.ts` as the single DTO builder.
