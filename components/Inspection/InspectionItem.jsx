// components/Inspection/InspectionItem.jsx
// ⭐ COMPONENTE: Item individual de inspección
// ✅ RESPONSABILIDADES: Rating por estrellas, upload de imágenes, notas

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Camera, 
  Loader, 
  Eye, 
  EyeOff, 
  X,
  Upload
} from 'lucide-react';
import { InspectionService } from '../../services/InspectionService';
import { ValidationService } from '../../services/ValidationService';

export const InspectionItem = ({ 
  item, 
  category, 
  data, 
  onEvaluate, 
  onUploadImages,
  currentInspectionId
}) => {
  // ✅ ESTADOS LOCALES
  const [score, setScore] = useState(0);
  const [repairCost, setRepairCost] = useState(0);
  const [notes, setNotes] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ✅ SINCRONIZACIÓN CON DATOS EXTERNOS
  useEffect(() => {
    if (data) {
      setScore(data.score || 0);
      setRepairCost(data.repairCost || 0);
      setNotes(data.notes || '');
    }
  }, [data]);

  // ✅ HANDLERS
  const handleStarClick = (starValue) => {
    setScore(starValue);
    onEvaluate(category, item.name, starValue, repairCost, notes);
  };

  const handleCostChange = (newCost) => {
    const costValue = Number(newCost) || 0;
    setRepairCost(costValue);
    
    if (score > 0) {
      onEvaluate(category, item.name, score, costValue, notes);
    }
  };

  const handleNotesChange = (newNotes) => {
    setNotes(newNotes);
    
    if (score > 0) {
      onEvaluate(category, item.name, score, repairCost, newNotes);
    }
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      await onUploadImages(files, category, item.name);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = (imageIndex) => {
    if (data?.images) {
      const newImages = data.images.filter((_, i) => i !== imageIndex);
      // Actualizar con las imágenes restantes
      onEvaluate(category, item.name, score, repairCost, notes);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* ✅ HEADER */}
      <ItemHeader
        name={item.name}
        isEvaluated={data?.evaluated}
        score={score}
        showDescription={showDescription}
        onToggleDescription={() => setShowDescription(!showDescription)}
      />

      {/* ✅ DESCRIPCIÓN */}
      {showDescription && (
        <ItemDescription description={item.description} />
      )}

      {/* ✅ CONTENIDO PRINCIPAL */}
      <div className="p-4 space-y-6">
        {/* ✅ SISTEMA DE ESTRELLAS */}
        <StarRating
          score={score}
          onStarClick={handleStarClick}
        />

        {/* ✅ CAMPOS DE ENTRADA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CostField
            value={repairCost}
            onChange={handleCostChange}
          />

          <ImageUpload
            onUpload={handleImageUpload}
            uploading={uploading}
            imageCount={data?.images?.length || 0}
            category={category}
            itemName={item.name}
          />
        </div>

        {/* ✅ NOTAS */}
        <NotesField
          value={notes}
          onChange={handleNotesChange}
        />

        {/* ✅ GALERÍA DE IMÁGENES */}
        {data?.images && data.images.length > 0 && (
          <ImageGallery
            images={data.images}
            onDelete={handleImageDelete}
            itemName={item.name}
          />
        )}

        {/* ✅ ESTADO DE EVALUACIÓN */}
        {data?.evaluated && (
          <EvaluationStatus
            score={score}
            repairCost={repairCost}
          />
        )}
      </div>
    </div>
  );
};

// ✅ SUB-COMPONENTES

const ItemHeader = ({ 
  name, 
  isEvaluated, 
  score, 
  showDescription, 
  onToggleDescription 
}) => (
  <div className="bg-gray-50 px-4 py-3 border-b">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <h4 className="font-medium text-gray-900">{name}</h4>
        {isEvaluated && (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            ✓ Evaluado ({score}/10)
          </span>
        )}
      </div>
      
      <button
        onClick={onToggleDescription}
        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
        title={showDescription ? 'Ocultar descripción' : 'Mostrar descripción'}
      >
        {showDescription ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

const ItemDescription = ({ description }) => (
  <div className="p-4 bg-blue-50 border-b">
    <p className="text-sm text-blue-800">{description}</p>
  </div>
);

const StarRating = ({ score, onStarClick }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">
      Puntuación (1-10)
    </label>
    <div className="flex items-center space-x-1 mb-2">
      {[...Array(10)].map((_, i) => {
        const starValue = i + 1;
        const isActive = starValue <= score;
        return (
          <button
            key={starValue}
            onClick={() => onStarClick(starValue)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
              isActive
                ? 'bg-yellow-400 text-white shadow-md'
                : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
            }`}
            title={`Puntuación: ${starValue}`}
          >
            <Star 
              className="w-4 h-4" 
              fill={isActive ? 'currentColor' : 'none'}
            />
          </button>
        );
      })}
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">
        Puntuación: <span className="font-medium">{score}/10</span>
      </span>
      {score > 0 && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          score >= 8 ? 'bg-green-100 text-green-800' :
          score >= 6 ? 'bg-yellow-100 text-yellow-800' :
          score >= 4 ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800'
        }`}>
          {score >= 8 ? 'Excelente' :
           score >= 6 ? 'Bueno' :
           score >= 4 ? 'Regular' : 'Deficiente'}
        </span>
      )}
    </div>
  </div>
);

const CostField = ({ value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Costo de reparación
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        $
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="0"
        min="0"
      />
    </div>
    {value > 0 && (
      <p className="text-xs text-gray-600 mt-1">
        ${value.toLocaleString()}
      </p>
    )}
  </div>
);

const ImageUpload = ({ 
  onUpload, 
  uploading, 
  imageCount, 
  category, 
  itemName 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Imágenes
    </label>
    <div className="flex items-center space-x-2">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => onUpload(e.target.files)}
        className="hidden"
        id={`images-${category}-${itemName}`}
      />
      <label
        htmlFor={`images-${category}-${itemName}`}
        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
      >
        {uploading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
        <span className="text-sm">
          {uploading ? 'Subiendo...' : 'Subir'}
        </span>
      </label>
      
      {imageCount > 0 && (
        <span className="text-sm text-gray-600">
          {imageCount} imagen{imageCount !== 1 ? 'es' : ''}
        </span>
      )}
    </div>
  </div>
);

const NotesField = ({ value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Notas adicionales
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows="3"
      placeholder="Observaciones, recomendaciones o comentarios adicionales..."
    />
  </div>
);

const ImageGallery = ({ images, onDelete, itemName }) => (
  <div>
    <h5 className="text-sm font-medium text-gray-700 mb-2">
      Imágenes subidas ({images.length})
    </h5>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={image.publicUrl || image.url}
              alt={`${itemName} ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => onDelete(index)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
            title="Eliminar imagen"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  </div>
);

const EvaluationStatus = ({ score, repairCost }) => (
  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
    <div className="flex items-center justify-between">
      <p className="text-sm text-green-800">
        ✓ Item evaluado: {score}/10 puntos
        {repairCost > 0 && ` - Costo estimado: ${repairCost.toLocaleString()}`}
      </p>
      <span className="text-xs text-green-600">
        {new Date().toLocaleDateString()}
      </span>
    </div>
  </div>
);