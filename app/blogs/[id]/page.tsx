'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Blog {
  _id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export default function BlogPage() {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      const fetchBlog = async () => {
        try {
          const res = await fetch(`/api/blogs/${id}`);
          if (!res.ok) {
            throw new Error('Failed to fetch blog');
          }
          const data = await res.json();
          setBlog(data);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchBlog();
    }
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const res = await fetch(`/api/blogs/${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          throw new Error('Failed to delete blog');
        }
        router.push('/blogs');
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    }
  };

  if (loading) return <p className="text-center text-sky-600">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  if (!blog) return <p className="text-center text-gray-500">Blog post not found.</p>;

  const isAuthor = session?.user?.id === blog.authorId;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-sky-50">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-sky-800 mb-4">{blog.title}</h1>
        <p className="text-sm text-gray-500 mb-6">
          Published on {new Date(blog.createdAt).toLocaleDateString()}
        </p>
        <div className="prose lg:prose-xl max-w-none text-gray-800 break-words">
          {blog.content}
        </div>

        {isAuthor && (
          <div className="mt-8 pt-6 border-t border-sky-200 flex items-center gap-4">
            <Link href={`/blogs/${id}/edit`} className="bg-sky-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-sky-700 transition">
              Edit Post
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Delete Post
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
