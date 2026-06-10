import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';

const NotFound: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
      {isEn ? (
        <>
          <SEO 
            title="Page Not Found - PDFFlow" 
            description="The page you are looking for could not be found." 
            noindex={true} 
          />

          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">404 - Page Not Found</h1>
          
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Please double check the URL.
          </p>

          <div className="mt-8">
            <Link 
              to="/en" 
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-violet-700 transition"
            >
              <span>🏠</span>
              Back to Home
            </Link>
          </div>
        </>
      ) : (
        <>
          <SEO 
            title="페이지를 찾을 수 없습니다 - PDFFlow" 
            description="요청하신 페이지를 찾을 수 없습니다." 
            noindex={true} 
          />

          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">404 - Page Not Found</h1>
          
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            요청하신 페이지가 존재하지 않거나, 주소가 변경되었거나, 삭제되었을 수 있습니다. 주소를 다시 한 번 확인해 주시기 바랍니다.
          </p>

          <div className="mt-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-violet-700 transition"
            >
              <span>🏠</span>
              홈페이지로 돌아가기
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default NotFound;
