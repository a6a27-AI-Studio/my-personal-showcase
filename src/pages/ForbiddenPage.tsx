import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  return (
    <div className="container-page flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="animate-slide-up">
        <ShieldX className="h-24 w-24 text-destructive/50 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-primary mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          You don't have permission to access this page. Please log in as an admin to continue.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link to="/">Go Home</Link>
          </Button>
          <Button asChild>
            <Link to="/about">View Portfolio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
