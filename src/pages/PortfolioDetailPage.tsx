import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDataClient } from '@/contexts/DataClientContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, CheckCircle } from 'lucide-react';
import type { PortfolioItem } from '@/types';

export default function PortfolioDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dataClient = useDataClient();
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    dataClient.getPortfolioBySlug(slug).then((data) => {
      setItem(data);
      setIsLoading(false);
    });
  }, [dataClient, slug]);

  if (isLoading) {
    return (
      <div className="container-page flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container-page text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Project Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The project you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/portfolio')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Portfolio
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page">
      {/* Back Button */}
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link to="/portfolio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Link>
        </Button>
      </div>

      <article className="max-w-4xl mx-auto animate-slide-up">
        {/* Cover Image */}
        {item.coverImageUrl && (
          <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-8">
            <img
              src={item.coverImageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-primary mb-4">{item.title}</h1>
          <p className="text-xl text-muted-foreground">{item.summary}</p>

          {/* Tags & Tech Stack */}
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {item.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-sm bg-accent/10 text-accent rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Problem */}
          {item.problem && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">The Problem</h2>
              <p className="text-muted-foreground leading-relaxed">{item.problem}</p>
            </section>
          )}

          {/* Solution */}
          {item.solution && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">The Solution</h2>
              <p className="text-muted-foreground leading-relaxed">{item.solution}</p>
            </section>
          )}

          {/* Impact */}
          {item.impact.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Impact & Results</h2>
              <ul className="space-y-3">
                {item.impact.map((result, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{result}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Links */}
          {item.links.length > 0 && (
            <section className="pt-8 border-t">
              <h2 className="text-2xl font-semibold mb-4">Project Links</h2>
              <div className="flex flex-wrap gap-4">
                {item.links.map((link) => (
                  <Button key={link.label} variant="outline" asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </div>
  );
}
