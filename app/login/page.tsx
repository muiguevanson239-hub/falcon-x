"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push("/tool");
      }
    };

    checkUser();
  }, [router]);

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          "https://falcon-x-six.vercel.app/tool",
      },
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8">

        <h1 className="text-4xl font-bold text-yellow-400 mb-3">
          Falcon X
        </h1>

        <p className="text-gray-400 mb-8">
          Generate viral content with AI in seconds.
        </p>

        <button
          onClick={loginWithGoogle}
          className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold hover:opacity-90"
        >
          Continue with Google
        </button>

        <p className="text-gray-500 text-sm mt-6 text-center">
          By continuing you agree to the Falcon X terms.
        </p>

      </div>
    </div>
  );
}