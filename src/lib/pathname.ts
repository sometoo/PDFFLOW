export const slugMap: Record<string, string> = {
  'pdf-merge-vs-split': 'merge-vs-split-pdf',
  'pdf-extract-pages-guide': 'extract-selected-pdf-pages',
  'browser-pdf-privacy': 'browser-based-pdf-privacy',
  'delete-pdf-pages': 'delete-pdf-pages-tips',
  'jpg-to-pdf-guide': 'jpg-to-pdf-guide',
  'pdf-to-jpg-quality': 'pdf-to-jpg-quality',
  'merge-vs-split-pdf': 'pdf-merge-vs-split',
  'extract-selected-pdf-pages': 'pdf-extract-pages-guide',
  'browser-based-pdf-privacy': 'browser-pdf-privacy',
  'delete-pdf-pages-tips': 'delete-pdf-pages'
};

const knownStaticPaths = new Set([
  '/',
  '/pdf-merge',
  '/pdf-split',
  '/pdf-extract-pages',
  '/pdf-delete-pages',
  '/pdf-rotate',
  '/jpg-to-pdf',
  '/pdf-to-jpg',
  '/about',
  '/privacy',
  '/terms',
  '/contact',
  '/editorial-policy',
  '/blog'
]);

export const normalizePathname = (pathname: string): string => {
  const normalized = (pathname || '/').replace(/\/{2,}/g, '/').replace(/\/+$/, '');
  return normalized || '/';
};

export const isEnglishPath = (pathname: string): boolean => {
  const normalizedPath = normalizePathname(pathname);
  return normalizedPath === '/en' || normalizedPath.startsWith('/en/');
};

export const getLanguageSwitchPath = (pathname: string): string => {
  const normalizedPath = normalizePathname(pathname);
  const isEn = isEnglishPath(normalizedPath);
  const languageNeutralPath = isEn ? normalizePathname(normalizedPath.slice(3) || '/') : normalizedPath;
  const blogSlug = languageNeutralPath.startsWith('/blog/') ? languageNeutralPath.slice(6) : '';
  const isKnownPath = knownStaticPaths.has(languageNeutralPath) || Boolean(blogSlug && slugMap[blogSlug]);

  if (!isKnownPath) return isEn ? '/' : '/en';

  if (isEn && normalizedPath.startsWith('/en/blog/')) {
    const enSlug = normalizedPath.slice(9);
    return `/blog/${slugMap[enSlug] || enSlug}`;
  }

  if (!isEn && normalizedPath.startsWith('/blog/')) {
    const koSlug = normalizedPath.slice(6);
    return `/en/blog/${slugMap[koSlug] || koSlug}`;
  }

  if (isEn) return languageNeutralPath;
  return `/en${normalizedPath === '/' ? '' : normalizedPath}`;
};
