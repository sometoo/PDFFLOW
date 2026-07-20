import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import DocLayout from '../../components/DocLayout';

interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: number;
}

const JpgToPdf: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  const [images, setImages] = useState<ImageFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addImages(e.target.files);
    }
  };

  const addImages = (fileList: FileList) => {
    const newImages: ImageFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const lowerName = file.name.toLowerCase();
      const isValidImage = file.type.startsWith('image/') || 
        lowerName.endsWith('.jpg') || 
        lowerName.endsWith('.jpeg') || 
        lowerName.endsWith('.png');
      
      if (isValidImage) {
        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          name: file.name,
          size: file.size
        });
      }
    }
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      addImages(e.dataTransfer.files);
    }
  };

  const moveImage = (index: number, direction: number) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImages(updated);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setImages([]);
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      alert(isEn ? 'Please add at least 1 image to convert.' : '변환할 이미지를 최소 1개 이상 추가해 주세요.');
      return;
    }

    setProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();

      for (const imgObj of images) {
        const imgBytes = await imgObj.file.arrayBuffer();
        let pdfImage;

        const lowerName = imgObj.name.toLowerCase();
        if (imgObj.file.type === 'image/jpeg' || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
          pdfImage = await pdfDoc.embedJpg(imgBytes);
        } else if (imgObj.file.type === 'image/png' || lowerName.endsWith('.png')) {
          pdfImage = await pdfDoc.embedPng(imgBytes);
        } else {
          // Skip unsupported types
          continue;
        }

        const { width, height } = pdfImage.scale(1.0);
        
        // Create page with matching size to image
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width,
          height
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'images-to-pdf.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(isEn ? 'An error occurred while converting images to PDF.' : '이미지를 PDF로 변환하는 도중 에러가 발생했습니다.');
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
    'Drag and drop or browse image files (JPG, JPEG, PNG) that you want to convert.',
    'Arrange page ordering by clicking ▲ or ▼ buttons next to each image name.',
    'Remove undesired images individually using the ✕ button.',
    'Click the [Convert to PDF] button.',
    'The generated images-to-pdf.pdf file containing all images in sequence will download instantly.'
  ] : [
    '변환하려는 이미지 파일(JPG, JPEG, PNG)들을 선택 또는 드래그하여 업로드합니다.',
    '이미지 파일 목록에서 ▲ 및 ▼ 버튼을 이용해 슬라이드(페이지) 순서를 정리합니다.',
    '원치 않는 이미지는 ✕ 단추를 눌러 개별 제외합니다.',
    '[PDF로 변환하기] 단추를 누릅니다.',
    '모든 이미지가 온전하게 삽입된 images-to-pdf.pdf 파일이 즉시 다운로드됩니다.'
  ];

  const caveats = isEn ? [
    'PDF pages are sized to match each selected image. The image is embedded without intentionally changing its pixel dimensions, but PDF viewers may display it at different zoom levels.',
    'Combining more than 30 high-resolution camera photos at once might occupy high device RAM, making the page laggy.',
    'Leaving or reloading the page resets the current image queue, so wait for the download to start.'
  ] : [
    '업로드된 이미지의 해상도 규격 그대로 PDF의 개별 페이지 크기가 자동 세팅됩니다. 따라서 원본 화질 손상이 없습니다.',
    '대형 고화질 폰카 사진을 30장 이상 일괄 변환 시 로컬 하드웨어 램 점유율이 높아져 브라우저가 다소 무거워질 수 있습니다.',
    '변환 중 브라우저 새로고침이나 뒤로가기 버튼을 누르면 업로드한 사진 큐가 초기화됩니다.'
  ];

  const faqs = isEn ? [
    {
      question: 'Can I add WebP or GIF formats to the conversion queue?',
      answer: 'Currently, the MVP site strictly supports standard JPG, JPEG, and PNG images to guarantee layout stability.'
    },
    {
      question: 'What happens if horizontal and vertical images are mixed?',
      answer: 'The conversion engine automatically inspects and maps the unique aspect ratio of each file, preventing distortion or stretching of mixed layouts.'
    },
    {
      question: 'Does converting multiple images explode the PDF file size?',
      answer: 'No. The conversion embeds the binary bytes. Combining five 2MB images yields a PDF of approximately 10MB. Consider optimizing image files beforehand if size is a concern.'
    }
  ] : [
    {
      question: 'GIF나 WebP 이미지 포맷도 PDF 변환 목록에 추가할 수 있나요?',
      answer: '현재 1단계 MVP 버전에서는 범용적으로 가장 널리 활용되는 JPG, JPEG, PNG 포맷에 대해서만 안정적인 PDF 변환 규격을 표준 보장하고 있습니다.'
    },
    {
      question: '가로 사진과 세로 사진이 섞여 있으면 어떻게 되나요?',
      answer: '변환 엔진은 각각의 사진별 고유 가로/세로 비율을 스스로 판독하여 개별 페이지의 가로세로 규격을 맞춤 생성하므로, 강제 회전되거나 찌그러짐 현상이 생기지 않고 자연스럽게 수록됩니다.'
    },
    {
      question: '이미지 파일 개수에 따른 전체 용량 폭증은 없나요?',
      answer: '기존의 파일 바이트 데이터를 최대한 보존하여 컨테이너화하는 로직이므로, 2MB 이미지 5개를 합치면 대략 10MB 크기의 PDF가 도출됩니다. 용량이 크다면 미리 이미지 크기를 소폭 다듬은 후 합치기를 추천합니다.'
    }
  ];

  const relatedTools = isEn ? [
    { name: 'PDF to JPG', path: '/en/pdf-to-jpg', desc: 'Convert each page of a PDF document into JPG images.' },
    { name: 'Merge PDF', path: '/en/pdf-merge', desc: 'Combine multiple PDF files into one.' }
  ] : [
    { name: 'PDF JPG 변환', path: '/pdf-to-jpg', desc: 'PDF의 개별 페이지를 다시 이미지 파일로 만듭니다.' },
    { name: 'PDF 합치기', path: '/pdf-merge', desc: '여러 개별 PDF 문서들을 하나로 묶습니다.' }
  ];

  return (
    <DocLayout
      seoTitle={isEn ? "JPG to PDF - Convert images to PDF online | PDFFlow" : "JPG PDF 변환 - 이미지를 PDF로 만들기 | PDFFlow"}
      seoDesc={isEn ? "Convert JPG, JPEG, and PNG images into a PDF file for free. Easy ordering, local browser-based secure conversion without server uploads." : "JPG, PNG 이미지를 하나의 PDF 파일로 변환하세요. 여러 이미지를 업로드해 순서대로 PDF를 만들 수 있습니다."}
      title={isEn ? "JPG to PDF" : "JPG PDF 변환"}
      description={isEn ? "Convert multiple images (JPG, JPEG, PNG) into a single, clean PDF document in any order." : "여러 장의 이미지(JPG, JPEG, PNG)들을 순서대로 나열하여 정렬된 한 권의 PDF 문서로 간편 변환해보세요."}
      instructions={instructions}
      caveats={caveats}
      faqs={faqs}
      relatedTools={relatedTools}
    >
      {images.length === 0 ? (
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
            multiple
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="text-4xl mb-4">🖼️</div>
          <p className="text-sm font-semibold text-slate-800">
            {isEn ? 'Drag and drop JPG or PNG images here, or click to browse' : 'JPG 또는 PNG 이미지들을 드래그하거나 클릭하여 추가하세요'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isEn ? 'You can add multiple images to set the page order.' : '복수 이미지를 일괄 추가하여 페이지 순서를 잡을 수 있습니다.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-semibold text-slate-700">
              {isEn ? `Queued Images (${images.length})` : `대기 중인 이미지 (${images.length}개)`}
            </span>
            <button 
              onClick={clearAll} 
              className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded"
            >
              {isEn ? 'Clear All' : '전체 삭제'}
            </button>
          </div>
          
          <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/50 max-h-72 overflow-y-auto">
            {images.map((imgObj, idx) => (
              <li key={imgObj.id} className="flex items-center justify-between p-3.5 bg-white transition hover:bg-slate-50/30">
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <span className="text-xl">🖼️</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate" title={imgObj.name}>
                      {imgObj.name}
                    </p>
                    <p className="text-xs text-slate-500">{formatBytes(imgObj.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => moveImage(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded"
                    title={isEn ? "Move Up" : "위로 이동"}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveImage(idx, 1)}
                    disabled={idx === images.length - 1}
                    className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded"
                    title={isEn ? "Move Down" : "아래로 이동"}
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => removeImage(idx)}
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
            <label className="flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
              {isEn ? 'Add Images' : '이미지 추가'}
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <button
              onClick={handleConvert}
              disabled={processing}
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {isEn ? 'Converting...' : '변환 중...'}
                </>
              ) : (
                isEn ? 'Convert to PDF' : 'PDF로 변환하기'
              )}
            </button>
          </div>
        </div>
      )}
    </DocLayout>
  );
};

export default JpgToPdf;
