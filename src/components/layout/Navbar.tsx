import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDataClient } from '@/contexts/DataClientContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Menu, X, Download, User, LogOut, Shield, UserCircle } from 'lucide-react';
import type { ResumeMeta, UserRole } from '@/types';

const NAV_LINKS = [
  { label: '關於我', href: '/about' },
  { label: '技能', href: '/skills' },
  { label: '服務', href: '/services' },
  { label: '作品集', href: '/portfolio' },
  { label: '聯絡我', href: '/contact' },
];

export function Navbar() {
  const location = useLocation();
  const { user, login, logout, isAdmin, isAuthenticated } = useAuth();
  const dataClient = useDataClient();
  const [resume, setResume] = useState<ResumeMeta | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    dataClient.getResume().then(setResume);
  }, [dataClient]);

  const handleRoleSwitch = (role: UserRole) => {
    login(role);
  };

  const roleIcons = {
    guest: <User className="h-4 w-4" />,
    user: <UserCircle className="h-4 w-4" />,
    admin: <Shield className="h-4 w-4" />,
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">個人官網</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors link-underline ${location.pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
                }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={`text-sm font-medium transition-colors ${location.pathname.startsWith('/admin')
                  ? 'text-accent'
                  : 'text-muted-foreground hover:text-accent'
                }`}
            >
              管理後台
            </Link>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Resume Download */}
          <Button
            variant="outline"
            size="sm"
            disabled={!resume?.pdfUrl}
            asChild={!!resume?.pdfUrl}
            className="hidden sm:inline-flex"
          >
            {resume?.pdfUrl ? (
              <a href={resume.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                下載履歷
              </a>
            ) : (
              <span>
                <Download className="mr-2 h-4 w-4" />
                下載履歷
              </span>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                {roleIcons[user?.role || 'guest']}
                <span className="hidden sm:inline">{user?.name || 'Guest'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                切換角色
              </div>
              <DropdownMenuItem onClick={() => handleRoleSwitch('guest')}>
                <User className="mr-2 h-4 w-4" />
                訪客
                {user?.role === 'guest' && <span className="ml-auto text-accent">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleSwitch('user')}>
                <UserCircle className="mr-2 h-4 w-4" />
                使用者
                {user?.role === 'user' && <span className="ml-auto text-accent">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleSwitch('admin')}>
                <Shield className="mr-2 h-4 w-4" />
                管理員
                {user?.role === 'admin' && <span className="ml-auto text-accent">✓</span>}
              </DropdownMenuItem>
              {isAuthenticated && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    登出
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === link.href
                    ? 'bg-secondary text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-primary'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname.startsWith('/admin')
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:bg-secondary'
                  }`}
              >
                管理後台
              </Link>
            )}
            {resume?.pdfUrl && (
              <a
                href={resume.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 rounded-md text-sm font-medium text-accent hover:bg-secondary"
              >
                <Download className="inline-block mr-2 h-4 w-4" />
                下載履歷
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
