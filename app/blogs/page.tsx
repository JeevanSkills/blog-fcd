'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Blog {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorInfo: { username: string };
}

interface PaginatedResponse {
  data: Blog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/blogs?page=${page}&limit=5`);
        if (!res.ok) {
          throw new Error('Failed to fetch blogs');
        }
        const data: PaginatedResponse = await res.json();
        setBlogs(data.data);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [page]);

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-sky-50">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-sky-800">Blog Posts</h1>
          {session && (
            <Link href="/blogs/new" className="bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition">
              Create New Post
            </Link>
          )}
        </div>

        {loading && <p className="text-sky-600">Loading blogs...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <>
            <div className="space-y-6">
              {blogs.length > 0 ? (
                blogs.map((blog) => (
                  <div key={blog._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-2xl font-bold text-sky-700 mb-2">{blog.title}</h2>
                    <p className="text-gray-600 mb-4">{blog.content.substring(0, 150)}...</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>By {blog.authorInfo?.username}</span>
                      <span>Last updated: {new Date(blog.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-4">
                      <Link href={`/blogs/${blog._id}`} className="text-sky-600 hover:underline">
                        Read More
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No blog posts found.</p>
              )}
            </div>

            <div className="flex justify-center items-center mt-8 space-x-4">
              <button
                onClick={handlePrevPage}
                disabled={page <= 1}
                className="bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700 transition disabled:bg-sky-400 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sky-700 font-semibold">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page >= totalPages}
                className="bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700 transition disabled:bg-sky-400 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

