import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from './SEO';
import { getToolGuide } from '../data/toolGuides';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface RelatedTool {
  name: string;
  path: string;
  desc: string;
}

interface DocLayoutProps {
  seoTitle: string;
  seoDesc: string;
  title: string;
  description: string;
  instructions: string[];
  caveats: string[];
  faqs: FAQItem[];
  relatedTools: RelatedTool[];
  children: React.ReactNode;
}

const DocLayout: React.FC<DocLayoutProps> = ({
  seoTitle,
  seoDesc,
  title,
  description,
  instructions,
  caveats,
  faqs,
  relatedTools,
  children
}) => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');
  const guide = getToolGuide(location.pathname, isEn);

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <SEO
        title={seoTitle}
        description={seoDesc}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: title,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Any modern web browser',
          url: `https://www.pdfflow.xyz${location.pathname}`,
          description: seoDesc,
          inLanguage: isEn ? 'en' : 'ko',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'KRW'
          },
          publisher: {
            '@type': 'Organization',
            name: 'PDFFlow',
            url: 'https://www.pdfflow.xyz/'
          }
        }}
      />

      {/* Header Info */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        <p className="mt-2 text-lg text-slate-600">{description}</p>
        
        {/* Privacy Note */}
        <div className="mt-4 rounded-lg bg-violet-50 border border-violet-100 p-4 text-sm text-violet-800">
          <div className="flex gap-2">
            <span className="text-base">🛡️</span>
            <p className="font-medium text-left">
              {isEn
                ? "Your files are not uploaded to our server. All processing is done locally inside your web browser, and files are only saved to your device."
                : "선택한 파일은 서버로 업로드되지 않습니다. 모든 작업은 사용자의 브라우저 안에서 처리되며, 작업이 끝난 파일은 사용자의 기기에만 저장됩니다."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Action Tool Component Area */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {children}

        {/* File size warning inside the tool card */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <p className="flex items-center gap-1.5 justify-center sm:justify-start">
            <span>⚠️</span>
            {isEn
              ? "Large PDF files may take longer to process depending on your browser's performance. We recommend keeping a backup of the original files before starting."
              : "큰 PDF 파일은 브라우저 성능에 따라 처리 시간이 길어질 수 있습니다. 작업 전 원본 파일을 백업해 두는 것을 권장합니다."}
          </p>
        </div>
      </section>

      {guide && (
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              {isEn ? 'Practical guide' : '도구 상세 가이드'}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{guide.heading}</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
              {guide.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>

          <dl className="mt-7 grid gap-3 sm:grid-cols-3">
            {guide.facts.map((fact) => (
              <div key={fact.label} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <dt className="text-xs font-semibold text-slate-500">{fact.label}</dt>
                <dd className="mt-1 text-sm font-bold text-slate-900">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">{guide.bestForTitle}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {guide.bestFor.map((item) => <li key={item} className="flex gap-2"><span className="text-violet-600">✓</span><span>{item}</span></li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{guide.verifyTitle}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {guide.verify.map((item) => <li key={item} className="flex gap-2"><span className="text-amber-600">•</span><span>{item}</span></li>)}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Information Grid: How to & Warnings */}
      <div className="grid gap-8 md:grid-cols-2 mb-12">
        {/* Instructions */}
        <section className="rounded-xl border border-slate-150 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-violet-600">📝</span>
            {isEn ? "How to Use" : "사용 방법"}
          </h2>
          <ol className="list-decimal list-inside space-y-2.5 text-sm text-slate-650">
            {instructions.map((step, idx) => (
              <li key={idx} className="leading-relaxed pl-1">
                <span className="text-slate-700 font-medium">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Caveats */}
        <section className="rounded-xl border border-slate-150 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-amber-500">⚠️</span>
            {isEn ? "Caveats" : "주의사항"}
          </h2>
          <ul className="list-disc list-inside space-y-2.5 text-sm text-slate-650">
            {caveats.map((warn, idx) => (
              <li key={idx} className="leading-relaxed pl-1">
                <span className="text-slate-700 font-medium">{warn}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* FAQ Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span>❓</span>
          {isEn ? "Frequently Asked Questions (FAQ)" : "자주 묻는 질문 (FAQ)"}
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 flex items-start gap-2">
                <span className="text-violet-600 shrink-0 mt-0.5">Q.</span>
                <span>{faq.question}</span>
              </h3>
              <p className="mt-2 text-sm text-slate-600 pl-6 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools Links */}
      <section className="border-t border-slate-200 pt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          {isEn ? "Other Useful Tools" : "다른 유용한 도구"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {relatedTools.map((tool, idx) => (
            <Link 
              key={idx} 
              to={tool.path}
              className="group rounded-lg border border-slate-200 bg-white p-4 hover:border-violet-500 hover:shadow-sm transition"
            >
              <h3 className="text-sm font-semibold text-slate-950 group-hover:text-violet-600 transition">
                {tool.name}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {tool.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
};

export default DocLayout;
