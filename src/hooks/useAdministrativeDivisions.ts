import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdministrativeDivision {
  id: string;
  name: string;
  name_fr: string;
  gps_coordinates: string | null;
  division_type: string;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDivisionData {
  name: string;
  name_fr: string;
  gps_coordinates?: string;
  division_type: string;
  parent_id?: string;
  is_active?: boolean;
}

export const useAdministrativeDivisions = () => {
  return useQuery({
    queryKey: ["administrative-divisions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("administrative_divisions")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as AdministrativeDivision[];
    },
  });
};

export const useAllAdministrativeDivisions = () => {
  return useQuery({
    queryKey: ["administrative-divisions-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("administrative_divisions")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as AdministrativeDivision[];
    },
  });
};

export const useCreateDivision = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateDivisionData) => {
      const { data: division, error } = await supabase
        .from("administrative_divisions")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return division;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["administrative-divisions"] });
      queryClient.invalidateQueries({ queryKey: ["administrative-divisions-all"] });
      toast({
        title: "تمت الإضافة",
        description: "تم إضافة التقسيم الإداري بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة التقسيم الإداري",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateDivision = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AdministrativeDivision> & { id: string }) => {
      const { data: division, error } = await supabase
        .from("administrative_divisions")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return division;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["administrative-divisions"] });
      queryClient.invalidateQueries({ queryKey: ["administrative-divisions-all"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث التقسيم الإداري بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث التقسيم الإداري",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteDivision = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("administrative_divisions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["administrative-divisions"] });
      queryClient.invalidateQueries({ queryKey: ["administrative-divisions-all"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف التقسيم الإداري بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف التقسيم الإداري",
        variant: "destructive",
      });
    },
  });
};
