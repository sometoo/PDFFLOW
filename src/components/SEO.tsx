import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { isEnglishPath, normalizePathname, slugMap } from '../lib/pathname';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

// Easily configure the actual target domain here (or via .env VITE_SITE_URL variable)
const SITE_ORIGIN = import.meta.env.VITE_SITE_URL || 'https://www.pdfflow.xyz';

const SEO: React.FC<SEOProps> = ({ title, description, canonical, noindex, structuredData }) => {
  const location = useLocation();
  const origin = SITE_ORIGIN;
  const pathname = normalizePathname(location.pathname);
  const isEn = isEnglishPath(pathname);

  // Calculate canonical and alternate URLs
  const canonicalUrl = canonical || `${origin}${pathname}`;
  let koUrl: string;
  let enUrl: string;

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
  } else if (isEn) {
    const cleanPath = pathname.substring(3) || '/';
    enUrl = `${origin}${pathname}`;
    koUrl = `${origin}${cleanPath}`;
  } else {
    enUrl = `${origin}/en${pathname === '/' ? '' : pathname}`;
    koUrl = `${origin}${pathname}`;
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
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={pathname.includes('/blog/') ? 'article' : 'website'} />
      <meta property="og:site_name" content="PDFFlow" />
      <meta property="og:locale" content={isEn ? 'en_US' : 'ko_KR'} />
      <meta property="og:image" content={`${origin}/og.png`} />
      <meta property="og:image:alt" content={isEn ? 'PDFFlow browser-based PDF tools' : '브라우저에서 문서를 처리하는 PDFFlow PDF 도구'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${origin}/og.png`} />
      
      {/* Alternate hreflang tags for SEO indexation mapping */}
      {!noindex && <link rel="alternate" hrefLang="ko" href={koUrl} />}
      {!noindex && <link rel="alternate" hrefLang="en" href={enUrl} />}
      {!noindex && <link rel="alternate" hrefLang="x-default" href={koUrl} />}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
