-- Create license status enum
CREATE TYPE public.license_status AS ENUM (
  'ساري', 'قريب الانتهاء', 'منتهي', 'ملغى'
);

-- Create licenses table
CREATE TABLE public.licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  license_number TEXT NOT NULL UNIQUE,
  license_type TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status license_status NOT NULL DEFAULT 'ساري',
  notes TEXT,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view licenses" 
ON public.licenses 
FOR SELECT 
USING (true);

-- Create policy for public insert
CREATE POLICY "Anyone can insert licenses" 
ON public.licenses 
FOR INSERT 
WITH CHECK (true);

-- Create policy for public update
CREATE POLICY "Anyone can update licenses" 
ON public.licenses 
FOR UPDATE 
USING (true);

-- Create policy for public delete
CREATE POLICY "Anyone can delete licenses" 
ON public.licenses 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_licenses_updated_at
BEFORE UPDATE ON public.licenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-update license status based on expiry
CREATE OR REPLACE FUNCTION public.update_license_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date < CURRENT_DATE THEN
    NEW.status = 'منتهي';
  ELSIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
    NEW.status = 'قريب الانتهاء';
  ELSE
    NEW.status = 'ساري';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-update status on insert/update
CREATE TRIGGER auto_update_license_status
BEFORE INSERT OR UPDATE OF expiry_date ON public.licenses
FOR EACH ROW
EXECUTE FUNCTION public.update_license_status();

-- Enable realtime for licenses table
ALTER PUBLICATION supabase_realtime ADD TABLE public.licenses;