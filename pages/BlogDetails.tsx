import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { BlogPost } from '../types';

export const BlogDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiService.getBlogPost(slug)
      .then(setPost)
      .catch(error => {
        console.error('Failed to fetch blog post:', error);
        setPost(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container mx-auto px-4 py-16 text-center text-gray-500">Loading article...</div>;
  if (!post) return <div className="container mx-auto px-4 py-16 text-center text-gray-500">Article not found</div>;

  return (
    <article className="bg-white min-h-screen pb-16">
      <div className="bg-gray-50 border-b border-gray-200 py-5">
        <div className="container mx-auto px-4 text-sm text-gray-500">
          <Link to="/" className="hover:text-[var(--brand-primary)]">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/blog" className="hover:text-[var(--brand-primary)]">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800 font-medium">{post.title}</span>
        </div>
      </div>
      {post.image && (
        <div className="h-[280px] md:h-[460px] bg-gray-100 overflow-hidden">
          <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto py-10">
          <p className="text-sm font-bold uppercase tracking-wider text-[var(--brand-accent)] mb-3">Store Journal</p>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-5">{post.title}</h1>
          {post.excerpt && <p className="text-lg text-gray-600 mb-8">{post.excerpt}</p>}
          <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </div>
    </article>
  );
};
