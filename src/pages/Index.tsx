import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDataClient } from '@/contexts/DataClientContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download, Code, Briefcase, FolderKanban } from 'lucide-react';
import type { About } from '@/types';

export default function Index() {
  const dataClient = useDataClient();
  const [about, setAbout] = useState<About | null>(null);

  useEffect(() => {
    dataClient.getAbout().then((aboutData) => {
      setAbout(aboutData);
    });
  }, [dataClient]);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <h1 className="text-primary mb-6">{about?.headline || 'Welcome to My Portfolio'}</h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              {about?.subheadline || 'Building elegant solutions with modern technologies'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="btn-gradient">
                <Link to="/portfolio">
                  View My Work
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">About Me</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link to="/resume/export">
                  <Download className="mr-2 h-5 w-5" />
                  Resume PDF
                </Link>
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
              <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">Skills & Expertise</h3>
              <p className="text-muted-foreground">Explore my technical skills across frontend, backend, and more.</p>
            </Link>

            <Link to="/services" className="group p-8 bg-card rounded-xl border shadow-sm card-hover">
              <Briefcase className="h-10 w-10 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">Services</h3>
              <p className="text-muted-foreground">Discover how I can help bring your ideas to life.</p>
            </Link>

            <Link to="/portfolio" className="group p-8 bg-card rounded-xl border shadow-sm card-hover">
              <FolderKanban className="h-10 w-10 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">Portfolio</h3>
              <p className="text-muted-foreground">View my recent projects and case studies.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Ready to Start a Project?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            I'm always open to discussing new projects and creative ideas. Let's build something amazing together.
          </p>
          <Button size="lg" asChild>
            <Link to="/contact">
              Get in Touch
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
