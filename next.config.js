/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // CORRECCIÓN: Configuración experimental mejorada
  experimental: {
    esmExternals: false,
    // Evitar problemas con importaciones circulares
    forceSwcTransforms: true,
  },
  
  // CORRECCIÓN: Configuración webpack mejorada para evitar TDZ
  webpack: (config, { isServer, dev }) => {
    // Configuración para manejar archivos .js como módulos ES
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.jsx', '.tsx'],
    };

    // Evitar problemas de hoisting y TDZ
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    // Configuración específica para el servidor
    if (isServer) {
      config.externals = config.externals || [];
      // Evitar problemas con importaciones dinámicas de CDN
      config.externals.push(/^https?:\/\//);
    }

    // NUEVO: Configuración para optimización de módulos
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    };

    // NUEVO: Evitar problemas con variables antes de inicialización
    if (dev) {
      config.optimization.minimize = false;
    }

    return config;
  },
  
  // Configuración para manejar errores de ESLint durante el build
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['pages', 'components', 'lib', 'utils', 'data']
  },
  
  // CORRECCIÓN: Configurar CORS para APIs con headers más completos
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          // NUEVO: Headers adicionales para evitar problemas de caché
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' }
        ],
      },
    ];
  },

  // NUEVO: Configuración de compilación transpilada
  transpilePackages: ['@supabase/supabase-js'],

  // NUEVO: Configuración para evitar errores de hidratación
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig