import { useEffect, useState } from 'react';
import { useDataClient } from '@/contexts/DataClientContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, MapPin, CalendarDays } from 'lucide-react';
import type { Experience } from '@/types';

function formatPeriod(startDate: string, endDate?: string, isCurrent?: boolean) {
  const toLabel = (value: string) => {
    const [y, m] = value.split('-');
    return `${y}/${m}`;
  };
  return `${toLabel(startDate)} - ${isCurrent ? '現在' : endDate ? toLabel(endDate) : '未填寫'}`;
}

export default function ExperiencesPage() {
  const dataClient = useDataClient();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    setPageError(null);
    dataClient
      .listExperiences()
      .then(setExperiences)
      .catch((error) => {
        console.error('Failed to load experiences:', error);
        setPageError('經歷資料載入失敗，請稍後再試。');
      })
      .finally(() => setIsLoading(false));
  }, [dataClient]);

  if (isLoading) {
    return (
      <div className="container-page flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">載入中...</div>
      </div>
    );
  }

  return (
    <div className="container-page">
      {pageError && (
        <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {pageError}
        </div>
      )}

      <div className="section-header">
        <h1 className="text-primary mb-4">經歷</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          以時間軸方式呈現我的工作歷程、技術成長與實作成果。
        </p>
      </div>

      <div className="relative ml-4 border-l border-border pl-6 space-y-6">
        {experiences.map((exp, index) => (
          <div key={exp.id} className="relative animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
            <span className="absolute -left-[33px] top-6 h-3 w-3 rounded-full bg-accent" />
            <Card className="card-hover overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">{exp.role}</CardTitle>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{exp.company}</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>{formatPeriod(exp.startDate, exp.endDate, exp.isCurrent)}</span>
                  </div>
                </div>
                {exp.location && (
                  <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{exp.location}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{exp.summary}</p>

                {exp.highlights.length > 0 && (
                  <ul className="space-y-2">
                    {exp.highlights.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {exp.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {exp.techStack.map((tech) => (
                      <span key={tech} className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {experiences.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">尚無經歷資料</div>
      )}
    </div>
  );
}
