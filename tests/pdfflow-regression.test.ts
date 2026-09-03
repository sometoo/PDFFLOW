import assert from 'node:assert/strict';
import test from 'node:test';
import { getToolGuide } from '../src/data/toolGuides.ts';
import { getLanguageSwitchPath, normalizePathname } from '../src/lib/pathname.ts';

test('tool guide lookup keeps working for a trailing-slash pathname', () => {
  assert.ok(getToolGuide('/pdf-split/', false));
  assert.ok(getToolGuide('/en/pdf-split/', true));
});

test('language switching strips trailing slashes in both directions', () => {
  assert.equal(normalizePathname('/pdf-split/'), '/pdf-split');
  assert.equal(normalizePathname('/en//pdf-split///'), '/en/pdf-split');
  assert.equal(getLanguageSwitchPath('/pdf-split/'), '/en/pdf-split');
  assert.equal(getLanguageSwitchPath('/en/pdf-split/'), '/pdf-split');
});

test('SSR keeps the detailed guide and localized link on a trailing-slash route', async () => {
  const { createServer } = await import('vite');
  const vite = await createServer({
    root: process.cwd(),
    appType: 'custom',
    server: { middlewareMode: true, hmr: false }
  });

  try {
    const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
    const rendered = render('/pdf-split/');

    assert.match(rendered.html, /도구 상세 가이드/);
    assert.match(rendered.html, /href="\/en\/pdf-split"/);
    assert.match(rendered.html, /https:\/\/www\.pdfflow\.xyz\/pdf-split/);
  } finally {
    await vite.close();
  }
});

test('buildDocument preserves one JSON-LD script and SEO metadata in the root contract', async () => {
  const { createServer } = await import('vite');
  const { buildDocument } = await import('../scripts/prerender.mjs');
  const vite = await createServer({
    root: process.cwd(),
    appType: 'custom',
    server: { middlewareMode: true, hmr: false }
  });
  const template = '<!doctype html><html lang="ko"><head><title>base</title></head><body><div id="root"></div></body></html>';

  try {
    const { prerenderRoutes, render } = await vite.ssrLoadModule('/src/entry-server.tsx');
    assert.equal(prerenderRoutes.length, 40);

    for (const [route, expected] of [
      ['/pdf-split/', {
        guide: '도구 상세 가이드',
        englishLink: '/en/pdf-split',
        title: 'PDF 분할 - 원하는 페이지 범위로 PDF 나누기 | PDFFlow',
        description: 'PDF 파일을 원하는 페이지 범위로 나누고 필요한 부분만 새 파일로 저장하세요. 모든 작업은 브라우저 내부에서 처리됩니다.',
        path: '/pdf-split'
      }],
      ['/pdf-to-jpg/', {
        guide: '도구 상세 가이드',
        englishLink: '/en/pdf-to-jpg',
        title: 'PDF JPG 변환 - PDF 페이지를 이미지로 저장 | PDFFlow',
        description: 'PDF 페이지를 브라우저에서 JPG 이미지로 변환하세요. 여러 페이지는 ZIP 파일로 내려받을 수 있습니다.',
        path: '/pdf-to-jpg'
      }]
    ] as const) {
      const rendered = render(route);
      const document = buildDocument(template, route, rendered);
      const jsonLdPattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
      const jsonLdMatches = [...document.matchAll(jsonLdPattern)];
      const rootIndex = document.indexOf('<div id="root">');
      const headEnd = document.indexOf('</head>');

      assert.equal(jsonLdMatches.length, 1);
      assert.equal([...document.slice(rootIndex).matchAll(jsonLdPattern)].length, 1);
      assert.equal([...document.slice(0, headEnd).matchAll(jsonLdPattern)].length, 0);
      assert.ok(document.includes(`<title>${expected.title}</title>`));
      assert.ok(document.includes(`content="${expected.description}"`));
      assert.ok(document.includes(`href="https://www.pdfflow.xyz${expected.path}"`));
      assert.ok(document.includes('hrefLang="ko" href="https://www.pdfflow.xyz' + expected.path + '"'));
      assert.ok(document.includes('hrefLang="en" href="https://www.pdfflow.xyz/en' + expected.path + '"'));
      assert.ok(document.includes(expected.guide));
      assert.ok(document.includes(`href="${expected.englishLink}"`));

      const structuredData = JSON.parse(jsonLdMatches[0][1]) as { url?: string };
      assert.equal(structuredData.url, `https://www.pdfflow.xyz${expected.path}`);
    }
  } finally {
    await vite.close();
  }
});
