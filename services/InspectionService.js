// services/InspectionService.js
// 🔧 SERVICIO: Operaciones de inspección (CRUD, upload, etc.)
// ✅ RESPONSABILIDADES: API calls, file uploads, data transformation

import { supabase } from '../lib/supabase';

export class InspectionService {
  // ✅ GUARDAR INSPECCIÓN
  static async save({ vehicleInfo, inspectionData, metrics, session }) {
    const payload = {
      vehicle_info: vehicleInfo,
      inspection_data: inspectionData,
      total_score: metrics.global.totalScore,
      total_repair_cost: metrics.global.totalRepairCost
    };

    const response = await fetch('/api/inspections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error guardando la inspección');
    }

    const result = await response.json();
    return result.data;
  }

  // ✅ CARGAR INSPECCIONES
  static async loadAll(session) {
    const response = await fetch('/api/inspections', {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error cargando inspecciones');
    }

    const result = await response.json();
    return result.data || [];
  }

  // ✅ SUBIR IMÁGENES
  static async uploadImages(files, inspectionId, category, itemName) {
    const uploadPromises = Array.from(files).map(file => 
      this.uploadSingleImage(file, inspectionId, category, itemName)
    );

    const results = await Promise.allSettled(uploadPromises);
    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
  }

  // ✅ SUBIR IMAGEN INDIVIDUAL
  static async uploadSingleImage(file, inspectionId, category, itemName) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${inspectionId}/${category}/${itemName}/${Date.now()}.${fileExt}`;
    
    // Intentar bucket principal
    let bucketName = 'inspection-photos';
    let { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);

    // Fallback a bucket alternativo
    if (error?.message?.includes('Bucket not found')) {
      bucketName = 'inspection-images';
      const result = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      throw new Error(`Error subiendo imagen: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return {
      fileName,
      publicUrl,
      originalName: file.name,
      size: file.size,
      type: file.type
    };
  }

  // ✅ ELIMINAR IMAGEN
  static async deleteImage(fileName, bucketName = 'inspection-photos') {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      throw new Error(`Error eliminando imagen: ${error.message}`);
    }
  }
}