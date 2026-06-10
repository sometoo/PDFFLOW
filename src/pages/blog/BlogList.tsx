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
        title={isEn ? "Blog - PDF Tips & Tricks | PDFFlow" : "블로그 - PDF 활용 팁 | PDFFlow"} 
        description={isEn ? "Explore helpful tips and expert guides on merging, splitting, page extraction, and image conversion for PDF documents." : "PDF 합치기, 분할, 보안, 이미지 변환에 대한 다양하고 전문적인 활용 팁과 가이드를 공유합니다."} 
      />

      <div className="text-center sm:text-left mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {isEn ? 'Blog' : '블로그'}
        </h1>
        <p className="mt-2 text-base text-slate-600">
          {isEn ? 'Explore guides, tips, and tutorials to make your PDF workflows smarter and faster.' : 'PDF를 스마트하고 안전하게 활용할 수 있는 다양한 팁과 사용 방법을 확인해보세요.'}
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
