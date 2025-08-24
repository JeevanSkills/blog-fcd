import { Blogs } from "./blog-data";
import Link from "next/link";
export default function BlogList({ blogs }: { blogs: Blogs[] }) {
return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {blogs.map((blog) => (
        <div
          key={blog.id}
          className="bg-white rounded-xl shadow-lg p-6 flex flex-col hover:shadow-2xl transition-shadow border border-sky-100"
        >
          <Link href={`/blogs/${blog.id}`}>
            <h2 className="text-xl font-semibold text-sky-700 hover:underline mb-2 cursor-pointer">
              {blog.title}
            </h2>
          </Link>
          <p className="text-sky-500 mb-4">By {blog.author}</p>
          <p className="text-gray-700 flex-grow">{blog.summary}</p>
          <Link
            href={`/blogs/${blog.id}`}
            className="mt-4 inline-block text-sky-600 hover:text-sky-800 font-medium"
          >
            Read more &rarr;
          </Link>
        </div>
      ))}
    </div>
  );
}
