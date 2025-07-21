// pages/_app.js
// 🔧 VERSIÓN CORREGIDA: App wrapper con Error Boundary
// Captura errores de configuración y previene pantalla en blanco

import React from 'react'
import { AuthProvider } from '../contexts/AuthContext'
import ErrorBoundary from '../components/ErrorBoundary'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default MyApp