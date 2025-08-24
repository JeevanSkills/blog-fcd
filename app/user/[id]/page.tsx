'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react'; // Import useSession

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

  // New state variables for editing
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const { data: session } = useSession(); // Get session data

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
          setNewUsername(profileData.username); // Initialize newUsername
          setNewEmail(profileData.email);     // Initialize newEmail

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

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMessage(null);
    setError(null);

    if (newPassword && newPassword !== confirmNewPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    const updatePayload: {
      username?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    } = {};

    if (newUsername !== profile?.username) {
      updatePayload.username = newUsername;
    }
    if (newEmail !== profile?.email) {
      updatePayload.email = newEmail;
    }
    if (newPassword) {
      updatePayload.currentPassword = currentPassword;
      updatePayload.newPassword = newPassword;
    }

    if (Object.keys(updatePayload).length === 0) {
      setUpdateMessage('No changes to save.');
      setIsEditing(false);
      return;
    }

    try {
      const res = await fetch(`/api/user/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setUpdateMessage(data.message || 'Profile updated successfully!');
      // Update local profile state
      if (profile) {
        setProfile({
          ...profile,
          username: updatePayload.username || profile.username,
          email: updatePayload.email || profile.email,
        });
      }
      setIsEditing(false); // Exit edit mode
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during update.');
      }
    }
  };

  if (loading) {
    return <p className="text-center text-sky-600 mt-8">Loading profile...</p>;
  }

  if (error && !updateMessage) { // Display initial fetch error
    return <p className="text-center text-red-500 mt-8">Error: {error}</p>;
  }

  if (!profile) {
    return <p className="text-center text-gray-500 mt-8">User not found.</p>;
  }

  const isCurrentUser = session?.user?.id === id;

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
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-4xl font-bold text-sky-800">{profile.username}</h1>
            <p className="text-sky-600 mt-1">{profile.email}</p>
            <p className="text-gray-500 text-sm mt-2">
              Joined on {new Date(profile.createdAt).toLocaleDateString()}
            </p>
            <span className="inline-block bg-sky-200 text-sky-800 text-xs font-semibold mt-3 px-2.5 py-0.5 rounded-full">
              {profile.role}
            </span>
          </div>
          {isCurrentUser && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          )}
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <div className="mt-8 bg-white rounded-2xl shadow-2xl p-8 border border-sky-300">
            <h2 className="text-3xl font-bold text-sky-800 mb-6">Edit Profile</h2>
            {updateMessage && (
              <p className={`mb-4 ${error ? 'text-red-500' : 'text-green-500'}`}>{updateMessage}</p>
            )}
            {error && <p className="mb-4 text-red-500">{error}</p>}
            <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username:</label>
                <input
                  type="text"
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mt-6 border-t pt-6">
                <h3 className="text-xl font-bold text-sky-700 mb-4">Change Password</h3>
                <div>
                  <label htmlFor="currentPassword" className="block text-gray-700 text-sm font-bold mb-2">Current Password:</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mt-4">
                  <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">New Password:</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mt-4">
                  <label htmlFor="confirmNewPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password:</label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition mt-6"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* My Blogs Section (remains the same) */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-sky-800 mb-6">My Blogs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <Link key={blog._id} href={`/blogs/${blog._id}`} className="block bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all">
                  <h3 className="text-xl font-bold text-sky-700 mb-2 break-words">{blog.title}</h3>
                  <p className="text-sm text-gray-500 break-words">
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