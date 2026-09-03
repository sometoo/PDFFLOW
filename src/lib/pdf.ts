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

export const loadPdfForEditing = async (data: PdfData): Promise<PDFDocument> => {
  try {
    return await PDFDocument.load(data);
  } catch (error) {
    if (error instanceof ProtectedPdfError || isEncryptedPdfError(error)) {
      throw new ProtectedPdfError();
    }
    throw error;
  }
};
