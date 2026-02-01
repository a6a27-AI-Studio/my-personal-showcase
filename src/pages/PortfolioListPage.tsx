import { useState, useEffect, useMemo } from 'react';
import { useDataClient } from '@/contexts/DataClientContext';
import { PortfolioCard } from '@/components/portfolio/PortfolioCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import type { PortfolioItem } from '@/types';

export default function PortfolioListPage() {
  const dataClient = useDataClient();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  useEffect(() => {
    dataClient.listPortfolio().then((data) => {
      setPortfolio(data);
      setIsLoading(false);
    });
  }, [dataClient]);

  const allTags = useMemo(
    () => Array.from(new Set(portfolio.flatMap((p) => p.tags))),
    [portfolio]
  );

  const allTech = useMemo(
    () => Array.from(new Set(portfolio.flatMap((p) => p.techStack))),
    [portfolio]
  );

  const filteredPortfolio = useMemo(() => {
    let items = portfolio;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.summary.toLowerCase().includes(query)
      );
    }

    if (selectedTag) {
      items = items.filter((p) => p.tags.includes(selectedTag));
    }

    if (selectedTech) {
      items = items.filter((p) => p.techStack.includes(selectedTech));
    }

    return items;
  }, [portfolio, searchQuery, selectedTag, selectedTech]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag(null);
    setSelectedTech(null);
  };

  const hasActiveFilters = searchQuery || selectedTag || selectedTech;

  if (isLoading) {
    return (
      <div className="container-page flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">載入中...</div>
      </div>
    );
  }

  return (
    <div className="container-page">
      <div className="section-header">
        <h1 className="text-primary mb-4">作品集</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          展示我最近的專案與解決的問題
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋專案..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tag Filter */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">依標籤篩選：</p>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Tech Filter */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">依技術篩選：</p>
          <div className="flex flex-wrap gap-2">
            {allTech.map((tech) => (
              <Button
                key={tech}
                variant={selectedTech === tech ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTech(selectedTech === tech ? null : tech)}
              >
                {tech}
              </Button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="mr-2 h-4 w-4" />
            清除篩選
          </Button>
        )}
      </div>

      {/* Portfolio Grid */}
      {filteredPortfolio.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolio.map((item, index) => (
            <div
              key={item.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PortfolioCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {hasActiveFilters
            ? '沒有符合的專案'
            : '尚無作品'}
        </div>
      )}
    </div>
  );
}
