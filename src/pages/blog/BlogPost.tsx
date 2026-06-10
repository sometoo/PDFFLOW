import React from 'react';
import { useParams, Link, Navigate, useLocation } from 'react-router-dom';
import { blogPosts } from '../../data/blogData';
import { blogPostsEn } from '../../data/blogDataEn';
import SEO from '../../components/SEO';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const isEn = location.pathname.startsWith('/en');
  const posts = isEn ? blogPostsEn : blogPosts;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return <Navigate to={isEn ? "/en/404" : "/404"} replace />;
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <SEO 
        title={`${post.title} - PDFFlow`} 
        description={post.description} 
      />

      {/* Meta Info */}
      <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-slate-500 justify-center sm:justify-start">
        <span className="font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">{post.category}</span>
        <span>•</span>
        <span>{isEn ? `${post.readTime} read` : `${post.readTime} 읽기 분량`}</span>
        <span>•</span>
        <time dateTime={post.date}>{post.date}</time>
      </div>

      {/* H1 Title */}
      <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight sm:text-4xl text-center sm:text-left mb-6 leading-tight">
        {post.title}
      </h1>

      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6">
        
        {/* Introduction */}
        <p className="text-base text-slate-650 bg-slate-50 border-l-4 border-violet-500 p-4 rounded-r-md italic">
          {post.introduction}
        </p>

        {/* Dynamic Sections */}
        {post.sections.map((section, idx) => (
          <section key={idx} className="pt-4">
            <h2 className="text-xl font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">
              {section.heading}
            </h2>
            <p className="text-sm sm:text-base text-slate-650 leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </section>
        ))}

        {/* Real-life Example */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm my-8">
          <h2 className="text-base font-bold text-slate-950 mb-2 flex items-center gap-2">
            <span>💡</span>
            {isEn ? 'Real-life Usage Example' : '실제 사용 상황 예시'}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {post.example}
          </p>
        </section>

        {/* Warnings / Caveats */}
        <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 my-8">
          <h2 className="text-base font-bold text-amber-900 mb-2 flex items-center gap-2">
            <span>⚠️</span>
            {isEn ? 'Important Guidelines & Caveats' : '작업 시 주의사항'}
          </h2>
          <p className="text-sm text-amber-800 leading-relaxed">
            {post.caveat}
          </p>
        </section>

        {/* FAQs */}
        <section className="my-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>❓</span>
            {isEn ? 'Frequently Asked Questions (FAQ)' : '자주 묻는 질문 (FAQ)'}
          </h2>
          <div className="space-y-4">
            {post.faqs.map((faq, idx) => (
              <div key={idx} className="rounded-lg border border-slate-150 p-4 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-900">Q. {faq.question}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  A. {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Tools Links */}
        <section className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-4">
          <span className="text-sm font-semibold text-slate-700">
            {isEn ? 'Free PDF tools related to this article:' : '이 아티클과 관련된 무료 PDF 도구:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {post.relatedTools.map((tool, idx) => (
              <Link 
                key={idx} 
                to={tool.path}
                className="inline-flex items-center rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-violet-755 transition"
              >
                {tool.name}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </article>
  );
};

export default BlogPost;
