-- Replace demo/test showcase content with real profile data from user's Cake resume
-- Source: https://www.cake.me/resumes/s--rApapJ_0omjm0qVlt96f2A--/a6a27

BEGIN;

-- 1) About: keep one row and overwrite with real profile summary
DO $$
DECLARE
  v_about_id uuid;
BEGIN
  SELECT id INTO v_about_id
  FROM site_about
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1;

  IF v_about_id IS NULL THEN
    INSERT INTO site_about (
      headline,
      subheadline,
      bio,
      highlights,
      links,
      avatar_url
    ) VALUES (
      '.NET工程師',
      '沈奇緯 · 新北市新店區',
      '我對程式設計充滿熱情，樂於接受新挑戰並學習各種不同領域的知識。我熱衷於深入研究技術細節，並享受在學習與教學的過程中與他人共享知識，相互啟發。',
      ARRAY[
        '工作經歷橫跨軟體工程與系統維護，累積政府/校務網站建置與維運經驗',
        '熟悉 C#、.NET、MS SQL、Vue 生態，具備商業邏輯拆解與跨單位溝通能力',
        '重視資安、細節與可維運性，持續透過實作深化技術理解'
      ]::text[],
      '[{"label":"Cake Resume","url":"https://www.cake.me/resumes/s--rApapJ_0omjm0qVlt96f2A--/a6a27"},{"label":"YouTube","url":"https://www.youtube.com"}]'::jsonb,
      'https://media.cakeresume.com/image/upload/s--SBXwyRu5--/c_fill,g_face,h_120,w_120/v1694703209/xtittka10i7thf1uhppp.jpg'
    );
  ELSE
    UPDATE site_about
    SET
      headline = '.NET工程師',
      subheadline = '沈奇緯 · 新北市新店區',
      bio = '我對程式設計充滿熱情，樂於接受新挑戰並學習各種不同領域的知識。我熱衷於深入研究技術細節，並享受在學習與教學的過程中與他人共享知識，相互啟發。',
      highlights = ARRAY[
        '工作經歷橫跨軟體工程與系統維護，累積政府/校務網站建置與維運經驗',
        '熟悉 C#、.NET、MS SQL、Vue 生態，具備商業邏輯拆解與跨單位溝通能力',
        '重視資安、細節與可維運性，持續透過實作深化技術理解'
      ]::text[],
      links = '[{"label":"Cake Resume","url":"https://www.cake.me/resumes/s--rApapJ_0omjm0qVlt96f2A--/a6a27"},{"label":"YouTube","url":"https://www.youtube.com"}]'::jsonb,
      avatar_url = 'https://media.cakeresume.com/image/upload/s--SBXwyRu5--/c_fill,g_face,h_120,w_120/v1694703209/xtittka10i7thf1uhppp.jpg',
      updated_at = now()
    WHERE id = v_about_id;
  END IF;
END $$;

-- 2) Skills: clear demo/test and insert real skill set
DELETE FROM skills;

INSERT INTO skills (name, category, level, tags, sort_order)
VALUES
  ('C# / .NET (ADO.NET, LINQ, ASP.NET MVC, Razor)', 'backend', 5, ARRAY['c#','.net','asp.net','linq','ado.net']::text[], 10),
  ('MS SQL', 'database', 5, ARRAY['mssql','sql','stored procedure']::text[], 20),
  ('Vue 3', 'frontend', 4, ARRAY['vue','javascript','frontend']::text[], 30),
  ('Spring', 'backend', 3, ARRAY['java','spring']::text[], 40),
  ('Kendo UI', 'tools', 4, ARRAY['kendo','ui','telerik']::text[], 50);

-- 3) Portfolio: clear demo/test and insert projects from resume
DELETE FROM portfolio_items;

INSERT INTO portfolio_items (
  slug, title, summary, cover_image_url, problem, solution, impact, tags, tech_stack, links, status, sort_order
) VALUES
  (
    'course-learning-outcome-system',
    '課程學習成果系統開發',
    '服務對象為學生，重點在系統效能與正確性。',
    'https://img.cake.me/cdn-cgi/image/fit=scale-down,format=auto,w=1920/https://images.cakeresume.com/B0XVd7/a6a27/d3580a5e-1ee8-4c88-8211-1c984a7d3ce1.png',
    '學生端查詢與操作量高，需兼顧效能與資料一致性。',
    '設計並實作學習成果流程，強化查詢與交易正確性。',
    ARRAY['面向學生使用者情境', '強調效能與正確性']::text[],
    ARRAY['校務系統','學生服務']::text[],
    ARRAY['C#','.NET','MS SQL']::text[],
    '[{"label":"Cake Resume","url":"https://www.cake.me/resumes/s--rApapJ_0omjm0qVlt96f2A--/a6a27"}]'::jsonb,
    'published',
    10
  ),
  (
    'student-status-system',
    '學籍系統開發',
    '開發學生異動相關流程，並與客服反覆確認複雜商業邏輯。',
    'https://img.cake.me/cdn-cgi/image/fit=scale-down,format=auto,w=1920/https://images.cakeresume.com/B0XVd7/a6a27/7158214b-be4e-4244-b601-af50d8390dab.png',
    '學籍異動規則複雜，流程牽涉多角色與高正確性要求。',
    '透過需求釐清與多輪驗證，將規則轉為可維護流程。',
    ARRAY['跨部門需求釐清', '落地複雜商業邏輯']::text[],
    ARRAY['校務系統','商業邏輯']::text[],
    ARRAY['C#','.NET','MS SQL']::text[],
    '[{"label":"Cake Resume","url":"https://www.cake.me/resumes/s--rApapJ_0omjm0qVlt96f2A--/a6a27"}]'::jsonb,
    'published',
    20
  ),
  (
    'student-counseling-system',
    '輔導系統開發',
    '管理輔導人員與學生訪談紀錄，並處理多角色資料檢視權限。',
    'https://img.cake.me/cdn-cgi/image/fit=scale-down,format=auto,w=1920/https://images.cakeresume.com/B0XVd7/a6a27/344d019e-51c5-4c2f-a030-fd36f5233290.png',
    '訪談紀錄具敏感性，權限邊界需清楚。',
    '設計資料可視範圍與角色權限，確保存取安全。',
    ARRAY['權限分層資料可視化', '支援敏感紀錄管理']::text[],
    ARRAY['權限控管','校務系統']::text[],
    ARRAY['C#','.NET','MS SQL']::text[],
    '[{"label":"Cake Resume","url":"https://www.cake.me/resumes/s--rApapJ_0omjm0qVlt96f2A--/a6a27"}]'::jsonb,
    'published',
    30
  ),
  (
    'school-db-migration',
    '大規模校務資料庫移轉開發',
    '將舊系統資料規劃與轉移至新系統，並撰寫移轉程式。',
    'https://img.cake.me/cdn-cgi/image/fit=scale-down,format=auto,w=1920/https://images.cakeresume.com/B0XVd7/a6a27/f6ce741a-27a1-4766-bc8c-0d1e50d71b77.png',
    '舊新系統 schema 差異大，資料一致性與風險高。',
    '規劃轉換規則、撰寫 migration 程式並逐批驗證。',
    ARRAY['執行大型資料轉換', '降低移轉風險']::text[],
    ARRAY['資料移轉','資料庫']::text[],
    ARRAY['MS SQL','Stored Procedure','ETL']::text[],
    '[{"label":"Cake Resume","url":"https://www.cake.me/resumes/s--rApapJ_0omjm0qVlt96f2A--/a6a27"}]'::jsonb,
    'published',
    40
  ),
  (
    'online-retake-course-enrollment',
    '線上重補修報名系統開發',
    '統計學生不及格科目，並提供教師開課設定流程。',
    'https://img.cake.me/cdn-cgi/image/fit=scale-down,format=auto,w=1920/https://images.cakeresume.com/B0XVd7/a6a27/0f9bb4f2-6410-4760-b62f-12c157e2d976.png',
    '資料彙整與開課流程需同時兼顧彈性與正確性。',
    '整合成績統計與課程設定，提供可操作流程。',
    ARRAY['串接成績與開課流程', '支援教學行政操作']::text[],
    ARRAY['報名系統','教務流程']::text[],
    ARRAY['C#','.NET','MS SQL']::text[],
    '[{"label":"Cake Resume","url":"https://www.cake.me/resumes/s--rApapJ_0omjm0qVlt96f2A--/a6a27"}]'::jsonb,
    'published',
    50
  ),
  (
    'classroom-inspection-system',
    '巡堂系統開發',
    '巡堂教師可線上依座位表紀錄違規缺失。',
    'https://img.cake.me/cdn-cgi/image/fit=scale-down,format=auto,w=1920/https://images.cakeresume.com/B0XVd7/a6a27/e8622746-88a5-4fa6-837f-e53b011a2cb6.png',
    '紙本流程回報慢且難追蹤。',
    '導入線上紀錄流程，提升巡堂與後續管理效率。',
    ARRAY['改善現場回報效率', '提升紀錄可追蹤性']::text[],
    ARRAY['校務系統','行動流程']::text[],
    ARRAY['C#','.NET','MS SQL']::text[],
    '[{"label":"Cake Resume","url":"https://www.cake.me/resumes/s--rApapJ_0omjm0qVlt96f2A--/a6a27"}]'::jsonb,
    'published',
    60
  );

-- 4) Services: replace demo/test with real capability categories
DELETE FROM services;

INSERT INTO services (
  name, summary, description, deliverables, process, icon, related_portfolio_ids, sort_order
) VALUES
  (
    '校務系統與政府網站開發',
    '以 C#/.NET 與 MS SQL 打造高可用、可維運的業務系統。',
    '擅長處理複雜商業邏輯、跨單位需求溝通，以及長期維運的系統開發模式。',
    ARRAY['需求訪談與流程拆解', '功能開發與資料模型設計', '上線後維運優化']::text[],
    ARRAY['需求釐清', '設計與開發', '測試與交付', '維運迭代']::text[],
    'building',
    ARRAY[]::uuid[],
    10
  ),
  (
    '資料庫與資料移轉實作',
    '提供大型資料轉換、資料庫調校與 Stored Procedure 實作。',
    '可協助舊系統轉新系統資料整理、轉換、驗證，降低上線風險。',
    ARRAY['資料盤點與轉換規格', '移轉程式與腳本', '驗證報表與回歸檢查']::text[],
    ARRAY['盤點', '規劃', '執行', '驗證']::text[],
    'database',
    ARRAY[]::uuid[],
    20
  ),
  (
    '整合與流程自動化',
    '涵蓋客服對話、金流串接、後台加值與輔助工具開發。',
    '具備第三方服務串接經驗，可在既有系統中導入可落地的自動化流程。',
    ARRAY['第三方服務串接', '後台流程優化', '工具化與自動化腳本']::text[],
    ARRAY['現況分析', '串接實作', '流程優化', '監控維護']::text[],
    'workflow',
    ARRAY[]::uuid[],
    30
  );

-- 5) Resume metadata: point to resume source page
DELETE FROM resume_meta;
INSERT INTO resume_meta (version, pdf_url)
VALUES ('2026.02-cake-import', 'https://www.cake.me/resumes/s--rApapJ_0omjm0qVlt96f2A--/a6a27');

COMMIT;
