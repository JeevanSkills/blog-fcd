"use client";
import { useState } from "react";
import { isValidEmail } from "@/utils/validation";
export default function LoginPage() {
  const [email, setEmail] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
    alert("Invalid email format");
    }

  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="bg-white/80 rounded-2xl shadow-2xl p-10 max-w-md w-full text-center border border-sky-300">
        <h2 className="text-3xl font-bold mb-6 text-sky-700">
          Login to Blog-faircode
        </h2>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-lg border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-sky-400"
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-3 rounded-lg border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-sky-400"
          />
          <button
            type="submit"
            className="bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-sky-700">
          Don&apos;t have an account?{" "}
          <a href="/register" className="underline hover:text-sky-900">
            Sign Up
          </a>
        </p>
      </div>
    </main>
  );
}
