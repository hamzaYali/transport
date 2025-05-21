/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  webpack: (config) => {
    // This is necessary for jsPDF to work with webpack 5
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
    };
    
    return config;
  },
};

module.exports = nextConfig; 