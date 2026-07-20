import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';

const EditorialPolicy: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <SEO
        title={isEn ? 'Editorial Policy - PDFFlow' : '콘텐츠 운영 원칙 - PDFFlow'}
        description={isEn
          ? 'How PDFFlow creates, tests, reviews, and corrects its PDF guides and tool documentation.'
          : 'PDFFlow가 PDF 도구 설명과 가이드를 작성하고 테스트하며 수정하는 기준을 공개합니다.'}
      />

      <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">PDFFlow Standards</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {isEn ? 'Editorial Policy' : '콘텐츠 운영 원칙'}
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600">
        {isEn
          ? 'PDFFlow publishes practical documentation for the tools available on this site. This page explains who is responsible for the content and how technical claims are checked.'
          : 'PDFFlow는 이 사이트에서 실제 제공하는 도구를 기준으로 사용법과 주의사항을 작성합니다. 이 페이지에서는 콘텐츠 책임 주체와 기술 설명을 확인하는 방식을 공개합니다.'}
      </p>

      <div className="mt-10 space-y-8 border-t border-slate-200 pt-10 text-sm leading-7 text-slate-600">
        <section>
          <h2 className="text-xl font-bold text-slate-900">{isEn ? 'Publisher and responsibility' : '운영 및 콘텐츠 책임'}</h2>
          <p className="mt-2">
            {isEn
              ? 'PDFFlow is an independently operated web utility. The PDFFlow operations team writes and maintains the site content and can be reached through the public support address. We do not present legal, accounting, or security advice.'
              : 'PDFFlow는 독립적으로 운영되는 웹 도구입니다. 사이트의 설명과 가이드는 PDFFlow 운영팀이 직접 작성·관리하며 공개된 지원 이메일을 통해 수정 요청을 받습니다. 법률·회계·보안 자문을 제공하는 서비스는 아닙니다.'}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">{isEn ? 'How guides are tested' : '가이드 검증 방식'}</h2>
          <p className="mt-2">
            {isEn
              ? 'Instructions are checked against the current browser implementation using ordinary text PDFs, image-heavy scans, mixed page sizes, and invalid or protected files where relevant. We document observable output and known limitations instead of promising that every PDF feature will be preserved.'
              : '사용 방법은 현재 배포된 브라우저 기능을 기준으로 일반 텍스트 PDF, 이미지가 많은 스캔본, 서로 다른 페이지 크기, 손상·보호 파일 등을 점검해 작성합니다. 모든 PDF 기능이 보존된다고 단정하지 않고 실제 확인 가능한 결과와 알려진 한계를 함께 기록합니다.'}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">{isEn ? 'Corrections and updates' : '수정 및 업데이트'}</h2>
          <p className="mt-2">
            {isEn
              ? 'Tool behavior and browser compatibility can change. Material corrections are reflected in the affected guide, and review dates are shown on articles. If you find an error, include the page URL, browser, and a description of the issue without attaching a private document.'
              : '도구 동작과 브라우저 호환성은 바뀔 수 있습니다. 중요한 수정은 해당 가이드에 반영하고 아티클에는 검토일을 표시합니다. 오류를 발견하면 민감한 원본 문서를 첨부하지 말고 페이지 주소, 브라우저, 재현 상황을 보내주세요.'}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">{isEn ? 'Advertising independence' : '광고와 콘텐츠의 분리'}</h2>
          <p className="mt-2">
            {isEn
              ? 'Advertising may support the operating cost of the free tools, but advertisers do not select topics, approve conclusions, or receive access to documents selected in the tools. Sponsored content is not currently published.'
              : '무료 도구 운영 비용을 위해 광고가 사용될 수 있지만 광고주가 주제나 결론을 정하거나 도구에서 선택한 문서에 접근하지 않습니다. 현재 협찬 콘텐츠는 발행하지 않습니다.'}
          </p>
        </section>
      </div>

      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
        <p>{isEn ? 'Last reviewed: July 20, 2026' : '최종 검토일: 2026년 7월 20일'}</p>
        <p className="mt-2">
          <Link to={isEn ? '/en/contact' : '/contact'} className="font-semibold text-violet-600 hover:underline">
            {isEn ? 'Send a correction or question' : '수정 요청 또는 문의하기'}
          </Link>
        </p>
      </div>
    </article>
  );
};

export default EditorialPolicy;
