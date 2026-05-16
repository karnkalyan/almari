import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { BlogPost } from '../types';

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    apiService.getBlogPosts().then(setPosts).catch(error => console.error('Failed to fetch blog posts:', error));
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="bg-white border-b border-gray-200 py-8 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-slate-800">Blog</h1>
          <p className="text-sm text-gray-500 mt-1">Store updates, buying guides, and shopping tips.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <article key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {post.image && <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />}
            <div className="p-5">
              <h2 className="font-bold text-lg text-slate-800 mb-2">{post.title}</h2>
              <p className="text-sm text-gray-500 mb-4">{post.excerpt}</p>
              <p className="text-sm text-gray-600 line-clamp-4">{post.content}</p>
              <Link to={`/blog/${post.slug || post.id}`} className="inline-flex mt-5 text-sm font-bold text-[var(--brand-primary)] hover:underline">Read article</Link>
            </div>
          </article>
        ))}
        {posts.length === 0 && <div className="col-span-full text-center py-16 text-gray-500">No blog posts yet.</div>}
      </div>
    </div>
  );
};
