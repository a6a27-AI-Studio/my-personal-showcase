import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  return (
    <div className="container-page flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="animate-slide-up">
        <ShieldX className="h-24 w-24 text-destructive/50 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-destructive mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-2">禁止訪問</h2>
        <p className="text-muted-foreground mb-6">
          您沒有權限訪問此頁面。此區域僅限管理員訪問
        </p>
        <Button asChild>
          <Link to="/">返回首頁</ Link>
        </Button>
      </div>
    </div>
  );
}
