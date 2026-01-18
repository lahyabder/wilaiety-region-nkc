import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type LicenseStatus = "ساري" | "قريب الانتهاء" | "منتهي" | "ملغى";

export interface License {
  id: string;
  facility_id: string;
  license_number: string;
  license_type: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  status: LicenseStatus;
  notes: string | null;
  document_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  facilities?: {
    id: string;
    name: string;
    sector: string;
    region: string;
  };
}

export interface CreateLicenseData {
  facility_id: string;
  license_number: string;
  license_type: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  notes?: string;
}

export const useLicenses = () => {
  return useQuery({
    queryKey: ["licenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("licenses")
        .select(`
          *,
          facilities (
            id,
            name,
            sector,
            region
          )
        `)
        .order("expiry_date", { ascending: true });

      if (error) {
        throw error;
      }

      return data as License[];
    },
  });
};

export const useLicense = (id: string) => {
  return useQuery({
    queryKey: ["license", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("licenses")
        .select(`
          *,
          facilities (
            id,
            name,
            sector,
            region
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data as License | null;
    },
    enabled: !!id,
  });
};

export const useFacilityLicenses = (facilityId: string) => {
  return useQuery({
    queryKey: ["facility-licenses", facilityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("licenses")
        .select("*")
        .eq("facility_id", facilityId)
        .order("expiry_date", { ascending: false });

      if (error) {
        throw error;
      }

      return data as License[];
    },
    enabled: !!facilityId,
  });
};

export const useCreateLicense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (licenseData: CreateLicenseData) => {
      const { data, error } = await supabase
        .from("licenses")
        .insert([licenseData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة الترخيص الجديد بنجاح",
      });
    },
    onError: (error) => {
      console.error("Error creating license:", error);
      toast({
        title: "خطأ في الإضافة",
        description: "حدث خطأ أثناء إضافة الترخيص",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateLicense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...licenseData }: Partial<License> & { id: string }) => {
      const { data, error } = await supabase
        .from("licenses")
        .update(licenseData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      queryClient.invalidateQueries({ queryKey: ["license", data.id] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات الترخيص بنجاح",
      });
    },
    onError: (error) => {
      console.error("Error updating license:", error);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث بيانات الترخيص",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteLicense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("licenses")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الترخيص بنجاح",
      });
    },
    onError: (error) => {
      console.error("Error deleting license:", error);
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف الترخيص",
        variant: "destructive",
      });
    },
  });
};

export const useLicenseStats = () => {
  return useQuery({
    queryKey: ["license-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("licenses")
        .select("status");

      if (error) {
        throw error;
      }

      const licenses = data as { status: LicenseStatus }[];
      
      const total = licenses.length;
      const active = licenses.filter(l => l.status === "ساري").length;
      const expiringSoon = licenses.filter(l => l.status === "قريب الانتهاء").length;
      const expired = licenses.filter(l => l.status === "منتهي").length;
      const cancelled = licenses.filter(l => l.status === "ملغى").length;

      return {
        total,
        active,
        expiringSoon,
        expired,
        cancelled,
      };
    },
  });
};
