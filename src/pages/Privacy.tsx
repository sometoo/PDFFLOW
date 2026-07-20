import React from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../components/SEO';

const Privacy: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  const sections = isEn ? [
    {
      title: '1. Scope',
      body: <>This policy explains how PDFFlow handles information when you visit the website, use a document tool, or contact support. It distinguishes document contents from ordinary website connection data.</>
    },
    {
      title: '2. Files selected in a tool',
      body: <><strong>PDF and image files selected in a PDFFlow tool are processed in browser memory and are not uploaded to a PDFFlow document-processing server.</strong> Output files are created on the same device and saved only when you choose to download them. Reloading or closing the page clears the in-memory work queue. Keep your own copy of every source file.</>
    },
    {
      title: '3. Website connection and hosting data',
      body: <>Like other websites, PDFFlow and its hosting or security providers may receive technical connection data such as IP address, request time, requested URL, browser type, and security signals. This data is used to deliver the site, prevent abuse, and diagnose availability. It is separate from the contents of files selected in the tools.</>
    },
    {
      title: '4. Advertising, cookies, and third parties',
      body: <>PDFFlow uses Google AdSense code to verify and, if approved, support the service with advertising. Google and its partners may use cookies, web beacons, IP addresses, or device identifiers to deliver, measure, and personalize ads subject to user choices and applicable consent requirements. Learn more in <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer" className="font-semibold text-violet-600 hover:underline">Google&apos;s explanation of data use on partner sites</a>. You can manage ad personalization in Google Ads Settings and control cookies through your browser.</>
    },
    {
      title: '5. Support email',
      body: <>If you email <a href="mailto:sometoo8435@gmail.com" className="font-semibold text-violet-600 hover:underline">sometoo8435@gmail.com</a>, the message may include your email address and any information you choose to provide. It is used to answer the request and maintain a reasonable support record. Do not attach confidential documents, identity records, contracts, or financial files.</>
    },
    {
      title: '6. Choices and requests',
      body: <>You may block or delete cookies in your browser, adjust Google advertising preferences, or stop using the site. Questions or requests about information sent directly to PDFFlow can be submitted to the support email above. Third-party providers handle requests relating to data they control under their own policies.</>
    },
    {
      title: '7. Changes to this policy',
      body: <>This policy may be updated when site functionality, advertising, or service providers change. Material changes will be reflected by the review date shown on this page.</>
    }
  ] : [
    {
      title: '1. 적용 범위',
      body: <>이 방침은 PDFFlow 웹사이트 방문, 문서 도구 사용, 지원 문의 과정에서 정보가 어떻게 처리되는지 설명합니다. 사용자가 선택한 문서 내용과 일반적인 웹사이트 접속 정보를 구분해 안내합니다.</>
    },
    {
      title: '2. 도구에서 선택한 파일',
      body: <><strong>PDFFlow 도구에서 선택한 PDF와 이미지는 브라우저 메모리에서 처리되며 PDFFlow의 문서 처리 서버로 업로드되지 않습니다.</strong> 결과 파일도 같은 기기에서 생성되고 사용자가 다운로드할 때만 기기에 저장됩니다. 페이지를 새로고침하거나 닫으면 메모리에 있던 작업 목록이 사라집니다. 원본 파일은 사용자가 별도로 보관해야 합니다.</>
    },
    {
      title: '3. 웹사이트 접속 및 호스팅 정보',
      body: <>일반 웹사이트와 마찬가지로 PDFFlow와 호스팅·보안 제공업체는 사이트 제공, 악용 방지, 장애 확인을 위해 IP 주소, 요청 시각, 접속 주소, 브라우저 종류, 보안 신호 같은 기술적 접속 정보를 처리할 수 있습니다. 이 정보는 도구에서 선택한 파일의 내용과 별개입니다.</>
    },
    {
      title: '4. 광고, 쿠키 및 제3자 서비스',
      body: <>PDFFlow는 사이트 확인과 승인 후 광고 운영을 위해 Google AdSense 코드를 사용합니다. Google과 파트너는 사용자의 선택 및 관련 동의 요건에 따라 광고 제공·측정·개인화를 위해 쿠키, 웹 비콘, IP 주소 또는 기기 식별자를 사용할 수 있습니다. 자세한 내용은 <a href="https://policies.google.com/technologies/partner-sites?hl=ko" target="_blank" rel="noreferrer" className="font-semibold text-violet-600 hover:underline">Google 파트너 사이트의 데이터 사용 안내</a>에서 확인할 수 있습니다. Google 광고 설정과 브라우저 설정에서 맞춤 광고 및 쿠키를 관리할 수 있습니다.</>
    },
    {
      title: '5. 지원 이메일',
      body: <><a href="mailto:sometoo8435@gmail.com" className="font-semibold text-violet-600 hover:underline">sometoo8435@gmail.com</a>으로 문의하면 발신 이메일 주소와 사용자가 직접 작성한 정보가 전달됩니다. 해당 정보는 문의 답변과 합리적인 지원 기록 유지에 사용될 수 있습니다. 기밀 문서, 신분증, 계약서, 금융 자료는 이메일에 첨부하지 마세요.</>
    },
    {
      title: '6. 사용자의 선택과 요청',
      body: <>브라우저에서 쿠키를 차단·삭제하거나 Google 광고 설정을 변경할 수 있으며 언제든 사이트 이용을 중단할 수 있습니다. PDFFlow에 직접 보낸 정보와 관련한 문의는 위 지원 이메일로 접수할 수 있습니다. 제3자 제공업체가 관리하는 정보는 해당 업체의 방침에 따라 요청해야 합니다.</>
    },
    {
      title: '7. 방침 변경',
      body: <>사이트 기능, 광고 또는 서비스 제공업체가 바뀌면 이 방침도 수정될 수 있습니다. 중요한 변경 사항은 이 페이지의 최종 검토일에 반영합니다.</>
    }
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <SEO
        title={isEn ? 'Privacy Policy - PDFFlow' : '개인정보처리방침 - PDFFlow'}
        description={isEn
          ? 'How PDFFlow handles locally processed documents, website connection data, support email, cookies, and Google AdSense.'
          : 'PDFFlow의 로컬 문서 처리, 웹 접속 정보, 지원 이메일, 쿠키 및 Google AdSense 관련 정보 처리 방침입니다.'}
      />

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {isEn ? 'Privacy Policy' : '개인정보처리방침'}
      </h1>
      <p className="mt-3 text-sm text-slate-500">
        {isEn ? 'Effective and last reviewed: July 20, 2026' : '시행 및 최종 검토일: 2026년 7월 20일'}
      </p>

      <div className="mt-8 rounded-xl border border-violet-100 bg-violet-50 p-5 text-sm leading-7 text-violet-950">
        {isEn
          ? 'Key point: document files stay in the browser. Website connection data, advertising requests, and information you send by email are separate and are described below.'
          : '핵심 요약: 문서 파일은 브라우저 안에서 처리됩니다. 웹사이트 접속 정보, 광고 요청, 이메일로 직접 보낸 정보는 문서와 별개이며 아래에 구분해 설명합니다.'}
      </div>

      <div className="mt-10 space-y-8 text-sm leading-7 text-slate-600">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
            <p className="mt-2">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
};

export default Privacy;
