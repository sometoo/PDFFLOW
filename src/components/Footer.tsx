import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Footer: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');

  return (
    <footer className="w-full border-t border-slate-200 bg-white py-12 text-slate-500">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b border-slate-100">
          {/* Brand Logo in Footer */}
          <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-violet-600">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
              <path d="M11 7H7V17H9V13H11C12.1 13 13 12.1 13 11V9C13 7.9 12.1 7 11 7ZM11 11H9V9H11V11ZM17 9V7H14V17H16V13H17C18.1 13 19 12.1 19 11V9C19 7.9 18.1 7 17 7H14V9H17ZM17 11H16V9H17V11Z" fill="currentColor"/>
            </svg>
            <span>PDFFlow</span>
          </div>

          {/* Footer Links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <Link to={isEn ? "/en/about" : "/about"} className="hover:text-violet-600 transition">
              {isEn ? 'About Us' : '사이트 소개'}
            </Link>
            <Link to={isEn ? "/en/privacy" : "/privacy"} className="hover:text-violet-600 transition">
              {isEn ? 'Privacy Policy' : '개인정보처리방침'}
            </Link>
            <Link to={isEn ? "/en/terms" : "/terms"} className="hover:text-violet-600 transition">
              {isEn ? 'Terms of Service' : '이용약관'}
            </Link>
            <Link to={isEn ? "/en/contact" : "/contact"} className="hover:text-violet-600 transition">
              {isEn ? 'Contact Us' : '문의하기'}
            </Link>
            <Link to={isEn ? "/en/blog" : "/blog"} className="hover:text-violet-600 transition">
              {isEn ? 'Blog' : '블로그'}
            </Link>
          </nav>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-8 text-xs">
          <p>&copy; {new Date().getFullYear()} PDFFlow. All rights reserved.</p>
          <p className="max-w-md md:text-right">
            {isEn 
              ? 'PDFFlow prioritizes client-side local processing. None of your uploaded PDF files are collected or stored on our servers.'
              : 'PDFFlow는 브라우저 내부 로컬 연산을 우선하며, 업로드된 어떠한 PDF 파일도 수집하거나 서버에 저장하지 않습니다.'}
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
