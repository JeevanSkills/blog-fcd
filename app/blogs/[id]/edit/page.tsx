'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function EditBlogPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      const fetchBlog = async () => {
        try {
          const res = await fetch(`/api/blogs/${id}`);
          if (!res.ok) {
            throw new Error('Failed to fetch blog data');
          }
          const data = await res.json();

          // Security check: only the author can edit
          if (session?.user?.id !== data.authorId) {
            router.push('/unauthorized'); // Or some other error page
            return;
          }

          setTitle(data.title);
          setContent(data.content);
        } catch (err) {
          if (err instanceof Error) {
            if (err instanceof Error) {
              setError(err.message);
            } else {
              setError('An unknown error occurred');
            }
          } else {
            setError('An unknown error occurred');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchBlog();
    }
  }, [id, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !content) {
      setError('Title and content are required.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/blogs/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, content }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      router.push(`/blogs/${id}`);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return <p className="text-center text-sky-600">Loading...</p>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sky-50 p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-2xl w-full border border-sky-300">
        <h1 className="text-3xl font-bold mb-6 text-sky-700">Edit Blog Post</h1>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <input
            type="text"
            placeholder="Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-4 py-3 rounded-lg border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-sky-400"
            disabled={submitting}
          />
          <textarea
            placeholder="Write your blog content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="px-4 py-3 rounded-lg border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-sky-400 h-48 resize-none"
            disabled={submitting}
          />
          <button
            type="submit"
            className="bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition disabled:bg-sky-400"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Post'}
          </button>
        </form>
      </div>
    </main>
  );
}
