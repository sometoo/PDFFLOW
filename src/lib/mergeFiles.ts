import { inspectPdf } from './pdf.ts';

export interface MergeFileEntry {
  id: string;
  file: File;
  name: string;
  size: number;
}

export type MergeFileIdFactory = (index: number, file: File) => string;

export interface MergeQueueState {
  addingFiles: boolean;
  processing: boolean;
}

export interface MergeDropEvent {
  preventDefault: () => void;
  defaultPrevented?: boolean;
}

export const isMergeQueueLocked = ({ addingFiles, processing }: MergeQueueState): boolean => addingFiles || processing;

export const prepareMergeDrop = (event: MergeDropEvent, state: MergeQueueState): boolean => {
  if (!event.defaultPrevented) event.preventDefault();
  return !isMergeQueueLocked(state);
};

export interface MergeFileRejection {
  file: File;
  error: unknown;
}

export interface MergeFileValidationResult {
  validFiles: File[];
  rejectedFiles: MergeFileRejection[];
}

const defaultIdFactory: MergeFileIdFactory = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export const createMergeFileEntries = (
  files: readonly File[],
  idFactory: MergeFileIdFactory = defaultIdFactory
): MergeFileEntry[] => files.map((file, index) => ({
  id: idFactory(index, file),
  file,
  name: file.name,
  size: file.size
}));

export const validateMergeFiles = async (files: readonly File[]): Promise<MergeFileValidationResult> => {
  const validFiles: File[] = [];
  const rejectedFiles: MergeFileRejection[] = [];

  for (const file of files) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) continue;

    try {
      await inspectPdf(await file.arrayBuffer());
      validFiles.push(file);
    } catch (error: unknown) {
      rejectedFiles.push({ file, error });
    }
  }

  return { validFiles, rejectedFiles };
};
