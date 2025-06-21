/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: false,
  },
  webpack: (config, { isServer }) => {
    // Configuración para manejar archivos .js como módulos ES
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.jsx', '.tsx'],
    };

    // Configuración específica para el servidor
    if (isServer) {
      config.externals = config.externals || [];
      // Evitar problemas con importaciones dinámicas de CDN
      config.externals.push(/^https?:\/\//);
    }

    return config;
  },
  // Configuración para manejar errores de ESLint durante el build
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['pages', 'components', 'lib', 'utils', 'data']
  },
  // Configurar CORS para APIs
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
}

module.exports = nextConfig