import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="bg-white/80 rounded-2xl shadow-2xl p-10 max-w-xl w-full text-center border border-sky-300">
        <h1 className="text-4xl font-bold mb-4 text-sky-700">
          Welcome to Blog-faircode
        </h1>
        <p className="text-lg text-sky-900 mb-8">
          Share your ideas, learn from others, and join a community of
          passionate developers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/login"
            className="bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition"
          >
            Login
          </a>
          <a
            href="/signup"
            className="bg-white border border-sky-600 text-sky-700 px-6 py-3 rounded-lg font-semibold hover:bg-sky-50 transition"
          >
            Sign Up
          </a>
        </div>
      </div>
    </main>
  );
}
