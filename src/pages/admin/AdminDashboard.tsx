import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Wrench, Briefcase, FolderKanban, FileText, Clock3 } from 'lucide-react';

const ADMIN_SECTIONS = [
  {
    title: 'About',
    description: 'Edit your headline, bio, and personal information',
    href: '/admin/about',
    icon: User,
  },
  {
    title: 'Skills',
    description: 'Manage your technical skills and expertise levels',
    href: '/admin/skills',
    icon: Wrench,
  },
  {
    title: 'Services',
    description: 'Configure the services you offer to clients',
    href: '/admin/services',
    icon: Briefcase,
  },
  {
    title: 'Experiences',
    description: 'Manage your work experiences and timeline',
    href: '/admin/experiences',
    icon: Clock3,
  },
  {
    title: 'Portfolio',
    description: 'Add, edit, and manage your portfolio projects',
    href: '/admin/portfolio',
    icon: FolderKanban,
  },
  {
    title: 'Resume',
    description: 'Update your resume PDF and version info',
    href: '/admin/resume',
    icon: FileText,
  },
];

export default function AdminDashboard() {
  return (
    <div className="container-page">
      <div className="section-header">
        <h1 className="text-primary mb-4">Admin Dashboard</h1>
        <p className="text-xl text-muted-foreground">
          Manage your portfolio content and settings.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADMIN_SECTIONS.map((section, index) => (
          <Link
            key={section.href}
            to={section.href}
            className="group animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Card className="h-full card-hover">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <section.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="group-hover:text-accent transition-colors">
                      {section.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{section.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
