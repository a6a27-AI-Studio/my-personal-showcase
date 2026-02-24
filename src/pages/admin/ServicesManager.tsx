import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDataClient } from '@/contexts/DataClientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, ArrowUp, ArrowDown, Save, X } from 'lucide-react';
import type { Service } from '@/types';

const INITIAL_FORM: Omit<Service, 'id' | 'updatedAt'> = {
  name: '',
  summary: '',
  description: '',
  deliverables: [],
  process: [],
  icon: '',
  relatedPortfolioIds: [],
  sortOrder: 0,
};

export default function ServicesManager() {
  const dataClient = useDataClient();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [deliverablesInput, setDeliverablesInput] = useState('');
  const [processInput, setProcessInput] = useState('');
  const [portfolioIdsInput, setPortfolioIdsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const loadServices = async () => {
    setPageError(null);
    try {
      const data = await dataClient.listServices();
      setServices(data);
    } catch (error) {
      console.error('Failed to load services:', error);
      setPageError('服務資料載入失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [dataClient]);

  const openCreateDialog = () => {
    setEditingService(null);
    setFormData({ ...INITIAL_FORM, sortOrder: services.length + 1 });
    setDeliverablesInput('');
    setProcessInput('');
    setPortfolioIdsInput('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      summary: service.summary,
      description: service.description,
      deliverables: service.deliverables,
      process: service.process,
      icon: service.icon,
      relatedPortfolioIds: service.relatedPortfolioIds,
      sortOrder: service.sortOrder,
    });
    setDeliverablesInput(service.deliverables.join('\n'));
    setProcessInput(service.process.join('\n'));
    setPortfolioIdsInput(service.relatedPortfolioIds.join(', '));
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        deliverables: deliverablesInput.split('\n').map((d) => d.trim()).filter(Boolean),
        process: processInput.split('\n').map((p) => p.trim()).filter(Boolean),
        relatedPortfolioIds: portfolioIdsInput.split(',').map((id) => id.trim()).filter(Boolean),
      };

      if (editingService) {
        const updated = await dataClient.updateService(editingService.id, payload);
        setServices(services.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        const created = await dataClient.createService(payload);
        setServices([...services, created]);
      }
      setIsDialogOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await dataClient.deleteService(id);
    setServices(services.filter((s) => s.id !== id));
  };

  const moveService = async (service: Service, direction: 'up' | 'down') => {
    const sortedServices = [...services].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sortedServices.findIndex((s) => s.id === service.id);
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= sortedServices.length) return;

    const otherService = sortedServices[newIndex];
    const tempOrder = service.sortOrder;

    await dataClient.updateService(service.id, { sortOrder: otherService.sortOrder });
    await dataClient.updateService(otherService.id, { sortOrder: tempOrder });

    loadServices();
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
          <h1 className="text-3xl font-bold text-primary">Manage Services</h1>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      {pageError && (
        <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {pageError}
        </div>
      )}

      <div className="space-y-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>{service.summary}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => moveService(service, 'up')}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => moveService(service, 'down')}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(service)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Deliverables:</p>
                  <ul className="text-muted-foreground">
                    {service.deliverables.map((d, i) => (
                      <li key={i}>• {d}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">Process:</p>
                  <ol className="text-muted-foreground">
                    {service.process.map((p, i) => (
                      <li key={i}>{i + 1}. {p}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No services yet. Click "Add Service" to create one.
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Service name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <Input
                  value={formData.icon || ''}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="code, lightbulb, palette"
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
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Full description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Deliverables (one per line)</label>
              <Textarea
                value={deliverablesInput}
                onChange={(e) => setDeliverablesInput(e.target.value)}
                placeholder="First deliverable&#10;Second deliverable"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Process (one step per line)</label>
              <Textarea
                value={processInput}
                onChange={(e) => setProcessInput(e.target.value)}
                placeholder="Step 1&#10;Step 2"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Related Portfolio IDs (comma-separated)</label>
              <Input
                value={portfolioIdsInput}
                onChange={(e) => setPortfolioIdsInput(e.target.value)}
                placeholder="portfolio-1, portfolio-2"
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
