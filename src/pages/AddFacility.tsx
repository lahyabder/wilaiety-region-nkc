import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
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
import FacilityLocationEditor from "@/components/FacilityLocationEditor";
import { useAdministrativeDivisions } from "@/hooks/useAdministrativeDivisions";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Save, 
  X,
  FileText,
  Scale,
  Upload,
  Loader2,
  Navigation,
  LocateFixed
} from "lucide-react";

const sectors: FacilitySector[] = [
  "صحية", "تعليمية", "صناعية", "زراعية", "رياضية", "ثقافية", "اجتماعية", 
  "دينية", "نقل", "تجارة", "سياحة", "إدارية", "قضائية", "سياسية", 
  "مالية", "كهربائية", "مائية", "تكنولوجية", "بيئية"
];

const sectorLabels: Record<FacilitySector, string> = {
  "صحية": "Santé",
  "تعليمية": "Éducation",
  "صناعية": "Industrie",
  "زراعية": "Agriculture",
  "رياضية": "Sport",
  "ثقافية": "Culture",
  "اجتماعية": "Social",
  "دينية": "Religieux",
  "نقل": "Transport",
  "تجارة": "Commerce",
  "سياحة": "Tourisme",
  "إدارية": "Administratif",
  "قضائية": "Judiciaire",
  "سياسية": "Politique",
  "مالية": "Finance",
  "كهربائية": "Électricité",
  "مائية": "Eau",
  "تكنولوجية": "Technologie",
  "بيئية": "Environnement",
};

const ownershipTypes: OwnershipType[] = ["ملكية كاملة", "إيجار", "شراكة", "مملوكة مع جهة أخرى"];
const ownershipLabelsAr: Record<OwnershipType, string> = {
  "ملكية كاملة": "ملكية كاملة",
  "إيجار": "إيجار",
  "شراكة": "شراكة",
  "مملوكة مع جهة أخرى": "ملكية مشتركة",
};
const ownershipLabelsFr: Record<OwnershipType, string> = {
  "ملكية كاملة": "Propriété totale",
  "إيجار": "Location",
  "شراكة": "Partenariat",
  "مملوكة مع جهة أخرى": "Copropriété",
};

const legalDomains: LegalDomain[] = ["مجال عام للجهة", "مجال خاص للجهة", "خارج ملكية الجهة"];
const legalDomainLabelsAr: Record<LegalDomain, string> = {
  "مجال عام للجهة": "مجال عام للجهة",
  "مجال خاص للجهة": "مجال خاص للجهة",
  "خارج ملكية الجهة": "خارج ملكية الجهة",
};
const legalDomainLabelsFr: Record<LegalDomain, string> = {
  "مجال عام للجهة": "Domaine public",
  "مجال خاص للجهة": "Domaine privé",
  "خارج ملكية الجهة": "Hors propriété",
};

const facilityTypes: JurisdictionType[] = ["خاص", "محال", "تنسيق"];
const jurisdictionLabelsAr: Record<JurisdictionType, string> = {
  "خاص": "خاص",
  "محال": "محال",
  "تنسيق": "تنسيق",
};
const jurisdictionLabelsFr: Record<JurisdictionType, string> = {
  "خاص": "Privé",
  "محال": "Délégué",
  "تنسيق": "Coordination",
};

const statusOptions: FacilityStatus[] = ["نشط", "غير نشط", "قيد الإنشاء", "معلق"];
const statusLabels: Record<FacilityStatus, string> = {
  "نشط": "Actif",
  "غير نشط": "Inactif",
  "قيد الإنشاء": "En construction",
  "معلق": "Suspendu",
};


// Zod validation schema
const facilitySchema = z.object({
  name: z.string()
    .min(3, { message: "يجب أن يحتوي الاسم على 3 أحرف على الأقل" })
    .max(100, { message: "يجب ألا يتجاوز الاسم 100 حرف" }),
  nameFr: z.string()
    .min(3, { message: "Le nom doit contenir au moins 3 caractères" })
    .max(100, { message: "Le nom ne doit pas dépasser 100 caractères" }),
  shortName: z.string()
    .min(2, { message: "يجب أن يحتوي الاختصار على حرفين على الأقل" })
    .max(20, { message: "يجب ألا يتجاوز الاختصار 20 حرفاً" }),
  shortNameFr: z.string()
    .min(2, { message: "L'abréviation doit contenir au moins 2 caractères" })
    .max(20, { message: "L'abréviation ne doit pas dépasser 20 caractères" })
    .optional()
    .or(z.literal("")),
  legalName: z.string()
    .min(5, { message: "يجب أن يحتوي الاسم القانوني على 5 أحرف على الأقل" })
    .max(150, { message: "يجب ألا يتجاوز الاسم القانوني 150 حرفاً" }),
  legalNameFr: z.string()
    .min(5, { message: "Le nom légal doit contenir au moins 5 caractères" })
    .max(150, { message: "Le nom légal ne doit pas dépasser 150 caractères" })
    .optional()
    .or(z.literal("")),
  sector: z.string()
    .min(1, { message: "الرجاء اختيار القطاع" }),
  activityType: z.string()
    .min(3, { message: "يجب أن يحتوي نوع النشاط على 3 أحرف على الأقل" })
    .max(100, { message: "يجب ألا يتجاوز نوع النشاط 100 حرف" }),
  activityTypeFr: z.string()
    .min(3, { message: "Le type d'activité doit contenir au moins 3 caractères" })
    .max(100, { message: "Le type d'activité ne doit pas dépasser 100 caractères" })
    .optional()
    .or(z.literal("")),
  facilityType: z.string()
    .min(1, { message: "الرجاء اختيار نوع المنشأة" }),
  facilityTypeFr: z.string()
    .max(50, { message: "Le type ne doit pas dépasser 50 caractères" })
    .optional()
    .or(z.literal("")),
  jurisdictionType: z.string()
    .min(1, { message: "الرجاء اختيار نوع الولاية القضائية" }),
  createdDate: z.string()
    .min(1, { message: "الرجاء تحديد تاريخ الإنشاء" }),
  description: z.string()
    .min(10, { message: "يجب أن يحتوي الوصف على 10 أحرف على الأقل" })
    .max(500, { message: "يجب ألا يتجاوز الوصف 500 حرف" }),
  descriptionFr: z.string()
    .min(10, { message: "La description doit contenir au moins 10 caractères" })
    .max(500, { message: "La description ne doit pas dépasser 500 caractères" })
    .optional()
    .or(z.literal("")),
  gps: z.string()
    .regex(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/, { message: "صيغة الإحداثيات غير صحيحة (مثال: 36.7538, 3.0588)" })
    .optional()
    .or(z.literal("")),
  region: z.string()
    .min(2, { message: "يجب أن تحتوي المنطقة على حرفين على الأقل" })
    .max(50, { message: "يجب ألا تتجاوز المنطقة 50 حرفاً" }),
  address: z.string()
    .min(5, { message: "يجب أن يحتوي العنوان على 5 أحرف على الأقل" })
    .max(200, { message: "يجب ألا يتجاوز العنوان 200 حرف" }),
  addressFr: z.string()
    .min(5, { message: "L'adresse doit contenir au moins 5 caractères" })
    .max(200, { message: "L'adresse ne doit pas dépasser 200 caractères" })
    .optional()
    .or(z.literal("")),
  ownership: z.string()
    .min(1, { message: "الرجاء اختيار نوع الملكية" }),
  legalDomain: z.string()
    .min(1, { message: "الرجاء اختيار المجال القانوني" }),
  status: z.string()
    .min(1, { message: "الرجاء اختيار الحالة" }),
});

type FacilityFormData = z.infer<typeof facilitySchema>;

const AddFacility = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const createFacility = useCreateFacility();
  const { data: administrativeDivisions, isLoading: divisionsLoading } = useAdministrativeDivisions();

  const [isLocating, setIsLocating] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      name: "",
      nameFr: "",
      shortName: "",
      shortNameFr: "",
      legalName: "",
      legalNameFr: "",
      sector: "",
      activityType: "",
      activityTypeFr: "",
      facilityType: "",
      facilityTypeFr: "",
      jurisdictionType: "",
      createdDate: "",
      description: "",
      descriptionFr: "",
      gps: "",
      region: "",
      address: "",
      addressFr: "",
      ownership: "",
      legalDomain: "",
      status: "نشط",
    },
  });

  // Handle GPS coordinates change from map
  const handleCoordinatesChange = useCallback((coordinates: string) => {
    form.setValue("gps", coordinates);
  }, [form]);

  // Handle division change to auto-fill GPS coordinates
  const handleDivisionChange = (value: string, onChange: (value: string) => void) => {
    onChange(value);
    const selectedDivision = administrativeDivisions?.find(d => d.name === value);
    if (selectedDivision?.gps_coordinates) {
      form.setValue("gps", selectedDivision.gps_coordinates);
    }
  };

  // Get current GPS location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t("Géolocalisation non supportée", "الموقع الجغرافي غير مدعوم في هذا المتصفح"));
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coordinates = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        form.setValue("gps", coordinates);
        setIsLocating(false);
        toast.success(t("Position détectée avec succès", "تم تحديد الموقع بنجاح"));
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error(t("Accès à la localisation refusé", "تم رفض الوصول إلى الموقع"));
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error(t("Position non disponible", "الموقع غير متاح"));
            break;
          case error.TIMEOUT:
            toast.error(t("Délai d'attente dépassé", "انتهت مهلة تحديد الموقع"));
            break;
          default:
            toast.error(t("Erreur de localisation", "خطأ في تحديد الموقع"));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const onSubmit = async (data: FacilityFormData) => {
    await createFacility.mutateAsync({
      name: data.name,
      name_fr: data.nameFr || undefined,
      short_name: data.shortName,
      short_name_fr: data.shortNameFr || undefined,
      legal_name: data.legalName,
      legal_name_fr: data.legalNameFr || undefined,
      sector: data.sector as FacilitySector,
      activity_type: data.activityType,
      activity_type_fr: data.activityTypeFr || undefined,
      facility_type: data.facilityType,
      facility_type_fr: data.facilityTypeFr || undefined,
      jurisdiction_type: data.jurisdictionType as JurisdictionType,
      created_date: data.createdDate,
      description: data.description,
      description_fr: data.descriptionFr || undefined,
      gps_coordinates: data.gps || undefined,
      region: data.region,
      address: data.address,
      address_fr: data.addressFr || undefined,
      ownership: data.ownership as OwnershipType,
      legal_domain: data.legalDomain as LegalDomain,
      status: data.status as FacilityStatus,
    });
    
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex flex-1 w-full">
        <Sidebar />
        
        <main className="flex-1 p-6 min-w-0 flex flex-col">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">
              {t("Tableau de bord", "لوحة التحكم")}
            </button>
            <ArrowLeft className="w-4 h-4" />
            <span className="text-foreground">{t("Ajouter un établissement", "إضافة منشأة")}</span>
          </div>

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("Ajouter un établissement", "إضافة منشأة")}</h1>
              <p className="text-muted-foreground">{t("Entrez les informations du nouvel établissement", "أدخل معلومات المنشأة الجديدة")}</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Basic Info Section - Arabic */}
                <div className="card-institutional space-y-5">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">{t("Informations de base (Arabe)", "المعلومات الأساسية (العربية)")}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Nom de l'établissement (Arabe)", "اسم المنشأة (عربي)")} *</FormLabel>
                          <FormControl>
                            <Input placeholder={t("Ex: المستشفى المركزي", "مثال: المستشفى المركزي")} {...field} dir="rtl" />
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
                            <FormLabel>{t("Abréviation (Arabe)", "الاختصار (عربي)")} *</FormLabel>
                            <FormControl>
                              <Input placeholder={t("Ex: م.م", "مثال: م.م")} {...field} dir="rtl" />
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
                            <FormLabel>{t("Date de création", "تاريخ الإنشاء")} *</FormLabel>
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
                          <FormLabel>{t("Nom légal (Arabe)", "الاسم القانوني (عربي)")} *</FormLabel>
                          <FormControl>
                            <Input placeholder={t("Nom officiel selon les documents légaux", "الاسم الرسمي وفق الوثائق القانونية")} {...field} dir="rtl" />
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
                          <FormLabel>{t("Description (Arabe)", "الوصف (عربي)")} *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={t("Description brève de l'établissement", "وصف موجز للمنشأة ونشاطاتها")}
                              className="min-h-[100px]"
                              dir="rtl"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value?.length || 0}/500 {t("caractères", "حرف")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Basic Info Section - French */}
                <div className="card-institutional space-y-5">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">{t("Informations de base (Français)", "المعلومات الأساسية (الفرنسية)")}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nameFr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Nom de l'établissement (Français)", "اسم المنشأة (فرنسي)")} *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Hôpital Central de la Ville" {...field} dir="ltr" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shortNameFr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Abréviation (Français)", "الاختصار (فرنسي)")}</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: HCV" {...field} dir="ltr" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="legalNameFr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Nom légal (Français)", "الاسم القانوني (فرنسي)")}</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom officiel selon les documents légaux" {...field} dir="ltr" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="descriptionFr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Description (Français)", "الوصف (فرنسي)")}</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Description brève de l'établissement et de ses activités"
                              className="min-h-[100px]"
                              dir="ltr"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value?.length || 0}/500 {t("caractères", "حرف")}
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
                    <h2 className="text-lg font-semibold text-foreground">{t("Classification et activité", "التصنيف والنشاط")}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="sector"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Secteur", "القطاع")} *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("Sélectionner le secteur", "اختر القطاع")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sectors.map((sector) => (
                                <SelectItem key={sector} value={sector}>{t(sectorLabels[sector], sector)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="activityType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Type d'activité (Arabe)", "نوع النشاط (عربي)")} *</FormLabel>
                            <FormControl>
                              <Input placeholder={t("Ex: خدمات طبية", "مثال: خدمات طبية")} {...field} dir="rtl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="activityTypeFr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Type d'activité (Français)", "نوع النشاط (فرنسي)")}</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Services médicaux" {...field} dir="ltr" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="facilityType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Type d'établissement", "نوع المنشأة")} *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("Sélectionner le type", "اختر النوع")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="عام">{t("Public", "عام")}</SelectItem>
                                <SelectItem value="خاص">{t("Privé", "خاص")}</SelectItem>
                                <SelectItem value="شبه عام">{t("Semi-public", "شبه عام")}</SelectItem>
                                <SelectItem value="أجنبية">{t("Étranger", "أجنبية")}</SelectItem>
                                <SelectItem value="دولية">{t("International", "دولية")}</SelectItem>
                                <SelectItem value="مجتمع مدني">{t("Société civile", "مجتمع مدني")}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="facilityTypeFr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Type (Français)", "النوع (فرنسي)")}</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Public" {...field} dir="ltr" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="jurisdictionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Type de juridiction", "نوع الولاية القضائية")} *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("Sélectionner la juridiction", "اختر نوع الولاية")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {facilityTypes.map((type) => (
                                <SelectItem key={type} value={type}>{language === 'fr' ? jurisdictionLabelsFr[type] : jurisdictionLabelsAr[type]}</SelectItem>
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
                          <FormLabel>{t("Statut", "الحالة")} *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("Sélectionner le statut", "اختر الحالة")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>
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
                    <h2 className="text-lg font-semibold text-foreground">{t("Localisation géographique", "الموقع الجغرافي")}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="gps"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Coordonnées GPS", "إحداثيات GPS")}</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                placeholder={t("Ex: 18.0790, -15.9657", "مثال: 18.0790, -15.9657")} 
                                className="font-mono flex-1"
                                {...field} 
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={handleGetCurrentLocation}
                              disabled={isLocating}
                              className="flex-shrink-0"
                              title={t("Détecter ma position", "تحديد موقعي")}
                            >
                              {isLocating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <LocateFixed className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <FormDescription>
                            {t("Format: latitude, longitude - Cliquez sur l'icône pour détecter votre position", "الصيغة: خط العرض, خط الطول - اضغط على الأيقونة لتحديد موقعك")}
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
                          <FormLabel>{t("Division administrative", "التقسيم الإداري")} *</FormLabel>
                          <Select 
                            onValueChange={(value) => handleDivisionChange(value, field.onChange)} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("Sélectionner la division administrative", "اختر التقسيم الإداري")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-background">
                              {divisionsLoading ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                              ) : (
                                administrativeDivisions?.map((division) => (
                                  <SelectItem key={division.id} value={division.name}>
                                    {t(division.name_fr, division.name)}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {t("Les coordonnées GPS seront remplies automatiquement", "سيتم ملء إحداثيات GPS تلقائياً")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Adresse (Arabe)", "العنوان (عربي)")} *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder={t("Rue, quartier, points de repère", "الشارع، الحي، نقاط مرجعية")}
                                className="min-h-[80px]"
                                dir="rtl"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="addressFr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Adresse (Français)", "العنوان (فرنسي)")}</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Rue, quartier, points de repère"
                                className="min-h-[80px]"
                                dir="ltr"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Interactive Map */}
                    <FacilityLocationEditor
                      coordinates={form.watch("gps") || null}
                      onCoordinatesChange={handleCoordinatesChange}
                      facilityName={form.watch("name") || t("Nouvel établissement", "منشأة جديدة")}
                    />
                  </div>
                </div>

                {/* Legal Section */}
                <div className="card-institutional space-y-5">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Scale className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">{t("Statut juridique et propriété", "الحالة القانونية والملكية")}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="ownership"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Type de propriété", "نوع الملكية")} *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("Sélectionner le type de propriété", "اختر نوع الملكية")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ownershipTypes.map((type) => (
                                <SelectItem key={type} value={type}>{language === 'fr' ? ownershipLabelsFr[type] : ownershipLabelsAr[type]}</SelectItem>
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
                          <FormLabel>{t("Domaine juridique", "المجال القانوني")} *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("Sélectionner le domaine juridique", "اختر المجال القانوني")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {legalDomains.map((domain) => (
                                <SelectItem key={domain} value={domain}>{language === 'fr' ? legalDomainLabelsFr[domain] : legalDomainLabelsAr[domain]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {t("Définit le cadre juridique de gestion de l'établissement", "يحدد الإطار القانوني لإدارة المنشأة")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Documents upload */}
                    <div>
                      <FormLabel>{t("Documents justificatifs", "الوثائق المؤيدة")}</FormLabel>
                      <div 
                        className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                        onClick={() => document.getElementById('document-upload')?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-primary', 'bg-primary/5');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                          const files = Array.from(e.dataTransfer.files);
                          const validFiles = files.filter(file => 
                            file.size <= 10 * 1024 * 1024 && 
                            ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
                          );
                          if (validFiles.length < files.length) {
                            toast.error(t("Certains fichiers ont été ignorés (type non supporté ou taille > 10 Mo)", "تم تجاهل بعض الملفات (نوع غير مدعوم أو الحجم > 10 ميجابايت)"));
                          }
                          setDocuments(prev => [...prev, ...validFiles]);
                        }}
                      >
                        <input
                          id="document-upload"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            const validFiles = files.filter(file => 
                              file.size <= 10 * 1024 * 1024
                            );
                            if (validFiles.length < files.length) {
                              toast.error(t("Certains fichiers dépassent 10 Mo", "بعض الملفات تتجاوز 10 ميجابايت"));
                            }
                            setDocuments(prev => [...prev, ...validFiles]);
                            e.target.value = '';
                          }}
                        />
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {t("Glissez les fichiers ici ou cliquez pour télécharger", "اسحب الملفات هنا أو انقر للتحميل")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("PDF, DOC, JPG - Maximum 10 Mo", "PDF, DOC, JPG - الحد الأقصى 10 ميجابايت")}
                        </p>
                      </div>

                      {/* Uploaded files list */}
                      {documents.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {documents.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-primary" />
                                <div>
                                  <p className="text-sm font-medium">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setDocuments(prev => prev.filter((_, i) => i !== index))}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
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
                  {t("Annuler", "إلغاء")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createFacility.isPending}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {createFacility.isPending ? t("Enregistrement...", "جاري الحفظ...") : t("Enregistrer", "حفظ")}
                </Button>
              </div>
            </form>
          </Form>
          
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default AddFacility;