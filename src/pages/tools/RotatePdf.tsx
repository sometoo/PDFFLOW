import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { degrees } from 'pdf-lib';
import DocLayout from '../../components/DocLayout';
import { copyPdfArrayBuffer, loadPdfForEditing, inspectPdf, ProtectedPdfError } from '../../lib/pdf';

interface RotateFile {
  file: File;
  name: string;
  size: number;
  pageCount: number;
  buffer: ArrayBuffer;
}

const RotatePdf: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  const [file, setFile] = useState<RotateFile | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [rotationAngle, setRotationAngle] = useState<90 | 180 | 270>(90);

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
  };

  const executeRotation = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const pdfDoc = await loadPdfForEditing(file.buffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        const newRotation = (currentRotation + rotationAngle) % 360;
        page.setRotation(degrees(newRotation));
      });

      const rotatedPdfBytes = await pdfDoc.save();
      const blob = new Blob([copyPdfArrayBuffer(rotatedPdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'rotated.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(isEn ? 'An unexpected error occurred during PDF rotation.' : 'PDF 회전 처리 중 예기치 못한 에러가 발생했습니다.');
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
    'Drag and drop the single PDF file you want to rotate into the upload zone or click to select.',
    'Choose your rotation angle (90° clockwise, 180°, or 90° counter-clockwise).',
    'Review the configuration settings.',
    'Click the [Rotate PDF] button.',
    'The rotated PDF file copy will download automatically as rotated.pdf.'
  ] : [
    '회전시킬 단일 PDF 파일을 드래그 앤 드롭 영역에 놓거나 클릭하여 로드합니다.',
    '회전시킬 방향 각도를 선택합니다 (시계방향 90도, 180도, 또는 270도).',
    '설정 내용이 맞는지 최종 대조합니다.',
    '[PDF 회전하기] 단추를 누릅니다.',
    '회전 적용이 완료된 결과 사본 파일이 rotated.pdf 이름으로 자동 저장됩니다.'
  ];

  const caveats = isEn ? [
    'The selected rotation is applied to all pages of the document simultaneously.',
    'This website processes document rotation entirely inside your browser session using local CPU resources.',
    'Documents with edit restrictions or encryption locks cannot be rotated using this local editor library.'
  ] : [
    '해당 회전 옵션은 특정 페이지만 회전하는 것이 아니라 문서의 전체 페이지에 일괄 적용됩니다.',
    '본 사이트의 회전 처리는 사용자 디바이스의 CPU 자원을 기반으로 하여 완전히 local로 돌아갑니다.',
    '암호 잠금이 걸린 문서는 수정 권한을 얻을 수 없어 회전 작업이 즉각 제한됩니다.'
  ];

  const faqs = isEn ? [
    {
      question: 'Will rotating pages corrupt the layout or text annotations?',
      answer: 'The operation changes each page rotation value rather than rasterizing the page, so ordinary text and vector graphics are not re-compressed. Always inspect annotations, form fields, and signed documents afterward.'
    },
    {
      question: 'Does rotating a document multiple times reduce the quality?',
      answer: 'Rotation does not intentionally re-compress page graphics. Repeated edits can still affect document-level metadata, forms, or signatures, so use the source file when changing direction again.'
    },
    {
      question: 'How do I rotate pages counter-clockwise by 90 degrees?',
      answer: 'Choose the "90° Left" (or 270° clockwise) rotation option. It yields the exact same logical result as a 90° counter-clockwise rotation.'
    }
  ] : [
    {
      question: '회전을 시키면 텍스트의 레이아웃이 밀리거나 손상되나요?',
      answer: '일반적인 텍스트와 벡터 그래픽을 이미지로 다시 압축하지 않고 페이지 회전 값을 바꿉니다. 다만 주석, 양식, 전자서명이 있는 문서는 결과를 다시 확인해야 합니다.'
    },
    {
      question: '회전을 여러 번 수행하면 점차 화질이 떨어지나요?',
      answer: '그렇지 않습니다. 이미지 재인코딩 방식과 달리 단순 메타 각도 정보 변경에 국한되므로 10번 회전을 시켜도 화질 저하는 0%에 가깝습니다.'
    },
    {
      question: '반시계방향으로 90도 돌리려면 어떻게 지정해야 하나요?',
      answer: '시계방향 270도 회전은 방향상 반시계방향 90도 회전과 같습니다. 저장 후 페이지 방향과 주석 위치를 확인하세요.'
    }
  ];

  const relatedTools = isEn ? [
    { name: 'Merge PDF', path: '/en/pdf-merge', desc: 'Combine multiple PDF files into one.' },
    { name: 'Split PDF', path: '/en/pdf-split', desc: 'Split a PDF document into separate page ranges.' }
  ] : [
    { name: 'PDF 합치기', path: '/pdf-merge', desc: '여러 개의 보고서 파일을 하나로 묶습니다.' },
    { name: 'PDF 분할', path: '/pdf-split', desc: '페이지 구간별로 다수 파일로 잘라 냅니다.' }
  ];

  return (
    <DocLayout
      seoTitle={isEn ? "Rotate PDF - Rotate PDF pages online for free | PDFFlow" : "PDF 회전 - PDF 페이지 방향 변경 | PDFFlow"}
      seoDesc={isEn ? "Rotate PDF pages online for free. Adjust orientation by 90, 180, or 270 degrees. Secure, browser-side local processing." : "PDF 페이지를 90도, 180도, 270도로 회전해 새 파일로 저장할 수 있습니다."}
      title={isEn ? "Rotate PDF" : "PDF 회전"}
      description={isEn ? "Change the page orientation of your PDF files easily and securely." : "잘못 정렬되었거나 가로/세로 방향이 어긋난 PDF 문서의 전체 페이지 각도를 빠르게 회전해 교정하세요."}
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
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-sm font-semibold text-slate-800">
            {isEn ? 'Drag and drop a PDF file here, or click to browse' : '회전할 PDF 파일을 드래그하거나 클릭하여 추가하세요'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isEn ? 'Add a single PDF file to rotate all pages.' : '전체 페이지 회전을 위해 단일 PDF 파일을 등록합니다.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-semibold text-slate-700">
              {isEn ? 'Target PDF File' : '회전 대기 대상'}
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
              {isEn ? 'Select Rotation Angle' : '회전 각도 선택'}
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRotationAngle(90)}
                className={`rounded-lg border p-4 text-center transition flex flex-col items-center justify-center gap-2 ${
                  rotationAngle === 90 
                    ? 'border-violet-600 bg-violet-50 text-violet-600 font-bold' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xl">↪️</span>
                <span className="text-xs">
                  {isEn ? '90° Clockwise' : '우측으로 90°'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRotationAngle(180)}
                className={`rounded-lg border p-4 text-center transition flex flex-col items-center justify-center gap-2 ${
                  rotationAngle === 180 
                    ? 'border-violet-600 bg-violet-50 text-violet-600 font-bold' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xl">⬇️</span>
                <span className="text-xs">
                  {isEn ? 'Flip 180°' : '상하반전 180°'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRotationAngle(270)}
                className={`rounded-lg border p-4 text-center transition flex flex-col items-center justify-center gap-2 ${
                  rotationAngle === 270 
                    ? 'border-violet-600 bg-violet-50 text-violet-600 font-bold' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xl">↩️</span>
                <span className="text-xs">좌측으로 90°</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={executeRotation}
              disabled={processing}
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  회전 중...
                </>
              ) : (
                'PDF 회전하기'
              )}
            </button>
          </div>
        </div>
      )}
    </DocLayout>
  );
};

export default RotatePdf;
