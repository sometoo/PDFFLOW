import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getLanguageSwitchPath, isEnglishPath, normalizePathname } from '../lib/pathname';

const Header: React.FC = () => {
  const location = useLocation();
  const pathname = normalizePathname(location.pathname);
  const isEn = isEnglishPath(pathname);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setToolsOpen(false);
    setConvertOpen(false);
  };

  const switchRoute = getLanguageSwitchPath(pathname);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Logo */}
        <Link to={isEn ? "/en" : "/"} className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900" onClick={closeMenu}>
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-violet-600">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
            <path d="M11 7H7V17H9V13H11C12.1 13 13 12.1 13 11V9C13 7.9 12.1 7 11 7ZM11 11H9V9H11V11ZM17 9V7H14V17H16V13H17C18.1 13 19 12.1 19 11V9C19 7.9 18.1 7 17 7H14V9H17ZM17 11H16V9H17V11Z" fill="currentColor"/>
          </svg>
          <span>PDF<span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Flow</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          
          {/* Tools Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button className="flex items-center gap-1 py-2 text-sm font-medium text-slate-700 hover:text-violet-600 transition">
              {isEn ? 'Tools' : '도구'}
              <svg className={`h-4 w-4 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {toolsOpen && (
              <div className="absolute left-0 mt-0 w-48 rounded-md border border-slate-100 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                <Link to={isEn ? "/en/pdf-merge" : "/pdf-merge"} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-violet-600" onClick={closeMenu}>
                  {isEn ? 'Merge PDF' : 'PDF 합치기'}
                </Link>
                <Link to={isEn ? "/en/pdf-split" : "/pdf-split"} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-violet-600" onClick={closeMenu}>
                  {isEn ? 'Split PDF' : 'PDF 분할'}
                </Link>
                <Link to={isEn ? "/en/pdf-extract-pages" : "/pdf-extract-pages"} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-violet-600" onClick={closeMenu}>
                  {isEn ? 'Extract PDF Pages' : 'PDF 페이지 추출'}
                </Link>
                <Link to={isEn ? "/en/pdf-delete-pages" : "/pdf-delete-pages"} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-violet-600" onClick={closeMenu}>
                  {isEn ? 'Delete PDF Pages' : 'PDF 페이지 삭제'}
                </Link>
                <Link to={isEn ? "/en/pdf-rotate" : "/pdf-rotate"} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-violet-600" onClick={closeMenu}>
                  {isEn ? 'Rotate PDF' : 'PDF 회전'}
                </Link>
              </div>
            )}
          </div>

          {/* Conversion Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setConvertOpen(true)}
            onMouseLeave={() => setConvertOpen(false)}
          >
            <button className="flex items-center gap-1 py-2 text-sm font-medium text-slate-700 hover:text-violet-600 transition">
              {isEn ? 'Convert' : '변환'}
              <svg className={`h-4 w-4 transition-transform ${convertOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {convertOpen && (
              <div className="absolute left-0 mt-0 w-48 rounded-md border border-slate-100 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                <Link to={isEn ? "/en/jpg-to-pdf" : "/jpg-to-pdf"} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-violet-600" onClick={closeMenu}>
                  {isEn ? 'JPG to PDF' : 'JPG PDF 변환'}
                </Link>
                <Link to={isEn ? "/en/pdf-to-jpg" : "/pdf-to-jpg"} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-violet-600" onClick={closeMenu}>
                  {isEn ? 'PDF to JPG' : 'PDF JPG 변환'}
                </Link>
              </div>
            )}
          </div>

          {/* Blog link */}
          <NavLink to={isEn ? "/en/blog" : "/blog"} className={({isActive}) => `text-sm font-medium transition ${isActive ? 'text-violet-600' : 'text-slate-700 hover:text-violet-600'}`}>
            {isEn ? 'Blog' : '블로그'}
          </NavLink>

        </nav>

        {/* Right Header Controls (Language Toggle Only) */}
        <div className="flex items-center gap-3">
          <Link 
            to={switchRoute}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-violet-600 transition"
          >
            <span>🌐</span>
            <span>{isEn ? 'KR' : 'EN'}</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="flex md:hidden rounded-md p-2 text-slate-600 hover:bg-slate-50 focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 shadow-inner">
          <div className="flex flex-col gap-3">
            
            {/* Tools Section */}
            <div>
              <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isEn ? 'Tools' : '도구'}
              </div>
              <div className="mt-1 flex flex-col gap-1 pl-2">
                <Link to={isEn ? "/en/pdf-merge" : "/pdf-merge"} className="block py-2 text-sm text-slate-700 hover:text-violet-600" onClick={closeMenu}>
                  {isEn ? 'Merge PDF' : 'PDF 합치기'}
                </Link>
                <Link to={isEn ? "/en/pdf-split" : "/pdf-split"} className="block py-2 text-sm text-slate-700 hover:text-violet-600" onClick={closeMenu}>
                  {isEn ? 'Split PDF' : 'PDF 분할'}
                </Link>
                <Link to={isEn ? "/en/pdf-extract-pages" : "/pdf-extract-pages"} className="block py-2 text-sm text-slate-700 hover:text-violet-600" onClick={closeMenu}>
                  {isEn ? 'Extract PDF Pages' : 'PDF 페이지 추출'}
                </Link>
                <Link to={isEn ? "/en/pdf-delete-pages" : "/pdf-delete-pages"} className="block py-2 text-sm text-slate-700 hover:text-violet-600" onClick={closeMenu}>
                  {isEn ? 'Delete PDF Pages' : 'PDF 페이지 삭제'}
                </Link>
                <Link to={isEn ? "/en/pdf-rotate" : "/pdf-rotate"} className="block py-2 text-sm text-slate-700 hover:text-violet-600" onClick={closeMenu}>
                  {isEn ? 'Rotate PDF' : 'PDF 회전'}
                </Link>
              </div>
            </div>

            {/* Convert Section */}
            <div>
              <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isEn ? 'Convert' : '변환'}
              </div>
              <div className="mt-1 flex flex-col gap-1 pl-2">
                <Link to={isEn ? "/en/jpg-to-pdf" : "/jpg-to-pdf"} className="block py-2 text-sm text-slate-700 hover:text-violet-600" onClick={closeMenu}>
                  {isEn ? 'JPG to PDF' : 'JPG PDF 변환'}
                </Link>
                <Link to={isEn ? "/en/pdf-to-jpg" : "/pdf-to-jpg"} className="block py-2 text-sm text-slate-700 hover:text-violet-600" onClick={closeMenu}>
                  {isEn ? 'PDF to JPG' : 'PDF JPG 변환'}
                </Link>
              </div>
            </div>

            {/* Blog */}
            <div className="border-t border-slate-50 pt-2">
              <Link to={isEn ? "/en/blog" : "/blog"} className="block px-2 py-2 text-sm font-semibold text-slate-700 hover:text-violet-600" onClick={closeMenu}>
                {isEn ? 'Blog' : '블로그'}
              </Link>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
