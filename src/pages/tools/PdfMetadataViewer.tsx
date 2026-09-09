import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import DocLayout from '../../components/DocLayout';
import { copyPdfArrayBuffer, inspectPdf, readPdfMetadata, ProtectedPdfError, type PdfMetadataView } from '../../lib/pdf';

interface ViewerFile {
  file: File;
  name: string;
  size: number;
  pageCount: number;
  buffer: ArrayBuffer;
  metadata: PdfMetadataView;
}

const PdfMetadataViewer: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  const [file, setFile] = useState<ViewerFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);

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
      const metadata = await readPdfMetadata(copyPdfArrayBuffer(inspected.bytes));

      setFile({
        file: selectedFile,
        name: selectedFile.name,
        size: selectedFile.size,
        pageCount: inspected.pageCount,
        buffer: copyPdfArrayBuffer(inspected.bytes),
        metadata
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
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | null) => {
    if (!date) return isEn ? 'Not set' : '설정되지 않음';
    return date.toLocaleString(isEn ? 'en-US' : 'ko-KR');
  };

  const notSet = isEn ? 'Not set' : '설정되지 않음';
  const metadata = file?.metadata;

  const rows: { label: string; value: string }[] | undefined = metadata ? [
    { label: isEn ? 'Title' : '제목', value: metadata.title || notSet },
    { label: isEn ? 'Author' : '작성자', value: metadata.author || notSet },
    { label: isEn ? 'Subject' : '주제', value: metadata.subject || notSet },
    { label: isEn ? 'Keywords' : '키워드', value: metadata.keywords || notSet },
    { label: isEn ? 'Created' : '생성 날짜', value: formatDate(metadata.creationDate) },
    { label: isEn ? 'Modified' : '수정 날짜', value: formatDate(metadata.modificationDate) },
    { label: isEn ? 'Application' : '응용 프로그램', value: metadata.creator || notSet },
    { label: isEn ? 'PDF Producer' : 'PDF 생성기', value: metadata.producer || notSet },
    { label: isEn ? 'Pages' : '페이지 수', value: String(file?.pageCount ?? 0) },
    { label: isEn ? 'File size' : '파일 크기', value: formatBytes(file?.size ?? 0) }
  ] : undefined;

  const instructions = isEn ? [
    'Drag and drop the PDF file you want to inspect into the upload zone or click to select.',
    'The document properties are read immediately after the file is loaded.',
    'Review the title, author, dates, producer, and other recorded information.',
    'Use the "Change File" button to inspect another document.'
  ] : [
    '확인하려는 PDF 파일을 드래그 앤 드롭 영역에 놓거나 클릭하여 선택합니다.',
    '파일이 로드되는 즉시 문서 정보가 화면에 표시됩니다.',
    '제목, 작성자, 생성·수정 날짜, 생성 프로그램 등 기록된 정보를 확인합니다.',
    '"파일 변경" 버튼으로 다른 문서를 다시 확인할 수 있습니다.'
  ];

  const caveats = isEn ? [
    'Only properties stored by the PDF itself are shown. This tool cannot recover information that was never recorded in the file.',
    'Files exported by some applications leave most fields empty. An empty result means the property is absent, not that the tool failed.',
    'The document is read in your browser memory only. Nothing is uploaded, so protected (password-encrypted) PDFs cannot be opened here.'
  ] : [
    '표시되는 항목은 PDF 파일 자체에 기록된 정보뿐입니다. 파일에 기록되지 않은 정보는 이 도구로도 복원할 수 없습니다.',
    '일부 응용 프로그램이 내보낸 PDF는 대부분의 정보가 비어 있습니다. 값이 비어 있으면 해당 정보가 기록되지 않은 것이지 도구 오류가 아닙니다.',
    '문서는 브라우저 메모리에서만 읽고 서버로 전송되지 않지만, 암호로 보호된 PDF는 이 도구에서 열 수 없습니다.'
  ];

  const faqs = isEn ? [
    {
      question: 'What information is stored in PDF metadata?',
      answer: 'PDF files can carry a document information record with the title, author, subject, keywords, creation and modification dates, the application used, and the library or driver that produced the file. Cameras, scanners, and word processors often write this data automatically when the PDF is first created.'
    },
    {
      question: 'Is my document uploaded anywhere while I inspect it?',
      answer: 'No. The file is read with the browser\'s own file API and parsed in your browser memory. The inspection result you see is computed locally, and the document never leaves your device.'
    },
    {
      question: 'Why would I check metadata before sharing a PDF?',
      answer: 'Metadata can reveal details you did not intend to publish, such as your user name, the original file name, editing tools, or the document creation date. Checking it first lets you decide whether to clean the file with the Remove PDF Metadata tool before sending it out.'
    }
  ] : [
    {
      question: 'PDF 메타데이터에는 어떤 정보가 기록되어 있나요?',
      answer: 'PDF 파일에는 제목, 작성자, 주제, 키워드, 생성·수정 날짜, 작성에 사용된 응용 프로그램, 파일을 만든 변환 라이브러리나 드라이버 정보가 기록될 수 있습니다. 카메라, 스캐너, 워드 프로세서는 PDF를 처음 만들 때 이런 정보를 자동으로 남기는 경우가 많습니다.'
    },
    {
      question: '메타데이터를 확인하는 동안 문서가 서버로 전송되나요?',
      answer: '아니요. 파일은 브라우저의 파일 API로 읽혀 브라우저 메모리에서 해석됩니다. 화면에 보이는 확인 결과도 모두 로컬에서 계산되며 문서가 사용자 기기를 떠나지 않습니다.'
    },
    {
      question: 'PDF를 공유하기 전에 메타데이터를 확인하면 무엇이 좋은가요?',
      answer: '메타데이터에는 사용자 이름, 원본 파일 이름, 편집 도구, 작성 시점 등 공개할 의도가 없던 정보가 들어 있을 수 있습니다. 미리 확인하면 PDF 메타데이터 제거 도구로 정리한 뒤 보낼지 판단할 수 있습니다.'
    }
  ];

  const relatedTools = isEn ? [
    { name: 'Remove PDF Metadata', path: '/en/pdf-remove-metadata', desc: 'Strip recorded properties and download a cleaned copy.' },
    { name: 'PDF to Word', path: '/en/pdf-to-word', desc: 'Turn a text-based PDF into an editable DOCX document.' }
  ] : [
    { name: 'PDF 메타데이터 제거', path: '/pdf-remove-metadata', desc: '기록된 문서 정보를 지우고 정리된 사본을 저장합니다.' },
    { name: 'PDF Word 변환', path: '/pdf-to-word', desc: '텍스트 기반 PDF를 편집 가능한 DOCX로 바꿉니다.' }
  ];

  return (
    <DocLayout
      seoTitle={isEn ? 'PDF Metadata Viewer - Inspect document properties online | PDFFlow' : 'PDF 메타데이터 확인 - 문서 정보 조회 도구 | PDFFlow'}
      seoDesc={isEn ? 'View PDF title, author, creation dates, and producer information in your browser. Inspect PDF metadata locally without uploading your file.' : 'PDF에 기록된 제목, 작성자, 생성 날짜 등 문서 정보를 브라우저에서 바로 확인하세요. 파일을 업로드하지 않고 메타데이터를 안전하게 조회합니다.'}
      title={isEn ? 'PDF Metadata Viewer' : 'PDF 메타데이터 확인'}
      description={isEn ? 'Inspect the properties recorded inside a PDF file before you share it.' : 'PDF 파일 안에 기록된 문서 정보를 공유 전에 미리 확인해보세요.'}
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
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-sm font-semibold text-slate-800">
            {processing
              ? (isEn ? 'Reading document properties...' : '문서 정보를 읽는 중...')
              : (isEn ? 'Drag and drop a PDF file here, or click to browse' : '확인할 PDF 파일을 드래그하거나 클릭하여 추가하세요')}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isEn ? 'The document properties are read locally and shown instantly.' : '문서 정보를 브라우저에서 읽어 즉시 표시합니다.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-semibold text-slate-700">
              {isEn ? 'Inspected File' : '확인한 파일'}
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

          <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {rows && rows.map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 sm:w-40 sm:shrink-0">
                  {row.label}
                </dt>
                <dd className={`text-sm font-medium break-all ${row.value === notSet ? 'text-slate-400' : 'text-slate-900'}`}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="text-xs text-slate-500">
            {isEn
              ? 'This read-only view does not modify the file. To delete the recorded properties, use the Remove PDF Metadata tool.'
              : '이 화면은 파일을 수정하지 않는 읽기 전용 조회입니다. 기록된 정보를 삭제하려면 PDF 메타데이터 제거 도구를 사용하세요.'}
          </p>
        </div>
      )}
    </DocLayout>
  );
};

export default PdfMetadataViewer;
