-- Add image_url column to facilities table
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS image_url text;

-- Create storage bucket for facility images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('facility-images', 'facility-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Anyone can upload facility images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'facility-images');

-- Create policy to allow public read access
CREATE POLICY "Facility images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'facility-images');

-- Create policy to allow authenticated users to update their uploads
CREATE POLICY "Anyone can update facility images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'facility-images');

-- Create policy to allow authenticated users to delete images
CREATE POLICY "Anyone can delete facility images"
ON storage.objects FOR DELETE
USING (bucket_id = 'facility-images');