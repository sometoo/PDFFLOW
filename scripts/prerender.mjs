import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(projectRoot, 'dist');
const siteOrigin = process.env.VITE_SITE_URL || 'https://www.pdfflow.xyz';

const vite = await createServer({
  root: projectRoot,
  appType: 'custom',
  server: { middlewareMode: true }
});

try {
  const { prerenderRoutes, render } = await vite.ssrLoadModule('/src/entry-server.tsx');
  const template = await readFile(join(distDir, 'index.html'), 'utf8');
  const cleanTemplate = template
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/\s*<meta\s+(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+)"[^>]*>/gi, '');

  const buildDocument = (route, rendered) => {
    const metadataPattern = /<title>[\s\S]*?<\/title>|<meta\s+[^>]*\/>|<link\s+[^>]*\/>|<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi;
    const renderedMetadata = [...rendered.html.matchAll(metadataPattern)].map((match) => match[0]).join('\n');
    const headHtml = rendered.head.trim() || renderedMetadata;
    const bodyHtml = rendered.html.replace(metadataPattern, '');

    return cleanTemplate
      .replace('<html lang="ko">', `<html lang="${route.startsWith('/en') ? 'en' : 'ko'}">`)
      .replace('</head>', `${headHtml}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
  };

  for (const route of prerenderRoutes) {
    const outputPath = route === '/'
      ? join(distDir, 'index.html')
      : join(distDir, route.slice(1), 'index.html');
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, buildDocument(route, render(route)), 'utf8');
  }

  await writeFile(join(distDir, '404.html'), buildDocument('/404', render('/404')), 'utf8');

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...prerenderRoutes.map((route) => {
      const isToolOrHome = route === '/' || route === '/en' || /pdf|jpg/.test(route) && !route.includes('/blog/');
      const isBlog = route === '/blog' || route === '/en/blog' || route.includes('/blog/');
      return [
        '  <url>',
        `    <loc>${siteOrigin}${route === '/' ? '/' : route}</loc>`,
        '    <lastmod>2026-07-20</lastmod>',
        `    <changefreq>${isBlog ? 'monthly' : isToolOrHome ? 'weekly' : 'yearly'}</changefreq>`,
        `    <priority>${route === '/' || route === '/en' ? '1.0' : isToolOrHome ? '0.9' : isBlog ? '0.7' : '0.4'}</priority>`,
        '  </url>'
      ].join('\n');
    }),
    '</urlset>',
    ''
  ].join('\n');
  await writeFile(join(distDir, 'sitemap.xml'), sitemap, 'utf8');

  console.log(`Prerendered ${prerenderRoutes.length} indexable routes plus 404.html.`);
} finally {
  await vite.close();
}
