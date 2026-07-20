import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { blogPosts } from '../../data/blogData';
import { blogPostsEn } from '../../data/blogDataEn';
import SEO from '../../components/SEO';

const BlogList: React.FC = () => {
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');
  const posts = isEn ? blogPostsEn : blogPosts;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <SEO 
        title={isEn ? "PDF Guides and Practical Checklists | PDFFlow" : "PDF 가이드와 실무 체크리스트 | PDFFlow"}
        description={isEn ? "Tested instructions, limitations, and checklists for merging, splitting, extracting, and converting PDF documents in a browser." : "PDF 합치기, 분할, 추출, 변환 작업을 직접 확인할 수 있도록 사용법과 한계, 결과 검수 체크리스트를 제공합니다."}
      />

      <div className="text-center sm:text-left mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {isEn ? 'PDF Guides' : 'PDF 실무 가이드'}
        </h1>
        <p className="mt-2 text-base text-slate-600">
          {isEn ? 'Practical instructions and limitations reviewed against the tools available on this site.' : '이 사이트에서 제공하는 도구를 기준으로 작성한 사용법, 한계, 결과 확인 방법을 안내합니다.'}
        </p>
        <p className="mt-3 text-sm text-slate-500">
          {isEn ? 'Maintained by the PDFFlow Editorial Team · Technical review: July 20, 2026' : 'PDFFlow 편집팀 작성·관리 · 기술 검토일: 2026년 7월 20일'}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {posts.map((post) => (
          <article 
            key={post.slug} 
            className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition"
          >
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
              <span className="font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">{post.category}</span>
              <span>•</span>
              <span>{post.readTime}</span>
              <span>•</span>
              <time dateTime={post.date}>{post.date}</time>
            </div>
            
            <h2 className="text-xl font-bold text-slate-950 mb-2 hover:text-violet-600 transition">
              <Link to={isEn ? `/en/blog/${post.slug}` : `/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            
            <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-grow leading-relaxed">
              {post.description}
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Link 
                to={isEn ? `/en/blog/${post.slug}` : `/blog/${post.slug}`} 
                className="text-sm font-semibold text-violet-600 hover:text-violet-850 flex items-center gap-1 group"
              >
                {isEn ? 'Read Article' : '자세히 읽기'}
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogList;
