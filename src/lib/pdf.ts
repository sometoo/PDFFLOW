import { EncryptedPDFError, PDFDocument } from 'pdf-lib';

export class ProtectedPdfError extends Error {
  constructor() {
    super('Protected PDF files are not supported.');
    this.name = 'ProtectedPdfError';
  }
}

export type PdfData = ArrayBuffer | Uint8Array;

export const copyPdfData = (data: PdfData): Uint8Array => {
  const source = data instanceof Uint8Array ? data : new Uint8Array(data);
  return source.slice();
};

export const copyPdfArrayBuffer = (data: PdfData): ArrayBuffer => {
  const copy = copyPdfData(data);
  return copy.buffer.slice(copy.byteOffset, copy.byteOffset + copy.byteLength) as ArrayBuffer;
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
    const inspected = await inspectPdf(data);
    return await PDFDocument.load(copyPdfData(inspected.bytes));
  } catch (error) {
    if (error instanceof ProtectedPdfError || error instanceof EncryptedPDFError) {
      throw new ProtectedPdfError();
    }
    throw error;
  }
};
