import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import { blogPosts } from '../data/blogData';
import { blogPostsEn } from '../data/blogDataEn';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');
  
  const [activeTab, setActiveTab] = useState<'merge' | 'split' | 'extract'>('merge');

  // Select blog posts based on language
  const recommendedPosts = isEn ? blogPostsEn.slice(0, 3) : blogPosts.slice(0, 3);

  const handleQuickDropZoneClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SEO 
        title={isEn ? "Free PDF Tools - PDFFlow" : "무료 PDF 도구 모음 - PDFFlow"} 
        description={
          isEn 
            ? "Edit your PDF files safely in your browser without uploading them to a server. Merge, split, extract, delete, rotate, and convert PDF files with simple free tools."
            : "파일 업로드 없이 브라우저에서 안전하게 PDF를 편집하세요. PDF 합치기, 분할, 페이지 추출, 삭제, 회전, JPG 변환까지 한 곳에서 처리합니다."
        }
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'PDFFlow',
          url: `https://www.pdfflow.xyz${isEn ? '/en' : '/'}`,
          description: isEn
            ? 'Browser-based tools for common PDF editing and conversion tasks.'
            : '일상적인 PDF 편집과 변환을 브라우저에서 처리하는 도구 모음입니다.',
          inLanguage: isEn ? 'en' : 'ko',
          publisher: {
            '@type': 'Organization',
            name: 'PDFFlow',
            url: 'https://www.pdfflow.xyz/'
          }
        }}
      />

      {/* Hero Section */}
      <section className="text-center py-12 md:py-20 max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl md:text-6xl">
          {isEn ? "Free PDF Tools" : "무료 PDF 도구 모음"}
        </h1>
        <p className="mt-6 text-lg text-slate-600 leading-relaxed">
          {isEn ? (
            "Edit your PDF files safely in your browser without uploading them to a server. Merge, split, extract, delete, rotate, and convert PDF files with simple free tools."
          ) : (
            <>
              파일 업로드 없이 브라우저에서 안전하게 PDF를 편집하세요. <br className="hidden sm:inline" />
              PDF 합치기, 분할, 페이지 추출, 삭제, 회전, JPG 변환까지 한 곳에서 간편하게 사용할 수 있습니다.
            </>
          )}
        </p>

        {/* Core Value Accent */}
        <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-3 justify-center bg-violet-50 border border-violet-100 rounded-xl px-5 py-3.5 text-sm text-violet-800 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🛡️</span>
            <span>
              {isEn ? "Your files are not uploaded to our server." : "선택한 파일은 서버로 전송되지 않습니다."}
            </span>
          </div>
          <span className="hidden sm:inline text-violet-300">|</span>
          <span>
            {isEn 
              ? "All PDF processing happens directly in your browser, and the results are saved only to your device."
              : "모든 PDF 작업은 사용자의 브라우저 안에서 처리됩니다."
            }
          </span>
        </div>
      </section>

      {/* Quick Tools Tabs */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
          {isEn ? "Quick Tools" : "빠른 실행 도구"}
        </h2>
        
        {/* Tab Buttons */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('merge')}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'merge' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isEn ? "Merge PDF" : "PDF 합치기"}
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'split' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isEn ? "Split PDF" : "PDF 분할"}
            </button>
            <button
              onClick={() => setActiveTab('extract')}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'extract' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isEn ? "Extract PDF Pages" : "페이지 추출"}
            </button>
          </div>
        </div>

        {/* Tab Content Boxes */}
        <div className="max-w-xl mx-auto">
          {activeTab === 'merge' && (
            <div 
              onClick={() => handleQuickDropZoneClick(isEn ? '/en/pdf-merge' : '/pdf-merge')}
              className="group border-2 border-dashed border-slate-300 bg-white rounded-2xl p-10 text-center cursor-pointer hover:border-violet-500 hover:bg-slate-50 transition"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📂</div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {isEn ? "Merge PDF Start" : "PDF 합치기 시작"}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {isEn ? "Combine multiple PDF files into one single document." : "여러 PDF 파일들을 업로드하여 하나의 완성된 PDF 문서로 병합합니다."}
              </p>
              <span className="inline-flex rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm group-hover:bg-violet-700 transition">
                {isEn ? "Open Merge Tool" : "합치기 도구 열기"}
              </span>
            </div>
          )}

          {activeTab === 'split' && (
            <div 
              onClick={() => handleQuickDropZoneClick(isEn ? '/en/pdf-split' : '/pdf-split')}
              className="group border-2 border-dashed border-slate-300 bg-white rounded-2xl p-10 text-center cursor-pointer hover:border-violet-500 hover:bg-slate-50 transition"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">✂️</div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {isEn ? "Split PDF Start" : "PDF 분할 시작"}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {isEn ? "Divide a single PDF by pages or ranges into separate files." : "하나의 PDF 문서를 원하는 페이지 범위별로 쪼개어 다중 PDF로 나눕니다."}
              </p>
              <span className="inline-flex rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm group-hover:bg-violet-700 transition">
                {isEn ? "Open Split Tool" : "분할 도구 열기"}
              </span>
            </div>
          )}

          {activeTab === 'extract' && (
            <div 
              onClick={() => handleQuickDropZoneClick(isEn ? '/en/pdf-extract-pages' : '/pdf-extract-pages')}
              className="group border-2 border-dashed border-slate-300 bg-white rounded-2xl p-10 text-center cursor-pointer hover:border-violet-500 hover:bg-slate-50 transition"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">✨</div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {isEn ? "Extract PDF Pages Start" : "PDF 페이지 추출 시작"}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {isEn ? "Select specific pages to extract and save as a new PDF." : "PDF 문서에서 원하는 특정 페이지만 콕 집어내어 새로운 PDF로 저장합니다."}
              </p>
              <span className="inline-flex rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm group-hover:bg-violet-700 transition">
                {isEn ? "Open Extract Tool" : "추출 도구 열기"}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* All Tools Grid */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          {isEn ? "All Free PDF Tools" : "모든 무료 PDF 도구"}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          <Link to={isEn ? "/en/pdf-merge" : "/pdf-merge"} className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-violet-500 hover:shadow-md transition">
            <div className="text-3xl mb-4">📂</div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition">
              {isEn ? "Merge PDF" : "PDF 합치기"}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {isEn 
                ? "Combine multiple PDF files into one document in the exact sequence you choose." 
                : "여러 개의 PDF 보고서를 목록 순서대로 결합하여 하나의 새 PDF 파일로 만듭니다."}
            </p>
          </Link>

          <Link to={isEn ? "/en/pdf-split" : "/pdf-split"} className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-violet-500 hover:shadow-md transition">
            <div className="text-3xl mb-4">✂️</div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition">
              {isEn ? "Split PDF" : "PDF 분할"}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {isEn 
                ? "Separate a multi-page PDF into smaller individual files by page range." 
                : "대용량 PDF 문서에서 임의의 페이지 구간을 지정하여 여러 개의 새로운 PDF로 쪼갭니다."}
            </p>
          </Link>

          <Link to={isEn ? "/en/pdf-extract-pages" : "/pdf-extract-pages"} className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-violet-500 hover:shadow-md transition">
            <div className="text-3xl mb-4">✨</div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition">
              {isEn ? "Extract PDF Pages" : "PDF 페이지 추출"}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {isEn 
                ? "Select specific page indexes and save only those pages as a brand new document." 
                : "다중 페이지로 구성된 PDF 문서 중 원하는 페이지만 골라내어 새로운 PDF로 아카이빙합니다."}
            </p>
          </Link>

          <Link to={isEn ? "/en/pdf-delete-pages" : "/pdf-delete-pages"} className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-violet-500 hover:shadow-md transition">
            <div className="text-3xl mb-4">🗑️</div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition">
              {isEn ? "Delete PDF Pages" : "PDF 페이지 삭제"}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {isEn 
                ? "Remove unnecessary pages from a PDF document and export the remaining pages." 
                : "불필요한 빈 페이지나 마진 계산표 등 기밀 영역의 페이지를 골라 제거한 뒤 저장합니다."}
            </p>
          </Link>

          <Link to={isEn ? "/en/pdf-rotate" : "/pdf-rotate"} className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-violet-500 hover:shadow-md transition">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition">
              {isEn ? "Rotate PDF" : "PDF 회전"}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {isEn 
                ? "Rotate all pages in a PDF document by 90, 180, or 270 degrees clockwise." 
                : "거꾸로 찍힌 모바일 스캔본 PDF 등의 각도를 90도, 180도, 270도 단위로 회전해 바로잡습니다."}
            </p>
          </Link>

          <Link to={isEn ? "/en/jpg-to-pdf" : "/jpg-to-pdf"} className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-violet-500 hover:shadow-md transition">
            <div className="text-3xl mb-4">🖼️</div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition">
              {isEn ? "JPG to PDF" : "JPG PDF 변환"}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {isEn 
                ? "Convert JPG, JPEG, and PNG images into a single professional PDF document." 
                : "JPG, PNG 등 여러 장의 영수증이나 이미지 스냅샷을 순서대로 하나의 PDF 문서로 변환합니다."}
            </p>
          </Link>

          <Link to={isEn ? "/en/pdf-to-jpg" : "/pdf-to-jpg"} className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-violet-500 hover:shadow-md transition">
            <div className="text-3xl mb-4">📷</div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition">
              {isEn ? "PDF to JPG" : "PDF JPG 변환"}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {isEn 
                ? "Convert each PDF page into high-resolution JPG images and export as a ZIP." 
                : "PDF 각 페이지를 고화질 이미지(JPG) 파일로 렌더링하고 압축파일(ZIP) 형식으로 추출해냅니다."}
            </p>
          </Link>

        </div>
      </section>

      {/* Privacy Notice Section */}
      <section className="mb-20 rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="text-5xl bg-slate-50 p-6 rounded-2xl border border-slate-100">🛡️</div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {isEn ? "Documents processed in your browser" : "문서 파일은 브라우저 안에서 처리됩니다"}
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              {isEn ? (
                "Files selected in a PDFFlow tool are read in your browser memory and are not uploaded to a PDFFlow document-processing server. Website connection and advertising requests are separate from your document contents and are explained in our Privacy Policy."
              ) : (
                "PDFFlow 도구에서 선택한 파일은 현재 브라우저 메모리에서 읽고 처리하며 PDFFlow의 문서 처리 서버로 업로드하지 않습니다. 일반적인 웹사이트 접속과 광고 요청은 문서 내용과 별개이며 개인정보처리방침에서 구분해 안내합니다."
              )}
            </p>
            <Link to={isEn ? '/en/privacy' : '/privacy'} className="mt-4 inline-flex text-sm font-semibold text-violet-600 hover:underline">
              {isEn ? 'Read the full privacy explanation →' : '파일·접속 정보 처리 방식 자세히 보기 →'}
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">{isEn ? 'Before editing an important PDF' : '중요한 PDF를 편집하기 전에'}</h2>
          <p className="mt-2 text-sm text-slate-600">{isEn ? 'A short check prevents most submission mistakes.' : '간단한 사전 확인만으로 제출 오류를 줄일 수 있습니다.'}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            isEn ? ['Keep the source', 'Save an untouched copy before editing.'] : ['원본 보관', '편집 전 변경하지 않은 사본을 보관하세요.'],
            isEn ? ['Check page numbers', 'Use the viewer page counter, not printed labels.'] : ['페이지 번호 확인', '인쇄된 쪽수가 아닌 뷰어 번호를 확인하세요.'],
            isEn ? ['Watch advanced features', 'Forms, signatures, and outlines may change.'] : ['고급 기능 주의', '양식, 전자서명, 목차는 달라질 수 있습니다.'],
            isEn ? ['Inspect the result', 'Open the download before formal submission.'] : ['결과 검수', '공식 제출 전에 다운로드 파일을 열어보세요.']
          ].map(([title, body]) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Step Summary Section */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
          {isEn ? "Easy 3-Step Process" : "간편한 3단계 이용 방법"}
        </h2>
        <div className="grid gap-8 sm:grid-cols-3 text-center">
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-600 mb-4">1</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {isEn ? "Select Files" : "파일 선택"}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isEn 
                ? "Drag and drop your PDF or image files onto the secure interface card." 
                : "가공이 필요한 PDF나 이미지 파일을 화면에 드래그하여 가볍게 떨어뜨립니다."}
            </p>
          </div>
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-600 mb-4">2</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {isEn ? "Adjust Options" : "옵션 설정"}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isEn 
                ? "Input your desired page numbers, ranges, or orientation angles." 
                : "필요한 페이지 범위를 지정하거나 회전 각도를 선택하는 등 세부 설정을 수행합니다."}
            </p>
          </div>
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-600 mb-4">3</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {isEn ? "Save Results" : "즉시 다운로드"}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isEn 
                ? "Click the button to instantly download the generated document to your device." 
                : "변환 완료 단추를 누르면 브라우저가 생성한 결과 사본을 기기에 저장합니다."}
            </p>
          </div>
        </div>
      </section>

      {/* Recommended Blog Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          {isEn ? "PDF Guides & Articles" : "PDF 활용 팁 & 가이드"}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {recommendedPosts.map((post) => (
            <div key={post.slug} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition">
              <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-2">{post.category}</span>
              <h3 className="text-base font-bold text-slate-950 hover:text-violet-600 transition mb-3">
                <Link to={isEn ? `/en/blog/${post.slug}` : `/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed flex-grow">
                {post.description}
              </p>
              <Link to={isEn ? `/en/blog/${post.slug}` : `/blog/${post.slug}`} className="text-xs font-semibold text-violet-600 hover:text-violet-850 self-start">
                {isEn ? "Read More →" : "더 보기 →"}
              </Link>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
