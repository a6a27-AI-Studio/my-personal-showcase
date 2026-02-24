import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDataClient } from '@/contexts/DataClientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, ArrowUp, ArrowDown, Save, X } from 'lucide-react';
import type { Experience } from '@/types';

const INITIAL_FORM: Omit<Experience, 'id' | 'updatedAt'> = {
  role: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  summary: '',
  highlights: [],
  techStack: [],
  sortOrder: 0,
};

export default function ExperiencesManager() {
  const dataClient = useDataClient();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Experience | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [highlightsInput, setHighlightsInput] = useState('');
  const [techInput, setTechInput] = useState('');

  const loadExperiences = async () => {
    setPageError(null);
    try {
      const data = await dataClient.listExperiences();
      setExperiences(data);
    } catch (error) {
      console.error('Failed to load experiences:', error);
      setPageError('經歷資料載入失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, [dataClient]);

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({ ...INITIAL_FORM, sortOrder: experiences.length + 1 });
    setHighlightsInput('');
    setTechInput('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: Experience) => {
    setEditingItem(item);
    setFormData({
      role: item.role,
      company: item.company,
      location: item.location || '',
      startDate: item.startDate,
      endDate: item.endDate || '',
      isCurrent: item.isCurrent,
      summary: item.summary,
      highlights: item.highlights,
      techStack: item.techStack,
      sortOrder: item.sortOrder,
    });
    setHighlightsInput(item.highlights.join('\n'));
    setTechInput(item.techStack.join(', '));
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        location: formData.location || undefined,
        endDate: formData.isCurrent ? undefined : formData.endDate || undefined,
        highlights: highlightsInput.split('\n').map((t) => t.trim()).filter(Boolean),
        techStack: techInput.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (editingItem) {
        const updated = await dataClient.updateExperience(editingItem.id, payload);
        setExperiences(experiences.map((e) => (e.id === updated.id ? updated : e)));
      } else {
        const created = await dataClient.createExperience(payload);
        setExperiences([...experiences, created]);
      }
      setIsDialogOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await dataClient.deleteExperience(id);
    setExperiences(experiences.filter((e) => e.id !== id));
  };

  const moveItem = async (item: Experience, direction: 'up' | 'down') => {
    const sorted = [...experiences].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex((s) => s.id === item.id);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sorted.length) return;

    const other = sorted[newIndex];
    await dataClient.updateExperience(item.id, { sortOrder: other.sortOrder });
    await dataClient.updateExperience(other.id, { sortOrder: item.sortOrder });
    loadExperiences();
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
          <h1 className="text-3xl font-bold text-primary">Manage Experiences</h1>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
        </Button>
      </div>

      {pageError && (
        <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {pageError}
        </div>
      )}

      <div className="space-y-3">
        {experiences
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg">{item.role} · {item.company}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {item.startDate} - {item.isCurrent ? '現在' : item.endDate || '未填寫'}
                  {item.location ? ` · ${item.location}` : ''}
                </p>
                <p className="text-sm mb-3">{item.summary}</p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => moveItem(item, 'up')}><ArrowUp className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => moveItem(item, 'down')}><ArrowDown className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">
            <Input placeholder="Role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
            <Input placeholder="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
            <Input placeholder="Location" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Start (YYYY-MM)" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
              <Input placeholder="End (YYYY-MM)" value={formData.endDate || ''} disabled={formData.isCurrent} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formData.isCurrent} onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })} />
              目前仍在職
            </label>
            <Textarea placeholder="Summary" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} />
            <Textarea placeholder="Highlights (one per line)" value={highlightsInput} onChange={(e) => setHighlightsInput(e.target.value)} />
            <Input placeholder="Tech stack (comma separated)" value={techInput} onChange={(e) => setTechInput(e.target.value)} />
            <Input type="number" placeholder="Sort order" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}><X className="mr-2 h-4 w-4" />Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}><Save className="mr-2 h-4 w-4" />{isSaving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
