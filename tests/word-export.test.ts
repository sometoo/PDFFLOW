import assert from 'node:assert/strict';
import test from 'node:test';
import JSZip from 'jszip';
import {
  groupItemsIntoLines,
  groupLinesIntoParagraphs,
  buildDocxParagraphXml,
  buildDocx,
  type PdfTextItem
} from '../src/lib/wordExport.ts';

const item = (str: string, x: number, y: number, width: number, fontSize: number): PdfTextItem => ({
  str,
  x,
  y,
  width,
  fontSize
});

test('groupItemsIntoLines merges items on the same baseline and orders them left to right', () => {
  const lines = groupItemsIntoLines([
    item('world', 60, 700, 45, 12),
    item('Hello', 10, 700, 45, 12)
  ]);

  assert.equal(lines.length, 1);
  assert.equal(lines[0].text, 'Hello world');
});

test('groupItemsIntoLines splits items that are far apart vertically and sorts top to bottom', () => {
  const lines = groupItemsIntoLines([
    item('Second', 10, 600, 50, 12),
    item('First', 10, 700, 40, 12)
  ]);

  assert.equal(lines.length, 2);
  assert.equal(lines[0].text, 'First');
  assert.equal(lines[1].text, 'Second');
});

test('groupItemsIntoLines drops items that carry no text', () => {
  const lines = groupItemsIntoLines([item('', 10, 700, 40, 12)]);

  assert.equal(lines.length, 0);
});

test('groupLinesIntoParagraphs keeps closely spaced lines together', () => {
  const paragraphs = groupLinesIntoParagraphs([
    { y: 700, fontSize: 12, text: 'First line of the paragraph' },
    { y: 686, fontSize: 12, text: 'second line of the same block' }
  ]);

  assert.equal(paragraphs.length, 1);
  assert.equal(paragraphs[0], 'First line of the paragraph second line of the same block');
});

test('groupLinesIntoParagraphs starts a new paragraph when the vertical gap grows', () => {
  const paragraphs = groupLinesIntoParagraphs([
    { y: 700, fontSize: 12, text: 'End of the first paragraph' },
    { y: 670, fontSize: 12, text: 'Start of the second paragraph' }
  ]);

  assert.equal(paragraphs.length, 2);
  assert.equal(paragraphs[0], 'End of the first paragraph');
  assert.equal(paragraphs[1], 'Start of the second paragraph');
});

test('buildDocxParagraphXml escapes XML control characters', () => {
  const xml = buildDocxParagraphXml('A & B <tag> "quote" \'apostrophe\'');

  assert.equal(xml, `<w:p><w:r><w:t xml:space="preserve">A &amp; B &lt;tag&gt; &quot;quote&quot; &apos;apostrophe&apos;</w:t></w:r></w:p>`);
});

test('buildDocx creates a valid OPC package with page breaks and page size in twips', async () => {
  const bytes = await buildDocx(
    [
      ['Page one paragraph'],
      ['First on page two', 'Second on page two']
    ],
    { widthPt: 595, heightPt: 842 }
  );

  const zip = await JSZip.loadAsync(bytes);
  assert.ok(zip.file('[Content_Types].xml'));
  assert.ok(zip.file('_rels/.rels'));
  assert.ok(zip.file('word/document.xml'));

  const documentXml = await zip.file('word/document.xml')!.async('string');
  assert.ok(documentXml.includes('Page one paragraph'));
  assert.ok(documentXml.includes('<w:br w:type="page"/>'));
  assert.ok(documentXml.includes('<w:pgSz w:w="11900" w:h="16840"/>'));
  assert.ok(documentXml.includes('First on page two'));
  assert.ok(!documentXml.includes('&amp;amp;'));
});
