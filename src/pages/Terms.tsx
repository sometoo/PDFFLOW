import React from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../components/SEO';

const Terms: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {isEn ? (
        <>
          <SEO 
            title="Terms of Service - PDFFlow" 
            description="PDFFlow's Terms of Service. By using our website, you agree to comply with our usage guidelines and limitations." 
          />

          <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Terms of Service</h1>
          
          <p className="text-sm text-slate-500 mb-8">Last Updated: July 20, 2026</p>

          <div className="space-y-6 text-sm text-slate-650 leading-relaxed">
            
            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">Section 1 (Purpose)</h2>
              <p>
                These Terms of Service govern the use of the online PDF editing and conversion tools (the "Service") provided by PDFFlow, operating without registration in a web browser environment.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">Section 2 (User Responsibility and File Ownership)</h2>
              <p>
                Users must only process files that they lawfully own or have been authorized to modify. The user is solely responsible for any civil or criminal liabilities arising from copyright infringement or unauthorized document processing.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">Section 3 (Local Client-Side Processing)</h2>
              <p>
                The Service executes all tools entirely inside your web browser (Client-Side Rendering) and does not transmit files to any server. However, performance and success depend on your device capability and the complexity of the original PDF schema.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">Section 4 (Backup Recommendation)</h2>
              <p>
                Users are strongly advised to keep a secure backup copy of their original files before using our tools (such as merge, split, or rotate). The Service is not liable for any file corruption, data loss, or system interruption that may occur during client-side operations.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">Section 5 (Prohibited Activities)</h2>
              <p>
                The Service must not be used to process illegal, harmful, or malicious materials. Violations may result in legal consequences.
              </p>
            </section>

          </div>
        </>
      ) : (
        <>
          <SEO 
            title="이용약관 - PDFFlow" 
            description="PDFFlow의 이용약관입니다. 본 서비스를 사용함으로써 준수해야 할 이용 기준 및 주의사항을 안내합니다." 
          />

          <h1 className="text-3xl font-extrabold text-slate-900 mb-6">이용약관</h1>
          
          <p className="text-sm text-slate-500 mb-8">최종 수정일: 2026년 7월 20일</p>

          <div className="space-y-6 text-sm text-slate-650 leading-relaxed">
            
            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">제 1 조 (목적)</h2>
              <p>
                본 약관은 PDFFlow(이하 "서비스")가 온라인 환경에서 제공하는 PDF 변환 및 편집 도구(이하 "서비스 도구")의 이용 조건과 회원가입 없이 이루어지는 서비스 이용 프로세스 전반에 대한 주의사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">제 2 조 (사용자 책임 및 파일 소유권)</h2>
              <p>
                사용자는 본 서비스가 제공하는 모든 도구를 활용해 편집하고자 하는 원본 파일에 대하여, <strong>본인이 적법하게 소유하고 있거나 제3자로부터 편집·변환 권한을 공식적으로 위임받은 파일에 한해서만 사용</strong>하여야 합니다. 만약 저작권이나 타인의 지식재산권을 침해하는 문서의 편집 행위로 인하여 법적 분쟁이 발생하는 경우, 그에 따른 모든 민·형사상 법적 책임은 전적으로 이용자 본인에게 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">제 3 조 (제한 없는 로컬 연산 및 서비스의 성격)</h2>
              <p>
                서비스 도구에서 사용자가 선택한 문서는 브라우저 메모리에서 처리되며 PDFFlow의 문서 처리 서버로 전송되지 않습니다. 다만 사이트 접속 및 광고 리소스 요청은 별도로 발생할 수 있고, 기기의 연산 성능이나 원본 PDF 구조에 따라 처리가 지연되거나 실패할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">제 4 조 (중요 문서 원본 백업 권장)</h2>
              <p>
                사용자는 소중한 자산인 중요 문서를 본 서비스를 통해 병합, 분할, 혹은 회전 등의 작업을 처리하기 전에, <strong>반드시 원본 데이터 파일의 유실 방지를 위한 예비 복사본(백업본)을 안전한 곳에 저장</strong>해 두실 것을 강력히 권장합니다. 웹 앱 오류나 브라우저 강제 종료 등으로 인해 사본 파일 생성 중 발생한 훼손에 대하여 본 서비스는 직·간접적인 손해배상 책임을 지지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">제 5 조 (불법적 사용의 금지)</h2>
              <p>
                사용자는 본 서비스를 음란물, 악성코드가 포함된 해킹 의심 파일, 타인의 명예를 훼손하는 등 법률에 저촉되는 목적이나 유해한 용도로 악용할 수 없습니다. 타인의 명시적 동의 없는 사칭 등 비도덕적이거나 불법적인 행위를 저지르기 위한 도구로 본 서비스를 사용하는 것을 금하며, 이와 같은 남용 발견 시 민형사상 불이익을 당할 수 있습니다.
              </p>
            </section>

          </div>
        </>
      )}
    </div>
  );
};

export default Terms;
