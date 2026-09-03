import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import DocLayout from '../../components/DocLayout';
import { copyPdfArrayBuffer, loadPdfForEditing, inspectPdf, ProtectedPdfError } from '../../lib/pdf';

interface DeleteFile {
  file: File;
  name: string;
  size: number;
  pageCount: number;
  buffer: ArrayBuffer;
}

const DeletePages: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  const [file, setFile] = useState<DeleteFile | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await loadFile(e.target.files[0]);
    }
  };

  const loadFile = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      alert(isEn ? 'Not a valid PDF file.' : '올바른 형식의 PDF 파일이 아닙니다.');
      return;
    }

    setProcessing(true);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const inspected = await inspectPdf(buffer);

      setFile({
        file: selectedFile,
        name: selectedFile.name,
        size: selectedFile.size,
        pageCount: inspected.pageCount,
        buffer: copyPdfArrayBuffer(inspected.bytes)
      });
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof ProtectedPdfError) {
        alert(isEn 
          ? 'This PDF file is protected and cannot be loaded. Please upload a document that is not protected.' 
          : '이 PDF 파일은 비밀번호로 보호되어 있어 로드할 수 없습니다. 암호가 걸려 있지 않은 문서를 업로드해 주십시오.');
      } else {
        alert(isEn ? 'An error occurred while loading the PDF file.' : 'PDF 파일을 로드하는 동안 에러가 발생했습니다.');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await loadFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setDeleteInput('');
  };

  const executeDeletion = async () => {
    if (!file) return;

    const input = deleteInput.trim();
    if (!input) {
      alert(isEn ? 'Please enter the page numbers to delete. (e.g. 2, 4, 7-9)' : '삭제할 페이지 번호를 입력해 주세요. (예: 2, 4, 7-9)');
      return;
    }

    setProcessing(true);
    try {
      const pdfDoc = await loadPdfForEditing(file.buffer);
      
      const parts = input.split(',');
      const pageIndicesToDelete: number[] = [];

      for (let part of parts) {
        part = part.trim();
        if (!part) continue;

        if (/^\d+$/.test(part)) {
          const pageNum = parseInt(part, 10);
          if (pageNum < 1 || pageNum > file.pageCount) {
            alert(isEn 
              ? `Page number out of bounds. Must be between 1 and ${file.pageCount}.` 
              : `페이지 범위를 벗어났습니다. 1부터 ${file.pageCount} 사이의 숫자여야 합니다.`);
            setProcessing(false);
            return;
          }
          pageIndicesToDelete.push(pageNum - 1); // 0-indexed
        } else if (/^(\d+)\s*-\s*(\d+)$/.test(part)) {
          const match = part.match(/^(\d+)\s*-\s*(\d+)$/);
          if (match) {
            const start = parseInt(match[1], 10);
            const end = parseInt(match[2], 10);

            if (start < 1 || end > file.pageCount || start > end) {
              alert(isEn 
                ? `Invalid range: ${part}. (Total pages: ${file.pageCount})` 
                : `유효하지 않은 범위 설정입니다: ${part}. (전체 페이지 수: ${file.pageCount})`);
              setProcessing(false);
              return;
            }

            for (let i = start; i <= end; i++) {
              pageIndicesToDelete.push(i - 1);
            }
          }
        } else {
          alert(isEn 
            ? `Invalid input format: "${part}". (e.g. 2, 4, 7-9)` 
            : `유효하지 않은 입력 형식입니다: "${part}". (예: 2, 4, 7-9)`);
          setProcessing(false);
          return;
        }
      }

      // Check if we are trying to delete all pages
      const uniqueIndicesToDelete = Array.from(new Set(pageIndicesToDelete));
      if (uniqueIndicesToDelete.length >= file.pageCount) {
        alert(isEn ? 'You cannot delete all pages. At least 1 page must remain.' : '모든 페이지를 삭제할 수는 없습니다. 최소 1페이지는 남겨야 합니다.');
        setProcessing(false);
        return;
      }

      // Sort indices in descending order to avoid shift issues during deletion
      uniqueIndicesToDelete.sort((a, b) => b - a);
      uniqueIndicesToDelete.forEach((idx) => {
        pdfDoc.removePage(idx);
      });

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([copyPdfArrayBuffer(modifiedPdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'deleted-pages.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(isEn ? 'An unexpected error occurred during page deletion.' : '페이지 삭제 처리 중 예기치 못한 에러가 발생했습니다.');
    } finally {
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

  const instructions = isEn ? [
    'Drag and drop the single PDF file from which you want to delete pages, or click to select.',
    'Enter the unwanted page index numbers or ranges separated by commas. (e.g. 2, 4, 7-9)',
    'Verify that your specified page numbers fall within the total page count of the document.',
    'Click the [Delete PDF Pages] button.',
    'The edited PDF with the specified pages removed will download automatically as deleted-pages.pdf.'
  ] : [
    '페이지를 지우고자 하는 단일 PDF 파일을 드래그 앤 드롭 영역에 놓거나 클릭하여 로드합니다.',
    '지우기를 원하는 불필요한 페이지 번호를 쉼표와 하이픈 조합으로 지정합니다. (예: 2, 4, 7-9)',
    '페이지 번호 입력이 전체 페이지 수 범위 내에 잘 해당하는지 최종 대조합니다.',
    '[PDF 페이지 삭제] 단추를 클릭합니다.',
    '지정한 페이지들이 제거된 새로운 PDF 파일이 deleted-pages.pdf 이름으로 자동 다운로드됩니다.'
  ];

  const caveats = isEn ? [
    'You cannot delete all pages in the PDF. At least 1 page must remain in the output document.',
    'Before starting, it is highly recommended to keep a secure backup copy of the original PDF document.',
    'This local browser-side process does not modify or corrupt the original file on your local storage.'
  ] : [
    '모든 페이지를 한 번에 전부 삭제하는 명령은 유효하지 않으므로 실행이 불가능합니다. 최소 1페이지 이상은 반드시 남겨두어야 합니다.',
    '삭제가 완료된 사본을 다운로드하기 전에 미리 안전용 원본 백업본 파일이 로컬 드라이브에 준비되어 있는지 확인해 주십시오.',
    '본 삭제 로직은 원본 문서 파일 자체의 바이트를 직접 깎는 것이 아니므로 안심하셔도 됩니다.'
  ];

  const faqs = isEn ? [
    {
      question: 'Will internal table of contents or bookmarks automatically update after page deletion?',
      answer: 'No. Due to the PDF specification limits, parent bookmark links pointing to deleted pages will not auto-adjust. Be careful when editing documents with complex bookmark indexes.'
    },
    {
      question: 'Why did the PDF file size not decrease much after deleting several pages?',
      answer: 'PDFs contain shared resources like font files, color profiles, and embedded image catalogs. If these assets are still referenced by the remaining pages, the overall file size may only decrease slightly.'
    },
    {
      question: 'Can I delete pages from protected or encrypted PDF documents?',
      answer: 'No. If a document has edit restrictions or security locks, browser-side libraries cannot read or rewrite the pages. You must use an unprotected file version.'
    }
  ] : [
    {
      question: '삭제 후 책갈피(북마크) 인덱스 번호가 지워진 페이지에 따라 자동으로 줄어드나요?',
      answer: '아니요, PDF 구조 한계상 내장 북마크의 가리키는 대상 링크 번호가 자동으로 재계산되지는 않으므로, 복잡한 북마크 구조가 내장된 문서를 다룰 때는 페이지 유실 검증 시 유의가 필요합니다.'
    },
    {
      question: '페이지를 여러 개 삭제했는데 최종 PDF 용량이 거의 줄어들지 않았습니다. 왜 그런가요?',
      answer: 'PDF 내부에는 페이지 영역 이외에 문서가 사용하는 글꼴, 임베디드 이미지 라이브러리 및 공통 스타일 등이 독립적으로 상주하고 있습니다. 이러한 공통 정보들이 그대로 남아있다면 소량의 페이지 삭제로는 용량이 눈에 띄게 감축되지 않을 수 있습니다.'
    },
    {
      question: '비밀번호 잠금이 설정된 문서에서도 삭제를 진행할 수 있나요?',
      answer: '불가능합니다. 수정 방지 락이 걸린 PDF는 뷰어뿐 아니라 가공 도구에서도 권한을 획득하지 못해 편집이 강제 제한됩니다.'
    }
  ];

  const relatedTools = isEn ? [
    { name: 'Extract PDF Pages', path: '/en/pdf-extract-pages', desc: 'Isolate specific pages and compile them into a new file.' },
    { name: 'Split PDF', path: '/en/pdf-split', desc: 'Split a PDF document into multiple separate page ranges.' }
  ] : [
    { name: 'PDF 페이지 추출', path: '/pdf-extract-pages', desc: '필요한 부분만 쏙 골라 새 파일로 조립합니다.' },
    { name: 'PDF 분할', path: '/pdf-split', desc: '전체 페이지를 여러 슬라이스로 분산 저장합니다.' }
  ];

  return (
    <DocLayout
      seoTitle={isEn ? "Delete PDF Pages - Remove pages from PDF online | PDFFlow" : "PDF 페이지 삭제 - 불필요한 PDF 페이지 제거 | PDFFlow"}
      seoDesc={isEn ? "Remove unwanted pages from a PDF and save a new document. Selected files are processed in your browser and are not uploaded to a PDFFlow processing server." : "PDF 파일에서 필요 없는 페이지를 선택해 삭제하고 새 파일로 저장하세요. 선택한 파일은 브라우저 내부에서 처리됩니다."}
      title={isEn ? "Delete PDF Pages" : "PDF 페이지 삭제"}
      description={isEn ? "Delete specific blank pages, draft notes, or unwanted sections from a PDF file quickly." : "다중 페이지 PDF 문서에서 잘못 인쇄되거나 더 이상 필요하지 않은 페이지를 신속히 삭제하고 저장하세요."}
      instructions={instructions}
      caveats={caveats}
      faqs={faqs}
      relatedTools={relatedTools}
    >
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition cursor-pointer ${
            isDragOver ? 'border-violet-500 bg-violet-50/50' : 'border-slate-300 hover:border-violet-500 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="text-4xl mb-4">🗑️</div>
          <p className="text-sm font-semibold text-slate-800">
            {isEn ? 'Drag and drop a PDF file here, or click to browse' : '삭제할 PDF 파일을 드래그하거나 클릭하여 추가하세요'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isEn ? 'Add a single PDF file to remove pages.' : '일부 페이지를 제거하기 위해 단일 PDF 파일을 등록합니다.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-semibold text-slate-700">
              {isEn ? 'Target PDF File' : '삭제 대기 대상'}
            </span>
            <button 
              onClick={removeFile}
              className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded"
            >
              {isEn ? 'Change File' : '파일 변경'}
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-3xl">📄</span>
            <div className="min-w-0 flex-grow">
              <p className="text-sm font-bold text-slate-900 truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • {isEn ? `Total ${file.pageCount} pages` : `총 ${file.pageCount} 페이지`}
              </p>
            </div>
          </div>

          {/* Form Options */}
          <div className="space-y-4 rounded-xl border border-slate-200 p-5 bg-white">
            <label htmlFor="deletePagesInput" className="text-sm font-bold text-slate-900 block">
              {isEn ? 'Enter pages to delete' : '삭제할 페이지 입력'}
            </label>
            <input
              id="deletePagesInput"
              type="text"
              placeholder={isEn ? `e.g. 2, 4, 7-9 (Total pages: ${file.pageCount})` : `예: 2, 4, 7-9 (전체 페이지 수: ${file.pageCount})`}
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400 block">
              {isEn ? 'The output PDF will contain all pages except the specified ones.' : '지정된 페이지들을 제외한 새로운 PDF 파일이 다시 구성됩니다. (예: 2, 4, 7-9)'}
            </span>
          </div>

          <div className="flex justify-end">
            <button
              onClick={executeDeletion}
              disabled={processing}
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {isEn ? 'Deleting...' : '삭제 처리 중...'}
                </>
              ) : (
                isEn ? 'Delete PDF Pages' : 'PDF 페이지 삭제하기'
              )}
            </button>
          </div>
        </div>
      )}
    </DocLayout>
  );
};

export default DeletePages;
