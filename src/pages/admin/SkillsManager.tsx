import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDataClient } from '@/contexts/DataClientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, ArrowUp, ArrowDown, Save, X } from 'lucide-react';
import type { Skill } from '@/types';

const CATEGORIES: { value: Skill['category']; label: string }[] = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'database', label: 'Database' },
  { value: 'devops', label: 'DevOps' },
  { value: 'tools', label: 'Tools' },
  { value: 'other', label: 'Other' },
];

const INITIAL_FORM: Omit<Skill, 'id' | 'updatedAt'> = {
  name: '',
  category: 'frontend',
  level: 3,
  tags: [],
  sortOrder: 0,
};

export default function SkillsManager() {
  const dataClient = useDataClient();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const loadSkills = async () => {
    setPageError(null);
    try {
      const data = await dataClient.listSkills();
      setSkills(data);
    } catch (error) {
      console.error('Failed to load skills:', error);
      setPageError('技能資料載入失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, [dataClient]);

  const openCreateDialog = () => {
    setEditingSkill(null);
    setFormData({ ...INITIAL_FORM, sortOrder: skills.length + 1 });
    setTagInput('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      tags: skill.tags,
      sortOrder: skill.sortOrder,
    });
    setTagInput(skill.tags.join(', '));
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean);
      const payload = { ...formData, tags };

      if (editingSkill) {
        const updated = await dataClient.updateSkill(editingSkill.id, payload);
        setSkills(skills.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        const created = await dataClient.createSkill(payload);
        setSkills([...skills, created]);
      }
      setIsDialogOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await dataClient.deleteSkill(id);
    setSkills(skills.filter((s) => s.id !== id));
  };

  const moveSkill = async (skill: Skill, direction: 'up' | 'down') => {
    const sortedSkills = [...skills].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sortedSkills.findIndex((s) => s.id === skill.id);
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= sortedSkills.length) return;

    const otherSkill = sortedSkills[newIndex];
    const tempOrder = skill.sortOrder;

    await dataClient.updateSkill(skill.id, { sortOrder: otherSkill.sortOrder });
    await dataClient.updateSkill(otherSkill.id, { sortOrder: tempOrder });

    loadSkills();
  };

  const groupedSkills = CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = skills.filter((s) => s.category === cat.value);
    return acc;
  }, {} as Record<Skill['category'], Skill[]>);

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
          <h1 className="text-3xl font-bold text-primary">Manage Skills</h1>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </div>

      {pageError && (
        <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {pageError}
        </div>
      )}

      <div className="space-y-8">
        {CATEGORIES.map((cat) => {
          const catSkills = groupedSkills[cat.value] || [];
          if (catSkills.length === 0) return null;

          return (
            <Card key={cat.value}>
              <CardHeader>
                <CardTitle>{cat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {catSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{skill.name}</span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < skill.level ? 'bg-accent' : 'bg-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {skill.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {skill.tags.map((tag) => (
                              <span key={tag} className="text-xs px-2 py-0.5 bg-background rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => moveSkill(skill, 'up')}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => moveSkill(skill, 'down')}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(skill)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(skill.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSkill ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Skill name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value: Skill['category']) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Level (1-5)</label>
              <Input
                type="number"
                min={1}
                max={5}
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
