# 🚗 InspecciónPro 4x4 - Sistema de Inspección Vehicular

> Sistema profesional de inspección vehicular con **Arquitectura Limpia**

## 🏗️ Arquitectura

Este proyecto implementa **Clean Architecture** organizada en 4 capas:

```
🎨 Presentación  → UI, Componentes React, Páginas
⚙️ Aplicación    → Estado, Contextos, Coordinación  
🎯 Dominio       → Entidades, Lógica de Negocio
🔧 Infraestructura → Servicios, Base de Datos, APIs
```

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## 📋 Funcionalidades

- ✅ **Gestión de Vehículos** - Registro y administración
- ✅ **Sistema de Inspección** - Evaluación por categorías
- ✅ **Generación de Reportes** - PDFs profesionales
- ✅ **Autenticación de Usuarios** - Sistema seguro
- ✅ **Cálculo de Métricas** - Análisis detallado

## 🛠️ Tecnologías

- **Frontend:** Next.js 14 + React 18
- **Backend:** Supabase (PostgreSQL)
- **Estilos:** Tailwind CSS
- **PDF:** jsPDF
- **Arquitectura:** Clean Architecture

## 📚 Documentación

- [Arquitectura](docs/architecture.md) - Documentación técnica detallada
- [Instalación](docs/installation.md) - Guía de instalación
- [Desarrollo](docs/development.md) - Guía para desarrolladores

## 🧪 Testing

```bash
# Tests por capa
npm run test:domain        # Entidades y lógica de negocio
npm run test:application   # Contextos y coordinación  
npm run test:presentation  # Componentes UI

# Todos los tests
npm run test:all
```

## 📦 Scripts Disponibles

```bash
npm run dev                 # Desarrollo
npm run build              # Construcción
npm run start              # Producción
npm run migration:status   # Estado de migración
npm run architecture:validate # Validar estructura
```

## 🏛️ Estructura del Proyecto

```
src/
├── infrastructure/     # 🔧 Servicios y configuración
├── domain/            # 🎯 Entidades y lógica de negocio
├── application/       # ⚙️ Estado y coordinación
└── presentation/      # 🎨 UI y componentes
```

## 👥 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**v2.0.0** - Arquitectura Limpia Implementada 🎉
