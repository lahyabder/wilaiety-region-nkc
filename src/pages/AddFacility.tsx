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
import { 
  ArrowLeft, 
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
const ownershipLabels: Record<OwnershipType, string> = {
  "ملكية كاملة": "Propriété totale",
  "إيجار": "Location",
  "شراكة": "Partenariat",
  "مملوكة مع جهة أخرى": "Copropriété",
};

const legalDomains: LegalDomain[] = ["مجال عام للجهة", "مجال خاص للجهة", "خارج ملكية الجهة"];
const legalDomainLabels: Record<LegalDomain, string> = {
  "مجال عام للجهة": "Domaine public",
  "مجال خاص للجهة": "Domaine privé",
  "خارج ملكية الجهة": "Hors propriété",
};

const facilityTypes: JurisdictionType[] = ["خاص", "محال", "تنسيق"];
const jurisdictionLabels: Record<JurisdictionType, string> = {
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
    .min(3, { message: "Le nom doit contenir au moins 3 caractères" })
    .max(100, { message: "Le nom ne doit pas dépasser 100 caractères" }),
  shortName: z.string()
    .min(2, { message: "L'abréviation doit contenir au moins 2 caractères" })
    .max(20, { message: "L'abréviation ne doit pas dépasser 20 caractères" }),
  legalName: z.string()
    .min(5, { message: "Le nom légal doit contenir au moins 5 caractères" })
    .max(150, { message: "Le nom légal ne doit pas dépasser 150 caractères" }),
  sector: z.string()
    .min(1, { message: "Veuillez sélectionner un secteur" }),
  activityType: z.string()
    .min(3, { message: "Le type d'activité doit contenir au moins 3 caractères" })
    .max(100, { message: "Le type d'activité ne doit pas dépasser 100 caractères" }),
  facilityType: z.string()
    .min(1, { message: "Veuillez sélectionner le type d'établissement" }),
  jurisdictionType: z.string()
    .min(1, { message: "Veuillez sélectionner le type de juridiction" }),
  createdDate: z.string()
    .min(1, { message: "Veuillez sélectionner la date de création" }),
  description: z.string()
    .min(10, { message: "La description doit contenir au moins 10 caractères" })
    .max(500, { message: "La description ne doit pas dépasser 500 caractères" }),
  gps: z.string()
    .regex(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/, { message: "Format de coordonnées invalide (exemple: 36.7538, 3.0588)" })
    .optional()
    .or(z.literal("")),
  region: z.string()
    .min(2, { message: "La région doit contenir au moins 2 caractères" })
    .max(50, { message: "La région ne doit pas dépasser 50 caractères" }),
  address: z.string()
    .min(5, { message: "L'adresse doit contenir au moins 5 caractères" })
    .max(200, { message: "L'adresse ne doit pas dépasser 200 caractères" }),
  ownership: z.string()
    .min(1, { message: "Veuillez sélectionner le type de propriété" }),
  legalDomain: z.string()
    .min(1, { message: "Veuillez sélectionner le domaine juridique" }),
  status: z.string()
    .min(1, { message: "Veuillez sélectionner le statut" }),
});

type FacilityFormData = z.infer<typeof facilitySchema>;

const AddFacility = () => {
  const { t } = useLanguage();
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
                
                {/* Basic Info Section */}
                <div className="card-institutional space-y-5">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Informations de base</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de l'établissement *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Hôpital Central de la Ville" {...field} />
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
                            <FormLabel>Abréviation *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: HCV" {...field} />
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
                            <FormLabel>Date de création *</FormLabel>
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
                          <FormLabel>Nom légal *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom officiel selon les documents légaux" {...field} />
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
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Description brève de l'établissement et de ses activités"
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value?.length || 0}/500 caractères
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
                    <h2 className="text-lg font-semibold text-foreground">Classification et activité</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="sector"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secteur *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le secteur" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sectors.map((sector) => (
                                <SelectItem key={sector} value={sector}>{sectorLabels[sector]}</SelectItem>
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
                          <FormLabel>Type d'activité *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Services médicaux complets" {...field} />
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
                          <FormLabel>Type d'établissement *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="عام">Public</SelectItem>
                              <SelectItem value="خاص">Privé</SelectItem>
                              <SelectItem value="شبه عام">Semi-public</SelectItem>
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
                          <FormLabel>Type de juridiction *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la juridiction" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {facilityTypes.map((type) => (
                                <SelectItem key={type} value={type}>{jurisdictionLabels[type]}</SelectItem>
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
                          <FormLabel>Statut *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le statut" />
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
                    <h2 className="text-lg font-semibold text-foreground">Localisation géographique</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="gps"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coordonnées GPS</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: 36.7538, 3.0588" 
                              className="font-mono"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Format: latitude, longitude
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
                          <FormLabel>Région *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Région Nord" {...field} />
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
                          <FormLabel>Adresse complète *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Rue, quartier, points de repère"
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
                        <span className="text-sm text-muted-foreground">Carte interactive</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Section */}
                <div className="card-institutional space-y-5">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Scale className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Statut juridique et propriété</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="ownership"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de propriété *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le type de propriété" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ownershipTypes.map((type) => (
                                <SelectItem key={type} value={type}>{ownershipLabels[type]}</SelectItem>
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
                          <FormLabel>Domaine juridique *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le domaine juridique" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {legalDomains.map((domain) => (
                                <SelectItem key={domain} value={domain}>{legalDomainLabels[domain]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Définit le cadre juridique de gestion de l'établissement
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Documents upload placeholder */}
                    <div>
                      <FormLabel>Documents justificatifs</FormLabel>
                      <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Glissez les fichiers ici ou cliquez pour télécharger
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, DOC, JPG - Maximum 10 Mo
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