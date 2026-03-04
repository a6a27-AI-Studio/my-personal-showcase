import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDataClient } from '@/contexts/DataClientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import type { HomeSettings } from '@/types';

export default function HomeSettingsPage() {
  const dataClient = useDataClient();
  const [settings, setSettings] = useState<HomeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    dataClient
      .getHomeSettings()
      .then(setSettings)
      .finally(() => setIsLoading(false));
  }, [dataClient]);

  const handleSave = async () => {
    if (!settings) return;
    setStatus('儲存中...');
    const updated = await dataClient.updateHomeSettings(settings);
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
        <h1 className="text-3xl font-bold text-primary">Home Settings</h1>
      </div>

      <div className="space-y-6 rounded-lg border p-5 bg-card">
        <div className="space-y-2">
          <label className="text-sm font-medium">Hero 主標</label>
          <Input value={settings.heroTitle} onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Hero 副標</label>
          <Textarea
            rows={2}
            value={settings.heroSubtitle}
            onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold">首頁按鈕文字</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">作品集（/portfolio）</label>
              <Input
                value={settings.ctaPortfolioText}
                onChange={(e) => setSettings({ ...settings, ctaPortfolioText: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">關於我（/about）</label>
              <Input value={settings.ctaAboutText} onChange={(e) => setSettings({ ...settings, ctaAboutText: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">履歷 PDF（/resume/export）</label>
              <Input value={settings.ctaResumeText} onChange={(e) => setSettings({ ...settings, ctaResumeText: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">聯絡我（/contact）</label>
              <Input value={settings.ctaContactText} onChange={(e) => setSettings({ ...settings, ctaContactText: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold">三個區塊卡片</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">技能區塊標題</label>
              <Input value={settings.skillsTitle} onChange={(e) => setSettings({ ...settings, skillsTitle: e.target.value })} />
              <label className="text-sm font-medium">技能區塊描述</label>
              <Textarea
                rows={2}
                value={settings.skillsDescription}
                onChange={(e) => setSettings({ ...settings, skillsDescription: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">服務區塊標題</label>
              <Input value={settings.servicesTitle} onChange={(e) => setSettings({ ...settings, servicesTitle: e.target.value })} />
              <label className="text-sm font-medium">服務區塊描述</label>
              <Textarea
                rows={2}
                value={settings.servicesDescription}
                onChange={(e) => setSettings({ ...settings, servicesDescription: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">作品集區塊標題</label>
              <Input
                value={settings.portfolioTitle}
                onChange={(e) => setSettings({ ...settings, portfolioTitle: e.target.value })}
              />
              <label className="text-sm font-medium">作品集區塊描述</label>
              <Textarea
                rows={2}
                value={settings.portfolioDescription}
                onChange={(e) => setSettings({ ...settings, portfolioDescription: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold">底部 CTA</h2>
          <div className="space-y-2">
            <label className="text-sm font-medium">標題</label>
            <Input value={settings.finalCtaTitle} onChange={(e) => setSettings({ ...settings, finalCtaTitle: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">描述</label>
            <Textarea
              rows={3}
              value={settings.finalCtaDescription}
              onChange={(e) => setSettings({ ...settings, finalCtaDescription: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">按鈕文字</label>
            <Input
              value={settings.finalCtaButtonText}
              onChange={(e) => setSettings({ ...settings, finalCtaButtonText: e.target.value })}
            />
          </div>
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
