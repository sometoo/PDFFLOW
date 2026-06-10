import React from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../components/SEO';

const About: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {isEn ? (
        <>
          <SEO 
            title="About Us - PDFFlow" 
            description="PDFFlow is a free collection of browser-based PDF tools for merging, splitting, extracting, deleting, rotating, and converting PDF files." 
          />
          
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">About Us</h1>
            <p className="mt-4 text-lg text-slate-650 leading-relaxed">
              PDFFlow is a free collection of browser-based PDF tools for merging, splitting, extracting, deleting, rotating, and converting PDF files.
              The service is designed to process selected files directly on the user's device without uploading them to a server.
              Our goal is to make everyday PDF tasks simple, private, and easy to use without installing software.
            </p>
          </div>

          <div className="mt-10 space-y-8 border-t border-slate-200 pt-10">
            <div>
              <h2 className="text-xl font-bold text-slate-900">🔒 Core Value: 100% Privacy Protection</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Most online PDF services upload files to a remote server. PDFFlow utilizes modern client-side technologies to process files directly inside your browser. Your private, financial, or confidential documents never leave your machine, ensuring complete security.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">⚡ No Installation Required</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                You do not need to download or install heavy desktop applications. As long as you have a web browser open, you can immediately merge, split, or convert documents on any operating system or device.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">💵 Completely Free Basic Tools</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                PDFFlow does not require logins, accounts, or payment options. Our goal is to provide essential document tools freely, helping users protect their data privacy and increase daily business productivity.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <SEO 
            title="사이트 소개 - PDFFlow" 
            description="PDFFlow는 서버 업로드 없이 브라우저 내부에서 작동하는 안전하고 빠른 무료 PDF 도구 모음입니다." 
          />
          
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">사이트 소개</h1>
            <p className="mt-4 text-lg text-slate-650 leading-relaxed">
              PDFFlow는 PDF 합치기, 분할, 페이지 추출, 삭제, 회전, 이미지 변환 같은 기본 PDF 작업을 브라우저에서 간편하게 처리할 수 있도록 만든 무료 도구 모음입니다.
            </p>
          </div>

          <div className="mt-10 space-y-8 border-t border-slate-200 pt-10">
            <div>
              <h2 className="text-xl font-bold text-slate-900">🔒 핵심 가치: 100% 개인정보 보호</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                기존의 대다수 온라인 PDF 서비스는 파일을 서버로 전송한 뒤 연산을 수행합니다. 하지만 PDFFlow는 최신 웹 기술을 활용하여 <strong>선택한 파일을 절대 외부 서버로 업로드하지 않고 사용자의 기기 안에서 직접 처리</strong>합니다. 기밀 비즈니스 문서, 주민등록번호가 기재된 사적 서류 등 민감한 데이터도 보안 우려 없이 안심하고 다룰 수 있습니다.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">⚡ 빠르고 간편한 무설치 서비스</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                무거운 PDF 편집 전용 소프트웨어를 PC나 스마트폰에 다운로드하고 설치할 필요가 없습니다. 웹 브라우저 창만 켜져 있다면, 어떠한 OS나 장치에서도 즉각적인 드래그 앤 드롭으로 작업을 신속하게 시작하고 완성할 수 있습니다.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">💵 완전히 무료로 제공되는 기본 기능</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                회원가입, 로그인은 물론이며 카드 결제나 기부(후원) 유도 없이 필수적인 PDF 편집 핵심 기능들을 무료로 제공합니다. 비즈니스 생산성을 향상시키고 안전한 보안 라이프를 유지하도록 돕는 유용한 디지털 툴킷이 되는 것을 궁극적 목표로 삼고 있습니다.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default About;
