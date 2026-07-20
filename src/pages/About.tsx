import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';

const About: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  const content = isEn ? {
    title: 'About PDFFlow',
    description: 'Learn who operates PDFFlow, why the tools process documents in the browser, and what limitations to check before using an output file.',
    lead: 'PDFFlow is an independently operated collection of practical PDF tools. It was built for everyday tasks that should not require installing a large desktop program or sending a document to a conversion server.',
    sections: [
      {
        title: 'Why this service exists',
        body: 'Many document tasks are small but time-sensitive: collecting receipts, sharing selected contract pages, correcting a scan, or converting a page to an image. PDFFlow focuses on a limited set of those tasks and documents the result and known limitations of each one.'
      },
      {
        title: 'How document processing works',
        body: 'The web application code is downloaded to your browser. When you select a PDF or image, its bytes are read in browser memory by open-source PDF libraries and the output is generated on the same device. The selected document is not submitted to a PDFFlow file-processing server. Normal website requests, such as loading the page or advertising resources, are separate from the document itself and are explained in the Privacy Policy.'
      },
      {
        title: 'What we test and disclose',
        body: 'Guides are reviewed against ordinary text PDFs, image-heavy scans, mixed page sizes, invalid ranges, and protected documents where relevant. Advanced PDF features—including digital signatures, forms, outlines, attachments, and uncommon encodings—may not survive every editing operation. We therefore ask users to keep the source and inspect every downloaded result.'
      },
      {
        title: 'Who maintains PDFFlow',
        body: 'The PDFFlow operations team writes the site documentation, maintains the browser tools, and handles feedback through the published support email. PDFFlow is not affiliated with Adobe or Google, and it does not provide legal, accounting, or information-security advice.'
      }
    ],
    principles: ['No account required', 'No document upload to a PDFFlow processing server', 'Original files remain unchanged', 'Known limitations are documented'],
    reviewed: 'Last reviewed: July 20, 2026',
    policyLink: 'Read our editorial policy',
    contactLink: 'Report an error or suggest an improvement'
  } : {
    title: 'PDFFlow 소개',
    description: 'PDFFlow의 운영 주체와 브라우저 내 문서 처리 방식, 결과 파일을 사용하기 전에 확인해야 할 한계를 안내합니다.',
    lead: 'PDFFlow는 일상에서 자주 필요한 PDF 작업을 제공하는 독립 운영 웹 도구입니다. 큰 프로그램을 설치하거나 변환 서버에 문서를 보내지 않고도 간단한 작업을 처리할 수 있도록 만들었습니다.',
    sections: [
      {
        title: '이 서비스를 만든 이유',
        body: '영수증을 한 파일로 모으고, 계약서의 일부 페이지만 공유하고, 잘못 스캔된 방향을 고치거나 PDF 한 장을 이미지로 바꾸는 일은 작지만 급하게 필요한 경우가 많습니다. PDFFlow는 이런 용도에 필요한 기능만 제공하고 각 작업의 결과와 알려진 한계를 함께 설명하는 데 집중합니다.'
      },
      {
        title: '문서가 처리되는 방식',
        body: '웹 애플리케이션 코드가 브라우저에 내려온 뒤, 사용자가 선택한 PDF나 이미지의 바이트를 오픈소스 PDF 라이브러리가 브라우저 메모리에서 읽어 같은 기기에서 결과를 생성합니다. 선택한 문서는 PDFFlow의 파일 처리 서버로 제출되지 않습니다. 페이지 접속이나 광고 리소스 로드처럼 일반적인 웹 요청은 문서 내용과 별개이며 개인정보처리방침에 구분해 설명합니다.'
      },
      {
        title: '검증 범위와 공개하는 한계',
        body: '일반 텍스트 PDF, 이미지가 많은 스캔본, 서로 다른 페이지 크기, 잘못된 범위, 보호 문서 등을 기능에 맞게 점검합니다. 전자서명, 양식, 목차, 첨부파일, 특수 인코딩 같은 고급 PDF 기능은 편집 과정에서 유지되지 않을 수 있습니다. 그래서 원본을 보관하고 다운로드 결과를 직접 확인하도록 안내합니다.'
      },
      {
        title: '운영과 책임',
        body: 'PDFFlow 운영팀이 사이트 설명을 작성하고 브라우저 도구를 관리하며 공개된 지원 이메일로 피드백을 받습니다. PDFFlow는 Adobe 또는 Google과 제휴된 서비스가 아니며 법률, 회계, 정보보안 자문을 제공하지 않습니다.'
      }
    ],
    principles: ['회원가입 없이 사용', 'PDFFlow 처리 서버로 문서 업로드 없음', '원본 파일을 변경하지 않음', '알려진 기능 한계를 함께 안내'],
    reviewed: '최종 검토일: 2026년 7월 20일',
    policyLink: '콘텐츠 운영 원칙 보기',
    contactLink: '오류 제보 또는 개선 의견 보내기'
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <SEO
        title={`${content.title} - PDFFlow`}
        description={content.description}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'PDFFlow',
          url: 'https://www.pdfflow.xyz/',
          email: 'sometoo8435@gmail.com',
          description: content.description
        }}
      />

      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">About PDFFlow</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{content.title}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{content.lead}</p>
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {content.principles.map((item) => (
          <li key={item} className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-4 text-sm font-semibold leading-6 text-violet-900">
            <span className="mr-2 text-violet-600">✓</span>{item}
          </li>
        ))}
      </ul>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {content.sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-slate-500">{content.reviewed}</p>
        <div className="flex flex-wrap gap-4">
          <Link to={isEn ? '/en/editorial-policy' : '/editorial-policy'} className="font-semibold text-violet-600 hover:underline">{content.policyLink}</Link>
          <Link to={isEn ? '/en/contact' : '/contact'} className="font-semibold text-violet-600 hover:underline">{content.contactLink}</Link>
        </div>
      </div>
    </article>
  );
};

export default About;
