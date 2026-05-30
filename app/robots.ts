export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://falcon-x-six.vercel.app/sitemap.xml",
  };
}