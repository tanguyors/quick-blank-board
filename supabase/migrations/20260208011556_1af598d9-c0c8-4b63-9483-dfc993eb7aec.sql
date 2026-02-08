-- Add new property types
ALTER TYPE public.property_type ADD VALUE IF NOT EXISTS 'commercial';
ALTER TYPE public.property_type ADD VALUE IF NOT EXISTS 'construction';
ALTER TYPE public.property_type ADD VALUE IF NOT EXISTS 'maison_a_renover';
ALTER TYPE public.property_type ADD VALUE IF NOT EXISTS 'colocation_longue';
ALTER TYPE public.property_type ADD VALUE IF NOT EXISTS 'colocation_courte';
ALTER TYPE public.property_type ADD VALUE IF NOT EXISTS 'hebergement_service';
ALTER TYPE public.property_type ADD VALUE IF NOT EXISTS 'hebergement_animaux';
ALTER TYPE public.property_type ADD VALUE IF NOT EXISTS 'guesthouse';

-- Add freehold/leasehold to droit enum
ALTER TYPE public.property_droit ADD VALUE IF NOT EXISTS 'freehold';
ALTER TYPE public.property_droit ADD VALUE IF NOT EXISTS 'leasehold';

-- Add achat to operations
ALTER TYPE public.property_operation ADD VALUE IF NOT EXISTS 'achat';