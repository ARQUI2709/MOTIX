/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 🔧 CORRECCIÓN: Configuración experimental simplificada
  experimental: {
    // Remover forceSwcTransforms que causaba conflictos
    // forceSwcTransforms: true, // ❌ REMOVIDO - Causaba error de webpack
  },
  
  // 🔧 CORRECCIÓN: Configuración webpack simplificada
  webpack: (config, { isServer, dev }) => {
    // ✅ CONFIGURACIÓN BÁSICA: Resolver extensiones
    config.resolve.extensionAlias = {
      '.js': ['.js', '.jsx'],
      '.ts': ['.ts', '.tsx'],
    };

    // ✅ CONFIGURACIÓN BÁSICA: Fallback para Node.js módulos
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      crypto: false,
    };

    // ✅ CORRECCIÓN CRÍTICA: Optimización simplificada sin conflictos
    if (dev) {
      // En desarrollo, usar configuración mínima para evitar conflictos
      config.optimization = {
        ...config.optimization,
        // ❌ REMOVIDO: usedExports que causaba el error
        // usedExports: true,
        minimize: false,
        concatenateModules: false,
        // Mantener solo configuraciones estables
        moduleIds: 'named',
        chunkIds: 'named',
      };
    } else {
      // En producción, usar configuración estándar de Next.js
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
      };
    }

    // ✅ CONFIGURACIÓN ESPECÍFICA: Manejar archivos JavaScript/JSX
    config.module.rules.push({
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
          // Configuración mínima para evitar conflictos
          plugins: []
        },
      },
    });

    return config;
  },
  
  // ✅ CONFIGURACIÓN ESTÁNDAR: ESLint
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['pages', 'components', 'lib', 'utils', 'data', 'contexts']
  },
  
  // ✅ CONFIGURACIÓN ESTÁNDAR: Headers CORS
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

  // ✅ CONFIGURACIÓN ESTÁNDAR: Imágenes
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },

  // ✅ CONFIGURACIÓN ESTÁNDAR: Variables de entorno
  env: {
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
}

module.exports = nextConfig