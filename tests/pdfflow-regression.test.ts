import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getToolGuide } from '../src/data/toolGuides.ts';
import { getLanguageSwitchPath, normalizePathname } from '../src/lib/pathname.ts';

const sourceRoot = new URL('../src/', import.meta.url);

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

test('all local PDF editors use the shared protected-document loader', async () => {
  const toolNames = ['SplitPdf', 'RotatePdf', 'ExtractPages', 'DeletePages'];

  for (const toolName of toolNames) {
    const source = await readFile(new URL(`pages/tools/${toolName}.tsx`, sourceRoot), 'utf8');
    assert.match(source, /loadPdfForEditing/);
    assert.doesNotMatch(source, /ignoreEncryption\s*:\s*true/);
  }
});

test('merge validates PDF bytes before adding them to the merge queue', async () => {
  const source = await readFile(new URL('pages/tools/MergePdf.tsx', sourceRoot), 'utf8');

  assert.match(source, /inspectPdf/);
});

test('PDF to JPG keeps its document data independent from PDF.js transfer', async () => {
  const source = await readFile(new URL('pages/tools/PdfToJpg.tsx', sourceRoot), 'utf8');

  assert.match(source, /copyPdfData/);
});

test('pathname normalization is shared by routing, guides, SEO, and structured URLs', async () => {
  const files = [
    'components/Header.tsx',
    'components/SEO.tsx',
    'components/DocLayout.tsx',
    'data/toolGuides.ts'
  ];

  for (const file of files) {
    const source = await readFile(new URL(file, sourceRoot), 'utf8');
    assert.match(source, /normalizePathname/);
  }
});

test('SSR keeps the detailed guide and localized link on a trailing-slash route', async () => {
  const { createServer } = await import('vite');
  const vite = await createServer({
    root: process.cwd(),
    appType: 'custom',
    server: { middlewareMode: true }
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
