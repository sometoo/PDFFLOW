import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import DocLayout from '../../components/DocLayout';

interface SplitFile {
  file: File;
  name: string;
  size: number;
  pageCount: number;
  buffer: ArrayBuffer;
}

const SplitPdf: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  const [file, setFile] = useState<SplitFile | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [splitMode, setSplitMode] = useState<'all' | 'range'>('all');
  const [rangeInput, setRangeInput] = useState('');

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
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();

      setFile({
        file: selectedFile,
        name: selectedFile.name,
        size: selectedFile.size,
        pageCount,
        buffer
      });
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes('encrypted') || err.message.includes('password'))) {
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
    setRangeInput('');
  };

  const executeSplit = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const srcDoc = await PDFDocument.load(file.buffer);
      const baseName = file.name.replace(/\.[^/.]+$/, "");

      if (splitMode === 'all') {
        const zip = new JSZip();

        for (let i = 0; i < file.pageCount; i++) {
          const subDoc = await PDFDocument.create();
          const [copiedPage] = await subDoc.copyPages(srcDoc, [i]);
          subDoc.addPage(copiedPage);

          const subPdfBytes = await subDoc.save();
          zip.file(`${baseName}_page_${i + 1}.pdf`, subPdfBytes);
        }

        const zipBlobBytes = await zip.generateAsync({ type: 'blob' });
        downloadFile(zipBlobBytes, `${baseName}_split_pages.zip`, 'application/zip');
      } else {
        // Range mode parsing
        const rangeStr = rangeInput.trim();
        if (!rangeStr) {
          alert(isEn ? 'Please enter the page ranges to split. (e.g. 1-3, 4-6)' : '분할할 페이지 범위를 입력해 주세요. (예: 1-3, 4-6)');
          setProcessing(false);
          return;
        }

        const parts = rangeStr.split(',');
        const parsedRanges: { start: number; end: number }[] = [];

        for (let part of parts) {
          part = part.trim();
          if (!part) continue;

          if (/^\d+$/.test(part)) {
            const page = parseInt(part, 10);
            if (page < 1 || page > file.pageCount) {
              alert(isEn 
                ? `Page number out of bounds. Must be between 1 and ${file.pageCount}.` 
                : `페이지 범위를 벗어났습니다. 1부터 ${file.pageCount} 사이의 숫자여야 합니다.`);
              setProcessing(false);
              return;
            }
            parsedRanges.push({ start: page, end: page });
          } else if (/^(\d+)\s*-\s*(\d+)$/.test(part)) {
            const match = part.match(/^(\d+)\s*-\s*(\d+)$/);
            if (match) {
              const start = parseInt(match[1], 10);
              const end = parseInt(match[2], 10);

              if (start < 1 || end > file.pageCount || start > end) {
                alert(isEn 
                  ? `Invalid range: ${part}. (Total pages: ${file.pageCount})` 
                  : `유효하지 않은 범위입니다: ${part}. (전체 페이지 수: ${file.pageCount})`);
                setProcessing(false);
                return;
              }
              parsedRanges.push({ start, end });
            }
          } else {
            alert(isEn 
              ? `Invalid page range format: "${part}". (e.g., 1-3, 5, 8-10)` 
              : `올바르지 않은 페이지 범위 형식입니다: "${part}". (예: 1-3, 5, 8-10)`);
            setProcessing(false);
            return;
          }
        }

        if (parsedRanges.length === 0) {
          alert(isEn ? 'No valid page ranges specified.' : '유효한 페이지 범위가 지정되지 않았습니다.');
          setProcessing(false);
          return;
        }

        if (parsedRanges.length === 1) {
          const range = parsedRanges[0];
          const subDoc = await PDFDocument.create();
          const indices: number[] = [];
          for (let i = range.start - 1; i <= range.end - 1; i++) {
            indices.push(i);
          }

          const copiedPages = await subDoc.copyPages(srcDoc, indices);
          copiedPages.forEach((p) => subDoc.addPage(p));

          const subPdfBytes = await subDoc.save();
          const suffix = range.start === range.end ? `_page_${range.start}` : `_pages_${range.start}-${range.end}`;
          downloadFile(subPdfBytes, `${baseName}${suffix}.pdf`, 'application/pdf');
        } else {
          const zip = new JSZip();

          for (let idx = 0; idx < parsedRanges.length; idx++) {
            const range = parsedRanges[idx];
            const subDoc = await PDFDocument.create();
            const indices: number[] = [];
            for (let i = range.start - 1; i <= range.end - 1; i++) {
              indices.push(i);
            }

            const copiedPages = await subDoc.copyPages(srcDoc, indices);
            copiedPages.forEach((p) => subDoc.addPage(p));

            const subPdfBytes = await subDoc.save();
            const suffix = range.start === range.end ? `_page_${range.start}` : `_pages_${range.start}-${range.end}`;
            zip.file(`${baseName}${suffix}.pdf`, subPdfBytes);
          }

          const zipBlobBytes = await zip.generateAsync({ type: 'blob' });
          downloadFile(zipBlobBytes, `${baseName}_ranges.zip`, 'application/zip');
        }
      }
    } catch (err) {
      console.error(err);
      alert(isEn ? 'An error occurred during PDF split.' : 'PDF 분할 도중 에러가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadFile = (data: Blob | Uint8Array, filename: string, contentType: string) => {
    const blob = data instanceof Blob ? data : new Blob([data as any], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const instructions = isEn ? [
    'Drag and drop the PDF file you want to split into the upload zone or click to select.',
    'Select your split mode. To split every page into separate single-page files, select "Split all pages".',
    'To extract page batches, select "Split by page ranges" and input ranges like 1-3, 5-8.',
    'Click the [Split PDF] button.',
    'If the process generates multiple files, they will be packed and downloaded automatically as a single ZIP archive.'
  ] : [
    '분할하고자 하는 단일 PDF 파일을 드래그 앤 드롭 영역에 놓거나 클릭하여 로드합니다.',
    '분할 모드를 선택합니다. 전체 페이지를 각각 1페이지짜리로 나누려면 "모든 페이지 분할"을 선택하십시오.',
    '원하는 페이지 묶음이 있다면 "범위 지정 분할"을 선택한 뒤 1-3, 5-8 형태로 입력합니다.',
    '[PDF 분할하기] 버튼을 누릅니다.',
    '두 개 이상의 결과물이 나오는 경우 자동으로 하나의 압축 ZIP 파일로 패킹하여 다운로드됩니다.'
  ];

  const caveats = isEn ? [
    'The page numbers entered must exist within the page count of the uploaded document.',
    'When specifying multiple ranges using commas, they will be split into separate PDF documents and combined into a ZIP archive.',
    'Please allow download permissions in your browser if prompted after completion.'
  ] : [
    '입력된 범위 번호는 반드시 해당 문서의 전체 페이지 범위 내에 존재해야 합니다.',
    '쉼표(,)를 통해 다수의 구간을 정하면 각각 개별 PDF 문서로 분리되어 하나의 파일로 압축됩니다.',
    '분할 프로세스 완료 후 브라우저 다운로드 팝업 허용 알림창이 보인다면 허용을 선택해 주십시오.'
  ];

  const faqs = isEn ? [
    {
      question: 'Will hyperlinks or text annotations remain active after splitting?',
      answer: 'Yes. Splitting preserves all internal properties, embedded fonts, hyperlinks, and vector layout on each page. The content of each page is copied exactly as-is into the split documents.'
    },
    {
      question: 'What happens if I enter overlapping page ranges, like 1-5 and 3-7?',
      answer: 'Overlapping ranges will be processed independently. You will get one PDF document containing pages 1-5 and another containing pages 3-7, packaged side-by-side in the downloaded ZIP archive.'
    },
    {
      question: 'Do I need specific software to open the ZIP archive?',
      answer: 'No. Modern operating systems like Windows 10/11 and macOS can open and extract ZIP files natively via right-click or double-click without installing any third-party software.'
    }
  ] : [
    {
      question: '분할 시에 기존에 작성된 텍스트 주석이나 하이퍼링크가 사라지나요?',
      answer: '페이지를 쪼개더라도 해당 페이지에 매핑되어 있는 고유의 텍스트, 하이퍼링크 및 벡터 그래픽 속성은 삭제되지 않고 복제된 PDF 안으로 완벽하게 전사됩니다.'
    },
    {
      question: '범위를 1-5, 3-7 처럼 중복되게 기재하면 어떻게 되나요?',
      answer: '중복 기재된 범위도 각각 독립된 PDF 파일로 온전히 출력됩니다. 즉, 1-5페이지 문서 1개와 3-7페이지 문서 1개가 생성되어 압축파일 안에 차곡차곡 담기게 됩니다.'
    },
    {
      question: '분할 후 압축파일(ZIP)을 푸는 프로그램이 꼭 필요한가요?',
      answer: '최신 Windows 10/11이나 macOS 등은 별도의 유료 파일 압축 프로그램 설치 없이도 마우스 우클릭을 통해 기본으로 제공되는 시스템 압축 해제 마법사로 ZIP 파일 내용물을 손쉽게 열람할 수 있습니다.'
    }
  ];

  const relatedTools = isEn ? [
    { name: 'Extract PDF Pages', path: '/en/pdf-extract-pages', desc: 'Isolate specific pages and merge them into a new file.' },
    { name: 'Delete PDF Pages', path: '/en/pdf-delete-pages', desc: 'Remove unwanted pages and save the remaining ones.' }
  ] : [
    { name: 'PDF 페이지 추출', path: '/pdf-extract-pages', desc: '특정 페이지만 골라 단일 PDF 파일로 합쳐 뺍니다.' },
    { name: 'PDF 페이지 삭제', path: '/pdf-delete-pages', desc: '필요 없는 페이지만 제거하고 남은 문서를 저장합니다.' }
  ];

  return (
    <DocLayout
      seoTitle={isEn ? "Split PDF - Split PDF pages online for free | PDFFlow" : "PDF 분할 - 원하는 페이지 범위로 PDF 나누기 | PDFFlow"}
      seoDesc={isEn ? "Split your PDF document into separate page ranges or individual pages locally. Private, secure, and fast with no server uploads." : "PDF 파일을 원하는 페이지 범위로 나누고 필요한 부분만 새 파일로 저장하세요. 모든 작업은 브라우저 내부에서 처리됩니다."}
      title={isEn ? "Split PDF" : "PDF 분할"}
      description={isEn ? "Break down a multi-page PDF document into separate files by page ranges or pages." : "다중 페이지로 구성된 단일 PDF 파일을 여러 개의 문서로 조각내어 깔끔하게 관리해보세요."}
      instructions={instructions}
      caveats={caveats}
      faqs={faqs}
      relatedTools={relatedTools}
    >
      {/* Tool Main Area */}
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
          <div className="text-4xl mb-4">✂️</div>
          <p className="text-sm font-semibold text-slate-800">
            {isEn ? 'Drag and drop a PDF file here, or click to browse' : '분할할 PDF 파일을 드래그하거나 클릭하여 추가하세요'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isEn ? 'Add a single PDF file to configure split ranges.' : '문서 분할 설정을 위해 단일 PDF 파일을 등록합니다.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-semibold text-slate-700">
              {isEn ? 'Target PDF File' : '분할 대기 대상'}
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
            <h3 className="text-sm font-bold text-slate-900">
              {isEn ? 'Split Options' : '분할 옵션 설정'}
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                <input
                  type="radio"
                  name="splitMode"
                  value="all"
                  checked={splitMode === 'all'}
                  onChange={() => setSplitMode('all')}
                  className="mt-1 accent-violet-600"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {isEn ? 'Split all pages' : '모든 페이지 분할'}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {isEn 
                      ? `Split into individual single-page documents. (Generates ${file.pageCount} files)`
                      : `각각의 단일 페이지로 쪼개어 파일 묶음을 만듭니다. (총 ${file.pageCount}개 파일 생성)`}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                <input
                  type="radio"
                  name="splitMode"
                  value="range"
                  checked={splitMode === 'range'}
                  onChange={() => setSplitMode('range')}
                  className="mt-1 accent-violet-600"
                />
                <div className="w-full">
                  <span className="text-sm font-semibold text-slate-800 block">
                    {isEn ? 'Split by page ranges' : '범위 지정 분할'}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {isEn ? 'Generate separate PDF files based on the specified page ranges.' : '입력한 구간별로 묶음 PDF 파일을 분할 생성합니다.'}
                  </span>
                  
                  {splitMode === 'range' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder={isEn ? `e.g. 1-3, 4-6, 7-10 (Total: 1-${file.pageCount})` : `예: 1-3, 4-6, 7-10 (전체: 1-${file.pageCount})`}
                        value={rangeInput}
                        onChange={(e) => setRangeInput(e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
                      />
                      <span className="text-[11px] text-slate-400 block mt-1">
                        {isEn ? 'Use hyphens (-) and commas (,) to specify page ranges.' : '하이픈(-)과 콤마(,)를 사용해 원하는 페이지 범위를 지정하세요.'}
                      </span>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={executeSplit}
              disabled={processing}
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {isEn ? 'Splitting...' : '분할 중...'}
                </>
              ) : (
                isEn ? 'Split PDF' : 'PDF 분할하기'
              )}
            </button>
          </div>
        </div>
      )}
    </DocLayout>
  );
};

export default SplitPdf;
