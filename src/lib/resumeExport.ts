import type { DataClient } from '@/api/dataClient';
import type { About, Experience, PortfolioItem, ResumeMeta, Service, Skill } from '@/types';

export interface ResumeExportCore {
  about: About;
  experiences: Experience[];
  skills: Skill[];
  portfolio: PortfolioItem[];
  services: Service[];
  resumeMeta: ResumeMeta;
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
  core: ResumeExportCore;
}

export async function buildResumeExportData(dataClient: DataClient): Promise<ResumeExportData> {
  const [about, experiences, skills, portfolio, services, resumeMeta] = await Promise.all([
    dataClient.getAbout(),
    dataClient.listExperiences(),
    dataClient.listSkills(),
    dataClient.listPortfolio(),
    dataClient.listServices(),
    dataClient.getResume(),
  ]);

  // Current source data does not include a dedicated profile table for name/contact.
  // Use headline/subheadline as fallback identity until admin export settings are introduced.
  const profile: ResumeExportProfile = {
    fullName: about.subheadline?.split('·')[0]?.trim() || about.headline,
    title: about.headline,
    location: about.subheadline?.split('·')[1]?.trim(),
  };

  return {
    profile,
    sections: {
      header: true,
      summary: true,
      experiences: true,
      skills: true,
      projects: true,
      contact: true,
    },
    core: {
      about,
      experiences,
      skills,
      portfolio,
      services,
      resumeMeta,
      generatedAt: new Date().toISOString(),
    },
  };
}
