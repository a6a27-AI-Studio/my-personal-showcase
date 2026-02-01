import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDataClient } from '@/contexts/DataClientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, FileText, ExternalLink } from 'lucide-react';
import type { ResumeMeta } from '@/types';

export default function ResumeManager() {
  const dataClient = useDataClient();
  const [resume, setResume] = useState<ResumeMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    dataClient.getResume().then((data) => {
      setResume(data);
      setIsLoading(false);
    });
  }, [dataClient]);

  const handleSave = async () => {
    if (!resume) return;
    setIsSaving(true);
    setSaved(false);
    try {
      const updated = await dataClient.updateResumeMeta({
        version: resume.version,
        pdfUrl: resume.pdfUrl,
      });
      setResume(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-page flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!resume) return null;

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
          <h1 className="text-3xl font-bold text-primary">Manage Resume</h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      <div className="max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume PDF
            </CardTitle>
            <CardDescription>
              Configure your downloadable resume. The PDF URL will be used in the navbar's "Download Resume" button.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Version</label>
              <Input
                value={resume.version}
                onChange={(e) => setResume({ ...resume, version: e.target.value })}
                placeholder="e.g., 2024.01"
              />
              <p className="text-xs text-muted-foreground">
                A version identifier for tracking updates (e.g., "2024.01" or "v3")
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">PDF URL</label>
              <Input
                value={resume.pdfUrl || ''}
                onChange={(e) => setResume({ ...resume, pdfUrl: e.target.value || null })}
                placeholder="https://example.com/resume.pdf"
              />
              <p className="text-xs text-muted-foreground">
                Direct link to your resume PDF file. Leave empty to disable the download button.
              </p>
            </div>
            {resume.pdfUrl && (
              <div className="pt-4 border-t">
                <Button variant="outline" asChild>
                  <a href={resume.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Preview PDF
                  </a>
                </Button>
              </div>
            )}
            <div className="pt-4 border-t text-sm text-muted-foreground">
              <p>Last updated: {new Date(resume.updatedAt).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
