/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    const headers = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/backoffice/:path*", headers },
      { source: "/api/:path*", headers },
      ...(process.env.VERCEL_ENV === "preview" ? [{ source: "/:path*", headers }] : []),
    ];
  },
}

module.exports = nextConfig
