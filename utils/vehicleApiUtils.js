// utils/vehicleApiUtils.js - VERSIÓN MEJORADA
// Utilidades para manejo de datos de vehículos con fallbacks locales

// Cache para datos de vehículos
const vehicleCache = {
  makes: null,
  models: {},
  lastFetch: null,
  cacheTimeout: 24 * 60 * 60 * 1000 // 24 horas
};

// Marcas de vehículos locales como fallback
const LOCAL_MAKES = [
  { MakeId: 1, MakeName: 'Toyota' },
  { MakeId: 2, MakeName: 'Chevrolet' },
  { MakeId: 3, MakeName: 'Ford' },
  { MakeId: 4, MakeName: 'Nissan' },
  { MakeId: 5, MakeName: 'Volkswagen' },
  { MakeId: 6, MakeName: 'Renault' },
  { MakeId: 7, MakeName: 'Mazda' },
  { MakeId: 8, MakeName: 'Hyundai' },
  { MakeId: 9, MakeName: 'Kia' },
  { MakeId: 10, MakeName: 'Suzuki' },
  { MakeId: 11, MakeName: 'Mitsubishi' },
  { MakeId: 12, MakeName: 'Honda' },
  { MakeId: 13, MakeName: 'Subaru' },
  { MakeId: 14, MakeName: 'Jeep' },
  { MakeId: 15, MakeName: 'Land Rover' },
  { MakeId: 16, MakeName: 'BMW' },
  { MakeId: 17, MakeName: 'Mercedes-Benz' },
  { MakeId: 18, MakeName: 'Audi' },
  { MakeId: 19, MakeName: 'Volvo' },
  { MakeId: 20, MakeName: 'Peugeot' }
];

// Modelos locales por marca
const LOCAL_MODELS = {
  'Toyota': [
    { ModelId: 1, ModelName: 'Prado', Model_Name: 'Prado' },
    { ModelId: 2, ModelName: 'Fortuner', Model_Name: 'Fortuner' },
    { ModelId: 3, ModelName: 'RAV4', Model_Name: 'RAV4' },
    { ModelId: 4, ModelName: 'Hilux', Model_Name: 'Hilux' },
    { ModelId: 5, ModelName: 'Land Cruiser', Model_Name: 'Land Cruiser' },
    { ModelId: 6, ModelName: 'FJ Cruiser', Model_Name: 'FJ Cruiser' },
    { ModelId: 7, ModelName: 'Corolla', Model_Name: 'Corolla' },
    { ModelId: 8, ModelName: 'Camry', Model_Name: 'Camry' }
  ],
  'Chevrolet': [
    { ModelId: 9, ModelName: 'Tahoe', Model_Name: 'Tahoe' },
    { ModelId: 10, ModelName: 'Suburban', Model_Name: 'Suburban' },
    { ModelId: 11, ModelName: 'Captiva', Model_Name: 'Captiva' },
    { ModelId: 12, ModelName: 'Tracker', Model_Name: 'Tracker' },
    { ModelId: 13, ModelName: 'Traverse', Model_Name: 'Traverse' },
    { ModelId: 14, ModelName: 'Equinox', Model_Name: 'Equinox' }
  ],
  'Ford': [
    { ModelId: 15, ModelName: 'Explorer', Model_Name: 'Explorer' },
    { ModelId: 16, ModelName: 'Expedition', Model_Name: 'Expedition' },
    { ModelId: 17, ModelName: 'Escape', Model_Name: 'Escape' },
    { ModelId: 18, ModelName: 'EcoSport', Model_Name: 'EcoSport' },
    { ModelId: 19, ModelName: 'F-150', Model_Name: 'F-150' },
    { ModelId: 20, ModelName: 'Ranger', Model_Name: 'Ranger' }
  ],
  'Nissan': [
    { ModelId: 21, ModelName: 'Patrol', Model_Name: 'Patrol' },
    { ModelId: 22, ModelName: 'Pathfinder', Model_Name: 'Pathfinder' },
    { ModelId: 23, ModelName: 'X-Trail', Model_Name: 'X-Trail' },
    { ModelId: 24, ModelName: 'Murano', Model_Name: 'Murano' },
    { ModelId: 25, ModelName: 'Frontier', Model_Name: 'Frontier' },
    { ModelId: 26, ModelName: 'Kicks', Model_Name: 'Kicks' }
  ],
  'Jeep': [
    { ModelId: 27, ModelName: 'Wrangler', Model_Name: 'Wrangler' },
    { ModelId: 28, ModelName: 'Grand Cherokee', Model_Name: 'Grand Cherokee' },
    { ModelId: 29, ModelName: 'Cherokee', Model_Name: 'Cherokee' },
    { ModelId: 30, ModelName: 'Compass', Model_Name: 'Compass' },
    { ModelId: 31, ModelName: 'Renegade', Model_Name: 'Renegade' }
  ]
};

// Función para verificar si el cache es válido
const isCacheValid = () => {
  if (!vehicleCache.lastFetch) return false;
  return (Date.now() - vehicleCache.lastFetch) < vehicleCache.cacheTimeout;
};

// Función para obtener marcas de vehículos
export const fetchVehicleMakesWithCache = async () => {
  // Si hay cache válido, devolverlo
  if (vehicleCache.makes && isCacheValid()) {
    return vehicleCache.makes;
  }

  try {
    // Intentar obtener de la API
    const response = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.Results && Array.isArray(data.Results)) {
      // Filtrar solo marcas relevantes para vehículos 4x4 y populares
      const relevantMakes = data.Results.filter(make => 
        LOCAL_MAKES.some(localMake => 
          localMake.MakeName.toLowerCase() === make.Make_Name.toLowerCase()
        )
      ).map(make => ({
        MakeId: make.Make_ID,
        MakeName: make.Make_Name
      }));

      // Agregar marcas locales que no estén en la API
      const apiMakeNames = relevantMakes.map(make => make.MakeName.toLowerCase());
      const missingMakes = LOCAL_MAKES.filter(localMake => 
        !apiMakeNames.includes(localMake.MakeName.toLowerCase())
      );

      const allMakes = [...relevantMakes, ...missingMakes].sort((a, b) => 
        a.MakeName.localeCompare(b.MakeName)
      );

      // Actualizar cache
      vehicleCache.makes = allMakes;
      vehicleCache.lastFetch = Date.now();

      return allMakes;
    }
    
    throw new Error('Formato de datos inválido de la API');
    
  } catch (error) {
    console.warn('Error fetching from API, using local data:', error);
    
    // Fallback a datos locales
    vehicleCache.makes = LOCAL_MAKES;
    vehicleCache.lastFetch = Date.now();
    
    return LOCAL_MAKES;
  }
};

// Función para obtener modelos por marca
export const fetchVehicleModelsWithCache = async (makeName) => {
  if (!makeName) return [];

  // Verificar cache
  const cacheKey = makeName.toLowerCase();
  if (vehicleCache.models[cacheKey] && isCacheValid()) {
    return vehicleCache.models[cacheKey];
  }

  try {
    // Intentar obtener de la API
    const encodedMake = encodeURIComponent(makeName);
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${encodedMake}?format=json`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.Results && Array.isArray(data.Results)) {
      const models = data.Results.map(model => ({
        ModelId: model.Model_ID,
        ModelName: model.Model_Name,
        Model_Name: model.Model_Name
      })).sort((a, b) => a.ModelName.localeCompare(b.ModelName));

      // Actualizar cache
      vehicleCache.models[cacheKey] = models;
      
      return models;
    }
    
    throw new Error('Formato de datos inválido de la API');
    
  } catch (error) {
    console.warn('Error fetching models from API, using local data:', error);
    
    // Fallback a datos locales
    const localModels = LOCAL_MODELS[makeName] || [];
    vehicleCache.models[cacheKey] = localModels;
    
    return localModels;
  }
};

// Función para generar años de vehículos
export const generateVehicleYears = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 1990;
  const years = [];
  
  for (let year = currentYear + 1; year >= startYear; year--) {
    years.push({
      value: year.toString(),
      label: year.toString()
    });
  }
  
  return years;
};

// Función para formatear nombre completo del vehículo
export const formatVehicleName = (vehicleInfo) => {
  const { marca, modelo, año } = vehicleInfo;
  const parts = [marca, modelo, año].filter(Boolean);
  return parts.join(' ') || 'Vehículo sin especificar';
};

// Función para validar información del vehículo
export const validateVehicleInfo = (vehicleInfo) => {
  const errors = [];
  
  if (!vehicleInfo.marca?.trim()) {
    errors.push('La marca es requerida');
  }
  
  if (!vehicleInfo.modelo?.trim()) {
    errors.push('El modelo es requerido');
  }
  
  if (!vehicleInfo.año?.trim()) {
    errors.push('El año es requerido');
  } else {
    const year = parseInt(vehicleInfo.año);
    const currentYear = new Date().getFullYear();
    if (year < 1990 || year > currentYear + 1) {
      errors.push(`El año debe estar entre 1990 y ${currentYear + 1}`);
    }
  }
  
  if (vehicleInfo.placa?.trim() && vehicleInfo.placa.length < 3) {
    errors.push('La placa debe tener al menos 3 caracteres');
  }
  
  if (vehicleInfo.kilometraje?.trim()) {
    const km = parseInt(vehicleInfo.kilometraje);
    if (isNaN(km) || km < 0) {
      errors.push('El kilometraje debe ser un número válido');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Función para limpiar el cache (útil para testing o reiniciar datos)
export const clearVehicleCache = () => {
  vehicleCache.makes = null;
  vehicleCache.models = {};
  vehicleCache.lastFetch = null;
};

// Función para obtener estadísticas del cache
export const getCacheStats = () => {
  return {
    makesLoaded: !!vehicleCache.makes,
    modelsLoaded: Object.keys(vehicleCache.models).length,
    lastFetch: vehicleCache.lastFetch,
    cacheValid: isCacheValid()
  };
};