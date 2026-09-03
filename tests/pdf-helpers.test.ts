import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument } from 'pdf-lib';

const encryptedFixture = (): Uint8Array => {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>',
    '<< /Length 0 >>\nstream\n\nendstream',
    '<< /Filter /Standard /V 1 /R 2 /O <0000000000000000000000000000000000000000000000000000000000000000> /U <0000000000000000000000000000000000000000000000000000000000000000> /P -4 /Length 40 >>'
  ];
  let pdf = '%PDF-1.4\n%\xFF\xFF\xFF\xFF\n';
  const offsets = [0];

  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Encrypt 5 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
};

test('copyPdfData keeps a second independent copy after PDF.js transfers the first one', async () => {
  const { copyPdfData } = await import('../src/lib/pdf.ts');
  const source = new Uint8Array([1, 2, 3, 4]).buffer;
  const firstCopy = copyPdfData(source);

  structuredClone(firstCopy.buffer, { transfer: [firstCopy.buffer] });

  assert.deepEqual(new Uint8Array(source), new Uint8Array([1, 2, 3, 4]));
  assert.deepEqual(copyPdfData(source), new Uint8Array([1, 2, 3, 4]));
});

test('copyPdfArrayBuffer returns an independent ArrayBuffer for tool state', async () => {
  const { copyPdfArrayBuffer } = await import('../src/lib/pdf.ts');
  const source = new Uint8Array([5, 6, 7, 8]);
  const copiedBuffer = copyPdfArrayBuffer(source);
  const copied = new Uint8Array(copiedBuffer);

  copied[0] = 99;

  assert.deepEqual(source, new Uint8Array([5, 6, 7, 8]));
  assert.deepEqual(copied, new Uint8Array([99, 6, 7, 8]));
});

test('inspectPdf returns the page count for a normal PDF', async () => {
  const { inspectPdf } = await import('../src/lib/pdf.ts');
  const document = await PDFDocument.create();
  document.addPage();
  document.addPage();

  const inspected = await inspectPdf(await document.save());

  assert.equal(inspected.pageCount, 2);
});

test('inspectPdf rejects an encrypted PDF before a tool can queue it', async () => {
  const { ProtectedPdfError, inspectPdf } = await import('../src/lib/pdf.ts');
  const parsedWithIgnore = await PDFDocument.load(encryptedFixture(), { ignoreEncryption: true });

  assert.equal(parsedWithIgnore.isEncrypted, true);

  await assert.rejects(
    () => inspectPdf(encryptedFixture()),
    (error: unknown) => error instanceof ProtectedPdfError
  );
});

test('loadPdfForEditing opens a normal PDF with its pages available', async () => {
  const { loadPdfForEditing } = await import('../src/lib/pdf.ts');
  const document = await PDFDocument.create();
  document.addPage();
  document.addPage();

  const editable = await loadPdfForEditing(await document.save());

  assert.equal(editable.getPageCount(), 2);
});

test('loadPdfForEditing maps an encrypted fixture to ProtectedPdfError', async () => {
  const { loadPdfForEditing, ProtectedPdfError } = await import('../src/lib/pdf.ts');

  await assert.rejects(
    () => loadPdfForEditing(encryptedFixture()),
    (error: unknown) => error instanceof ProtectedPdfError
  );
});
