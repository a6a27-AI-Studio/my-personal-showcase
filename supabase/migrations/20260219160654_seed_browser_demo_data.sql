-- Seed demo data for browsing the personal showcase
-- Safe-ish approach: insert missing records, avoid deleting existing user data.

-- 1) About section: update existing row (first row) or insert if table is empty
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
      'Hi, I''m Alex Chen',
      'Full‑Stack Developer · Product Builder',
      'I build practical web products with clean UX, reliable backend architecture, and maintainable code. I enjoy turning ambiguous ideas into shipped features.',
      ARRAY[
        '4+ years building React/TypeScript applications',
        'Production experience with Supabase and PostgreSQL',
        'Strong focus on DX, testing, and delivery speed'
      ]::text[],
      '[{"label":"GitHub","url":"https://github.com/a6a27-AI-Studio"},{"label":"LinkedIn","url":"https://linkedin.com"}]'::jsonb,
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'
    );
  ELSE
    UPDATE site_about
    SET
      headline = COALESCE(NULLIF(headline, ''), 'Hi, I''m Alex Chen'),
      subheadline = COALESCE(NULLIF(subheadline, ''), 'Full‑Stack Developer · Product Builder'),
      bio = COALESCE(NULLIF(bio, ''), 'I build practical web products with clean UX, reliable backend architecture, and maintainable code. I enjoy turning ambiguous ideas into shipped features.'),
      highlights = CASE WHEN highlights IS NULL OR array_length(highlights, 1) IS NULL THEN ARRAY[
        '4+ years building React/TypeScript applications',
        'Production experience with Supabase and PostgreSQL',
        'Strong focus on DX, testing, and delivery speed'
      ]::text[] ELSE highlights END,
      links = CASE WHEN links IS NULL OR jsonb_array_length(links) = 0 THEN
        '[{"label":"GitHub","url":"https://github.com/a6a27-AI-Studio"},{"label":"LinkedIn","url":"https://linkedin.com"}]'::jsonb
      ELSE links END,
      avatar_url = COALESCE(NULLIF(avatar_url, ''), 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'),
      updated_at = now()
    WHERE id = v_about_id;
  END IF;
END $$;

-- 2) Skills
INSERT INTO skills (name, category, level, tags, sort_order)
SELECT * FROM (
  VALUES
    ('TypeScript', 'frontend', 5, ARRAY['react','spa','typing']::text[], 10),
    ('React', 'frontend', 5, ARRAY['hooks','router','ui']::text[], 20),
    ('Node.js', 'backend', 4, ARRAY['api','express','performance']::text[], 30),
    ('PostgreSQL', 'database', 4, ARRAY['sql','index','query']::text[], 40),
    ('Supabase', 'database', 4, ARRAY['auth','rls','realtime']::text[], 50),
    ('Docker', 'devops', 3, ARRAY['container','deploy']::text[], 60)
) AS v(name, category, level, tags, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM skills s WHERE s.name = v.name
);

-- 3) Portfolio items
INSERT INTO portfolio_items (
  slug,
  title,
  summary,
  cover_image_url,
  problem,
  solution,
  impact,
  tags,
  tech_stack,
  links,
  status,
  sort_order
)
SELECT * FROM (
  VALUES
    (
      'smart-booking-dashboard',
      'Smart Booking Dashboard',
      'A dashboard for operators to manage reservations, occupancy, and customer service workflows.',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
      'Manual booking operations caused delayed responses and inconsistent records.',
      'Built a centralized dashboard with role-based access, timeline views, and automation hooks.',
      ARRAY['Reduced response time by 42%', 'Cut manual update errors by 60%']::text[],
      ARRAY['dashboard','saas','operations']::text[],
      ARRAY['React','TypeScript','Supabase','PostgreSQL']::text[],
      '[{"label":"Live Demo","url":"https://example.com"},{"label":"Case Study","url":"https://example.com/case-study"}]'::jsonb,
      'published',
      10
    ),
    (
      'creator-portfolio-cms',
      'Creator Portfolio CMS',
      'A lightweight CMS for creators to edit content blocks and publish portfolio updates quickly.',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
      'Static content updates required developer intervention and slowed iteration.',
      'Implemented a structured CMS with media upload, draft/publish flow, and audit-friendly schema.',
      ARRAY['Publishing lead time improved from days to minutes', 'Enabled non-engineers to maintain content']::text[],
      ARRAY['cms','content','workflow']::text[],
      ARRAY['React','Supabase','RLS','Tailwind']::text[],
      '[{"label":"Overview","url":"https://example.com"}]'::jsonb,
      'published',
      20
    ),
    (
      'support-ticket-analytics',
      'Support Ticket Analytics',
      'Analytics toolkit to monitor ticket SLA, trend anomalies, and weekly support insights.',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80',
      'Support teams lacked visibility into SLA risk and recurring issue clusters.',
      'Delivered reporting pipelines and visual summaries with filters by team, tag, and severity.',
      ARRAY['Improved SLA compliance by 18%', 'Helped identify top 3 recurring issue categories']::text[],
      ARRAY['analytics','support','reporting']::text[],
      ARRAY['PostgreSQL','Supabase','React Query','Recharts']::text[],
      '[{"label":"Summary","url":"https://example.com"}]'::jsonb,
      'published',
      30
    )
) AS v(
  slug, title, summary, cover_image_url, problem, solution,
  impact, tags, tech_stack, links, status, sort_order
)
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_items p WHERE p.slug = v.slug
);

-- 4) Services
INSERT INTO services (
  name,
  summary,
  description,
  deliverables,
  process,
  icon,
  related_portfolio_ids,
  sort_order
)
SELECT * FROM (
  VALUES
    (
      'MVP Web App Development',
      'Build a production-ready MVP from idea to launch.',
      'From requirement framing to implementation and deployment, focused on fast validation and maintainability.',
      ARRAY['Product scoping','Frontend + backend implementation','Deployment checklist']::text[],
      ARRAY['Discovery','Architecture','Build','QA & launch']::text[],
      'rocket',
      ARRAY[]::uuid[],
      10
    ),
    (
      'Supabase Data Architecture',
      'Design scalable schema, RLS, and auth flows for Supabase apps.',
      'Practical schema design with migration strategy, RLS hardening, and performance tuning.',
      ARRAY['Schema proposal','RLS policy set','Migration scripts']::text[],
      ARRAY['Audit','Design','Implement','Review']::text[],
      'database',
      ARRAY[]::uuid[],
      20
    ),
    (
      'Frontend Performance Optimization',
      'Improve Core Web Vitals and runtime UX for React applications.',
      'Bundle strategy, rendering optimization, and interaction latency improvements.',
      ARRAY['Performance audit','Code-splitting plan','Implementation PRs']::text[],
      ARRAY['Measure','Prioritize','Optimize','Verify']::text[],
      'zap',
      ARRAY[]::uuid[],
      30
    )
) AS v(name, summary, description, deliverables, process, icon, related_portfolio_ids, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM services s WHERE s.name = v.name
);

-- 5) Resume metadata: ensure at least one visible record
INSERT INTO resume_meta (version, pdf_url)
SELECT 'v1.0', 'https://example.com/resume.pdf'
WHERE NOT EXISTS (SELECT 1 FROM resume_meta);
