import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-yellow-400">
        Falcon X
      </h1>

      <p className="text-gray-400 mt-4 text-center max-w-md">
        AI-powered viral content generator for creators who want to grow fast.
      </p>

      <div className="mt-6 flex gap-4">
        <Link href="/tool" className="bg-yellow-500 text-black px-5 py-2 rounded">
          Try Tool
        </Link>

        <Link href="/login" className="border border-white px-5 py-2 rounded">
          Login
        </Link>
      </div>
    </div>
  );
}