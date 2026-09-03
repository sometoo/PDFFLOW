import React, { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import DocLayout from '../../components/DocLayout';
import { copyPdfArrayBuffer, loadPdfForEditing, ProtectedPdfError } from '../../lib/pdf';
import { createMergeFileEntries, isMergeQueueLocked, prepareMergeDrop, type MergeFileEntry, validateMergeFiles } from '../../lib/mergeFiles';

const MergePdf: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  const [files, setFiles] = useState<MergeFileEntry[]>([]);
  const [processing, setProcessing] = useState(false);
  const [addingFiles, setAddingFiles] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const addingFilesRef = useRef(false);
  const processingRef = useRef(false);
  const queueLocked = addingFiles || processing;
  const currentQueueState = () => ({ addingFiles: addingFilesRef.current, processing: processingRef.current });
  const isQueueLocked = () => isMergeQueueLocked(currentQueueState());

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await addFiles(e.target.files);
    }
  };

  const addFiles = async (fileList: FileList) => {
    if (isQueueLocked()) return;
    addingFilesRef.current = true;
    setAddingFiles(true);

    try {
      const { validFiles, rejectedFiles } = await validateMergeFiles(Array.from(fileList));
      for (const { file, error } of rejectedFiles) {
        console.error(error);
        alert(error instanceof ProtectedPdfError
          ? (isEn
            ? 'This PDF file is protected and cannot be loaded. Please upload a document that is not protected.'
            : '이 PDF 파일은 비밀번호로 보호되어 있어 로드할 수 없습니다. 암호가 걸려 있지 않은 문서를 업로드해 주십시오.')
          : (isEn
            ? `An error occurred while loading "${file.name}". The file may be protected or corrupted.`
            : `"${file.name}" 파일 로딩 중 에러가 발생했습니다. 암호가 걸려있거나 손상된 파일일 수 있습니다.`));
      }
      setFiles((prev) => [...prev, ...createMergeFileEntries(validFiles)]);
    } finally {
      addingFilesRef.current = false;
      setAddingFiles(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!prepareMergeDrop(e, currentQueueState())) {
      setIsDragOver(false);
      return;
    }
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!prepareMergeDrop(e, currentQueueState())) return;
    if (e.dataTransfer.files) {
      await addFiles(e.dataTransfer.files);
    }
  };

  const moveFile = (index: number, direction: number) => {
    if (isQueueLocked()) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    const updated = [...files];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFiles(updated);
  };

  const removeFile = (index: number) => {
    if (isQueueLocked()) return;
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    if (isQueueLocked()) return;
    setFiles([]);
  };

  const handleMerge = async () => {
    if (isQueueLocked()) return;
    if (files.length < 2) {
      alert(isEn ? 'At least 2 PDF files are required for merging.' : '병합을 수행하려면 최소 2개 이상의 PDF 파일을 등록해야 합니다.');
      return;
    }

    processingRef.current = true;
    setProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const fileObj of files) {
        const fileBuffer = await fileObj.file.arrayBuffer();
        
        let srcDoc;
        try {
          srcDoc = await loadPdfForEditing(fileBuffer);
        } catch {
          alert(isEn 
            ? `An error occurred while loading "${fileObj.name}". The file may be protected or corrupted.` 
            : `"${fileObj.name}" 파일 로딩 중 에러가 발생했습니다. 암호가 걸려있거나 손상된 파일일 수 있습니다.`);
          setProcessing(false);
          return;
        }

        const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([copyPdfArrayBuffer(mergedPdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(isEn ? 'An unexpected error occurred during PDF merging.' : 'PDF 병합 중 예기치 못한 오류가 발생했습니다.');
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Static strings for DocLayout
  const instructions = isEn ? [
    'Drag and drop multiple PDF files into the upload zone or click to select them.',
    'Arrange the merging order in the file queue list by clicking ▲ or ▼ buttons.',
    'Remove incorrectly added files individually by clicking the ✕ button.',
    'When the sequence is ready, click the [Merge PDF] button.',
    'Once combined locally in your browser, the merged.pdf file will download automatically.'
  ] : [
    '병합하려는 다중 PDF 파일을 드래그 앤 드롭 영역에 놓거나 클릭하여 로드합니다.',
    '파일 대기 리스트에서 ▲ 또는 ▼ 버튼을 클릭하여 합쳐질 순서를 조정합니다.',
    '잘못 추가된 파일은 ✕ 단추를 눌러 개별 삭제할 수 있습니다.',
    '모든 정렬이 끝났다면 [PDF 병합하기] 단추를 누릅니다.',
    '브라우저가 병합본을 즉각 완성하면 자동으로 merged.pdf 파일이 다운로드됩니다.'
  ];

  const caveats = isEn ? [
    'Protected or encrypted PDF documents cannot be merged using this tool.',
    'Since processing uses browser session memory, combining huge PDF files exceeding hundreds of MBs may cause the browser tab to restart depending on device RAM.',
    'Always keep a backup copy of your original files before processing.'
  ] : [
    '암호로 보호되거나 잠겨진 PDF 문서의 경우 병합 처리가 불가할 수 있습니다.',
    '브라우저 내 로컬 가상 메모리를 사용하므로 용량이 수백 MB가 넘는 파일 여러 개를 합칠 때 기기 성능에 따라 작동이 멈출 수 있습니다.',
    '중요 문서의 경우 합치기 작업 전에 꼭 원본 파일의 백업본을 보관해 두시기 바랍니다.'
  ];

  const faqs = isEn ? [
    {
      question: 'Is there a limit to the number of PDF files I can merge?',
      answer: 'There is no strict limit on the number of files you can add. However, because everything is processed in your local browser, merging more than 15 large documents at once might slow down the page. We recommend merging in batches if files are extremely heavy.'
    },
    {
      question: 'Will text search or links still work after merging?',
      answer: 'Ordinary text and vector pages are copied without rasterizing them, so text usually remains searchable. Document-level outlines, forms, signatures, attachments, and some links may not survive; inspect the result before submitting it.'
    },
    {
      question: 'Can I use this tool offline?',
      answer: 'The document operation runs in browser memory. Depending on browser caching, the page may continue working after it has loaded, but offline behavior is not guaranteed for every device or session.'
    }
  ] : [
    {
      question: '합칠 수 있는 PDF 파일 개수의 상한선이 있나요?',
      answer: '기술적인 개수 제한은 설정되어 있지 않습니다. 하지만 브라우저가 사용하는 RAM 한계에 따라 15개 이상의 문서를 한 번에 병합할 때는 다소 랙이 유발될 수 있으므로 분할하여 합치는 편을 추천합니다.'
    },
    {
      question: '병합한 후에 텍스트 검색이나 하이퍼링크가 그대로 작동하나요?',
      answer: '네, 그렇습니다. 본 도구는 PDF 내부의 원본 소스 구조를 픽셀 단위로 재압축하는 것이 아니라 페이지만 그대로 복제해 이어붙이는 것이기 때문에 검색(Ctrl+F) 정보 및 포함된 모든 내부 링크가 온전히 유지됩니다.'
    },
    {
      question: '오프라인 상황에서도 병합이 가능한가요?',
      answer: '그렇습니다. PDFFlow 사이트가 이미 켜진 상태라면, 인터넷 연결이 중단된 오프라인 환경에서도 브라우저 엔진이 자체 구동되므로 안전하게 병합을 마치고 다운로드받을 수 있습니다.'
    }
  ];

  const relatedTools = isEn ? [
    { name: 'Split PDF', path: '/en/pdf-split', desc: 'Split a PDF document into separate page ranges.' },
    { name: 'Extract PDF Pages', path: '/en/pdf-extract-pages', desc: 'Save only selected pages as a new PDF document.' }
  ] : [
    { name: 'PDF 분할', path: '/pdf-split', desc: '하나의 PDF 문서를 원하는 범위로 쪼갭니다.' },
    { name: 'PDF 페이지 추출', path: '/pdf-extract-pages', desc: '필요한 페이지만 골라 새 문서로 저장합니다.' }
  ];

  return (
    <DocLayout
      seoTitle={isEn ? "Merge PDF - Combine PDF files online for free | PDFFlow" : "PDF 합치기 - 여러 PDF 파일을 하나로 병합 | PDFFlow"}
      seoDesc={isEn ? "Combine multiple PDF files into one easily. All files are processed locally in your browser for maximum security. No server uploads." : "여러 PDF 파일을 하나로 합칠 수 있는 무료 PDF 병합 도구입니다. 선택한 파일은 서버로 업로드되지 않고 브라우저에서 처리됩니다."}
      title={isEn ? "Merge PDF" : "PDF 합치기"}
      description={isEn ? "Combine multiple PDF files in your preferred order quickly and securely." : "여러 개의 PDF 파일을 원하는 순서대로 안전하고 간편하게 결합하여 하나의 PDF 파일로 만드세요."}
      instructions={instructions}
      caveats={caveats}
      faqs={faqs}
      relatedTools={relatedTools}
    >
      {/* Drop Zone */}
      {files.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition cursor-pointer ${
            queueLocked ? 'opacity-60' : ''
          } ${
            isDragOver ? 'border-violet-500 bg-violet-50/50' : 'border-slate-300 hover:border-violet-500 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileChange}
            disabled={queueLocked}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="text-4xl mb-4">📂</div>
          <p className="text-sm font-semibold text-slate-800">
            {queueLocked
              ? (isEn ? 'Checking selected PDF files...' : '선택한 PDF 파일 확인 중...')
              : (isEn ? "Drag and drop PDF files here, or click to browse" : "PDF 파일들을 이곳에 드래그하거나 클릭하여 추가하세요")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isEn ? "Select multiple PDF files to combine them." : "여러 개의 PDF를 선택하여 한 번에 합칠 수 있습니다."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-semibold text-slate-700">
              {isEn ? `Queued Files (${files.length})` : `대기 중인 파일 (${files.length}개)`}
            </span>
            <button 
              onClick={clearAll} 
              disabled={queueLocked}
              className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded"
            >
              {isEn ? 'Clear All' : '전체 삭제'}
            </button>
          </div>
          
          <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/50 max-h-72 overflow-y-auto">
            {files.map((fileObj, idx) => (
              <li key={fileObj.id} className="flex items-center justify-between p-3.5 bg-white transition hover:bg-slate-50/30">
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <span className="text-xl">📄</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate" title={fileObj.name}>
                      {fileObj.name}
                    </p>
                    <p className="text-xs text-slate-500">{formatBytes(fileObj.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => moveFile(idx, -1)}
                    disabled={queueLocked || idx === 0}
                    className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded"
                    title={isEn ? "Move Up" : "위로 이동"}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveFile(idx, 1)}
                    disabled={queueLocked || idx === files.length - 1}
                    className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded"
                    title={isEn ? "Move Down" : "아래로 이동"}
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => removeFile(idx)}
                    disabled={queueLocked}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded ml-2"
                    title={isEn ? "Delete" : "삭제"}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-end gap-3">
            <label className={`flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer ${queueLocked ? 'pointer-events-none opacity-50' : ''}`}>
              {addingFiles ? (isEn ? 'Checking files...' : '파일 확인 중...') : processing ? (isEn ? 'Merging...' : '병합 중...') : (isEn ? 'Add Files' : '파일 추가')}
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileChange}
                disabled={queueLocked}
                className="hidden"
              />
            </label>
            <button
              onClick={handleMerge}
              disabled={queueLocked}
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {addingFiles ? (
                isEn ? 'Checking files...' : '파일 확인 중...'
              ) : processing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {isEn ? 'Merging...' : '병합 중...'}
                </>
              ) : (
                isEn ? 'Merge PDF' : 'PDF 병합하기'
              )}
            </button>
          </div>
        </div>
      )}
    </DocLayout>
  );
};

export default MergePdf;
