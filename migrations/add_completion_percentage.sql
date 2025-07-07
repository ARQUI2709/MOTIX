-- migrations/add_completion_percentage.sql
-- 🔧 MIGRACIÓN: Agregar columna completion_percentage a la tabla inspections
-- Ejecutar en Supabase SQL Editor

-- ✅ AGREGAR COLUMNA: completion_percentage
ALTER TABLE public.inspections 
ADD COLUMN IF NOT EXISTS completion_percentage numeric DEFAULT 0 
CHECK (completion_percentage >= 0 AND completion_percentage <= 100);

-- ✅ COMENTARIO: Documentar el propósito de la columna
COMMENT ON COLUMN public.inspections.completion_percentage 
IS 'Porcentaje de completitud de la inspección (0-100)';

-- ✅ ACTUALIZAR REGISTROS EXISTENTES: Calcular completion_percentage para inspecciones existentes
UPDATE public.inspections 
SET completion_percentage = 0 
WHERE completion_percentage IS NULL;

-- ✅ ÍNDICE: Mejorar rendimiento de consultas por completion_percentage
CREATE INDEX IF NOT EXISTS idx_inspections_completion_percentage 
ON public.inspections(completion_percentage);

-- ✅ FUNCIÓN: Calcular automáticamente completion_percentage
CREATE OR REPLACE FUNCTION calculate_completion_percentage(inspection_data jsonb)
RETURNS numeric AS $$
DECLARE
    total_items integer := 0;
    evaluated_items integer := 0;
    category_key text;
    category_data jsonb;
    item_key text;
    item_data jsonb;
BEGIN
    -- Iterar sobre todas las categorías
    FOR category_key IN SELECT jsonb_object_keys(inspection_data)
    LOOP
        category_data := inspection_data -> category_key;
        
        -- Iterar sobre todos los ítems de la categoría
        FOR item_key IN SELECT jsonb_object_keys(category_data)
        LOOP
            item_data := category_data -> item_key;
            total_items := total_items + 1;
            
            -- Verificar si el ítem fue evaluado
            IF (item_data ->> 'evaluated')::boolean = true THEN
                evaluated_items := evaluated_items + 1;
            END IF;
        END LOOP;
    END LOOP;
    
    -- Calcular porcentaje
    IF total_items > 0 THEN
        RETURN ROUND((evaluated_items::numeric / total_items::numeric) * 100, 2);
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ✅ TRIGGER: Actualizar completion_percentage automáticamente
CREATE OR REPLACE FUNCTION update_completion_percentage()
RETURNS TRIGGER AS $$
BEGIN
    NEW.completion_percentage := calculate_completion_percentage(NEW.inspection_data);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ✅ CREAR TRIGGER: Ejecutar antes de INSERT y UPDATE
DROP TRIGGER IF EXISTS trigger_update_completion_percentage ON public.inspections;
CREATE TRIGGER trigger_update_completion_percentage
    BEFORE INSERT OR UPDATE OF inspection_data
    ON public.inspections
    FOR EACH ROW
    EXECUTE FUNCTION update_completion_percentage();

-- ✅ ACTUALIZAR REGISTROS EXISTENTES: Recalcular completion_percentage
UPDATE public.inspections 
SET completion_percentage = calculate_completion_percentage(inspection_data)
WHERE inspection_data IS NOT NULL AND inspection_data != '{}'::jsonb;

-- ✅ POLÍTICA RLS: Asegurar que completion_percentage respete las políticas existentes
-- (Las políticas RLS existentes se aplicarán automáticamente a la nueva columna)

-- ✅ VERIFICACIÓN: Comprobar que la migración fue exitosa
DO $$
BEGIN
    -- Verificar que la columna existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inspections' 
        AND column_name = 'completion_percentage'
        AND table_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'Error: La columna completion_percentage no fue creada correctamente';
    END IF;
    
    -- Verificar que el trigger existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_update_completion_percentage'
        AND event_object_table = 'inspections'
        AND event_object_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'Error: El trigger trigger_update_completion_percentage no fue creado correctamente';
    END IF;
    
    RAISE NOTICE 'Migración completada exitosamente';
END $$;