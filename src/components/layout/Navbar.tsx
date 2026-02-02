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
import type { ResumeMeta } from '@/types';

const NAV_LINKS = [
  { label: '關於我', href: '/about' },
  { label: '技能', href: '/skills' },
  { label: '服務', href: '/services' },
  { label: '作品集', href: '/portfolio' },
  { label: '聯絡我', href: '/contact' },
];

export function Navbar() {
  const location = useLocation();
  const { user, signInWithGoogle, signOut, isAdmin } = useAuth();
  const dataClient = useDataClient();
  const [resume, setResume] = useState<ResumeMeta | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    dataClient.getResume().then(setResume);
  }, [dataClient]);

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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.email?.split('@')[0] || 'User'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user.email}</div>
                  {isAdmin && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      管理員
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        管理後台
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  登出
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => signInWithGoogle()}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">登入</span>
            </Button>
          )}

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
