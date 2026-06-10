import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
}

const slugMap: Record<string, string> = {
  // KO -> EN
  'pdf-merge-vs-split': 'merge-vs-split-pdf',
  'pdf-extract-pages-guide': 'extract-selected-pdf-pages',
  'browser-pdf-privacy': 'browser-based-pdf-privacy',
  'delete-pdf-pages': 'delete-pdf-pages-tips',
  'jpg-to-pdf-guide': 'jpg-to-pdf-guide',
  'pdf-to-jpg-quality': 'pdf-to-jpg-quality',
  // EN -> KO
  'merge-vs-split-pdf': 'pdf-merge-vs-split',
  'extract-selected-pdf-pages': 'pdf-extract-pages-guide',
  'browser-based-pdf-privacy': 'browser-pdf-privacy',
  'delete-pdf-pages-tips': 'delete-pdf-pages'
};

// Easily configure the actual target domain here (or via .env VITE_SITE_URL variable)
const SITE_ORIGIN = import.meta.env.VITE_SITE_URL || 'https://pdfflow.com';

const SEO: React.FC<SEOProps> = ({ title, description, canonical, noindex }) => {
  const location = useLocation();
  const origin = SITE_ORIGIN;
  const pathname = location.pathname;

  // Calculate canonical and alternate URLs
  let canonicalUrl = canonical || `${origin}${pathname}`;
  let koUrl = '';
  let enUrl = '';

  if (pathname.startsWith('/en/blog/')) {
    const enSlug = pathname.substring(9);
    const koSlug = slugMap[enSlug] || enSlug;
    enUrl = `${origin}/en/blog/${enSlug}`;
    koUrl = `${origin}/blog/${koSlug}`;
  } else if (pathname.startsWith('/blog/')) {
    const koSlug = pathname.substring(6);
    const enSlug = slugMap[koSlug] || koSlug;
    enUrl = `${origin}/en/blog/${enSlug}`;
    koUrl = `${origin}/blog/${koSlug}`;
  } else if (pathname.startsWith('/en')) {
    const cleanPath = pathname.substring(3) || '/';
    enUrl = `${origin}${pathname}`;
    koUrl = `${origin}${cleanPath}`;
  } else {
    enUrl = `${origin}/en${pathname === '/' ? '' : pathname}`;
    koUrl = `${origin}${pathname}`;
  }

  // Double check trailing slash consistency for home page
  if (koUrl.endsWith('/') && koUrl.length > origin.length + 1) {
    koUrl = koUrl.slice(0, -1);
  }
  if (enUrl.endsWith('/') && enUrl.length > origin.length + 4) {
    enUrl = enUrl.slice(0, -1);
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Alternate hreflang tags for SEO indexation mapping */}
      {!noindex && <link rel="alternate" hrefLang="ko" href={koUrl} />}
      {!noindex && <link rel="alternate" hrefLang="en" href={enUrl} />}
      {!noindex && <link rel="alternate" hrefLang="x-default" href={koUrl} />}
    </Helmet>
  );
};

export default SEO;
export { slugMap };
