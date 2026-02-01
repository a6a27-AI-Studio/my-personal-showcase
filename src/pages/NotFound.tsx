import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">找不到頁面</h2>
        <p className="text-muted-foreground mb-6">此頁面不存在</p>
        <Button asChild>
          <Link to="/">返回首頁</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
