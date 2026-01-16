import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type FacilitySector = 
  | "صحية" | "تعليمية" | "صناعية" | "زراعية" | "رياضية" | "ثقافية" | "اجتماعية" 
  | "دينية" | "نقل" | "تجارة" | "سياحة" | "إدارية" | "قضائية" | "سياسية" 
  | "مالية" | "كهربائية" | "مائية" | "تكنولوجية" | "بيئية";

export type OwnershipType = "ملكية كاملة" | "إيجار" | "شراكة" | "مملوكة مع جهة أخرى";
export type LegalDomain = "مجال عام للجهة" | "مجال خاص للجهة" | "خارج ملكية الجهة";
export type JurisdictionType = "خاص" | "محال" | "تنسيق";
export type FacilityStatus = "نشط" | "غير نشط" | "قيد الإنشاء" | "معلق";

export interface Facility {
  id: string;
  name: string;
  short_name: string;
  legal_name: string;
  sector: FacilitySector;
  activity_type: string;
  facility_type: string;
  jurisdiction_type: JurisdictionType;
  created_date: string;
  description: string | null;
  gps_coordinates: string | null;
  location_accuracy: string | null;
  region: string;
  address: string;
  ownership: OwnershipType;
  legal_domain: LegalDomain;
  status: FacilityStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateFacilityData {
  name: string;
  short_name: string;
  legal_name: string;
  sector: FacilitySector;
  activity_type: string;
  facility_type: string;
  jurisdiction_type: JurisdictionType;
  created_date: string;
  description?: string;
  gps_coordinates?: string;
  region: string;
  address: string;
  ownership: OwnershipType;
  legal_domain: LegalDomain;
  status?: FacilityStatus;
}

export const useFacilities = () => {
  return useQuery({
    queryKey: ["facilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data as Facility[];
    },
  });
};

export const useFacility = (id: string) => {
  return useQuery({
    queryKey: ["facility", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return data as Facility;
    },
    enabled: !!id,
  });
};

export const useCreateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (facilityData: CreateFacilityData) => {
      const { data, error } = await supabase
        .from("facilities")
        .insert([facilityData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة المنشأة الجديدة بنجاح",
      });
    },
    onError: (error) => {
      console.error("Error creating facility:", error);
      toast({
        title: "خطأ في الإضافة",
        description: "حدث خطأ أثناء إضافة المنشأة",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...facilityData }: Partial<Facility> & { id: string }) => {
      const { data, error } = await supabase
        .from("facilities")
        .update(facilityData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      queryClient.invalidateQueries({ queryKey: ["facility", data.id] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات المنشأة بنجاح",
      });
    },
    onError: (error) => {
      console.error("Error updating facility:", error);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث بيانات المنشأة",
        variant: "destructive",
      });
    },
  });
};

export const useFacilityStats = () => {
  return useQuery({
    queryKey: ["facility-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facilities")
        .select("sector, status");

      if (error) {
        throw error;
      }

      const facilities = data as { sector: FacilitySector; status: FacilityStatus }[];
      
      // Calculate stats
      const total = facilities.length;
      const active = facilities.filter(f => f.status === "نشط").length;
      const pending = facilities.filter(f => f.status === "قيد الإنشاء" || f.status === "معلق").length;
      const inactive = facilities.filter(f => f.status === "غير نشط").length;

      // Count by sector
      const sectorCounts: Record<string, number> = {};
      facilities.forEach(f => {
        sectorCounts[f.sector] = (sectorCounts[f.sector] || 0) + 1;
      });

      return {
        total,
        active,
        pending,
        inactive,
        sectorCounts,
      };
    },
  });
};
