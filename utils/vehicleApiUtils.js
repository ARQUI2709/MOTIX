// utils/vehicleApiUtils.js
// Utilidades para manejar la API de NHTSA de manera eficiente y robusta

// URLs base de la API NHTSA
const NHTSA_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

// Marcas comunes predefinidas para fallback
export const COMMON_MAKES = [
  { Make_ID: 548, Make_Name: 'Toyota' },
  { Make_ID: 440, Make_Name: 'Jeep' },
  { Make_ID: 460, Make_Name: 'Ford' },
  { Make_ID: 452, Make_Name: 'Chevrolet' },
  { Make_ID: 483, Make_Name: 'Nissan' },
  { Make_ID: 449, Make_Name: 'Honda' },
  { Make_ID: 482, Make_Name: 'Mitsubishi' },
  { Make_ID: 453, Make_Name: 'Chrysler' },
  { Make_ID: 448, Make_Name: 'Dodge' },
  { Make_ID: 579, Make_Name: 'Subaru' },
  { Make_ID: 442, Make_Name: 'Hyundai' },
  { Make_ID: 467, Make_Name: 'Kia' },
  { Make_ID: 582, Make_Name: 'Suzuki' },
  { Make_ID: 450, Make_Name: 'Isuzu' },
  { Make_ID: 474, Make_Name: 'Land Rover' },
  { Make_ID: 463, Make_Name: 'GMC' },
  { Make_ID: 441, Make_Name: 'Hummer' },
  { Make_ID: 515, Make_Name: 'Ram' },
  { Make_ID: 452, Make_Name: 'BMW' },
  { Make_ID: 449, Make_Name: 'Mercedes-Benz' },
  { Make_ID: 582, Make_Name: 'Audi' },
  { Make_ID: 467, Make_Name: 'Volkswagen' },
  { Make_ID: 579, Make_Name: 'Volvo' },
  { Make_ID: 483, Make_Name: 'Mazda' },
  { Make_ID: 440, Make_Name: 'Acura' },
  { Make_ID: 460, Make_Name: 'Infiniti' },
  { Make_ID: 548, Make_Name: 'Lexus' }
];

// Modelos predefinidos por marca
export const PREDEFINED_MODELS = {
  'Toyota': [
    { Model_ID: 1, Model_Name: 'Prado' },
    { Model_ID: 2, Model_Name: 'Land Cruiser' },
    { Model_ID: 3, Model_Name: 'Fortuner' },
    { Model_ID: 4, Model_Name: 'RAV4' },
    { Model_ID: 5, Model_Name: 'Hilux' },
    { Model_ID: 6, Model_Name: '4Runner' },
    { Model_ID: 7, Model_Name: 'Highlander' },
    { Model_ID: 8, Model_Name: 'Sequoia' },
    { Model_ID: 9, Model_Name: 'Tacoma' },
    { Model_ID: 10, Model_Name: 'Tundra' }
  ],
  'Jeep': [
    { Model_ID: 11, Model_Name: 'Wrangler' },
    { Model_ID: 12, Model_Name: 'Cherokee' },
    { Model_ID: 13, Model_Name: 'Grand Cherokee' },
    { Model_ID: 14, Model_Name: 'Compass' },
    { Model_ID: 15, Model_Name: 'Renegade' },
    { Model_ID: 16, Model_Name: 'Gladiator' },
    { Model_ID: 17, Model_Name: 'Commander' },
    { Model_ID: 18, Model_Name: 'Patriot' }
  ],
  'Ford': [
    { Model_ID: 19, Model_Name: 'Explorer' },
    { Model_ID: 20, Model_Name: 'Bronco' },
    { Model_ID: 21, Model_Name: 'Escape' },
    { Model_ID: 22, Model_Name: 'Edge' },
    { Model_ID: 23, Model_Name: 'Ranger' },
    { Model_ID: 24, Model_Name: 'F-150' },
    { Model_ID: 25, Model_Name: 'Expedition' },
    { Model_ID: 26, Model_Name: 'EcoSport' },
    { Model_ID: 27, Model_Name: 'Territory' }
  ],
  'Chevrolet': [
    { Model_ID: 28, Model_Name: 'Tahoe' },
    { Model_ID: 29, Model_Name: 'Suburban' },
    { Model_ID: 30, Model_Name: 'Traverse' },
    { Model_ID: 31, Model_Name: 'Equinox' },
    { Model_ID: 32, Model_Name: 'Blazer' },
    { Model_ID: 33, Model_Name: 'Colorado' },
    { Model_ID: 34, Model_Name: 'Silverado' },
    { Model_ID: 35, Model_Name: 'Captiva' },
    { Model_ID: 36, Model_Name: 'Trailblazer' }
  ],
  'Nissan': [
    { Model_ID: 37, Model_Name: 'Pathfinder' },
    { Model_ID: 38, Model_Name: 'Armada' },
    { Model_ID: 39, Model_Name: 'Murano' },
    { Model_ID: 40, Model_Name: 'Rogue' },
    { Model_ID: 41, Model_Name: 'Frontier' },
    { Model_ID: 42, Model_Name: 'X-Trail' },
    { Model_ID: 43, Model_Name: 'Patrol' },
    { Model_ID: 44, Model_Name: 'Navara' },
    { Model_ID: 45, Model_Name: 'Kicks' }
  ]
};

// Función para generar años de vehículos
export const generateVehicleYears = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 1980;
  const endYear = currentYear + 2;
  
  const years = [];
  for (let year = endYear; year >= startYear; year--) {
    years.push(year);
  }
  return years;
};

// Función para obtener marcas de vehículos
export const fetchVehicleMakes = async () => {
  try {
    const response = await fetch(`${NHTSA_BASE_URL}/GetAllMakes?format=json`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Results && data.Results.length > 0) {
      // Filtrar solo marcas relevantes
      const relevantMakeNames = [
        'Toyota', 'Jeep', 'Ford', 'Chevrolet', 'Nissan', 'Honda', 'Mitsubishi', 
        'Chrysler', 'Dodge', 'Subaru', 'Hyundai', 'Kia', 'Suzuki', 'Isuzu', 
        'Land Rover', 'GMC', 'Hummer', 'Ram', 'BMW', 'Mercedes-Benz', 'Audi', 
        'Volkswagen', 'Volvo', 'Mazda', 'Acura', 'Infiniti', 'Lexus', 'Renault',
        'Peugeot', 'Citroen', 'Fiat', 'Alfa Romeo', 'Porsche', 'Jaguar', 'Mahindra'
      ];
      
      const filteredMakes = data.Results
        .filter(make => relevantMakeNames.includes(make.Make_Name))
        .sort((a, b) => a.Make_Name.localeCompare(b.Make_Name));
      
      return filteredMakes.length > 0 ? filteredMakes : COMMON_MAKES;
    } else {
      return COMMON_MAKES;
    }
  } catch (error) {
    console.log('API NHTSA no disponible para marcas, usando predefinidas:', error.message);
    return COMMON_MAKES;
  }
};

// Función para obtener modelos por marca y año
export const fetchVehicleModels = async (makeName, year = null) => {
  if (!makeName) {
    return [];
  }

  try {
    let url;
    
    // Si se proporciona año, usar la API GetModelsForMakeYear
    if (year && year !== '') {
      url = `${NHTSA_BASE_URL}/GetModelsForMakeYear/make/${encodeURIComponent(makeName)}/modelyear/${year}?format=json`;
    } else {
      // Si no hay año, usar GetModelsForMake
      url = `${NHTSA_BASE_URL}/GetModelsForMake/${encodeURIComponent(makeName)}?format=json`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Results && data.Results.length > 0) {
      const sortedModels = data.Results
        .sort((a, b) => a.Model_Name.localeCompare(b.Model_Name));
      return sortedModels;
    } else {
      // Usar modelos predefinidos como fallback
      return PREDEFINED_MODELS[makeName] || [{ Model_ID: 999, Model_Name: 'Modelo genérico' }];
    }
  } catch (error) {
    console.log(`API NHTSA no disponible para modelos de ${makeName}, usando predefinidos:`, error.message);
    return PREDEFINED_MODELS[makeName] || [{ Model_ID: 999, Model_Name: 'Modelo genérico' }];
  }
};

// Función para decodificar VIN (opcional, para validación)
export const decodeVIN = async (vin, modelYear = null) => {
  if (!vin || vin.length < 17) {
    throw new Error('VIN debe tener 17 caracteres');
  }

  try {
    let url = `${NHTSA_BASE_URL}/DecodeVinValues/${vin}?format=json`;
    
    if (modelYear) {
      url += `&modelyear=${modelYear}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Results && data.Results.length > 0) {
      const result = data.Results[0];
      return {
        make: result.Make,
        model: result.Model,
        year: result.ModelYear,
        vehicleType: result.VehicleType,
        bodyClass: result.BodyClass,
        enginePower: result.EnginePower,
        fuelType: result.FuelTypePrimary,
        driveType: result.DriveType,
        errors: result.ErrorText ? [result.ErrorText] : []
      };
    } else {
      throw new Error('No se pudieron obtener datos del VIN');
    }
  } catch (error) {
    console.error('Error decodificando VIN:', error);
    throw error;
  }
};

// Función para validar formato de VIN
export const validateVIN = (vin) => {
  if (!vin) return { valid: false, error: 'VIN es requerido' };
  
  // Remover espacios y convertir a mayúsculas
  const cleanVIN = vin.replace(/\s/g, '').toUpperCase();
  
  // Verificar longitud
  if (cleanVIN.length !== 17) {
    return { valid: false, error: 'VIN debe tener exactamente 17 caracteres' };
  }
  
  // Verificar caracteres válidos (no I, O, Q)
  const validChars = /^[A-HJ-NPR-Z0-9]+$/;
  if (!validChars.test(cleanVIN)) {
    return { valid: false, error: 'VIN contiene caracteres inválidos (I, O, Q no están permitidos)' };
  }
  
  return { valid: true, cleanVIN };
};

// Función para obtener información básica de un vehículo
export const getVehicleInfo = async (make, model, year) => {
  try {
    // Esta función podría expandirse para obtener más información
    // Por ahora retorna la información básica formateada
    return {
      make: make || '',
      model: model || '',
      year: year || '',
      displayName: `${year || ''} ${make || ''} ${model || ''}`.trim(),
      isComplete: !!(make && model && year)
    };
  } catch (error) {
    console.error('Error obteniendo información del vehículo:', error);
    return {
      make: make || '',
      model: model || '',
      year: year || '',
      displayName: 'Información incompleta',
      isComplete: false,
      error: error.message
    };
  }
};

// Función para buscar modelos con texto libre (útil para búsqueda)
export const searchModels = async (makeName, searchTerm) => {
  if (!makeName || !searchTerm) {
    return [];
  }

  try {
    const models = await fetchVehicleModels(makeName);
    
    const searchTermLower = searchTerm.toLowerCase();
    return models.filter(model => 
      model.Model_Name.toLowerCase().includes(searchTermLower)
    );
  } catch (error) {
    console.error('Error buscando modelos:', error);
    return [];
  }
};

// Función para obtener especificaciones canadienses (opcional)
export const getCanadianSpecs = async (make, year, model = '') => {
  try {
    let url = `${NHTSA_BASE_URL}/GetCanadianVehicleSpecifications/?year=${year}&make=${encodeURIComponent(make)}&format=json`;
    
    if (model) {
      url += `&model=${encodeURIComponent(model)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Results && data.Results.length > 0) {
      return data.Results.map(spec => ({
        make: spec.MAKE,
        model: spec.MODEL,
        year: spec.MYR,
        overallLength: spec.OL,
        overallWidth: spec.OW,
        overallHeight: spec.OH,
        wheelbase: spec.WB,
        frontTrackWidth: spec.TWF,
        rearTrackWidth: spec.TWR,
        curbWeight: spec.CW,
        weightDistribution: spec.WD
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.log('Especificaciones canadienses no disponibles:', error.message);
    return [];
  }
};

// Función para manejar errores de red de manera robusta
export const handleApiError = (error, context = 'API call') => {
  const errorInfo = {
    message: error.message || 'Error desconocido',
    context,
    timestamp: new Date().toISOString(),
    isNetworkError: error instanceof TypeError && error.message.includes('fetch'),
    isTimeoutError: error.message.includes('timeout'),
    isServerError: error.message.includes('HTTP error')
  };

  console.error(`Error en ${context}:`, errorInfo);
  
  return errorInfo;
};

// Función para reintentar llamadas a la API
export const retryApiCall = async (apiFunction, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiFunction();
      return result;
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

// Función para cache simple de resultados de API
class SimpleCache {
  constructor(ttl = 300000) { // 5 minutos por defecto
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  clear() {
    this.cache.clear();
  }
}

// Instancia global del cache
export const apiCache = new SimpleCache();

// Función wrapper para fetchVehicleMakes con cache
export const fetchVehicleMakesWithCache = async () => {
  const cacheKey = 'vehicle_makes';
  const cached = apiCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const makes = await fetchVehicleMakes();
  apiCache.set(cacheKey, makes);
  
  return makes;
};

// Función wrapper para fetchVehicleModels con cache
export const fetchVehicleModelsWithCache = async (makeName, year = null) => {
  const cacheKey = `vehicle_models_${makeName}_${year || 'all'}`;
  const cached = apiCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const models = await fetchVehicleModels(makeName, year);
  apiCache.set(cacheKey, models);
  
  return models;
};

// Utilidades para formateo y validación
export const formatVehicleName = (make, model, year) => {
  const parts = [year, make, model].filter(Boolean);
  return parts.join(' ');
};

export const parseVehicleName = (vehicleName) => {
  if (!vehicleName) return { make: '', model: '', year: '' };
  
  const parts = vehicleName.trim().split(' ');
  
  if (parts.length >= 3) {
    const year = parts[0];
    const make = parts[1];
    const model = parts.slice(2).join(' ');
    
    return { make, model, year };
  }
  
  return { make: '', model: '', year: '' };
};

// Exportar todas las funciones principales
export default {
  generateVehicleYears,
  fetchVehicleMakes,
  fetchVehicleModels,
  fetchVehicleMakesWithCache,
  fetchVehicleModelsWithCache,
  decodeVIN,
  validateVIN,
  getVehicleInfo,
  searchModels,
  getCanadianSpecs,
  handleApiError,
  retryApiCall,
  formatVehicleName,
  parseVehicleName,
  apiCache,
  COMMON_MAKES,
  PREDEFINED_MODELS
};