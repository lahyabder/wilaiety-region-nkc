-- Create storage bucket for facility documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'facility-documents', 
  'facility-documents', 
  true, 
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg']
);

-- Create RLS policies for facility documents bucket
CREATE POLICY "Allow authenticated users to upload facility documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'facility-documents');

CREATE POLICY "Allow authenticated users to update their facility documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'facility-documents');

CREATE POLICY "Allow authenticated users to delete their facility documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'facility-documents');

CREATE POLICY "Allow public read access to facility documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'facility-documents');