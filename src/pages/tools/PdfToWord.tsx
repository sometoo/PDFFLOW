import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import DocLayout from '../../components/DocLayout';
import type { PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import { loadPdfJs } from '../../lib/pdfjs';
import { copyPdfArrayBuffer, copyPdfData, inspectPdf, ProtectedPdfError } from '../../lib/pdf';
import { groupItemsIntoLines, groupLinesIntoParagraphs, buildDocx, type PdfTextItem } from '../../lib/wordExport';

interface WordFile {
  file: File;
  name: string;
  size: number;
  pageCount: number;
  buffer: ArrayBuffer;
}

const MIN_CHARS_PER_PAGE = 10;

const PdfToWord: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  const [file, setFile] = useState<WordFile | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
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
      setProgressText('');
    }
  };

  const extractPageParagraphs = async (page: PDFPageProxy) => {
    const content = await page.getTextContent();
    const items: PdfTextItem[] = [];

    for (const item of content.items) {
      if (!('str' in item)) continue;
      const fontSize = Math.hypot(item.transform[2], item.transform[3]) || item.height;
      items.push({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        fontSize
      });
    }

    const viewport = page.getViewport({ scale: 1 });
    return {
      section: { widthPt: viewport.width, heightPt: viewport.height },
      paragraphs: groupLinesIntoParagraphs(groupItemsIntoLines(items))
    };
  };

  const executeConvert = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const pdfjsLib = await loadPdfJs();
      const loadingTask = pdfjsLib.getDocument({ data: copyPdfData(file.buffer) });
      const pdf = await loadingTask.promise;

      const sections: { widthPt: number; heightPt: number }[] = [];
      const pageParagraphs: string[][] = [];
      let totalChars = 0;

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        setProgressText(isEn
          ? `Extracting text: page ${pageNumber} of ${pdf.numPages}...`
          : `텍스트 추출 중: ${pdf.numPages}페이지 중 ${pageNumber}페이지...`);

        const page = await pdf.getPage(pageNumber);
        const extracted = await extractPageParagraphs(page);
        sections.push(extracted.section);
        pageParagraphs.push(extracted.paragraphs);

        for (const paragraph of extracted.paragraphs) {
          totalChars += paragraph.replace(/\s/g, '').length;
        }
        page.cleanup();
      }

      if (totalChars < pdf.numPages * MIN_CHARS_PER_PAGE) {
        alert(isEn
          ? 'This PDF contains little or no selectable text, so it looks like a scanned or image-based document. The current converter supports text-based PDFs only.'
          : '이 PDF는 선택 가능한 텍스트가 거의 없어 스캔 또는 이미지 문서로 보입니다. 현재 변환 기능은 텍스트 기반 PDF만 지원합니다.');
        return;
      }

      setProgressText(isEn ? 'Building DOCX document...' : 'DOCX 문서 생성 중...');
      const docxBytes = await buildDocx(pageParagraphs, sections[0] ?? { widthPt: 595, heightPt: 842 });
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      downloadFile(new Blob([copyPdfArrayBuffer(docxBytes)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), `${baseName}.docx`);
    } catch (err) {
      console.error(err);
      alert(isEn ? 'An error occurred during PDF to Word conversion.' : 'PDF를 Word로 변환하는 도중 에러가 발생했습니다.');
    } finally {
      setProcessing(false);
      setProgressText('');
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
  };

  const instructions = isEn ? [
    'Drag and drop the text-based PDF you want to convert into the upload zone or click to select.',
    'Click the [Convert to Word] button. The text layer is read page by page in your browser.',
    'Line positions are used to rebuild paragraphs, and each PDF page becomes a Word page of the same size.',
    'The generated DOCX file downloads automatically to your device.'
  ] : [
    '변환하려는 텍스트 기반 PDF 파일을 드래그 앤 드롭 영역에 놓거나 클릭하여 선택합니다.',
    '[Word로 변환] 버튼을 누릅니다. 브라우저가 페이지별로 텍스트 레이어를 읽습니다.',
    '글자 좌표를 기준으로 문단을 다시 구성하고, 각 PDF 페이지는 같은 크기의 Word 페이지가 됩니다.',
    '생성된 DOCX 파일이 자동으로 기기에 다운로드됩니다.'
  ];

  const caveats = isEn ? [
    'Only text-based PDFs are supported. Scanned or image-only documents contain no text layer and are rejected with a notice.',
    'Tables, columns, images, and multi-column layouts are simplified into sequential paragraphs, so complex layouts need manual touch-up in Word.',
    'Fonts, colors, and exact character spacing are not replicated. The goal is an editable document, not a pixel-perfect copy.'
  ] : [
    '텍스트 기반 PDF만 지원합니다. 스캔 또는 이미지 문서는 텍스트 레이어가 없어 안내 메시지와 함께 변환되지 않습니다.',
    '표, 다단, 이미지, 복잡한 레이아웃은 순차적 문단으로 단순화되므로 Word에서 수동 정리가 필요할 수 있습니다.',
    '글꼴, 색상, 정밀한 자간은 재현되지 않습니다. 목표는 화질 복제가 아니라 편집 가능한 문서입니다.'
  ];

  const faqs = isEn ? [
    {
      question: 'Can scanned PDFs be converted to Word?',
      answer: 'Not with the current converter. A scanned PDF stores pictures of pages instead of text, so there is nothing to extract without OCR. If your file has very little selectable text, the tool detects it and explains that it supports text-based PDFs only.'
    },
    {
      question: 'How does the converter rebuild paragraphs?',
      answer: 'For each page, text items are grouped into lines using their vertical positions, then lines are grouped into paragraphs when the vertical spacing between them is larger than the surrounding line spacing. The result follows the reading order of the page rather than guessing at design elements.'
    },
    {
      question: 'Is the Word file generated on a server?',
      answer: 'No. The DOCX package is assembled in your browser memory from the text extracted in your browser. The PDF is not uploaded, and the converted file is saved directly to your device.'
    }
  ] : [
    {
      question: '스캔한 PDF도 Word로 변환되나요?',
      answer: '현재 변환기는 지원하지 않습니다. 스캔 PDF는 페이지를 사진으로 저장한 것이어서 OCR 없이는 텍스트를 꺼낼 수 없습니다. 선택 가능한 텍스트가 거의 없는 파일은 도구가 이를 감지해 텍스트 기반 PDF만 지원한다는 안내를 표시합니다.'
    },
    {
      question: '문단은 어떻게 다시 만들어지나요?',
      answer: '각 페이지에서 글자 항목을 세로 좌표 기준으로 줄로 묶고, 줄 사이 간격이 주변 줄 간격보다 훨씬 크면 새 문단으로 구분합니다. 결과는 디자인 요소를 추측하지 않고 페이지의 읽기 순서를 따릅니다.'
    },
    {
      question: 'Word 파일이 서버에서 만들어지나요?',
      answer: '아니요. DOCX 패키지는 브라우저에서 추출한 텍스트로 브라우저 메모리 안에서 조립됩니다. PDF가 업로드되지 않으며 변환 결과 파일은 바로 사용자 기기에 저장됩니다.'
    }
  ];

  const relatedTools = isEn ? [
    { name: 'PDF to JPG', path: '/en/pdf-to-jpg', desc: 'Render PDF pages into high-resolution JPG images.' },
    { name: 'PDF Metadata Viewer', path: '/en/pdf-metadata-viewer', desc: 'Check the properties recorded in the source PDF.' }
  ] : [
    { name: 'PDF JPG 변환', path: '/pdf-to-jpg', desc: 'PDF 페이지를 고화질 JPG 이미지로 렌더링합니다.' },
    { name: 'PDF 메타데이터 확인', path: '/pdf-metadata-viewer', desc: '원본 PDF에 기록된 문서 정보를 먼저 확인합니다.' }
  ];

  return (
    <DocLayout
      seoTitle={isEn ? 'PDF to Word - Convert PDF to editable DOCX online | PDFFlow' : 'PDF to Word - PDF를 편집 가능한 Word(DOCX)로 변환 | PDFFlow'}
      seoDesc={isEn ? 'Convert text-based PDFs into editable Word (DOCX) documents in your browser. No uploads; paragraphs are rebuilt locally from the PDF text layer.' : '텍스트 기반 PDF를 브라우저에서 편집 가능한 DOCX 문서로 변환합니다. 파일을 서버에 올리지 않고 문단 구조를 살려 Word로 내려받으세요.'}
      title={isEn ? 'PDF to Word' : 'PDF Word 변환'}
      description={isEn ? 'Turn a text-based PDF into an editable Word document, processed entirely in your browser.' : '텍스트 기반 PDF를 편집 가능한 Word 문서로 바꿉니다. 모든 처리는 브라우저에서 이루어집니다.'}
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
          <div className="text-4xl mb-4">📝</div>
          <p className="text-sm font-semibold text-slate-800">
            {isEn ? 'Drag and drop a PDF file here, or click to browse' : '변환할 PDF 파일을 드래그하거나 클릭하여 추가하세요'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isEn ? 'Text-based PDFs are converted into an editable DOCX file.' : '텍스트 기반 PDF가 편집 가능한 DOCX 파일로 변환됩니다.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-semibold text-slate-700">
              {isEn ? 'Target PDF File' : '변환 대상 파일'}
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

          <div className="rounded-xl border border-slate-200 p-5 bg-white">
            <h3 className="text-sm font-bold text-slate-900">
              {isEn ? 'Conversion notes' : '변환 방식 요약'}
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              {(isEn
                ? ['Text layer is read locally — no uploads', 'Line and paragraph structure is rebuilt from text positions', 'Scanned or image-only PDFs are detected and rejected']
                : ['텍스트 레이어를 브라우저에서 읽음 — 업로드 없음', '글자 위치를 기준으로 줄과 문단 구조를 재구성', '스캔·이미지 문서는 자동 감지 후 안내']
              ).map((item) => (
                <li key={item} className="flex gap-2"><span className="text-violet-600">✓</span><span>{item}</span></li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              onClick={executeConvert}
              disabled={processing}
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {progressText || (isEn ? 'Converting...' : '변환 중...')}
                </>
              ) : (
                isEn ? 'Convert to Word' : 'Word로 변환'
              )}
            </button>
          </div>
        </div>
      )}
    </DocLayout>
  );
};

export default PdfToWord;
