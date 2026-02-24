import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDataClient } from '@/contexts/DataClientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Edit, Trash2, ArrowUp, ArrowDown, Save, Eye, EyeOff, X } from 'lucide-react';
import type { PortfolioItem } from '@/types';

const INITIAL_FORM: Omit<PortfolioItem, 'id' | 'updatedAt' | 'createdAt'> = {
  slug: '',
  title: '',
  summary: '',
  coverImageUrl: '',
  problem: '',
  solution: '',
  impact: [],
  tags: [],
  techStack: [],
  links: [],
  status: 'draft',
  sortOrder: 0,
};

export default function PortfolioManager() {
  const dataClient = useDataClient();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [tagsInput, setTagsInput] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [impactInput, setImpactInput] = useState('');
  const [linksInput, setLinksInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const loadPortfolio = async () => {
    setPageError(null);
    try {
      const data = await dataClient.listPortfolio({ includeAll: true });
      setPortfolio(data);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      setPageError('作品資料載入失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({ ...INITIAL_FORM, sortOrder: portfolio.length + 1 });
    setTagsInput('');
    setTechStackInput('');
    setImpactInput('');
    setLinksInput('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      slug: item.slug,
      title: item.title,
      summary: item.summary,
      coverImageUrl: item.coverImageUrl,
      problem: item.problem,
      solution: item.solution,
      impact: item.impact,
      tags: item.tags,
      techStack: item.techStack,
      links: item.links,
      status: item.status,
      sortOrder: item.sortOrder,
    });
    setTagsInput(item.tags.join(', '));
    setTechStackInput(item.techStack.join(', '));
    setImpactInput(item.impact.join('\n'));
    setLinksInput(item.links.map((l) => `${l.label}: ${l.url}`).join('\n'));
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        techStack: techStackInput.split(',').map((t) => t.trim()).filter(Boolean),
        impact: impactInput.split('\n').map((i) => i.trim()).filter(Boolean),
        links: linksInput.split('\n').map((line) => {
          const [label, ...urlParts] = line.split(':');
          return { label: label?.trim() || '', url: urlParts.join(':').trim() };
        }).filter((l) => l.label && l.url),
      };

      if (editingItem) {
        const updated = await dataClient.updatePortfolio(editingItem.id, payload);
        setPortfolio(portfolio.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await dataClient.createPortfolio(payload);
        setPortfolio([...portfolio, created]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save portfolio:', error);
      alert(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await dataClient.deletePortfolio(id);
    setPortfolio(portfolio.filter((p) => p.id !== id));
  };

  const toggleStatus = async (item: PortfolioItem) => {
    try {
      const newStatus = item.status === 'published' ? 'draft' : 'published';
      const updated = await dataClient.updatePortfolio(item.id, { status: newStatus });
      setPortfolio(portfolio.map((p) => (p.id === updated.id ? updated : p)));
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const moveItem = async (item: PortfolioItem, direction: 'up' | 'down') => {
    const sortedItems = [...portfolio].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sortedItems.findIndex((p) => p.id === item.id);
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= sortedItems.length) return;

    const otherItem = sortedItems[newIndex];
    const tempOrder = item.sortOrder;

    await dataClient.updatePortfolio(item.id, { sortOrder: otherItem.sortOrder });
    await dataClient.updatePortfolio(otherItem.id, { sortOrder: tempOrder });

    loadPortfolio();
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary">Manage Portfolio</h1>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      {pageError && (
        <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {pageError}
        </div>
      )}

      <div className="space-y-4">
        {portfolio.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {item.coverImageUrl && (
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <Badge
                        variant={item.status === 'published' ? 'default' : 'secondary'}
                        className={item.status === 'published' ? 'badge-status-published' : 'badge-status-draft'}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <CardDescription>{item.summary}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleStatus(item)}
                    title={item.status === 'published' ? 'Unpublish' : 'Publish'}
                  >
                    {item.status === 'published' ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => moveItem(item, 'up')}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => moveItem(item, 'down')}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                {item.techStack.map((tech) => (
                  <span key={tech} className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {portfolio.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No portfolio items yet. Click "Add Project" to create one.
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Project' : 'Add Project'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Project title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="project-slug"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Summary</label>
              <Input
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief summary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Image URL</label>
              <Input
                value={formData.coverImageUrl || ''}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Problem</label>
              <Textarea
                value={formData.problem || ''}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Solution</label>
              <Textarea
                value={formData.solution || ''}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Impact (one per line)</label>
              <Textarea
                value={impactInput}
                onChange={(e) => setImpactInput(e.target.value)}
                placeholder="50% increase in...&#10;99% uptime..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e-commerce, saas"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tech Stack (comma-separated)</label>
                <Input
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="React, Node.js"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Links (format: Label: URL, one per line)</label>
              <Textarea
                value={linksInput}
                onChange={(e) => setLinksInput(e.target.value)}
                placeholder="Live Demo: https://...&#10;GitHub: https://..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.status === 'published'}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked ? 'published' : 'draft' })
                }
              />
              <label className="text-sm font-medium">Published</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.title || !formData.slug}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
