# 🏗️ Documentación de Arquitectura Limpia

## 📋 Resumen Ejecutivo

Este proyecto implementa una **Arquitectura Limpia** (Clean Architecture) siguiendo los principios de Robert C. Martin, organizada en 4 capas bien definidas que permiten:

- ✅ **Separación clara de responsabilidades**
- ✅ **Independencia de frameworks y librerías**  
- ✅ **Facilidad de testing y mantenimiento**
- ✅ **Escalabilidad y modificabilidad**

## 🏛️ Estructura de Capas

### 🔧 Capa 1: Infraestructura (`src/infrastructure/`)
**Responsabilidad:** Detalles técnicos y servicios externos

```
infrastructure/
├── config/          # Configuración de entorno y app
├── services/        # Servicios externos (Supabase, PDF, etc.)
└── adapters/        # Adaptadores entre dominio y tecnologías
```

**Características:**
- Contiene implementaciones específicas de tecnologías
- Es la única capa que conoce Supabase, jsPDF, etc.
- Intercambiable sin afectar otras capas

### 🎯 Capa 2: Dominio (`src/domain/`)
**Responsabilidad:** Lógica de negocio pura

```
domain/
├── entities/        # Entidades del negocio (Vehicle, Inspection, etc.)
├── repositories/    # Interfaces de persistencia  
├── use-cases/       # Casos de uso del negocio
└── data/           # Estructuras de datos del dominio
```

**Características:**
- Independiente de cualquier tecnología
- Contiene las reglas de negocio
- Núcleo de la aplicación

### ⚙️ Capa 3: Aplicación (`src/application/`)
**Responsabilidad:** Coordinación y gestión de estado

```
application/
├── contexts/        # Contextos de React para estado global
├── hooks/          # Hooks personalizados
└── store/          # Gestión de estado adicional
```

**Características:**
- Orquesta casos de uso del dominio
- Maneja estado de la aplicación
- Conecta dominio con presentación

### 🎨 Capa 4: Presentación (`src/presentation/`)
**Responsabilidad:** Interfaz de usuario

```
presentation/
├── pages/          # Páginas de Next.js
├── components/     # Componentes React organizados por tipo
│   ├── layout/     # Layouts y estructura
│   ├── features/   # Componentes por funcionalidad  
│   ├── shared/     # Componentes reutilizables
│   └── templates/  # Templates de página
└── styles/         # Estilos globales
```

## 🔄 Flujo de Datos

```
Usuario → Presentación → Aplicación → Dominio → Infraestructura
                    ←              ←         ←
```

**Regla de Dependencia:** Las capas externas pueden depender de las internas, pero nunca al revés.

## 🚀 Beneficios Implementados

### 🔧 **Modificabilidad**
- Cambiar Supabase por otra DB: Solo infraestructura
- Cambiar React por Vue: Solo presentación
- Nuevas reglas de negocio: Solo dominio

### 📈 **Escalabilidad** 
- Agregar nuevos tipos de inspección: Extender entidades
- Nuevas funcionalidades: Nuevos casos de uso
- Más tipos de vehículos: Evolución natural del dominio

### 🧪 **Testabilidad**
- Dominio: Tests unitarios puros
- Aplicación: Tests de integración con mocks
- Presentación: Tests de componentes

### 🛡️ **Mantenibilidad**
- Código organizado y predecible
- Separación clara de conceptos
- Documentación natural por estructura

## 📊 Métricas de Calidad

- **Acoplamiento:** Bajo entre capas
- **Cohesión:** Alta dentro de cada capa
- **Complejidad:** Distribuida apropiadamente
- **Reusabilidad:** Alta en componentes y servicios

## 🎯 Próximos Pasos

1. **Completar implementación** de vistas específicas
2. **Agregar testing** por capas
3. **Documentar APIs** internas
4. **Optimizar rendimiento** según métricas
5. **Agregar nuevas funcionalidades** siguiendo la arquitectura

---

*Esta arquitectura está preparada para evolucionar y crecer sin comprometer la calidad del código.*
