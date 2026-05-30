export default function Page({ params }: { params: { topic: string } }) {
  const topic = decodeURIComponent(params.topic);

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-4xl font-bold text-yellow-400">
        AI Viral Content for {topic}
      </h1>

      <p className="mt-4 text-gray-400 max-w-xl">
        Generate AI-powered viral posts, captions, and ideas for {topic}
        optimized for Instagram, TikTok, X, and LinkedIn growth.
      </p>

      <a
        href="/tool"
        className="inline-block mt-6 bg-yellow-500 text-black px-6 py-3 rounded font-bold"
      >
        Generate Now
      </a>

    </div>
  );
}