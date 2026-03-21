import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export function Seo({
  title,
  description,
  path = '/',
  image = '/og-default.svg',
  type = 'website',
  noIndex = false,
  structuredData,
}: SeoProps) {
  useEffect(() => {
    const siteName = 'a6a27 個人作品集';
    const baseUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const absoluteUrl = `${baseUrl}${normalizedPath}`;
    const absoluteImage = image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? image : `/${image}`}`;

    document.title = title;

    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', type);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', absoluteUrl);
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', siteName);
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', absoluteImage);
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', absoluteImage);
    upsertMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow');
    upsertLink('canonical', absoluteUrl);

    const scriptId = 'seo-structured-data';
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    if (structuredData) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      const script = document.getElementById(scriptId);
      if (script) script.remove();
    };
  }, [title, description, path, image, type, noIndex, structuredData]);

  return null;
}
