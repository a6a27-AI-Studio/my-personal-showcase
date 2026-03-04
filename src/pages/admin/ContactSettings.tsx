import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDataClient } from '@/contexts/DataClientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import type { ContactSettings, Link as LinkType } from '@/types';

function linksToText(links: LinkType[]): string {
  return (links || [])
    .map((l) => `${l.label}: ${l.url}`)
    .join('\n');
}

function textToLinks(text: string): LinkType[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(':');
      return {
        label: (label || '').trim(),
        url: rest.join(':').trim(),
      };
    })
    .filter((l) => l.label && l.url);
}

export default function ContactSettingsPage() {
  const dataClient = useDataClient();
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [socialLinksText, setSocialLinksText] = useState('');

  const socialLinksParsed = useMemo(() => textToLinks(socialLinksText), [socialLinksText]);

  useEffect(() => {
    dataClient
      .getContactSettings()
      .then((s) => {
        setSettings(s);
        setSocialLinksText(linksToText(s.socialLinks || []));
      })
      .finally(() => setIsLoading(false));
  }, [dataClient]);

  const handleSave = async () => {
    if (!settings) return;

    setStatus('儲存中...');
    const updated = await dataClient.updateContactSettings({
      ...settings,
      socialLinks: socialLinksParsed,
    });

    setSettings(updated);
    setSocialLinksText(linksToText(updated.socialLinks || []));
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
        <h1 className="text-3xl font-bold text-primary">Contact Settings</h1>
      </div>

      <div className="space-y-4 rounded-lg border p-5 bg-card">
        <div className="space-y-2">
          <label className="text-sm font-medium">標題</label>
          <Input
            placeholder="取得聯繫"
            value={settings.contactTitle}
            onChange={(e) => setSettings({ ...settings, contactTitle: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">描述</label>
          <Textarea
            rows={3}
            placeholder="我隨時歡迎討論..."
            value={settings.contactDescription}
            onChange={(e) => setSettings({ ...settings, contactDescription: e.target.value })}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              placeholder="hello@example.com"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">電話</label>
            <Input
              placeholder="+886 ..."
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">地點</label>
          <Input
            placeholder="Taipei, TW"
            value={settings.location}
            onChange={(e) => setSettings({ ...settings, location: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">社群連結（每行一個：Label: URL）</label>
          <Textarea
            rows={5}
            value={socialLinksText}
            onChange={(e) => setSocialLinksText(e.target.value)}
            placeholder={`GitHub: https://github.com/yourname\nLinkedIn: https://linkedin.com/in/yourname`}
          />
          <p className="text-xs text-muted-foreground">
            會存成 JSON 陣列（label/url）。
          </p>
        </div>
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
