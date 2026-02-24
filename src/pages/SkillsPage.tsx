import { useState, useEffect } from 'react';
import { useDataClient } from '@/contexts/DataClientContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Skill } from '@/types';

const CATEGORY_LABELS: Record<Skill['category'], string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  devops: 'DevOps',
  tools: 'Tools',
  other: 'Other',
};

const CATEGORY_ORDER: Skill['category'][] = ['frontend', 'backend', 'database', 'devops', 'tools', 'other'];

export default function SkillsPage() {
  const dataClient = useDataClient();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    setPageError(null);
    dataClient.listSkills()
      .then((data) => {
        setSkills(data);
      })
      .catch((error) => {
        console.error('Failed to load skills:', error);
        setPageError('技能資料載入失敗，請稍後再試。');
      })
      .finally(() => setIsLoading(false));
  }, [dataClient]);

  const allTags = Array.from(new Set(skills.flatMap((s) => s.tags)));

  const filteredSkills = selectedTag
    ? skills.filter((s) => s.tags.includes(selectedTag))
    : skills;

  const groupedSkills = CATEGORY_ORDER.reduce((acc, category) => {
    const categorySkills = filteredSkills.filter((s) => s.category === category);
    if (categorySkills.length > 0) {
      acc[category] = categorySkills;
    }
    return acc;
  }, {} as Record<Skill['category'], Skill[]>);

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
        <h1 className="text-primary mb-4">技能</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          我的技術專長與工具熟練度
        </p>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={selectedTag === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTag(null)}
          >
            全部
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      )}

      {/* Skills by Category */}
      <div className="space-y-12">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <section key={category} className="animate-fade-in">
            <h2 className="text-2xl font-semibold mb-6 text-primary">
              {CATEGORY_LABELS[category as Skill['category']]}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorySkills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-4 bg-card rounded-lg border shadow-sm card-hover"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-card-foreground">{skill.name}</h3>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${i < skill.level ? 'bg-accent' : 'bg-muted'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {skill.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          無符合所選篩選條件的技能
        </div>
      )}
    </div>
  );
}
