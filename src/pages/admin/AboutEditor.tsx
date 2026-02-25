import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDataClient } from '@/contexts/DataClientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import type { About } from '@/types';

export default function AboutEditor() {
  const dataClient = useDataClient();
  const [about, setAbout] = useState<About | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    dataClient.getAbout().then((data) => {
      setAbout(data);
      setIsLoading(false);
    });
  }, [dataClient]);

  const handleSave = async () => {
    if (!about) return;
    setIsSaving(true);
    setSaved(false);
    try {
      const updated = await dataClient.upsertAbout(about);
      setAbout(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = <K extends keyof About>(field: K, value: About[K]) => {
    if (!about) return;
    setAbout({ ...about, [field]: value });
  };

  const addHighlight = () => {
    if (!about) return;
    setAbout({ ...about, highlights: [...about.highlights, ''] });
  };

  const updateHighlight = (index: number, value: string) => {
    if (!about) return;
    const highlights = [...about.highlights];
    highlights[index] = value;
    setAbout({ ...about, highlights });
  };

  const removeHighlight = (index: number) => {
    if (!about) return;
    setAbout({ ...about, highlights: about.highlights.filter((_, i) => i !== index) });
  };

  const addLink = () => {
    if (!about) return;
    setAbout({ ...about, links: [...about.links, { label: '', url: '' }] });
  };

  const updateLink = (index: number, field: 'label' | 'url' | 'icon', value: string) => {
    if (!about) return;
    const links = [...about.links];
    links[index] = { ...links[index], [field]: value };
    setAbout({ ...about, links });
  };

  const removeLink = (index: number) => {
    if (!about) return;
    setAbout({ ...about, links: about.links.filter((_, i) => i !== index) });
  };

  if (isLoading) {
    return (
      <div className="container-page flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!about) return null;

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
          <h1 className="text-3xl font-bold text-primary">Edit About</h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Headline</label>
              <Input
                value={about.headline}
                onChange={(e) => updateField('headline', e.target.value)}
                placeholder="Your main headline"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subheadline</label>
              <Input
                value={about.subheadline}
                onChange={(e) => updateField('subheadline', e.target.value)}
                placeholder="A brief description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                value={about.bio || ''}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="Your full bio"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar URL</label>
              <Input
                value={about.avatarUrl || ''}
                onChange={(e) => updateField('avatarUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Highlights</CardTitle>
            <Button variant="outline" size="sm" onClick={addHighlight}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {about.highlights.map((highlight, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={highlight}
                  onChange={(e) => updateHighlight(index, e.target.value)}
                  placeholder="Achievement or highlight"
                />
                <Button variant="ghost" size="icon" onClick={() => removeHighlight(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {about.highlights.length === 0 && (
              <p className="text-sm text-muted-foreground">No highlights added yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Links</CardTitle>
            <Button variant="outline" size="sm" onClick={addLink}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {about.links.map((link, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <Input
                    value={link.label}
                    onChange={(e) => updateLink(index, 'label', e.target.value)}
                    placeholder="Label"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                    placeholder="URL"
                  />
                  <Input
                    value={link.icon || ''}
                    onChange={(e) => updateLink(index, 'icon', e.target.value)}
                    placeholder="Icon (optional)"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeLink(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {about.links.length === 0 && (
              <p className="text-sm text-muted-foreground">No links added yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
