-- Create sectors enum
CREATE TYPE public.facility_sector AS ENUM (
  'صحية', 'تعليمية', 'صناعية', 'زراعية', 'رياضية', 'ثقافية', 'اجتماعية', 
  'دينية', 'نقل', 'تجارة', 'سياحة', 'إدارية', 'قضائية', 'سياسية', 
  'مالية', 'كهربائية', 'مائية', 'تكنولوجية', 'بيئية'
);

-- Create ownership type enum
CREATE TYPE public.ownership_type AS ENUM (
  'ملكية كاملة', 'إيجار', 'شراكة', 'مملوكة مع جهة أخرى'
);

-- Create legal domain enum
CREATE TYPE public.legal_domain AS ENUM (
  'مجال عام للجهة', 'مجال خاص للجهة', 'خارج ملكية الجهة'
);

-- Create jurisdiction type enum
CREATE TYPE public.jurisdiction_type AS ENUM (
  'خاص', 'محال', 'تنسيق'
);

-- Create facility status enum
CREATE TYPE public.facility_status AS ENUM (
  'نشط', 'غير نشط', 'قيد الإنشاء', 'معلق'
);

-- Create facilities table
CREATE TABLE public.facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  sector facility_sector NOT NULL,
  activity_type TEXT NOT NULL,
  facility_type TEXT NOT NULL,
  jurisdiction_type jurisdiction_type NOT NULL,
  created_date DATE NOT NULL,
  description TEXT,
  gps_coordinates TEXT,
  location_accuracy TEXT DEFAULT 'متوسطة',
  region TEXT NOT NULL,
  address TEXT NOT NULL,
  ownership ownership_type NOT NULL,
  legal_domain legal_domain NOT NULL,
  status facility_status NOT NULL DEFAULT 'نشط',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public read for now, will add auth later)
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view facilities" 
ON public.facilities 
FOR SELECT 
USING (true);

-- Create policy for public insert (temporary - will be restricted with auth)
CREATE POLICY "Anyone can insert facilities" 
ON public.facilities 
FOR INSERT 
WITH CHECK (true);

-- Create policy for public update (temporary - will be restricted with auth)
CREATE POLICY "Anyone can update facilities" 
ON public.facilities 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_facilities_updated_at
BEFORE UPDATE ON public.facilities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for facilities table
ALTER PUBLICATION supabase_realtime ADD TABLE public.facilities;