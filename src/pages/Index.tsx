import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useDataClient } from '@/contexts/DataClientContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download, Code, Briefcase, FolderKanban } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import type { About, HomeSettings } from '@/types';

export default function Index() {
  const dataClient = useDataClient();
  const [about, setAbout] = useState<About | null>(null);
  const [home, setHome] = useState<HomeSettings | null>(null);

  useEffect(() => {
    dataClient.getAbout().then((aboutData) => {
      setAbout(aboutData);
    });

    dataClient.getHomeSettings().then((homeData) => {
      setHome(homeData);
    });
  }, [dataClient]);

  const seoTitle = useMemo(() => {
    const hero = home?.heroTitle || about?.headline;
    return hero ? `${hero}｜a6a27 個人作品集` : 'a6a27 個人作品集｜現代網站與產品開發';
  }, [home?.heroTitle, about?.headline]);

  const seoDescription =
    home?.heroSubtitle ||
    about?.subheadline ||
    'a6a27 的個人作品集，展示專案、技能、服務與可合作的產品開發能力。';

  const structuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'a6a27',
      url: `${import.meta.env.VITE_SITE_URL || ''}/`,
      jobTitle: about?.headline || 'Frontend / Full-stack Developer',
      description: seoDescription,
      sameAs: about?.links?.map((link) => link.url) || [],
    }),
    [about?.headline, about?.links, seoDescription]
  );

  return (
    <>
      <Seo title={seoTitle} description={seoDescription} path="/" structuredData={structuredData} />
      <div className="min-h-[calc(100vh-4rem)]">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="container py-20 md:py-32 relative">
            <div className="max-w-3xl mx-auto text-center animate-slide-up">
              <h1 className="text-primary mb-6">{home?.heroTitle || about?.headline || '歡迎來到我的作品集'}</h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                {home?.heroSubtitle || about?.subheadline || '用現代技術打造優雅且可靠的解決方案'}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild className="btn-gradient">
                  <Link to="/portfolio">
                    {home?.ctaPortfolioText || '查看作品'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/about">{home?.ctaAboutText || '關於我'}</Link>
                </Button>
                <Button size="lg" variant="ghost" asChild>
                  <Link to="/resume/export">
                    <Download className="mr-2 h-5 w-5" />
                    {home?.ctaResumeText || '履歷 PDF'}
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" asChild>
                  <Link to="/contact">{home?.ctaContactText || '聯絡我'}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-secondary/30">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8">
              <Link to="/skills" className="group p-8 bg-card rounded-xl border shadow-sm card-hover">
                <Code className="h-10 w-10 text-accent mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                  {home?.skillsTitle || '技能與專長'}
                </h3>
                <p className="text-muted-foreground">
                  {home?.skillsDescription || '探索我在前端、後端與更多領域的技術能力。'}
                </p>
              </Link>

              <Link to="/services" className="group p-8 bg-card rounded-xl border shadow-sm card-hover">
                <Briefcase className="h-10 w-10 text-accent mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                  {home?.servicesTitle || '服務項目'}
                </h3>
                <p className="text-muted-foreground">
                  {home?.servicesDescription || '看看我能如何把你的想法落地成產品。'}
                </p>
              </Link>

              <Link to="/portfolio" className="group p-8 bg-card rounded-xl border shadow-sm card-hover">
                <FolderKanban className="h-10 w-10 text-accent mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                  {home?.portfolioTitle || '作品集'}
                </h3>
                <p className="text-muted-foreground">
                  {home?.portfolioDescription || '查看我近期的專案與案例整理。'}
                </p>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {home?.finalCtaTitle || '準備開始一個專案？'}
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {home?.finalCtaDescription || '我隨時歡迎討論新專案與創意想法，我們一起做出很棒的作品。'}
            </p>
            <Button size="lg" asChild>
              <Link to="/contact">
                {home?.finalCtaButtonText || '取得聯繫'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
