import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO SECTION */}
      <div className="text-center px-6 pt-28">

        <h1 className="text-6xl font-bold text-yellow-400 leading-tight">
          AI Viral Content Generator for Instagram, TikTok & LinkedIn Growth
        </h1>

        <p className="text-gray-400 mt-6 max-w-2xl mx-auto text-lg">
          Falcon X helps creators, marketers, and businesses generate viral-ready social media content in seconds using advanced AI.
        </p>

        {/* CTA BUTTONS */}
        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="/tool"
            className="bg-yellow-500 text-black px-6 py-3 rounded font-bold"
          >
            Start Creating Free
          </Link>

          <Link
            href="/dashboard"
            className="bg-gray-800 px-6 py-3 rounded font-bold"
          >
            View Analytics
          </Link>
        </div>

        <p className="text-gray-600 text-sm mt-4">
          No credit card required • Free AI generation • Built for growth
        </p>
      </div>

      {/* SEO DESCRIPTION BLOCK */}
      <div className="mt-20 max-w-3xl mx-auto text-center text-gray-400 text-sm leading-6 px-6">
        Falcon X is a next-generation AI platform designed to help users
        create high-performing social media content for Instagram, TikTok,
        X (Twitter), and LinkedIn. It is optimized for engagement, virality,
        and audience growth using advanced language models.
      </div>

      {/* FEATURES */}
      <div className="mt-24 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h3 className="text-yellow-400 font-bold text-lg">
            ⚡ AI Viral Content
          </h3>
          <p className="text-gray-400 mt-2 text-sm">
            Generate high-engagement posts tailored for each platform.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h3 className="text-green-400 font-bold text-lg">
            🔁 Growth Engine
          </h3>
          <p className="text-gray-400 mt-2 text-sm">
            Built-in referral system that rewards users for sharing.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h3 className="text-blue-400 font-bold text-lg">
            📊 Analytics Ready
          </h3>
          <p className="text-gray-400 mt-2 text-sm">
            Track usage, referrals, and growth inside your dashboard.
          </p>
        </div>

      </div>

      {/* SEO KEYWORD GRID */}
      <div className="mt-24 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-6 text-left">

        <div>
          <h2 className="text-white font-bold">
            Instagram Caption Generator AI
          </h2>
          <p className="text-gray-400 text-sm">
            Create viral Instagram captions instantly using AI.
          </p>
        </div>

        <div>
          <h2 className="text-white font-bold">
            TikTok Viral Ideas Generator
          </h2>
          <p className="text-gray-400 text-sm">
            Generate trending TikTok content ideas in seconds.
          </p>
        </div>

        <div>
          <h2 className="text-white font-bold">
            LinkedIn Growth Posts AI
          </h2>
          <p className="text-gray-400 text-sm">
            Write professional posts that increase authority and reach.
          </p>
        </div>

      </div>

      {/* HOW IT WORKS */}
      <div className="mt-24 text-center px-6">

        <h2 className="text-3xl font-bold">
          How Falcon X Works
        </h2>

        <div className="mt-10 space-y-3 text-gray-400 max-w-xl mx-auto text-left">

          <p>1. Enter a topic (fashion, tech, fitness, business)</p>
          <p>2. Choose platform (Instagram, TikTok, X, LinkedIn)</p>
          <p>3. Generate AI-powered viral content instantly</p>
          <p>4. Copy, post, and grow your audience</p>

        </div>
      </div>

      {/* FINAL CTA */}
      <div className="mt-28 text-center pb-24 px-6">

        <h2 className="text-3xl font-bold">
          Start Creating Viral Content Today
        </h2>

        <p className="text-gray-500 mt-3">
          Join creators using Falcon X to grow faster with AI.
        </p>

        <Link
          href="/tool"
          className="inline-block mt-6 bg-yellow-500 text-black px-8 py-4 rounded font-bold"
        >
          Launch Falcon X
        </Link>

      </div>

      {/* FOOTER LINKS */}
      <div className="text-center text-sm text-gray-600 pb-10">
        <Link href="/tool" className="text-yellow-400 underline mx-2">
          AI Tool
        </Link>

        <Link href="/dashboard" className="text-yellow-400 underline mx-2">
          Analytics
        </Link>

        <Link href="/generate/fashion" className="text-yellow-400 underline mx-2">
          Fashion AI
        </Link>

        <Link href="/generate/fitness" className="text-yellow-400 underline mx-2">
          Fitness AI
        </Link>
      </div>

    </div>
  );
}