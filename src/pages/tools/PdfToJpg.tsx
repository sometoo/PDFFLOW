import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import JSZip from 'jszip';
import DocLayout from '../../components/DocLayout';

let pdfJsPromise: Promise<typeof import('pdfjs-dist')> | undefined;

const loadPdfJs = () => {
  if (!pdfJsPromise) {
    pdfJsPromise = Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    ]).then(([pdfjs, workerModule]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default;
      return pdfjs;
    });
  }

  return pdfJsPromise;
};

interface PdfFile {
  file: File;
  name: string;
  size: number;
  pageCount: number;
  buffer: ArrayBuffer;
}

const PdfToJpg: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  const [file, setFile] = useState<PdfFile | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [convertMode, setConvertMode] = useState<'all' | 'range'>('all');
  const [rangeInput, setRangeInput] = useState('');
  const [progressText, setProgressText] = useState('');

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
    setProgressText(isEn ? 'Analyzing file...' : '파일 분석 중...');
    try {
      const buffer = await selectedFile.arrayBuffer();
      // Load document using pdfjs
      const pdfjsLib = await loadPdfJs();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const pageCount = pdf.numPages;

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
      setProgressText('');
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

  const executeConvert = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const pdfjsLib = await loadPdfJs();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(file.buffer) });
      const pdf = await loadingTask.promise;
      const baseName = file.name.replace(/\.[^/.]+$/, "");

      let pagesToRender: number[] = [];

      if (convertMode === 'all') {
        for (let i = 1; i <= file.pageCount; i++) {
          pagesToRender.push(i);
        }
      } else {
        // Parse range input
        const rangeStr = rangeInput.trim();
        if (!rangeStr) {
          alert(isEn ? 'Please enter the page ranges to convert. (e.g. 1, 3, 5-8)' : '변환할 페이지 범위를 입력해 주세요. (예: 1, 3, 5-8)');
          setProcessing(false);
          return;
        }

        const parts = rangeStr.split(',');
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
            pagesToRender.push(pageNum);
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

              for (let i = start; i <= end; i++) {
                pagesToRender.push(i);
              }
            }
          } else {
            alert(isEn 
              ? `Invalid page range format: "${part}". (e.g. 1, 3, 5-8)` 
              : `올바르지 않은 페이지 범위 형식입니다: "${part}". (예: 1, 3, 5-8)`);
            setProcessing(false);
            return;
          }
        }
      }

      // Remove duplicates and sort
      pagesToRender = Array.from(new Set(pagesToRender)).sort((a, b) => a - b);

      if (pagesToRender.length === 0) {
        alert(isEn ? 'No pages specified for conversion.' : '변환할 페이지가 지정되지 않았습니다.');
        setProcessing(false);
        return;
      }

      // Start rendering loop
      if (pagesToRender.length === 1) {
        const pageNum = pagesToRender[0];
        setProgressText(isEn ? `Rendering page ${pageNum}...` : `페이지 ${pageNum} 렌더링 중...`);
        const imgBlob = await renderPageToBlob(pdf, pageNum);
        if (imgBlob) {
          downloadFile(imgBlob, `${baseName}_page-${pageNum}.jpg`);
        }
      } else {
        const zip = new JSZip();

        for (let idx = 0; idx < pagesToRender.length; idx++) {
          const pageNum = pagesToRender[idx];
          setProgressText(isEn 
            ? `Rendering page ${pageNum}... (${idx + 1}/${pagesToRender.length})` 
            : `페이지 ${pageNum} 렌더링 중... (${idx + 1}/${pagesToRender.length})`);
          
          const imgBlob = await renderPageToBlob(pdf, pageNum);
          if (imgBlob) {
            zip.file(`page-${pageNum}.jpg`, imgBlob);
          }
        }

        setProgressText(isEn ? 'Creating ZIP archive...' : '압축 파일 생성 중...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadFile(zipBlob, `${baseName}_images.zip`);
      }

      alert(isEn ? 'Successfully converted!' : '성공적으로 변환되었습니다!');
    } catch (err) {
      console.error(err);
      alert(isEn ? 'An error occurred during PDF conversion.' : 'PDF 변환 도중 에러가 발생했습니다.');
    } finally {
      setProcessing(false);
      setProgressText('');
    }
  };

  const renderPageToBlob = async (pdf: any, pageNum: number): Promise<Blob | null> => {
    try {
      const page = await pdf.getPage(pageNum);
      // High-quality rendering scale
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return null;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;

      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
      });
    } catch (err) {
      console.error(`Page ${pageNum} render error:`, err);
      return null;
    }
  };

  const downloadFile = (data: Blob, filename: string) => {
    const url = URL.createObjectURL(data);
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
    'Drag and drop the single PDF file you want to convert into the upload zone or click to select.',
    'Select your conversion mode. Choose "Convert all pages" to extract every page as a JPG.',
    'To convert specific pages, choose "Convert specific pages" and type page numbers. (e.g. 1, 3, 5)',
    'Click the [Convert to JPG] button.',
    'Single page conversions download directly as a JPG file, while multiple pages download packaged in a ZIP archive.'
  ] : [
    '이미지(JPG)로 변환할 단일 PDF 파일을 드래그 앤 드롭 영역에 놓거나 클릭하여 추가합니다.',
    '변환 모드를 선택합니다. 전체 페이지를 추출하려면 "모든 페이지 변환"을 고릅니다.',
    '특정 부분만 이미지화하려면 "특정 페이지 지정"을 켜고 페이지 번호를 씁니다. (예: 1, 3, 5)',
    '[JPG로 변환하기] 단추를 누릅니다.',
    '단일 페이지 결과는 직접 JPG로 떨어지며, 여러 장인 경우 압축 ZIP 파일로 포장되어 다운로드됩니다.'
  ];

  const caveats = isEn ? [
    'Vector text is rendered at 2.0x scale to preserve clarity. This rendering cycle may take slightly longer for larger files.',
    'Text selection and copying functions are not supported within the output JPG image files.',
    'Protected or encrypted PDF files cannot be processed due to reading and canvas rendering restrictions.'
  ] : [
    '렌더링 해상도를 2배(Scale 2.0)로 선명하게 변환하므로 글씨 깨짐을 최소화합니다. 이에 따라 연산 처리 시간이 다소 걸릴 수 있습니다.',
    '변환된 결과 이미지(JPG)에서는 마우스 텍스트 드래그(글자 복사) 기능이 제한됩니다.',
    '비밀번호가 걸려 있는 보안 문서는 이미지 렌더링을 시도할 수 없어 작동이 불가합니다.'
  ];

  const faqs = isEn ? [
    {
      question: 'Will there be severe quality loss during the PDF to JPG conversion?',
      answer: 'No. PDFFlow renders vector elements at a high 2.0x scale (approximately 150-200 DPI equivalent), ensuring that the output text remains crisp and highly legible.'
    },
    {
      question: 'How are the output image filenames structured in the ZIP archive?',
      answer: 'When multiple pages are exported, they are sequential inside the ZIP archive with filenames like "page-1.jpg", "page-2.jpg", etc., making them easy to sort.'
    },
    {
      question: 'Can I convert a PDF containing hundreds of pages locally?',
      answer: 'Yes. However, because processing runs entirely inside your browser session, extremely large page counts may slow down or heat up your device. We recommend rendering in batches of 30 pages for optimal performance.'
    }
  ] : [
    {
      question: 'PDF를 이미지로 변환할 때 화질 저하가 심한가요?',
      answer: 'PDFFlow는 최적화된 고화질 배율(Scale 2.0, 약 150~200 DPI 수준)로 벡터 텍스트를 이미지 픽셀로 변환하기 때문에, 가시적으로 인쇄물 수준의 우수한 선명도를 지닌 JPG를 만나실 수 있습니다.'
    },
    {
      question: '추출된 개별 이미지 파일들의 파일명은 어떻게 되나요?',
      answer: '여러 페이지를 일괄 변환하여 압축 다운로드할 시, 파일들은 ZIP 내부에서 "page-1.jpg", "page-2.jpg" 와 같이 숫자가 순서대로 적혀 저장되므로 파악하기 매우 용이합니다.'
    },
    {
      question: '한 번에 수백 장의 PDF를 변환하는 것도 기기 내에서 처리되나요?',
      answer: '그렇습니다. 외부 서버를 거치지 않고 사용자 디바이스 성능만을 사용하기 때문에, 극도로 많은 페이지를 변환할 때는 CPU가 가열되어 다소 시간이 지연될 수 있습니다. 30장 단위로 분할 렌더링하는 것을 권장합니다.'
    }
  ];

  const relatedTools = isEn ? [
    { name: 'JPG to PDF', path: '/en/jpg-to-pdf', desc: 'Combine multiple images into a single PDF document.' },
    { name: 'Extract PDF Pages', path: '/en/pdf-extract-pages', desc: 'Extract specific pages and compile them into a new PDF.' }
  ] : [
    { name: 'JPG PDF 변환', path: '/jpg-to-pdf', desc: '여러 장의 촬영 이미지를 PDF 문서로 병합합니다.' },
    { name: 'PDF 페이지 추출', path: '/pdf-extract-pages', desc: '필요한 페이지만 골라 새로운 PDF로 조립합니다.' }
  ];

  return (
    <DocLayout
      seoTitle={isEn ? "PDF to JPG - Convert PDF pages to JPG online | PDFFlow" : "PDF JPG 변환 - PDF 페이지를 이미지로 저장 | PDFFlow"}
      seoDesc={isEn ? "Convert PDF pages to JPG images in your browser. Download one image or package multiple selected pages in a ZIP archive." : "PDF 페이지를 브라우저에서 JPG 이미지로 변환하세요. 여러 페이지는 ZIP 파일로 내려받을 수 있습니다."}
      title={isEn ? "PDF to JPG" : "PDF JPG 변환"}
      description={isEn ? "Render selected PDF pages as high-resolution JPG images and download them individually or in a ZIP." : "선택한 PDF 페이지를 고해상도 JPG 이미지로 렌더링하고 개별 파일 또는 ZIP으로 저장하세요."}
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
          <div className="text-4xl mb-4">📷</div>
          <p className="text-sm font-semibold text-slate-800">
            {isEn ? 'Drag and drop a PDF file here, or click to browse' : '이미지로 변환할 PDF 파일을 드래그하거나 클릭하여 추가하세요'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isEn ? 'Add a single PDF file to render pages.' : '개별 페이지 렌더링을 위해 단일 PDF 파일을 등록합니다.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-semibold text-slate-700">
              {isEn ? 'Target PDF File' : '변환 대기 대상'}
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
              {isEn ? 'Conversion Options' : '변환 옵션 설정'}
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                <input
                  type="radio"
                  name="convertMode"
                  value="all"
                  checked={convertMode === 'all'}
                  onChange={() => setConvertMode('all')}
                  className="mt-1 accent-violet-600"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {isEn ? 'Convert all pages' : '모든 페이지 변환'}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {isEn ? `Extract all ${file.pageCount} pages as JPG images.` : `전체 ${file.pageCount} 페이지를 각각 JPG로 추출합니다.`}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                <input
                  type="radio"
                  name="convertMode"
                  value="range"
                  checked={convertMode === 'range'}
                  onChange={() => setConvertMode('range')}
                  className="mt-1 accent-violet-600"
                />
                <div className="w-full">
                  <span className="text-sm font-semibold text-slate-800 block">
                    {isEn ? 'Convert specific pages' : '특정 페이지 지정'}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {isEn ? 'Render only selected page numbers or ranges as JPG images.' : '원하는 페이지 번호 또는 구간만 JPG 이미지로 렌더링합니다.'}
                  </span>
                  
                  {convertMode === 'range' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder={isEn ? `e.g. 1, 3, 5-7 (Total: 1-${file.pageCount})` : `예: 1, 3, 5-7 (전체: 1-${file.pageCount})`}
                        value={rangeInput}
                        onChange={(e) => setRangeInput(e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
                      />
                      <span className="text-[11px] text-slate-400 block mt-1">
                        {isEn ? 'Use commas (,) and hyphens (-) to specify page numbers.' : '콤마(,)와 하이픈(-)을 조합하여 페이지 번호를 기재하세요.'}
                      </span>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 items-center">
            {processing && (
              <span className="text-xs text-slate-500 font-medium animate-pulse">
                {progressText}
              </span>
            )}
            
            <button
              onClick={executeConvert}
              disabled={processing}
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {isEn ? 'Converting...' : '변환 중...'}
                </>
              ) : (
                isEn ? 'Convert to JPG' : 'JPG로 변환하기'
              )}
            </button>
          </div>
        </div>
      )}
    </DocLayout>
  );
};

export default PdfToJpg;
