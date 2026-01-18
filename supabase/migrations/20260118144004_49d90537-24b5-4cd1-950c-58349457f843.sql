-- Add image_url column to licenses table for storing license images
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS image_url TEXT;