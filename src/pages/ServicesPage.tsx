import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDataClient } from '@/contexts/DataClientContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Code, Lightbulb, Palette, CheckCircle } from 'lucide-react';
import type { Service, PortfolioItem } from '@/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code,
  lightbulb: Lightbulb,
  palette: Palette,
};

export default function ServicesPage() {
  const dataClient = useDataClient();
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([dataClient.listServices(), dataClient.listPortfolio()])
      .then(([servicesData, portfolioData]) => {
        setServices(servicesData);
        setPortfolio(portfolioData);
      })
      .finally(() => setIsLoading(false));
  }, [dataClient]);

  const getRelatedPortfolio = (relatedIds: string[]) => {
    return portfolio.filter((p) => relatedIds.includes(p.id));
  };

  if (isLoading) {
    return (
      <div className="container-page flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container-page">
      <div className="section-header">
        <h1 className="text-primary mb-4">Services</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Professional services tailored to help you build and grow your digital presence.
        </p>
      </div>

      <div className="grid gap-8">
        {services.map((service, index) => {
          const IconComponent = iconMap[service.icon || ''] || Code;
          const relatedProjects = getRelatedPortfolio(service.relatedPortfolioIds);

          return (
            <Card
              key={service.id}
              className="overflow-hidden animate-slide-up card-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <IconComponent className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{service.name}</CardTitle>
                    <CardDescription className="text-base">{service.summary}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {service.description && (
                  <p className="text-muted-foreground">{service.description}</p>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Deliverables */}
                  <div>
                    <h4 className="font-semibold mb-3">Deliverables</h4>
                    <ul className="space-y-2">
                      {service.deliverables.map((deliverable, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                          {deliverable}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Process */}
                  <div>
                    <h4 className="font-semibold mb-3">Process</h4>
                    <ol className="space-y-2">
                      {service.process.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-xs font-medium shrink-0">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Related Projects */}
                {relatedProjects.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Related Projects</h4>
                    <div className="flex flex-wrap gap-2">
                      {relatedProjects.map((project) => (
                        <Link
                          key={project.id}
                          to={`/portfolio/${project.slug}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
                        >
                          {project.title}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No services available at the moment.
        </div>
      )}
    </div>
  );
}
