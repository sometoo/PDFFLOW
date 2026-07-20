import React from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../components/SEO';

const Contact: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {isEn ? (
        <>
          <SEO 
            title="Contact Us - PDFFlow" 
            description="If you have any feedback, bug reports, or suggestions while using PDFFlow, please send us an email." 
          />

          <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Contact Us</h1>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-slate-650 leading-relaxed">
              If you experience any issues or have suggestions while using PDFFlow, please contact us at the email address below.
            </p>

            <div className="my-6 bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-slate-500 text-sm font-semibold">Official Support Email</span>
              <a href="mailto:sometoo8435@gmail.com" className="text-violet-600 font-bold text-lg hover:underline">
                sometoo8435@gmail.com
              </a>
            </div>

            <h2 className="text-base font-bold text-slate-900 mb-3">📋 Providing the following details will help us resolve your issue faster:</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-650 mb-8">
              <li>The tool you were using (e.g., Merge PDF, PDF to JPG)</li>
              <li>Detailed description of the issue (e.g., loading freezes, error messages)</li>
              <li>Your device type (e.g., Windows PC, Macbook, iPhone, Galaxy)</li>
              <li>Your browser (e.g., Chrome, Safari, Edge)</li>
            </ul>

            {/* Warning Note */}
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-4 text-xs text-amber-800">
              <div className="flex gap-2">
                <span className="text-sm">⚠️</span>
                <div>
                  <p className="font-semibold mb-1">Do not attach your documents to the email.</p>
                  <p className="leading-relaxed">
                    PDFFlow values user privacy and processes all PDF files locally within your browser without uploading them to external servers. For security, please do not attach your actual documents when contacting support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <SEO 
            title="문의하기 - PDFFlow" 
            description="PDFFlow 이용 중 불편한 점이나 제안 사항이 있으시면 공식 서포트 이메일로 언제든 피드백을 보내주시기 바랍니다." 
          />

          <h1 className="text-3xl font-extrabold text-slate-900 mb-6">문의하기</h1>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-slate-650 leading-relaxed">
              PDFFlow 이용 중 오류가 발생했거나 개선 의견이 있다면 아래 이메일로 연락해 주세요.
            </p>

            <div className="my-6 bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-slate-500 text-sm font-semibold">공식 문의 이메일</span>
              <a href="mailto:sometoo8435@gmail.com" className="text-violet-600 font-bold text-lg hover:underline">
                sometoo8435@gmail.com
              </a>
            </div>

            <h2 className="text-base font-bold text-slate-900 mb-3">📋 문의 시 아래 내용을 함께 보내주시면 더 빠르게 확인할 수 있습니다.</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-650 mb-8">
              <li>사용한 도구 이름 (예: PDF 합치기, PDF JPG 변환 등)</li>
              <li>오류가 발생한 구체적인 상황 (예: 변환 도중 로딩이 멈춤, 에러 메시지 팝업 등)</li>
              <li>사용 중인 기기 (예: 윈도우 PC, 맥북, 아이폰, 갤럭시 등)</li>
              <li>사용 중인 브라우저 (예: 크롬, 사파리, 엣지, 웨일 등)</li>
            </ul>

            {/* Warning Note */}
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-4 text-xs text-amber-800">
              <div className="flex gap-2">
                <span className="text-sm">⚠️</span>
                <div>
                  <p className="font-semibold mb-1">파일은 이메일로 보내지 않아도 됩니다.</p>
                  <p className="leading-relaxed">
                    PDFFlow 도구에서 선택한 파일은 브라우저 메모리에서 처리되며 문서 처리 서버로 업로드되지 않습니다. 기술 지원 문의 시에도 원본 문서는 메일에 첨부하지 말아 주세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Contact;
