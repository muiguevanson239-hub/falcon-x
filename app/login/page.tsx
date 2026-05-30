"use client";

import { supabase } from "@/lib/supabase";

export default function Login() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <button
        onClick={login}
        className="bg-yellow-500 text-black px-6 py-3 rounded"
      >
        Login with Google
      </button>
    </div>
  );
}