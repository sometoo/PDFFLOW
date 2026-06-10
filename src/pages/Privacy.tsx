import React from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../components/SEO';

const Privacy: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {isEn ? (
        <>
          <SEO 
            title="Privacy Policy - PDFFlow" 
            description="PDFFlow's Privacy Policy. We process your documents locally and never upload them to external servers." 
          />

          <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mb-8">Effective Date: June 9, 2026</p>

          <div className="space-y-6 text-sm text-slate-650 leading-relaxed">
            <section className="bg-slate-50 border border-slate-100 rounded-lg p-5">
              <h2 className="text-base font-bold text-slate-900 mb-2">1. Scope and Legal Nature</h2>
              <p>
                This policy outlines how PDFFlow ("the Service") manages data protection. By using our site, you agree to these terms. This document is a general guide for user information and does not constitute a formal legal contract or binding legal advice.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">2. Local Client-Side Processing</h2>
              <p>
                The Service operates entirely locally. <strong>No PDF files or images loaded by the user are transmitted, uploaded, or stored on external servers.</strong> All document manipulations, file merges, and split calculations happen solely inside your local web browser session memory. Your data never leaves your device, assuring the highest standard of confidentiality.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">3. Data Collection and Support Inquiry</h2>
              <p>
                We do not require account registration or logins, meaning we do not collect personal identify information during standard use. If you contact our support desk directly via email (<a href="mailto:sometoo8435@gmail.com" className="text-violet-600 hover:underline">sometoo8435@gmail.com</a>), we will only use the details provided (such as name, email address, or device type) for resolving your specific technical inquiry.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">4. Cookies and Google AdSense</h2>
              <p>
                To support and maintain this free service, Google AdSense advertisements may be displayed. Google and third-party vendors use cookies or device identifiers to serve customized ads based on your visiting history on this and other websites.
              </p>
              <p className="mt-2">
                Users can manage, view, or opt out of personalized advertising by visiting Google Ad Settings or by restricting cookie permissions within their web browser configuration (e.g., Chrome Settings - Privacy and Security - Block Third-Party Cookies).
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">5. Contact Information</h2>
              <p>
                For questions regarding this policy or data processing practices, please contact us by email:
              </p>
              <p className="mt-1 font-semibold text-slate-800">Email: sometoo8435@gmail.com</p>
            </section>
          </div>
        </>
      ) : (
        <>
          <SEO 
            title="개인정보처리방침 - PDFFlow" 
            description="PDFFlow의 개인정보처리방침입니다. 당사는 사용자의 파일을 절대 서버에 업로드하지 않으며 브라우저 내 로컬 가공을 보장합니다." 
          />

          <h1 className="text-3xl font-extrabold text-slate-900 mb-6">개인정보처리방침</h1>
          <p className="text-sm text-slate-500 mb-8">시행일자: 2026년 6월 9일</p>

          <div className="space-y-6 text-sm text-slate-650 leading-relaxed">
            <section className="bg-slate-50 border border-slate-100 rounded-lg p-5">
              <h2 className="text-base font-bold text-slate-900 mb-2">1. 개인정보처리방침의 범위 및 법적 성격</h2>
              <p>
                본 방침은 PDFFlow(이하 "서비스")가 제공하는 웹사이트 이용 시 적용되는 개인정보 처리 수준을 명확히 알리기 위해 작성되었습니다. 본 방침은 사용자 정보 권리 보호를 위한 일반적인 안내 문서이며, 어떠한 형태의 계약을 맺는 것이 아니며 특정 관할권의 정식 법적 계약서가 아님을 인지해 주시기 바랍니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">2. 파일 비업로드 정책 및 local 처리원칙</h2>
              <p>
                서비스는 사용자가 웹 사이트의 도구를 사용하기 위해 선택 및 로드한 어떠한 파일(PDF, 이미지 등)도 외부 서버로 전송하지 않습니다. 모든 변환 및 편집 등의 주요 연산은 <strong>사용자의 브라우저 메모리 안에서만 로컬(Local) 방식으로 즉각 수행</strong>됩니다. 사용자가 업로드한 원본 문서 데이터는 웹 사이트 운영 주체를 포함한 제3자에게 수집, 저장, 전송되지 않으므로 최상 수준의 개인정보 비밀 유지가 보장됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">3. 수집하는 개인정보 항목 및 목적</h2>
              <p>
                서비스는 회원가입이나 로그인을 제공하지 않으므로 사용자의 인적 정보를 일체 수집하지 않습니다. 단, 사용자가 문의 이메일(<a href="mailto:sometoo8435@gmail.com" className="text-violet-600 hover:underline">sometoo8435@gmail.com</a>)을 통해 직접 제공하는 정보(이름, 이메일 주소, 기기 모델 등)에 한해 사용자 지원 및 오류 해결을 위한 목적으로만 일시 보관할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">4. 쿠키(Cookie) 및 제3자 맞춤 광고 안내</h2>
              <p>
                향후 서비스 운영 지원 및 지속적인 서비스 제공을 위해 Google AdSense(구글 애드센스) 맞춤형 광고가 게재될 예정입니다. 이 과정에서 구글 및 파트너사는 쿠키 또는 모바일 광고 식별자를 사용하여 사용자의 이전 방문 기록을 바탕으로 맞춤 광고를 노출할 수 있습니다.
              </p>
              <p className="mt-2">
                사용자는 언제든지 사용하는 브라우저 설정(Chrome 설정 - 개인정보 및 보안 - 쿠키 차단 등)이나 구글 광고 설정 페이지를 방문하여 관심 분야 기반 맞춤 광고 쿠키의 사용을 수동으로 제한하고 차단할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">5. 문의 및 불만 처리</h2>
              <p>
                본 방침이나 서비스의 개인정보 보호 조치와 관련하여 추가적인 의문이나 건의 사항이 있으신 경우 아래 전자우편으로 연락해 주시면 적극적으로 대응하겠습니다.
              </p>
              <p className="mt-1 font-semibold text-slate-800">이메일: sometoo8435@gmail.com</p>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default Privacy;
