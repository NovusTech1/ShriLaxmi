"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Successful login, redirect to dashboard
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Invalid password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 text-[#3A3A3A]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-[#F0EBE1]">
        
        {/* Logo / Branding Placeholder */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-serif text-[#b08968] mb-1">SHRI LAXMI</h1>
          <p className="text-xs tracking-widest text-gray-400">CATALOGUE</p>
        </div>

        <h2 className="text-xl font-medium mb-2">Staff Login</h2>
        <p className="text-sm text-gray-500 mb-6">Enter password to continue</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E5E0D8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#b08968] transition-colors"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C17C6E] hover:bg-[#A86A5D] text-white py-3 rounded-md font-medium transition-colors disabled:opacity-70"
          >
            {loading ? "AUTHENTICATING..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}