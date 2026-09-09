import JSZip from 'jszip';

export interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
}

export interface PdfLine {
  y: number;
  fontSize: number;
  text: string;
}

export interface DocxPageSection {
  widthPt: number;
  heightPt: number;
}

const LINE_TOLERANCE_RATIO = 0.45;
const SPACE_GAP_RATIO = 0.22;
const PARAGRAPH_GAP_RATIO = 1.65;
const MIN_FONT_SIZE = 1;

export const groupItemsIntoLines = (items: PdfTextItem[]): PdfLine[] => {
  const usable = items.filter((item) => item.str.length > 0);
  if (usable.length === 0) return [];

  const sorted = [...usable].sort((a, b) => b.y - a.y || a.x - b.x);
  const buckets: { y: number; fontSize: number; items: PdfTextItem[] }[] = [];

  for (const item of sorted) {
    const fontSize = Math.max(item.fontSize, MIN_FONT_SIZE);
    const tolerance = Math.max(fontSize * LINE_TOLERANCE_RATIO, 1);
    const bucket = buckets.find((candidate) => Math.abs(candidate.y - item.y) <= tolerance);

    if (bucket) {
      bucket.items.push(item);
      bucket.fontSize = Math.max(bucket.fontSize, fontSize);
    } else {
      buckets.push({ y: item.y, fontSize, items: [item] });
    }
  }

  return buckets
    .sort((a, b) => b.y - a.y)
    .map((bucket) => {
      const ordered = bucket.items.sort((a, b) => a.x - b.x);
      let text = '';
      let previousEnd: number | undefined;

      for (const item of ordered) {
        const gap = previousEnd === undefined ? 0 : item.x - previousEnd;
        const needsSpace = previousEnd !== undefined
          && gap > Math.max(item.fontSize * SPACE_GAP_RATIO, 0.6)
          && !/\s$/.test(text);
        if (needsSpace) text += ' ';
        text += item.str;
        previousEnd = item.x + item.width;
      }

      return { y: bucket.y, fontSize: bucket.fontSize, text: text.trim() };
    })
    .filter((line) => line.text.length > 0);
};

export const groupLinesIntoParagraphs = (lines: PdfLine[]): string[] => {
  const paragraphs: string[] = [];
  let current: string[] = [];

  const flush = () => {
    if (current.length > 0) {
      paragraphs.push(current.join(' ').replace(/\s+/g, ' ').trim());
      current = [];
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const previous = lines[index - 1];
    const gap = previous ? previous.y - line.y : Number.POSITIVE_INFINITY;
    const threshold = Math.max(previous ? previous.fontSize : 0, line.fontSize) * PARAGRAPH_GAP_RATIO;

    if (current.length > 0 && gap > threshold) flush();
    current.push(line.text);
  }
  flush();

  return paragraphs;
};

export const escapeXmlText = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

export const buildDocxParagraphXml = (text: string): string => (
  `<w:p><w:r><w:t xml:space="preserve">${escapeXmlText(text)}</w:t></w:r></w:p>`
);

const CONTENT_TYPES_XML = [
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
  '<Default Extension="xml" ContentType="application/xml"/>',
  '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>',
  '</Types>',
  ''
].join('\n');

const ROOT_RELS_XML = [
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>',
  '</Relationships>',
  ''
].join('\n');

const PAGE_BREAK_XML = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

export const buildDocx = async (pages: string[][], section: DocxPageSection): Promise<Uint8Array> => {
  const zip = new JSZip();

  const bodyParts: string[] = [];
  pages.forEach((paragraphs, pageIndex) => {
    if (pageIndex > 0) bodyParts.push(PAGE_BREAK_XML);
    for (const paragraph of paragraphs) {
      bodyParts.push(buildDocxParagraphXml(paragraph));
    }
  });

  const documentXml = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
    '<w:body>',
    ...bodyParts,
    `<w:sectPr><w:pgSz w:w="${Math.round(section.widthPt * 20)}" w:h="${Math.round(section.heightPt * 20)}"/>`,
    '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>',
    '</w:sectPr>',
    '</w:body>',
    '</w:document>',
    ''
  ].join('\n');

  zip.file('[Content_Types].xml', CONTENT_TYPES_XML);
  zip.file('_rels/.rels', ROOT_RELS_XML);
  zip.file('word/document.xml', documentXml);

  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
};
