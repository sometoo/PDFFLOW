import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import type { HelmetServerState } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom';
import { AppRoutes } from './App';
import { blogPosts } from './data/blogData';
import { blogPostsEn } from './data/blogDataEn';

const sharedRoutes = [
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
];

const englishRoutes = sharedRoutes.map((route) => route === '/' ? '/en' : `/en${route}`);

export const prerenderRoutes = [
  ...sharedRoutes,
  ...blogPosts.map((post) => `/blog/${post.slug}`),
  ...englishRoutes,
  ...blogPostsEn.map((post) => `/en/blog/${post.slug}`)
];

interface HelmetContextValue {
  helmet?: HelmetServerState | null;
}

export const render = (url: string) => {
  const helmetContext: HelmetContextValue = {};
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </HelmetProvider>
  );
  const helmet = helmetContext.helmet;

  return {
    html,
    head: helmet
      ? [helmet.title.toString(), helmet.meta.toString(), helmet.link.toString(), helmet.script.toString()].join('\n')
      : ''
  };
};
