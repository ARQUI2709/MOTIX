-- supabase/storage-setup.sql
-- 🔧 CONFIGURACIÓN: Storage buckets para imágenes de inspección
-- Ejecutar en Supabase SQL Editor

-- ✅ CREAR BUCKET: inspection-photos (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inspection-photos',
  'inspection-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ✅ POLÍTICAS RLS: Permitir a usuarios autenticados subir y ver sus propias imágenes

-- Política para SELECT (ver imágenes)
CREATE POLICY "Users can view inspection photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'inspection-photos');

-- Política para INSERT (subir imágenes)
CREATE POLICY "Users can upload inspection photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'inspection-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para UPDATE (actualizar metadatos)
CREATE POLICY "Users can update their inspection photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'inspection-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'inspection-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para DELETE (eliminar imágenes)
CREATE POLICY "Users can delete their inspection photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'inspection-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ✅ CREAR BUCKET ALTERNATIVO: inspection-images (fallback)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inspection-images',
  'inspection-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ✅ POLÍTICAS RLS: Para bucket alternativo

-- Política para SELECT (ver imágenes)
CREATE POLICY "Users can view inspection images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'inspection-images');

-- Política para INSERT (subir imágenes)
CREATE POLICY "Users can upload inspection images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'inspection-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para UPDATE (actualizar metadatos)
CREATE POLICY "Users can update their inspection images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'inspection-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'inspection-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para DELETE (eliminar imágenes)
CREATE POLICY "Users can delete their inspection images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'inspection-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ✅ FUNCIÓN: Limpiar imágenes huérfanas (opcional)
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS void AS $$
DECLARE
    image_record RECORD;
    inspection_exists boolean;
BEGIN
    -- Buscar imágenes en storage que no tienen inspección asociada
    FOR image_record IN 
        SELECT name, bucket_id FROM storage.objects 
        WHERE bucket_id IN ('inspection-photos', 'inspection-images')
    LOOP
        -- Extraer ID de inspección del path
        IF array_length(string_to_array(image_record.name, '/'), 1) >= 2 THEN
            SELECT EXISTS(
                SELECT 1 FROM public.inspections 
                WHERE id::text = split_part(image_record.name, '/', 1)
            ) INTO inspection_exists;
            
            -- Si la inspección no existe, marcar para limpieza (no eliminar automáticamente)
            IF NOT inspection_exists THEN
                RAISE NOTICE 'Imagen huérfana encontrada: % en bucket %', 
                    image_record.name, image_record.bucket_id;
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ✅ VERIFICACIÓN: Comprobar que los buckets fueron creados
DO $$
BEGIN
    -- Verificar bucket inspection-photos
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'inspection-photos'
    ) THEN
        RAISE EXCEPTION 'Error: El bucket inspection-photos no fue creado';
    END IF;
    
    -- Verificar bucket inspection-images
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'inspection-images'
    ) THEN
        RAISE EXCEPTION 'Error: El bucket inspection-images no fue creado';
    END IF;
    
    RAISE NOTICE 'Buckets de storage configurados exitosamente';
    RAISE NOTICE 'inspection-photos: % policies', (
        SELECT count(*) FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' 
        AND policyname LIKE '%inspection photos%'
    );
    RAISE NOTICE 'inspection-images: % policies', (
        SELECT count(*) FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' 
        AND policyname LIKE '%inspection images%'
    );
END $$;