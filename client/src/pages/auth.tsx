import React, { useState } from "react";
import { auth } from "@/lib/auth";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin"|"signup">("signin");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      if (mode === "signup") {
        await auth.signup(email, pass);
        setMsg("Check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        await auth.login(email, pass, true);
        window.location.href = "/"; // or your /app route
      }
    } catch (err: any) {
      setMsg(err?.message || "Auth error");
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">{mode === "signup" ? "Create account" : "Sign in"}</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full border p-2 rounded" type="email" placeholder="you@example.com"
               value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border p-2 rounded" type="password" placeholder="••••••••"
               value={pass} onChange={e=>setPass(e.target.value)} required />
        <button className="w-full bg-black text-white rounded p-2">
          {mode === "signup" ? "Sign up" : "Sign in"}
        </button>
      </form>
      <button className="mt-3 underline" onClick={()=>setMode(mode==="signup"?"signin":"signup")}>
        {mode === "signup" ? "Have an account? Sign in" : "New here? Create an account"}
      </button>
      {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}
    </div>
  );
}
