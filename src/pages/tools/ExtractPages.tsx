import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import DocLayout from '../../components/DocLayout';
import { copyPdfArrayBuffer, loadPdfForEditing, inspectPdf, ProtectedPdfError } from '../../lib/pdf';

interface ExtractFile {
  file: File;
  name: string;
  size: number;
  pageCount: number;
  buffer: ArrayBuffer;
}

const ExtractPages: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  const [file, setFile] = useState<ExtractFile | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pageInput, setPageInput] = useState('');

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
    setPageInput('');
  };

  const executeExtraction = async () => {
    if (!file) return;

    const input = pageInput.trim();
    if (!input) {
      alert(isEn ? 'Please enter the page numbers to extract. (e.g. 1, 3, 5-8)' : '추출할 페이지 번호를 입력해 주세요. (예: 1, 3, 5-8)');
      return;
    }

    setProcessing(true);
    try {
      const srcDoc = await loadPdfForEditing(file.buffer);
      const destDoc = await PDFDocument.create();

      const parts = input.split(',');
      const pageIndicesToCopy: number[] = [];

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
          pageIndicesToCopy.push(pageNum - 1); // 0-indexed
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
              pageIndicesToCopy.push(i - 1);
            }
          }
        } else {
          alert(isEn 
            ? `Invalid input format: "${part}". (e.g., 1, 3, 5-8)` 
            : `유효하지 않은 입력 형식입니다: "${part}". (예: 1, 3, 5-8)`);
          setProcessing(false);
          return;
        }
      }

      if (pageIndicesToCopy.length === 0) {
        alert(isEn ? 'No pages specified for extraction.' : '추출할 페이지가 지정되지 않았습니다.');
        setProcessing(false);
        return;
      }

      // Copy pages
      const copiedPages = await destDoc.copyPages(srcDoc, pageIndicesToCopy);
      copiedPages.forEach((page) => destDoc.addPage(page));

      const extractedPdfBytes = await destDoc.save();
      const blob = new Blob([copyPdfArrayBuffer(extractedPdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'extracted-pages.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(isEn ? 'An unexpected error occurred during page extraction.' : '페이지 추출 도중 예기치 못한 에러가 발생했습니다.');
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
    'Drag and drop the single PDF file from which you want to extract pages, or click to browse.',
    'Enter the desired page index numbers or ranges separated by commas. (e.g. 1, 3, 5-8)',
    'Verify that your specified page numbers fall within the document\'s total page count.',
    'Click the [Extract PDF Pages] button.',
    'The extracted copy will download automatically as extracted-pages.pdf.'
  ] : [
    '페이지를 추출하고 싶은 단일 PDF 파일을 드래그 앤 드롭 영역에 놓거나 클릭하여 로드합니다.',
    '입력 폼에 추출을 원하는 페이지의 인덱스 번호를 쉼표와 하이픈을 섞어 기재합니다. (예: 1, 3, 5-8)',
    '페이지 일련번호가 전체 문서 범위 내에 잘 들어맞는지 다시 한 번 점검합니다.',
    '[PDF 페이지 추출] 단추를 누릅니다.',
    '완성된 파일 사본이 extracted-pages.pdf 이름으로 자동 저장됩니다.'
  ];

  const caveats = isEn ? [
    'Spaces in the page entry input are automatically trimmed and ignored.',
    'Extraction does not alter the original PDF. It creates a brand-new PDF containing only the chosen pages.',
    'For security, you can isolate only the relevant pages before sharing a confidential report.'
  ] : [
    '추출할 페이지 번호 입력 시 띄어쓰기가 섞여 있어도 자동으로 필터링 및 병합 처리됩니다.',
    '추출 처리는 원본을 훼손하지 않고 새로운 단일 문서를 만드는 아카이빙 작업입니다.',
    '기밀 문서의 경우 외부 공유 시 사전에 본 도구로 불필요한 부분을 확실하게 분리하면 기밀 유출을 피할 수 있습니다.'
  ];

  const faqs = isEn ? [
    {
      question: 'What happens if I enter duplicate page numbers or mix their sequence?',
      answer: 'Pages will be copied in the exact sequence you specified. For instance, entering "3, 1, 3" generates a new 3-page document containing page 3 first, then page 1, and page 3 again.'
    },
    {
      question: 'Will bookmarks or interactive form fields be kept?',
      answer: 'Page-level annotations and hyperlinks are fully copied. However, document-level properties like parent table of contents bookmarks might be lost during individual page copying.'
    },
    {
      question: 'Why does extraction fail on certain secured PDFs?',
      answer: 'PDFs that have write protection or printing restrictions cannot be read by browser-side canvas/document engines. You must use an unrestricted version of the document to perform extraction.'
    }
  ] : [
    {
      question: '페이지 번호를 중복하여 입력하거나 순서를 뒤섞어 입력하면 어떻게 되나요?',
      answer: '입력하신 순서대로 새 PDF 문서에 페이지가 복제됩니다. 예컨대 "3, 1, 3"을 입력하면 3페이지, 1페이지, 다시 3페이지 순서로 조합된 총 3페이지 분량의 특이한 사본 문서가 만들어집니다.'
    },
    {
      question: '책갈피(북마크)나 양식 데이터도 함께 추출되나요?',
      answer: '단순 페이지 복사 기술 특성상, 개별 페이지에 삽입된 주석이나 링크 정보는 복사되지만 문서 전체 수준에 저장된 통합 책갈피 정보는 복사되지 않을 수 있습니다.'
    },
    {
      question: '특정 보안 PDF에 대해 추출이 안 되는 이유는 무엇인가요?',
      answer: '파일 복사 방지 혹은 고도 인쇄 잠금 등이 설정된 PDF는 브라우저 엔진 상에서 안전을 보증할 수 없으므로 작업을 차단합니다. 잠금이 걸리지 않은 원본 문서를 확보한 뒤 사용하여야 합니다.'
    }
  ];

  const relatedTools = isEn ? [
    { name: 'Split PDF', path: '/en/pdf-split', desc: 'Split a PDF document into multiple files by ranges.' },
    { name: 'Delete PDF Pages', path: '/en/pdf-delete-pages', desc: 'Remove chosen pages and rebuild the rest.' }
  ] : [
    { name: 'PDF 분할', path: '/pdf-split', desc: '전체 문서를 구간별로 잘라 다수 파일로 만듭니다.' },
    { name: 'PDF 페이지 삭제', path: '/pdf-delete-pages', desc: '선택한 페이지를 제외하고 문서를 조립합니다.' }
  ];

  return (
    <DocLayout
      seoTitle={isEn ? "Extract PDF Pages - Save selected pages to new PDF | PDFFlow" : "PDF 페이지 추출 - 원하는 페이지만 새 PDF로 저장 | PDFFlow"}
      seoDesc={isEn ? "Extract specific pages from your PDF file and save them as a new document locally. Free, private, and secure browser-side tool." : "PDF에서 원하는 페이지만 선택해 새 PDF 파일로 저장할 수 있습니다. 파일은 서버로 전송되지 않습니다."}
      title={isEn ? "Extract PDF Pages" : "PDF 페이지 추출"}
      description={isEn ? "Isolate the exact pages you need from a PDF and save them as a new, lightweight file." : "다중 페이지 PDF 문서에서 원하는 페이지만 콕 집어내어 새로운 개별 PDF 파일로 신속하게 저장하세요."}
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
          <div className="text-4xl mb-4">✨</div>
          <p className="text-sm font-semibold text-slate-800">
            {isEn ? 'Drag and drop a PDF file here, or click to browse' : '추출할 PDF 파일을 드래그하거나 클릭하여 추가하세요'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isEn ? 'Add a single PDF file to extract pages.' : '페이지를 선별 추출하기 위해 단일 PDF 파일을 등록합니다.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-semibold text-slate-700">
              {isEn ? 'Target PDF File' : '추출 대기 대상'}
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
            <label htmlFor="pagesInput" className="text-sm font-bold text-slate-900 block">
              {isEn ? 'Enter pages to extract' : '추출할 페이지 입력'}
            </label>
            <input
              id="pagesInput"
              type="text"
              placeholder={isEn ? `e.g. 1, 3, 5-8 (Total pages: ${file.pageCount})` : `예: 1, 3, 5-8 (전체 페이지 수: ${file.pageCount})`}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400 block">
              {isEn ? 'Use commas (,) to separate page numbers and hyphens (-) for ranges.' : '쉼표(,)로 페이지 번호를 나열하거나 하이픈(-)으로 범위(시작-끝)를 지정할 수 있습니다.'}
            </span>
          </div>

          <div className="flex justify-end">
            <button
              onClick={executeExtraction}
              disabled={processing}
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {isEn ? 'Extracting...' : '추출 중...'}
                </>
              ) : (
                isEn ? 'Extract PDF Pages' : 'PDF 페이지 추출하기'
              )}
            </button>
          </div>
        </div>
      )}
    </DocLayout>
  );
};

export default ExtractPages;
