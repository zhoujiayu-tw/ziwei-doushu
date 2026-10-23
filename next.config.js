/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lunar-javascript'],
  // NEXT_PUBLIC_* 在建置時寫進頁面（sitemap、canonical），正式建置預設用正式網域
  env: {
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === 'production' ? 'https://bz.zhoujiayu.app' : 'http://localhost:3000'),
  },
};

module.exports = nextConfig;
