/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
}

module.exports = nextConfig