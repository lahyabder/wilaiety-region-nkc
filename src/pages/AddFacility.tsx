import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateFacility, type FacilitySector, type OwnershipType, type LegalDomain, type JurisdictionType, type FacilityStatus } from "@/hooks/useFacilities";
import { 
  ArrowRight, 
  Building2, 
  MapPin, 
  Save, 
  X,
  FileText,
  Scale,
  Upload
} from "lucide-react";

const sectors: FacilitySector[] = [
  "صحية", "تعليمية", "صناعية", "زراعية", "رياضية", "ثقافية", "اجتماعية", 
  "دينية", "نقل", "تجارة", "سياحة", "إدارية", "قضائية", "سياسية", 
  "مالية", "كهربائية", "مائية", "تكنولوجية", "بيئية"
];

const ownershipTypes: OwnershipType[] = ["ملكية كاملة", "إيجار", "شراكة", "مملوكة مع جهة أخرى"];
const legalDomains: LegalDomain[] = ["مجال عام للجهة", "مجال خاص للجهة", "خارج ملكية الجهة"];
const facilityTypes: JurisdictionType[] = ["خاص", "محال", "تنسيق"];
const statusOptions: FacilityStatus[] = ["نشط", "غير نشط", "قيد الإنشاء", "معلق"];

// Zod validation schema
const facilitySchema = z.object({
  name: z.string()
    .min(3, { message: "اسم المنشأة يجب أن يكون 3 أحرف على الأقل" })
    .max(100, { message: "اسم المنشأة يجب ألا يتجاوز 100 حرف" }),
  shortName: z.string()
    .min(2, { message: "اختصار الاسم يجب أن يكون حرفين على الأقل" })
    .max(20, { message: "اختصار الاسم يجب ألا يتجاوز 20 حرف" }),
  legalName: z.string()
    .min(5, { message: "الاسم القانوني يجب أن يكون 5 أحرف على الأقل" })
    .max(150, { message: "الاسم القانوني يجب ألا يتجاوز 150 حرف" }),
  sector: z.string()
    .min(1, { message: "يرجى اختيار القطاع" }),
  activityType: z.string()
    .min(3, { message: "نوع النشاط يجب أن يكون 3 أحرف على الأقل" })
    .max(100, { message: "نوع النشاط يجب ألا يتجاوز 100 حرف" }),
  facilityType: z.string()
    .min(1, { message: "يرجى اختيار صفة المنشأة" }),
  jurisdictionType: z.string()
    .min(1, { message: "يرجى اختيار نوع الاختصاص" }),
  createdDate: z.string()
    .min(1, { message: "يرجى تحديد تاريخ الإنشاء" }),
  description: z.string()
    .min(10, { message: "الوصف يجب أن يكون 10 أحرف على الأقل" })
    .max(500, { message: "الوصف يجب ألا يتجاوز 500 حرف" }),
  gps: z.string()
    .regex(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/, { message: "صيغة الإحداثيات غير صحيحة (مثال: 36.7538, 3.0588)" })
    .optional()
    .or(z.literal("")),
  region: z.string()
    .min(2, { message: "المنطقة يجب أن تكون حرفين على الأقل" })
    .max(50, { message: "المنطقة يجب ألا تتجاوز 50 حرف" }),
  address: z.string()
    .min(5, { message: "العنوان يجب أن يكون 5 أحرف على الأقل" })
    .max(200, { message: "العنوان يجب ألا يتجاوز 200 حرف" }),
  ownership: z.string()
    .min(1, { message: "يرجى اختيار نوع الملكية" }),
  legalDomain: z.string()
    .min(1, { message: "يرجى اختيار المجال القانوني" }),
  status: z.string()
    .min(1, { message: "يرجى اختيار الحالة" }),
});

type FacilityFormData = z.infer<typeof facilitySchema>;

const AddFacility = () => {
  const navigate = useNavigate();
  const createFacility = useCreateFacility();

  const form = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      name: "",
      shortName: "",
      legalName: "",
      sector: "",
      activityType: "",
      facilityType: "",
      jurisdictionType: "",
      createdDate: "",
      description: "",
      gps: "",
      region: "",
      address: "",
      ownership: "",
      legalDomain: "",
      status: "نشط",
    },
  });

  const onSubmit = async (data: FacilityFormData) => {
    await createFacility.mutateAsync({
      name: data.name,
      short_name: data.shortName,
      legal_name: data.legalName,
      sector: data.sector as FacilitySector,
      activity_type: data.activityType,
      facility_type: data.facilityType,
      jurisdiction_type: data.jurisdictionType as JurisdictionType,
      created_date: data.createdDate,
      description: data.description,
      gps_coordinates: data.gps || undefined,
      region: data.region,
      address: data.address,
      ownership: data.ownership as OwnershipType,
      legal_domain: data.legalDomain as LegalDomain,
      status: data.status as FacilityStatus,
    });
    
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">
              لوحة التحكم
            </button>
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="text-foreground">إضافة منشأة جديدة</span>
          </div>

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">إضافة منشأة جديدة</h1>
              <p className="text-muted-foreground">أدخل بيانات المنشأة الجديدة</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Basic Info Section */}
                <div className="card-institutional space-y-5">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">البيانات الأساسية</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المنشأة *</FormLabel>
                          <FormControl>
                            <Input placeholder="مثال: مستشفى المدينة المركزي" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="shortName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اختصار الاسم *</FormLabel>
                            <FormControl>
                              <Input placeholder="مثال: م.م.م" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="createdDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تاريخ الإنشاء *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="legalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم القانوني *</FormLabel>
                          <FormControl>
                            <Input placeholder="الاسم الرسمي كما في الوثائق القانونية" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الوصف العام *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="وصف موجز عن المنشأة ونشاطها"
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value?.length || 0}/500 حرف
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Classification Section */}
                <div className="card-institutional space-y-5">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">التصنيف والنشاط</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="sector"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>القطاع *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر القطاع" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sectors.map((sector) => (
                                <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="activityType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع النشاط *</FormLabel>
                          <FormControl>
                            <Input placeholder="مثال: خدمات طبية شاملة" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="facilityType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>صفة المنشأة *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر صفة المنشأة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="عام">عام</SelectItem>
                              <SelectItem value="خاص">خاص</SelectItem>
                              <SelectItem value="شبه عام">شبه عام</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jurisdictionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع الاختصاص *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع الاختصاص" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {facilityTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الحالة *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الحالة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Location Section */}
                <div className="card-institutional space-y-5">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">الموقع الجغرافي</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="gps"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>إحداثيات GPS</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="مثال: 36.7538, 3.0588" 
                              dir="ltr"
                              className="font-mono text-left"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            صيغة: خط العرض، خط الطول
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المنطقة / النطاق *</FormLabel>
                          <FormControl>
                            <Input placeholder="مثال: المنطقة الشمالية" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العنوان التفصيلي *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="الشارع، الحي، المعالم القريبة"
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Map placeholder */}
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <span className="text-sm text-muted-foreground">خريطة تفاعلية</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Section */}
                <div className="card-institutional space-y-5">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Scale className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">الوضع القانوني والملكية</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="ownership"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع الملكية *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع الملكية" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ownershipTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="legalDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المجال القانوني *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المجال القانوني" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {legalDomains.map((domain) => (
                                <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            يحدد الإطار القانوني للتصرف في المنشأة
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Documents upload placeholder */}
                    <div>
                      <FormLabel>المستندات الداعمة</FormLabel>
                      <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          اسحب الملفات هنا أو انقر للرفع
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, DOC, JPG - حد أقصى 10 ميجابايت
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/")}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={createFacility.isPending}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {createFacility.isPending ? "جاري الحفظ..." : "حفظ المنشأة"}
                </Button>
              </div>
            </form>
          </Form>
        </main>
      </div>
    </div>
  );
};

export default AddFacility;
