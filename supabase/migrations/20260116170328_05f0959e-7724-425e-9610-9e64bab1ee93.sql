-- Create administrative divisions table
CREATE TABLE public.administrative_divisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  gps_coordinates TEXT,
  division_type TEXT NOT NULL DEFAULT 'بلدية',
  parent_id UUID REFERENCES public.administrative_divisions(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.administrative_divisions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view administrative divisions" 
ON public.administrative_divisions 
FOR SELECT 
USING (true);

-- Only admins can manage divisions
CREATE POLICY "Admins can insert administrative divisions" 
ON public.administrative_divisions 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update administrative divisions" 
ON public.administrative_divisions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete administrative divisions" 
ON public.administrative_divisions 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_administrative_divisions_updated_at
BEFORE UPDATE ON public.administrative_divisions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default divisions for Dakhlet Nouadhibou with GPS coordinates
INSERT INTO public.administrative_divisions (name, name_fr, gps_coordinates, division_type) VALUES
('ولاية داخلت نواذيبو', 'Wilaya de Dakhlet Nouadhibou', '20.9333, -17.0333', 'ولاية'),
('بلدية نواذيبو', 'Commune de Nouadhibou', '20.9420, -17.0470', 'بلدية'),
('بلدية بولنوار', 'Commune de Boulanoir', '20.8500, -17.0500', 'بلدية'),
('بلدية الشامي', 'Commune de Chami', '21.3833, -16.0167', 'مقاطعة'),
('مقاطعة نواذيبو', 'Moughataa de Nouadhibou', '20.9333, -17.0333', 'مقاطعة'),
('مقاطعة بولنوار', 'Moughataa de Boulanoir', '20.8500, -17.0500', 'مقاطعة'),
('سلطة منطقة نواذيبو الحرة', 'Autorité de la Zone Franche de Nouadhibou', '20.9500, -17.0400', 'منطقة حرة');