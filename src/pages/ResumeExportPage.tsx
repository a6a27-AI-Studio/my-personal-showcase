import { useEffect, useMemo, useState } from 'react';
import { useDataClient } from '@/contexts/DataClientContext';
import { buildResumeExportData, type ResumeExportData } from '@/lib/resumeExport';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft } from 'lucide-react';

type ResumeTemplate = 'quick' | 'brand';
import { Link } from 'react-router-dom';

function fmtMonth(value?: string) {
  if (!value) return 'Present';
  const [y, m] = value.split('-');
  return `${y}/${m}`;
}

function makeFilename(base = 'resume-a6a27') {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${base}-${yyyy}${mm}${dd}`;
}

export default function ResumeExportPage() {
  const dataClient = useDataClient();
  const [data, setData] = useState<ResumeExportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [template, setTemplate] = useState<ResumeTemplate>('quick');
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  useEffect(() => {
    setPageError(null);
    buildResumeExportData(dataClient)
      .then(setData)
      .catch((error) => {
        console.error('Failed to build resume export data:', error);
        setPageError('履歷匯出資料載入失敗，請稍後再試。');
      })
      .finally(() => setIsLoading(false));
  }, [dataClient]);

  const topProjects = useMemo(() => {
    if (!data) return [];
    return data.core.portfolio.slice(0, template === 'quick' ? 4 : 6);
  }, [data, template]);

  const handlePrint = () => {
    setExportStatus('正在開啟系統列印視窗...');
    const originalTitle = document.title;
    document.title = makeFilename(template === 'quick' ? 'resume-quick-a6a27' : 'resume-brand-a6a27');
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
      setExportStatus('已觸發匯出，請在列印視窗另存為 PDF。');
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="container-page flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">載入中...</div>
      </div>
    );
  }

  if (pageError || !data) {
    return (
      <div className="container-page">
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {pageError || '資料不可用'}
        </div>
      </div>
    );
  }

  const { profile, core, sections, settings } = data;

  return (
    <div className="bg-muted/30 min-h-screen py-8 print:bg-white print:py-0">
      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          .no-print { display: none !important; }
          .print-wrap { box-shadow: none !important; margin: 0 !important; border: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      <div className="container-page no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            回到首頁
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant={template === 'quick' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTemplate('quick')}
          >
            Quick Scan
          </Button>
          <Button
            variant={template === 'brand' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTemplate('brand')}
          >
            Brand
          </Button>
          <Button onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" />
            匯出 PDF
          </Button>
        </div>
      </div>

      {exportStatus && (
        <div className="container-page no-print mb-4 text-sm text-muted-foreground">
          {exportStatus}
        </div>
      )}

      <article className={`print-wrap mx-auto w-full max-w-[210mm] bg-white border shadow-sm px-8 py-8 ${template === 'brand' ? 'border-primary/20' : ''}`}>
        {sections.header && (
        <header className={`border-b pb-4 mb-4 ${template === 'brand' ? 'bg-primary/5 -mx-8 px-8 pt-6' : ''}`}>
          <h1 className="text-3xl font-bold text-primary">{profile.fullName}</h1>
          <p className="text-lg mt-1">{profile.title}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {profile.location ? `${profile.location} · ` : ''}
            {core.about.links.map((l) => l.url).slice(0, 2).join(' · ')}
            {sections.contact && settings.showEmail && profile.contactEmail ? ` · ${profile.contactEmail}` : ''}
            {sections.contact && settings.showPhone && profile.contactPhone ? ` · ${profile.contactPhone}` : ''}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            模板：{template === 'quick' ? 'Quick Scan（快速審閱）' : 'Brand（品牌敘事）'}
          </p>
        </header>
        )}

        {sections.summary && (
        <section className="mb-5">
          <h2 className="text-base font-semibold uppercase tracking-wide mb-2">Summary</h2>
          <p className="text-sm leading-relaxed text-foreground/90">{core.about.bio || core.about.subheadline}</p>
        </section>
        )}

        {sections.experiences && (
        <section className="mb-5">
          <h2 className="text-base font-semibold uppercase tracking-wide mb-2">Experience</h2>
          <div className="space-y-4">
            {core.experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">{exp.role}</div>
                    <div className="text-sm text-muted-foreground">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {fmtMonth(exp.startDate)} - {exp.isCurrent ? 'Present' : fmtMonth(exp.endDate)}
                  </div>
                </div>
                <p className="text-sm mt-1">{exp.summary}</p>
                {exp.highlights.length > 0 && (
                  <ul className="text-sm mt-1 list-disc pl-5 space-y-0.5">
                    {exp.highlights.slice(0, 3).map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
        )}

        {sections.skills && (
        <section className="mb-5">
          <h2 className="text-base font-semibold uppercase tracking-wide mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {core.skills.map((s) => (
              <span key={s.id} className="text-xs px-2 py-1 rounded border bg-secondary/50">
                {s.name}
              </span>
            ))}
          </div>
        </section>
        )}

        {sections.projects && (
        <section>
          <h2 className="text-base font-semibold uppercase tracking-wide mb-2">Selected Projects</h2>
          <div className="space-y-2">
            {topProjects.map((p) => (
              <div key={p.id}>
                <div className="font-medium text-sm">{p.title}</div>
                <div className="text-xs text-muted-foreground">{p.summary}</div>
              </div>
            ))}
          </div>
        </section>
        )}
      </article>
    </div>
  );
}
