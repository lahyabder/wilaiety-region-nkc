import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import FacilityImageUpload from "@/components/FacilityImageUpload";
import FacilityLocationMap from "@/components/FacilityLocationMap";
import FacilityLocationEditor from "@/components/FacilityLocationEditor";
import { useFacility, useUpdateFacility, type Facility, type FacilitySector, type OwnershipType, type LegalDomain, type JurisdictionType, type FacilityStatus } from "@/hooks/useFacilities";
import { useFacilityLicenses } from "@/hooks/useLicenses";
import { 
  ArrowRight, 
  Building2, 
  MapPin, 
  Calendar, 
  FileText, 
  Edit3, 
  Save, 
  X,
  History,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from "lucide-react";

const sectors: FacilitySector[] = [
  "صحية", "تعليمية", "صناعية", "زراعية", "رياضية", "ثقافية", "اجتماعية", 
  "دينية", "نقل", "تجارة", "سياحة", "إدارية", "قضائية", "سياسية", 
  "مالية", "كهربائية", "مائية", "تكنولوجية", "بيئية"
];

const ownershipTypes: OwnershipType[] = ["ملكية كاملة", "إيجار", "شراكة", "مملوكة مع جهة أخرى"];
const legalDomains: LegalDomain[] = ["مجال عام للجهة", "مجال خاص للجهة", "خارج ملكية الجهة"];
const jurisdictionTypes: JurisdictionType[] = ["خاص", "محال", "تنسيق"];
const statusOptions: FacilityStatus[] = ["نشط", "غير نشط", "قيد الإنشاء", "معلق"];

const FacilityDetails = () => {
  const { t, language } = useLanguage();

  // Dynamic labels based on language
  const sectorLabels: Record<FacilitySector, string> = {
    "صحية": t("Santé", "صحية"),
    "تعليمية": t("Éducation", "تعليمية"),
    "صناعية": t("Industrie", "صناعية"),
    "زراعية": t("Agriculture", "زراعية"),
    "رياضية": t("Sport", "رياضية"),
    "ثقافية": t("Culture", "ثقافية"),
    "اجتماعية": t("Social", "اجتماعية"),
    "دينية": t("Religieux", "دينية"),
    "نقل": t("Transport", "نقل"),
    "تجارة": t("Commerce", "تجارة"),
    "سياحة": t("Tourisme", "سياحة"),
    "إدارية": t("Administratif", "إدارية"),
    "قضائية": t("Judiciaire", "قضائية"),
    "سياسية": t("Politique", "سياسية"),
    "مالية": t("Finance", "مالية"),
    "كهربائية": t("Électricité", "كهربائية"),
    "مائية": t("Eau", "مائية"),
    "تكنولوجية": t("Technologie", "تكنولوجية"),
    "بيئية": t("Environnement", "بيئية")
  };

  const ownershipLabels: Record<OwnershipType, string> = {
    "ملكية كاملة": t("Pleine propriété", "ملكية كاملة"),
    "إيجار": t("Location", "إيجار"),
    "شراكة": t("Partenariat", "شراكة"),
    "مملوكة مع جهة أخرى": t("Copropriété", "مملوكة مع جهة أخرى")
  };

  const legalDomainLabels: Record<LegalDomain, string> = {
    "مجال عام للجهة": t("Domaine public", "مجال عام للجهة"),
    "مجال خاص للجهة": t("Domaine privé", "مجال خاص للجهة"),
    "خارج ملكية الجهة": t("Hors propriété", "خارج ملكية الجهة")
  };

  const jurisdictionLabels: Record<JurisdictionType, string> = {
    "خاص": t("Privé", "خاص"),
    "محال": t("Délégué", "محال"),
    "تنسيق": t("Coordination", "تنسيق")
  };

  const statusLabels: Record<FacilityStatus, string> = {
    "نشط": t("Actif", "نشط"),
    "غير نشط": t("Inactif", "غير نشط"),
    "قيد الإنشاء": t("En construction", "قيد الإنشاء"),
    "معلق": t("Suspendu", "معلق")
  };

  const licenseStatusLabels: Record<string, string> = {
    "ساري": t("Valide", "ساري"),
    "قريب الانتهاء": t("Expire bientôt", "قريب الانتهاء"),
    "منتهي": t("Expiré", "منتهي"),
    "ملغى": t("Annulé", "ملغى")
  };
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: facility, isLoading, error } = useFacility(id || "");
  const { data: licenses } = useFacilityLicenses(id || "");
  const updateFacility = useUpdateFacility();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedFacility, setEditedFacility] = useState<Partial<Facility>>({});

  useEffect(() => {
    if (facility) {
      setEditedFacility(facility);
    }
  }, [facility]);

  const handleSave = async () => {
    if (!id || !editedFacility) return;
    
    await updateFacility.mutateAsync({
      id,
      name: editedFacility.name,
      short_name: editedFacility.short_name,
      legal_name: editedFacility.legal_name,
      sector: editedFacility.sector,
      activity_type: editedFacility.activity_type,
      facility_type: editedFacility.facility_type,
      jurisdiction_type: editedFacility.jurisdiction_type,
      created_date: editedFacility.created_date,
      description: editedFacility.description,
      gps_coordinates: editedFacility.gps_coordinates,
      location_accuracy: editedFacility.location_accuracy,
      region: editedFacility.region,
      address: editedFacility.address,
      ownership: editedFacility.ownership,
      legal_domain: editedFacility.legal_domain,
      status: editedFacility.status,
      image_url: editedFacility.image_url,
      website_url: editedFacility.website_url,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (facility) {
      setEditedFacility(facility);
    }
    setIsEditing(false);
  };

  const handleImageUploaded = (url: string) => {
    setEditedFacility(prev => ({ ...prev, image_url: url || null }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      "نشط": "bg-success text-success-foreground",
      "ساري": "bg-success text-success-foreground",
      "غير نشط": "bg-muted text-muted-foreground",
      "قيد الإنشاء": "bg-warning text-warning-foreground",
      "معلق": "bg-critical text-critical-foreground",
    };
    return statusConfig[status] || "bg-muted text-muted-foreground";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex w-full">
          <Sidebar />
          <main className="flex-1 p-3 sm:p-4 md:p-6 min-w-0">
            <Skeleton className="h-6 sm:h-8 w-48 sm:w-64 mb-4 sm:mb-6" />
            <Skeleton className="h-20 sm:h-24 w-full mb-4 sm:mb-6" />
            <Skeleton className="h-64 sm:h-96 w-full" />
          </main>
        </div>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex w-full">
          <Sidebar />
          <main className="flex-1 p-3 sm:p-4 md:p-6 min-w-0">
            <div className="card-institutional text-center py-8 sm:py-12">
              <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{t("Établissement non trouvé", "لم يتم العثور على المنشأة")}</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">{t("L'établissement demandé n'existe pas ou a été supprimé", "المنشأة المطلوبة غير موجودة أو تم حذفها")}</p>
              <Button onClick={() => navigate("/")}>{t("Retour à l'accueil", "العودة للرئيسية")}</Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const currentLicense = licenses?.[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex w-full">
        <Sidebar />
        
        <main className="flex-1 p-3 sm:p-4 md:p-6 min-w-0">
          {/* Breadcrumb - Hidden on very small screens */}
          <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 flex-wrap">
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">
              {t("Tableau de bord", "لوحة التحكم")}
            </button>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">
              {t("Établissements", "المنشآت")}
            </button>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-foreground truncate max-w-[150px] sm:max-w-none">{facility.name}</span>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              {facility.image_url ? (
                <img src={facility.image_url} alt={facility.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-accent-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">{facility.name}</h1>
                  <Badge className={`${getStatusBadge(facility.status)} flex-shrink-0`}>{statusLabels[facility.status] || facility.status}</Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{facility.short_name} • {sectorLabels[facility.sector] || facility.sector}</p>
              </div>
            </div>
            
            <div className="flex gap-2 self-end sm:self-start flex-shrink-0">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel} className="gap-1 sm:gap-2" disabled={updateFacility.isPending}>
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{t("Annuler", "إلغاء")}</span>
                  </Button>
                  <Button size="sm" onClick={handleSave} className="gap-1 sm:gap-2" disabled={updateFacility.isPending}>
                    <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{updateFacility.isPending ? t("Enregistrement...", "جاري الحفظ...") : t("Enregistrer", "حفظ")}</span>
                    <span className="sm:hidden">{t("Sauver", "حفظ")}</span>
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setIsEditing(true)} className="gap-1 sm:gap-2">
                  <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  {t("Modifier", "تعديل")}
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="basic" className="space-y-4 sm:space-y-6">
            <TabsList className="bg-muted p-1 rounded-lg w-full overflow-x-auto flex-nowrap">
              <TabsTrigger value="basic" className="gap-1 sm:gap-2 data-[state=active]:bg-card text-xs sm:text-sm flex-shrink-0">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{t("Informations", "المعلومات")}</span>
              </TabsTrigger>
              <TabsTrigger value="location" className="gap-1 sm:gap-2 data-[state=active]:bg-card text-xs sm:text-sm flex-shrink-0">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{t("Localisation", "الموقع")}</span>
              </TabsTrigger>
              <TabsTrigger value="legal" className="gap-1 sm:gap-2 data-[state=active]:bg-card text-xs sm:text-sm flex-shrink-0">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{t("Juridique", "القانوني")}</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1 sm:gap-2 data-[state=active]:bg-card text-xs sm:text-sm flex-shrink-0">
                <History className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{t("Historique", "السجل")}</span>
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Main Info Card */}
                <div className={`card-institutional space-y-5 ${language === "ar" ? "text-right" : "text-left"}`}>
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">{t("Informations de l'établissement", "معلومات المنشأة")}</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">{t("Nom de l'établissement", "اسم المنشأة")}</Label>
                      {isEditing ? (
                        <Input 
                          value={editedFacility.name || ""}
                          onChange={(e) => setEditedFacility({...editedFacility, name: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{facility.name}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-sm">{t("Abréviation", "الاختصار")}</Label>
                        {isEditing ? (
                          <Input 
                            value={editedFacility.short_name || ""}
                            onChange={(e) => setEditedFacility({...editedFacility, short_name: e.target.value})}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-medium text-foreground mt-1">{facility.short_name}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">{t("Date de création", "تاريخ الإنشاء")}</Label>
                        {isEditing ? (
                          <Input 
                            type="date"
                            value={editedFacility.created_date || ""}
                            onChange={(e) => setEditedFacility({...editedFacility, created_date: e.target.value})}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-medium text-foreground mt-1">{facility.created_date}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">{t("Nom légal", "الاسم القانوني")}</Label>
                      {isEditing ? (
                        <Input 
                          value={editedFacility.legal_name || ""}
                          onChange={(e) => setEditedFacility({...editedFacility, legal_name: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{facility.legal_name}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">{t("Description", "الوصف")}</Label>
                      {isEditing ? (
                        <Textarea 
                          value={editedFacility.description || ""}
                          onChange={(e) => setEditedFacility({...editedFacility, description: e.target.value})}
                          className="mt-1 min-h-[100px]"
                        />
                      ) : (
                        <p className="text-foreground mt-1 leading-relaxed">{facility.description || t("Aucune description", "لا يوجد وصف")}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">{t("Site web", "الموقع الإلكتروني")}</Label>
                      {isEditing ? (
                        <Input 
                          type="url"
                          value={editedFacility.website_url || ""}
                          onChange={(e) => setEditedFacility({...editedFacility, website_url: e.target.value})}
                          className="mt-1"
                          placeholder="https://example.com"
                        />
                      ) : facility.website_url ? (
                        <a 
                          href={facility.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mt-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>{t("Visiter le site", "زيارة الموقع")}</span>
                        </a>
                      ) : (
                        <p className="text-muted-foreground mt-1">{t("Aucun lien", "لا يوجد رابط")}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Classification Card */}
                <div className={`card-institutional space-y-5 ${language === "ar" ? "text-right" : "text-left"}`}>
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">{t("Classification et activité", "التصنيف والنشاط")}</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">{t("Secteur", "القطاع")}</Label>
                      {isEditing ? (
                        <Select 
                          value={editedFacility.sector}
                          onValueChange={(value) => setEditedFacility({...editedFacility, sector: value as FacilitySector})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sectors.map((sector) => (
                              <SelectItem key={sector} value={sector}>{sectorLabels[sector]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium text-foreground mt-1">{sectorLabels[facility.sector] || facility.sector}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">{t("Type d'activité", "نوع النشاط")}</Label>
                      {isEditing ? (
                        <Input 
                          value={editedFacility.activity_type || ""}
                          onChange={(e) => setEditedFacility({...editedFacility, activity_type: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{facility.activity_type}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">{t("Type d'établissement", "نوع المنشأة")}</Label>
                      {isEditing ? (
                        <Input 
                          value={editedFacility.facility_type || ""}
                          onChange={(e) => setEditedFacility({...editedFacility, facility_type: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{facility.facility_type}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">{t("Type de juridiction", "نوع الاختصاص")}</Label>
                      {isEditing ? (
                        <Select 
                          value={editedFacility.jurisdiction_type}
                          onValueChange={(value) => setEditedFacility({...editedFacility, jurisdiction_type: value as JurisdictionType})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {jurisdictionTypes.map((type) => (
                              <SelectItem key={type} value={type}>{jurisdictionLabels[type]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium text-foreground mt-1">{jurisdictionLabels[facility.jurisdiction_type] || facility.jurisdiction_type}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">{t("Statut", "الحالة")}</Label>
                      {isEditing ? (
                        <Select 
                          value={editedFacility.status}
                          onValueChange={(value) => setEditedFacility({...editedFacility, status: value as FacilityStatus})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getStatusBadge(facility.status)}>{statusLabels[facility.status] || facility.status}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Images Card */}
                <div className="card-institutional lg:col-span-2">
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3 mb-4">{t("Image de l'établissement", "صورة المنشأة")}</h2>
                  <FacilityImageUpload
                    facilityId={facility.id}
                    currentImageUrl={isEditing ? editedFacility.image_url : facility.image_url}
                    onImageUploaded={handleImageUploaded}
                    isEditing={isEditing}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Location Tab */}
            <TabsContent value="location" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`card-institutional space-y-5 ${language === "ar" ? "text-right" : "text-left"}`}>
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">{t("Coordonnées GPS", "إحداثيات GPS")}</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">{t("Coordonnées", "الإحداثيات")}</Label>
                      {isEditing ? (
                        <Input 
                          value={editedFacility.gps_coordinates || ""}
                          onChange={(e) => setEditedFacility({...editedFacility, gps_coordinates: e.target.value})}
                          className="mt-1"
                          placeholder={t("Latitude, Longitude", "خط العرض، خط الطول")}
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1 font-mono">{facility.gps_coordinates || t("Non défini", "غير محدد")}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">{t("Précision de la localisation", "دقة الموقع")}</Label>
                      {isEditing ? (
                        <Select 
                          value={editedFacility.location_accuracy || "متوسطة"}
                          onValueChange={(value) => setEditedFacility({...editedFacility, location_accuracy: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="عالية">{t("Haute", "عالية")}</SelectItem>
                            <SelectItem value="متوسطة">{t("Moyenne", "متوسطة")}</SelectItem>
                            <SelectItem value="منخفضة">{t("Basse", "منخفضة")}</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="font-medium text-foreground">
                            {facility.location_accuracy === "عالية" ? t("Haute", "عالية") : 
                             facility.location_accuracy === "متوسطة" ? t("Moyenne", "متوسطة") : 
                             facility.location_accuracy === "منخفضة" ? t("Basse", "منخفضة") : t("Moyenne", "متوسطة")}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">{t("Région", "المنطقة")}</Label>
                      {isEditing ? (
                        <Input 
                          value={editedFacility.region || ""}
                          onChange={(e) => setEditedFacility({...editedFacility, region: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{facility.region}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">{t("Adresse détaillée", "العنوان التفصيلي")}</Label>
                      {isEditing ? (
                        <Textarea 
                          value={editedFacility.address || ""}
                          onChange={(e) => setEditedFacility({...editedFacility, address: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{facility.address}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="card-institutional">
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3 mb-4">{t("Carte", "الخريطة")}</h2>
                  {isEditing ? (
                    <FacilityLocationEditor
                      coordinates={editedFacility.gps_coordinates || null}
                      onCoordinatesChange={(coords) => setEditedFacility({...editedFacility, gps_coordinates: coords})}
                      facilityName={editedFacility.name}
                    />
                  ) : (
                    <FacilityLocationMap 
                      coordinates={facility.gps_coordinates} 
                      facilityName={facility.name}
                      address={facility.address}
                    />
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Legal Tab */}
            <TabsContent value="legal" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ownership Card */}
                <div className={`card-institutional space-y-5 ${language === "ar" ? "text-right" : "text-left"}`}>
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">{t("Statut de propriété", "حالة الملكية")}</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">{t("Type de propriété", "نوع الملكية")}</Label>
                      {isEditing ? (
                        <Select 
                          value={editedFacility.ownership}
                          onValueChange={(value) => setEditedFacility({...editedFacility, ownership: value as OwnershipType})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ownershipTypes.map((type) => (
                              <SelectItem key={type} value={type}>{ownershipLabels[type]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium text-foreground mt-1">{ownershipLabels[facility.ownership] || facility.ownership}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">{t("Domaine juridique", "المجال القانوني")}</Label>
                      {isEditing ? (
                        <Select 
                          value={editedFacility.legal_domain}
                          onValueChange={(value) => setEditedFacility({...editedFacility, legal_domain: value as LegalDomain})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {legalDomains.map((domain) => (
                              <SelectItem key={domain} value={domain}>{legalDomainLabels[domain]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium text-foreground mt-1">{legalDomainLabels[facility.legal_domain] || facility.legal_domain}</p>
                      )}
                    </div>

                    {(facility.ownership === "شراكة" || facility.ownership === "مملوكة مع جهة أخرى") && (
                      <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                        <div className="flex items-center gap-2 text-warning-foreground">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">{t("Documents supplémentaires requis", "مطلوب مستندات إضافية")}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* License Card */}
                <div className={`card-institutional space-y-5 ${language === "ar" ? "text-right" : "text-left"}`}>
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">{t("Informations de licence", "معلومات الترخيص")}</h2>
                  
                  {currentLicense ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground text-sm">{t("Numéro de licence", "رقم الترخيص")}</Label>
                        <p className="font-medium text-foreground mt-1 font-mono">{currentLicense.license_number}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground text-sm">{t("Date d'émission", "تاريخ الإصدار")}</Label>
                          <p className="font-medium text-foreground mt-1">{currentLicense.issue_date}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">{t("Date d'expiration", "تاريخ الانتهاء")}</Label>
                          <p className="font-medium text-foreground mt-1">{currentLicense.expiry_date}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-muted-foreground text-sm">{t("Statut de la licence", "حالة الترخيص")}</Label>
                        <div className="mt-1">
                          <Badge className={getStatusBadge(currentLicense.status)}>
                            {licenseStatusLabels[currentLicense.status] || currentLicense.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>{t("Aucune licence enregistrée pour cet établissement", "لا توجد تراخيص مسجلة لهذه المنشأة")}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <div className="card-institutional">
                <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3 mb-4">{t("Historique des modifications", "سجل التعديلات")}</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{t("Création de l'enregistrement", "إنشاء السجل")}</p>
                      <p className="text-sm text-muted-foreground">{t("L'établissement a été créé", "تم إنشاء المنشأة")}</p>
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">{facility.created_at?.split("T")[0]}</span>
                  </div>
                  {facility.updated_at !== facility.created_at && (
                    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{t("Dernière mise à jour", "آخر تحديث")}</p>
                        <p className="text-sm text-muted-foreground">{t("Les données ont été mises à jour", "تم تحديث البيانات")}</p>
                      </div>
                      <span className="text-sm text-muted-foreground font-mono">{facility.updated_at?.split("T")[0]}</span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default FacilityDetails;