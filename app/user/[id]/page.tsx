'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  imageUrl?: string;
  role: string;
  createdAt: string;
}

interface Blog {
  _id: string;
  title: string;
  createdAt: string;
}

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchProfileData = async () => {
        setLoading(true);
        try {
          const [profileRes, blogsRes] = await Promise.all([
            fetch(`/api/user/${id}`),
            fetch(`/api/user/${id}/blogs`),
          ]);

          if (!profileRes.ok) {
            throw new Error('Failed to fetch profile');
          }
          const profileData = await profileRes.json();
          setProfile(profileData);

          if (blogsRes.ok) {
            const blogsData = await blogsRes.json();
            setBlogs(blogsData);
          }

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

      fetchProfileData();
    }
  }, [id]);

  if (loading) {
    return <p className="text-center text-sky-600 mt-8">Loading profile...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-8">Error: {error}</p>;
  }

  if (!profile) {
    return <p className="text-center text-gray-500 mt-8">User not found.</p>;
  }

  return (
    <div className="bg-sky-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col md:flex-row items-center gap-8 border border-sky-300">
          <img
            src={profile.imageUrl || `https://avatar.vercel.sh/${profile.username}.svg`}
            alt={profile.username}
            className="w-32 h-32 rounded-full border-4 border-sky-500 object-cover"
          />
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-sky-800">{profile.username}</h1>
            <p className="text-sky-600 mt-1">{profile.email}</p>
            <p className="text-gray-500 text-sm mt-2">
              Joined on {new Date(profile.createdAt).toLocaleDateString()}
            </p>
            <span className="inline-block bg-sky-200 text-sky-800 text-xs font-semibold mt-3 px-2.5 py-0.5 rounded-full">
              {profile.role}
            </span>
          </div>
        </div>

        {/* My Blogs Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-sky-800 mb-6">My Blogs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <Link key={blog._id} href={`/blogs/${blog._id}`} className="block bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all">
                  <h3 className="text-xl font-bold text-sky-700 mb-2">{blog.title}</h3>
                  <p className="text-sm text-gray-500">
                    Published on {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 col-span-full">This user has not posted any blogs yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}