import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FacilityImageUploadProps {
  facilityId: string;
  currentImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
  isEditing: boolean;
}

const FacilityImageUpload = ({ 
  facilityId, 
  currentImageUrl, 
  onImageUploaded, 
  isEditing 
}: FacilityImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صالح");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    setUploading(true);

    try {
      // Create unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${facilityId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("facility-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("facility-images")
        .getPublicUrl(data.path);

      const publicUrl = urlData.publicUrl;
      setPreviewUrl(publicUrl);
      onImageUploaded(publicUrl);
      toast.success("تم رفع الصورة بنجاح");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("فشل في رفع الصورة: " + (error.message || "خطأ غير معروف"));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={!isEditing || uploading}
      />

      {previewUrl ? (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="صورة المنشأة"
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          {isEditing && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span className="mr-2">تغيير</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
              >
                <X className="w-4 h-4" />
                <span className="mr-2">حذف</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => isEditing && fileInputRef.current?.click()}
          className={`
            aspect-video bg-muted rounded-lg flex items-center justify-center 
            border-2 border-dashed border-border 
            ${isEditing ? "hover:border-primary cursor-pointer" : ""} 
            transition-colors
          `}
        >
          {uploading ? (
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-primary mx-auto mb-2 animate-spin" />
              <span className="text-sm text-muted-foreground">جاري الرفع...</span>
            </div>
          ) : isEditing ? (
            <div className="text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <span className="text-sm text-muted-foreground">انقر لرفع صورة</span>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG حتى 5 ميجابايت</p>
            </div>
          ) : (
            <Camera className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );
};

export default FacilityImageUpload;
