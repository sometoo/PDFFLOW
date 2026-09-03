import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Encrypt 5 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
};

test('merge queue entries preserve the selected batch order', async () => {
  const { createMergeFileEntries } = await import('../src/lib/mergeFiles.ts');
  const selectedFiles = [
    new File(['first'], 'first.pdf', { type: 'application/pdf' }),
    new File(['second'], 'second.pdf', { type: 'application/pdf' }),
    new File(['third'], 'third.pdf', { type: 'application/pdf' })
  ];

  const entries = createMergeFileEntries(selectedFiles, (index) => `test-${index}`);

  assert.deepEqual(entries.map((entry) => entry.name), ['first.pdf', 'second.pdf', 'third.pdf']);
  assert.deepEqual(entries.map((entry) => entry.id), ['test-0', 'test-1', 'test-2']);
});

test('merge validation keeps normal files in order and rejects a protected file', async () => {
  const { validateMergeFiles } = await import('../src/lib/mergeFiles.ts');
  const normalDocument = await PDFDocument.create();
  normalDocument.addPage();
  const normalBytes = await normalDocument.save();
  const selectedFiles = [
    new File([normalBytes], 'first.pdf', { type: 'application/pdf' }),
    new File([encryptedFixture()], 'protected.pdf', { type: 'application/pdf' }),
    new File([normalBytes], 'third.pdf', { type: 'application/pdf' })
  ];

  const result = await validateMergeFiles(selectedFiles);

  assert.deepEqual(result.validFiles.map((file) => file.name), ['first.pdf', 'third.pdf']);
  assert.deepEqual(result.rejectedFiles.map((entry) => entry.file.name), ['protected.pdf']);
});

test('merge queue locks every mutation while adding or processing', async () => {
  const { isMergeQueueLocked, prepareMergeDrop } = await import('../src/lib/mergeFiles.ts');
  const states = [
    { addingFiles: false, processing: false, locked: false },
    { addingFiles: true, processing: false, locked: true },
    { addingFiles: false, processing: true, locked: true },
    { addingFiles: true, processing: true, locked: true }
  ];

  for (const state of states) {
    let preventDefaultCalls = 0;
    const allowed = prepareMergeDrop({ preventDefault: () => { preventDefaultCalls += 1; } }, state);

    assert.equal(isMergeQueueLocked(state), state.locked);
    assert.equal(allowed, !state.locked);
    assert.equal(preventDefaultCalls, 1);
  }
});

test('outer merge drop zone keeps pointer events while showing the queue lock opacity', async () => {
  const source = await readFile(new URL('../src/pages/tools/MergePdf.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /queueLocked \? 'pointer-events-none opacity-60'/);
  assert.match(source, /queueLocked \? 'opacity-60'/);
});
