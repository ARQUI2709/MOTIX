/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuración para evitar problemas de compilación
  experimental: {
    // Forzar transformaciones SWC para evitar problemas de hoisting
    forceSwcTransforms: true,
  },
  
  // Configuración webpack mejorada para evitar TDZ y errores de referencia
  webpack: (config, { isServer, dev }) => {
    // Resolver extensiones de archivo correctamente
    config.resolve.extensionAlias = {
      '.js': ['.js', '.jsx'],
      '.ts': ['.ts', '.tsx'],
    };

    // Configuración de fallback para módulos Node.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      crypto: false,
    };

    // Configuración específica para el servidor
    if (isServer) {
      // Evitar problemas con importaciones externas
      config.externals = [...(config.externals || [])];
    }

    // Optimización mejorada
    config.optimization = {
      ...config.optimization,
      // Mantener nombres de módulos para debugging
      moduleIds: dev ? 'named' : 'deterministic',
      // Evitar problemas de tree-shaking agresivo en desarrollo
      sideEffects: false,
      usedExports: true,
    };

    // En desarrollo, minimizar optimizaciones que puedan causar TDZ
    if (dev) {
      config.optimization.minimize = false;
      config.optimization.concatenateModules = false;
    }

    // Agregar plugin para manejar importaciones circulares
    config.module.rules.push({
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
          plugins: [
            // Plugin para evitar problemas de hoisting
            ['@babel/plugin-transform-runtime', {
              regenerator: true,
              useESModules: true,
            }],
          ],
        },
      },
    });

    return config;
  },
  
  // Configuración para manejar errores de ESLint durante el build
  eslint: {
    // No ignorar errores durante el build
    ignoreDuringBuilds: false,
    // Directorios a verificar
    dirs: ['pages', 'components', 'lib', 'utils', 'data', 'contexts']
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
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },

  // Configuración para evitar errores de hidratación
  onDemandEntries: {
    // Periodo de inactividad antes de desechar páginas en memoria
    maxInactiveAge: 25 * 1000,
    // Número de páginas a mantener en memoria
    pagesBufferLength: 2,
  },

  // Configuración de imágenes (si se usan)
  images: {
    domains: ['localhost', 'your-domain.com'],
    unoptimized: true, // Temporalmente para evitar problemas de optimización
  },

  // Variables de entorno que se expondrán al cliente
  env: {
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // Configuración de output
  output: 'standalone',
}

module.exports = nextConfig