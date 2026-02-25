import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDataClient } from '@/contexts/DataClientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';
import type { ResumeExportSettings } from '@/types';

export default function ResumeExportSettingsPage() {
  const dataClient = useDataClient();
  const [settings, setSettings] = useState<ResumeExportSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    dataClient
      .getResumeExportSettings()
      .then(setSettings)
      .finally(() => setIsLoading(false));
  }, [dataClient]);

  const handleSave = async () => {
    if (!settings) return;
    setStatus('儲存中...');
    const updated = await dataClient.updateResumeExportSettings(settings);
    setSettings(updated);
    setStatus('已儲存');
  };

  if (isLoading || !settings) {
    return (
      <div className="container-page flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" asChild>
          <Link to="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-primary">Resume Export Settings</h1>
      </div>

      <div className="space-y-4 rounded-lg border p-5 bg-card">
        <h2 className="font-semibold">區塊顯示設定</h2>
        {[
          ['showHeader', 'Header'],
          ['showSummary', 'Summary'],
          ['showExperiences', 'Experiences'],
          ['showSkills', 'Skills'],
          ['showProjects', 'Projects'],
          ['showContact', 'Contact'],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(settings[key as keyof ResumeExportSettings])}
              onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>

      <div className="space-y-4 rounded-lg border p-5 bg-card mt-5">
        <h2 className="font-semibold">隱私與聯絡資訊</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showEmail}
            onChange={(e) => setSettings({ ...settings, showEmail: e.target.checked })}
          />
          顯示 Email
        </label>
        <Input
          placeholder="Email"
          value={settings.contactEmail || ''}
          onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showPhone}
            onChange={(e) => setSettings({ ...settings, showPhone: e.target.checked })}
          />
          顯示電話
        </label>
        <Input
          placeholder="Phone"
          value={settings.contactPhone || ''}
          onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          儲存設定
        </Button>
        {status && <span className="text-sm text-muted-foreground">{status}</span>}
      </div>
    </div>
  );
}
