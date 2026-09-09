import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument } from 'pdf-lib';
import { readPdfMetadata, stripPdfMetadata } from '../src/lib/pdf.ts';
import { getToolGuide } from '../src/data/toolGuides.ts';

const samplePdf = async (): Promise<Uint8Array> => {
  const pdfDocument = await PDFDocument.create();
  pdfDocument.addPage([595, 842]);
  pdfDocument.addPage([595, 842]);
  pdfDocument.setTitle('Quarterly Report');
  pdfDocument.setAuthor('Alice');
  pdfDocument.setSubject('Financial results');
  pdfDocument.setKeywords(['finance', '2026']);
  pdfDocument.setProducer('SampleProducer');
  pdfDocument.setCreator('SampleCreator');

  return pdfDocument.save();
};

test('readPdfMetadata returns the document information record', async () => {
  const bytes = await samplePdf();
  const metadata = await readPdfMetadata(bytes);

  assert.equal(metadata.title, 'Quarterly Report');
  assert.equal(metadata.author, 'Alice');
  assert.equal(metadata.subject, 'Financial results');
  assert.equal(metadata.keywords, 'finance 2026');
  assert.equal(metadata.producer, 'SampleProducer');
  assert.equal(metadata.creator, 'SampleCreator');
  assert.ok(metadata.creationDate instanceof Date);
});

test('stripPdfMetadata rebuilds the document without the information record', async () => {
  const bytes = await samplePdf();
  const cleaned = await stripPdfMetadata(bytes);

  assert.ok(cleaned instanceof Uint8Array);

  const metadata = await readPdfMetadata(cleaned);
  assert.equal(metadata.title, '');
  assert.equal(metadata.author, '');
  assert.equal(metadata.subject, '');
  assert.equal(metadata.keywords, '');
  assert.equal(metadata.producer, '');
  assert.equal(metadata.creator, '');

  const document = await PDFDocument.load(cleaned, { updateMetadata: false });
  assert.equal(document.getPageCount(), 2);
});

test('new privacy and word tools resolve localized guides in both languages', () => {
  for (const path of ['/pdf-metadata-viewer', '/pdf-remove-metadata', '/pdf-to-word']) {
    assert.ok(getToolGuide(path, false), `missing Korean guide for ${path}`);
    assert.ok(getToolGuide(`/en${path}`, true), `missing English guide for ${path}`);
  }
});
