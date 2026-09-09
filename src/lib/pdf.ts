import { EncryptedPDFError, PDFDocument } from 'pdf-lib';

export class ProtectedPdfError extends Error {
  constructor() {
    super('Protected PDF files are not supported.');
    this.name = 'ProtectedPdfError';
  }
}

const isEncryptedPdfError = (error: unknown): boolean => error instanceof EncryptedPDFError
  || error instanceof Error && error.message.includes('Input document to `PDFDocument.load` is encrypted.');

export type PdfData = ArrayBuffer | Uint8Array;

export const copyPdfData = (data: PdfData): Uint8Array => {
  const source = data instanceof Uint8Array ? data : new Uint8Array(data);
  return source.slice();
};

export const copyPdfArrayBuffer = (data: PdfData): ArrayBuffer => {
  const source = data instanceof Uint8Array ? data : new Uint8Array(data);
  const copy = new Uint8Array(source.byteLength);
  copy.set(source);
  return copy.buffer;
};

export interface PdfInspection {
  bytes: Uint8Array;
  pageCount: number;
}

export const inspectPdf = async (data: PdfData): Promise<PdfInspection> => {
  const bytes = copyPdfData(data);
  const pdfDocument = await PDFDocument.load(bytes, { ignoreEncryption: true });

  if (pdfDocument.isEncrypted) throw new ProtectedPdfError();

  return {
    bytes,
    pageCount: pdfDocument.getPageCount()
  };
};

export const loadPdfForEditing = async (
  data: PdfData,
  options: { updateMetadata?: boolean } = {}
): Promise<PDFDocument> => {
  try {
    return await PDFDocument.load(data, { updateMetadata: options.updateMetadata ?? true });
  } catch (error) {
    if (error instanceof ProtectedPdfError || isEncryptedPdfError(error)) {
      throw new ProtectedPdfError();
    }
    throw error;
  }
};

export interface PdfMetadataView {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: Date | null;
  modificationDate: Date | null;
}

const presentText = (value: unknown): string => (
  typeof value === 'string' && value.trim().length > 0 ? value : ''
);

export const readPdfMetadata = async (data: PdfData): Promise<PdfMetadataView> => {
  // pdf-lib's load() rewrites Producer and ModificationDate by default, so the
  // record must be read with updateMetadata disabled to report the real file.
  const pdfDocument = await loadPdfForEditing(data, { updateMetadata: false });

  return {
    title: presentText(pdfDocument.getTitle()),
    author: presentText(pdfDocument.getAuthor()),
    subject: presentText(pdfDocument.getSubject()),
    keywords: presentText(pdfDocument.getKeywords()),
    creator: presentText(pdfDocument.getCreator()),
    producer: presentText(pdfDocument.getProducer()),
    creationDate: pdfDocument.getCreationDate() ?? null,
    modificationDate: pdfDocument.getModificationDate() ?? null
  };
};

export const stripPdfMetadata = async (data: PdfData): Promise<Uint8Array> => {
  const source = await loadPdfForEditing(data);
  const clean = await PDFDocument.create();
  clean.setProducer('');
  clean.setCreator('');

  const pages = await clean.copyPages(source, source.getPageIndices());
  pages.forEach((page) => clean.addPage(page));

  return clean.save();
};
