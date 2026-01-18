-- Create facility_documents table to store document references
CREATE TABLE public.facility_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.facility_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view facility documents"
ON public.facility_documents
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can insert facility documents"
ON public.facility_documents
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update facility documents"
ON public.facility_documents
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete facility documents"
ON public.facility_documents
FOR DELETE
TO authenticated
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_facility_documents_updated_at
BEFORE UPDATE ON public.facility_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();