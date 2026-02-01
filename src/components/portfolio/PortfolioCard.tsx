import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import type { PortfolioItem } from '@/types';

interface PortfolioCardProps {
  item: PortfolioItem;
}

export function PortfolioCard({ item }: PortfolioCardProps) {
  return (
    <Link to={`/portfolio/${item.slug}`} className="group block">
      <Card className="overflow-hidden h-full card-hover">
        {item.coverImageUrl && (
          <div className="aspect-video overflow-hidden bg-muted">
            <img
              src={item.coverImageUrl}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="flex items-center justify-between group-hover:text-accent transition-colors">
            {item.title}
            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
          </CardTitle>
          <CardDescription>{item.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-1">
              {item.techStack.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded"
                >
                  {tech}
                </span>
              ))}
              {item.techStack.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{item.techStack.length - 4} more
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
