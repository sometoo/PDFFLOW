import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import DocLayout from '../../components/DocLayout';
import { copyPdfArrayBuffer, copyPdfData, inspectPdf, stripPdfMetadata, ProtectedPdfError } from '../../lib/pdf';

interface CleanupFile {
  file: File;
  name: string;
  size: number;
  pageCount: number;
  buffer: ArrayBuffer;
}

const RemovePdfMetadata: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  const [file, setFile] = useState<CleanupFile | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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

  const executeCleanup = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const cleaned = await stripPdfMetadata(copyPdfData(file.buffer));
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      downloadFile(cleaned, `${baseName}_metadata_removed.pdf`, 'application/pdf');
    } catch (err) {
      console.error(err);
      alert(isEn ? 'An error occurred while removing PDF metadata.' : 'PDF 메타데이터 제거 도중 에러가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadFile = (data: Blob | Uint8Array, filename: string, contentType: string) => {
    const blob = data instanceof Blob ? data : new Blob([copyPdfArrayBuffer(data)], { type: contentType });
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
    'Drag and drop the PDF you want to clean into the upload zone or click to select.',
    'The tool rebuilds the document from its pages in browser memory, so recorded document properties are not carried over.',
    'Click the [Remove Metadata] button.',
    'Download the cleaned copy and open the PDF Metadata Viewer to confirm that the properties are gone.'
  ] : [
    '정리하려는 PDF 파일을 드래그 앤 드롭 영역에 놓거나 클릭하여 선택합니다.',
    '도구는 페이지 내용을 브라우저 메모리에서 새 문서로 다시 구성하므로 기록된 문서 정보가 함께 담기지 않습니다.',
    '[메타데이터 제거] 버튼을 누릅니다.',
    '정리된 사본을 내려받은 뒤 PDF 메타데이터 확인 도구로 정보가 사라졌는지 점검합니다.'
  ];

  const caveats = isEn ? [
    'The result is a rebuilt document. Document-level extras such as bookmarks, digital signatures, and some form field definitions may not survive the rebuild.',
    'The new file carries only minimal technical values, so viewers will show an empty title and author.',
    'The page content itself is not re-compressed or altered, but always keep a backup of the original before cleaning.'
  ] : [
    '결과 파일은 문서를 새로 구성한 사본입니다. 목차, 전자서명, 일부 양식 필드 같은 문서 수준 기능은 재구성 과정에서 유지되지 않을 수 있습니다.',
    '새 파일에는 최소한의 기술 정보만 남으므로 뷰어에서 제목과 작성자가 비어 있게 표시됩니다.',
    '페이지 내용 자체는 다시 압축되거나 변경되지 않지만, 정리 전에 원본을 반드시 백업해 두세요.'
  ];

  const faqs = isEn ? [
    {
      question: 'Which properties are removed from the file?',
      answer: 'The document information record — title, author, subject, keywords, creation and modification dates, the creating application, and the original producer string — is not carried into the result. The cleaned copy is rebuilt from the page contents, so document metadata recorded in the catalog or trailer is dropped as well.'
    },
    {
      question: 'Does removing metadata change how my pages look?',
      answer: 'No. Pages are copied as-is, so text, images, and vector graphics keep their original rendering. What changes is the hidden document-level information, plus features that live outside the pages such as bookmarks and signatures.'
    },
    {
      question: 'Will the cleaned PDF still be searchable and selectable?',
      answer: 'Yes. The text layer is part of the page content and is copied untouched, so searching and copying text in the cleaned file works the same as in the original.'
    }
  ] : [
    {
      question: '파일에서 어떤 정보가 제거되나요?',
      answer: '문서 정보 레코드(제목, 작성자, 주제, 키워드, 생성·수정 날짜, 작성 응용 프로그램, 원본 생성기 정보)가 결과 파일에 담기지 않습니다. 결과 파일은 페이지 내용으로 새로 구성되므로 문서 카탈로그나 트레일러에 기록된 문서 메타데이터도 함께 사라집니다.'
    },
    {
      question: '메타데이터를 지우면 페이지 모양이 달라지나요?',
      answer: '아니요. 페이지는 그대로 복사되므로 텍스트, 이미지, 벡터 그래픽은 원본과 동일하게 렌더링됩니다. 달라지는 것은 숨겨진 문서 수준 정보와 목차·서명처럼 페이지 밖에 있는 기능입니다.'
    },
    {
      question: '정리된 PDF에서도 텍스트 검색과 복사가 되나요?',
      answer: '네. 텍스트 레이어는 페이지 콘텐츠의 일부이므로 그대로 복사되며, 정리된 파일에서도 원본과 같은 방식으로 검색과 복사가 가능합니다.'
    }
  ];

  const relatedTools = isEn ? [
    { name: 'PDF Metadata Viewer', path: '/en/pdf-metadata-viewer', desc: 'Inspect what a PDF records before and after cleaning.' },
    { name: 'Merge PDF', path: '/en/pdf-merge', desc: 'Combine cleaned documents into a single file.' }
  ] : [
    { name: 'PDF 메타데이터 확인', path: '/pdf-metadata-viewer', desc: '정리 전후에 어떤 정보가 기록됐는지 확인합니다.' },
    { name: 'PDF 합치기', path: '/pdf-merge', desc: '정리한 문서 여러 개를 하나로 병합합니다.' }
  ];

  return (
    <DocLayout
      seoTitle={isEn ? 'Remove PDF Metadata - Delete document properties online | PDFFlow' : 'PDF 메타데이터 제거 - 문서 정보 삭제 도구 | PDFFlow'}
      seoDesc={isEn ? 'Strip title, author, and producer metadata from your PDF in the browser and download a cleaned copy without uploading the file.' : 'PDF에 기록된 제목, 작성자, 생성 프로그램 등 문서 정보를 브라우저에서 제거하고 새 파일로 저장합니다. 업로드 없이 안전하게 정리합니다.'}
      title={isEn ? 'Remove PDF Metadata' : 'PDF 메타데이터 제거'}
      description={isEn ? 'Rebuild your PDF without the recorded document properties and download a cleaned copy.' : '기록된 문서 정보 없이 깨끗한 사본을 만들어 바로 내려받으세요.'}
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
          <div className="text-4xl mb-4">🧹</div>
          <p className="text-sm font-semibold text-slate-800">
            {isEn ? 'Drag and drop a PDF file here, or click to browse' : '정리할 PDF 파일을 드래그하거나 클릭하여 추가하세요'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isEn ? 'A cleaned copy is generated locally and downloaded to your device.' : '정리된 사본이 브라우저에서 생성되어 기기에 저장됩니다.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-semibold text-slate-700">
              {isEn ? 'Target PDF File' : '정리 대상 파일'}
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
              {isEn ? 'What will be removed' : '제거되는 항목'}
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              {(isEn
                ? ['Title, author, subject, and keywords', 'Creation and modification dates', 'Creating application and PDF producer record']
                : ['제목, 작성자, 주제, 키워드', '생성 및 수정 날짜', '작성 응용 프로그램과 PDF 생성기 정보']
              ).map((item) => (
                <li key={item} className="flex gap-2"><span className="text-violet-600">✓</span><span>{item}</span></li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              {isEn
                ? 'Producer and creator metadata are removed from the PDF. Title, author, subject, keywords, creation and modification dates may be preserved depending on the source PDF. Bookmarks, digital signatures, and form fields are document-level features and may not be preserved in the rebuilt copy.'
                : '생성자(producer) 및 제작자(creator) 메타데이터가 PDF에서 제거됩니다. 제목(title), 작성자(author), 주제(subject), 키워드(keywords), 생성·수정 날짜는 소스 PDF에 따라 보존될 수 있습니다. 목차, 전자서명, 양식 필드는 문서 수준 기능이므로 재구성된 사본에 유지되지 않을 수 있습니다.'}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={executeCleanup}
              disabled={processing}
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {isEn ? 'Cleaning...' : '정리 중...'}
                </>
              ) : (
                isEn ? 'Remove Metadata' : '메타데이터 제거'
              )}
            </button>
          </div>
        </div>
      )}
    </DocLayout>
  );
};

export default RemovePdfMetadata;
