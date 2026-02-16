-- Add leasehold and freehold to property_operation enum
ALTER TYPE public.property_operation ADD VALUE IF NOT EXISTS 'leasehold';
ALTER TYPE public.property_operation ADD VALUE IF NOT EXISTS 'freehold';
