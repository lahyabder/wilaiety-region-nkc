-- Add French name column to facilities table
ALTER TABLE public.facilities ADD COLUMN name_fr text;

-- Add French short name column
ALTER TABLE public.facilities ADD COLUMN short_name_fr text;

-- Add French legal name column  
ALTER TABLE public.facilities ADD COLUMN legal_name_fr text;

-- Add French description column
ALTER TABLE public.facilities ADD COLUMN description_fr text;

-- Add French address column
ALTER TABLE public.facilities ADD COLUMN address_fr text;

-- Add French activity type column
ALTER TABLE public.facilities ADD COLUMN activity_type_fr text;

-- Add French facility type column
ALTER TABLE public.facilities ADD COLUMN facility_type_fr text;