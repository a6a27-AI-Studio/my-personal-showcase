import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDataClient } from '@/contexts/DataClientContext';
import { Button } from '@/components/ui/button';
import { Download, ArrowRight, Github, Linkedin, Twitter, Mail } from 'lucide-react';
import type { About, ResumeMeta } from '@/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  mail: Mail,
};

export default function AboutPage() {
  const dataClient = useDataClient();
  const [about, setAbout] = useState<About | null>(null);
  const [resume, setResume] = useState<ResumeMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    setPageError(null);
    Promise.all([dataClient.getAbout(), dataClient.getResume()])
      .then(([aboutData, resumeData]) => {
        setAbout(aboutData);
        setResume(resumeData);
      })
      .catch((error) => {
        console.error('Failed to load about page data:', error);
        setPageError('頁面資料載入失敗，請稍後再試。');
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

  if (pageError) {
    return (
      <div className="container-page text-center">
        <p className="text-destructive">{pageError}</p>
      </div>
    );
  }

  if (!about) {
    return (
      <div className="container-page text-center">
        <p className="text-muted-foreground">About information not available.</p>
      </div>
    );
  }

  return (
    <div className="container-page">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-slide-up">
            <h1 className="text-primary mb-4">關於我 {about.headline}</h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              {about.subheadline}
            </p>
            {about.bio && (
              <p className="text-muted-foreground leading-relaxed">
                {about.bio}
              </p>
            )}
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="btn-gradient">
                <Link to="/portfolio">
                  檢視我的作品
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                disabled={!resume?.pdfUrl}
                asChild={!!resume?.pdfUrl}
              >
                {resume?.pdfUrl ? (
                  <a href={resume.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-5 w-5" />
                    下載履歷 PDF
                  </a>
                ) : (
                  <span>
                    <Download className="mr-2 h-5 w-5" />
                    履歷尚未提供
                  </span>
                )}
              </Button>
            </div>
            {/* Social Links */}
            <div className="flex gap-4 pt-4">
              {about.links.map((link) => {
                const IconComponent = iconMap[link.icon || ''] || ArrowRight;
                return (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-primary transition-colors"
                    title={link.label}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
          <div className="relative animate-fade-in">
            {about.avatarUrl && (
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-2xl transform rotate-6"></div>
                <img
                  src={about.avatarUrl}
                  alt="頭像"
                  className="relative rounded-2xl shadow-xl w-full max-w-md mx-auto object-cover aspect-square"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      {about.highlights.length > 0 && (
        <section className="py-12 border-t">
          <h2 className="text-2xl font-semibold mb-8">Highlights</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {about.highlights.map((highlight, index) => (
              <div
                key={index}
                className="p-6 bg-card rounded-lg border shadow-sm card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="font-medium text-card-foreground">{highlight}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
