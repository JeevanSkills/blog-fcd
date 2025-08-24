"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { isValidEmail } from "@/utils/validation";

export default function RegisterPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isValidEmail(email)) {
      setError("Invalid email format.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong during registration.");
        return;
      }

      setSuccess(data.message);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="bg-white/80 rounded-2xl shadow-2xl p-10 max-w-md w-full text-center border border-sky-300">
        <h2 className="text-3xl font-bold mb-6 text-sky-700">
          Create an Account
        </h2>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-lg border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-sky-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-lg border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-sky-400"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="px-4 py-3 rounded-lg border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-sky-400"
          />
          {error && <p className="text-red-500 text-xs text-left -mt-2">{error}</p>}
          {success && <p className="text-green-500 text-xs text-left -mt-2">{success}</p>}
          <button
            type="submit"
            className="bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition"
          >
            Register
          </button>
        </form>
        <p className="mt-6 text-sky-700">
          Already have an account?{" "}
          <Link href="/login" className="underline hover:text-sky-900">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}