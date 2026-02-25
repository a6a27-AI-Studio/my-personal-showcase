import type { DataClient } from '@/api/dataClient';
import type { About, Experience, PortfolioItem, ResumeExportSettings, Service, Skill } from '@/types';

export interface ResumeExportCore {
  about: About;
  experiences: Experience[];
  skills: Skill[];
  portfolio: PortfolioItem[];
  services: Service[];
  generatedAt: string;
}

export interface ResumeExportSections {
  header: boolean;
  summary: boolean;
  experiences: boolean;
  skills: boolean;
  projects: boolean;
  contact: boolean;
}

export interface ResumeExportProfile {
  fullName: string;
  title: string;
  contactEmail?: string;
  contactPhone?: string;
  location?: string;
}

export interface ResumeExportData {
  profile: ResumeExportProfile;
  sections: ResumeExportSections;
  settings: ResumeExportSettings;
  core: ResumeExportCore;
}

export async function buildResumeExportData(dataClient: DataClient): Promise<ResumeExportData> {
  const [about, experiences, skills, portfolio, services, settings] = await Promise.all([
    dataClient.getAbout(),
    dataClient.listExperiences(),
    dataClient.listSkills(),
    dataClient.listPortfolio(),
    dataClient.listServices(),
    dataClient.getResumeExportSettings(),
  ]);

  const profile: ResumeExportProfile = {
    fullName: about.subheadline?.split('·')[0]?.trim() || about.headline,
    title: about.headline,
    location: about.subheadline?.split('·')[1]?.trim(),
  };

  return {
    profile: {
      ...profile,
      contactEmail: settings.contactEmail || undefined,
      contactPhone: settings.contactPhone || undefined,
    },
    sections: {
      header: settings.showHeader,
      summary: settings.showSummary,
      experiences: settings.showExperiences,
      skills: settings.showSkills,
      projects: settings.showProjects,
      contact: settings.showContact,
    },
    settings,
    core: {
      about,
      experiences,
      skills,
      portfolio,
      services,
      generatedAt: new Date().toISOString(),
    },
  };
}
