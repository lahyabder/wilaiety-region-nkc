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
  "بيئية": "Environnement"
};

const ownershipTypes: OwnershipType[] = ["ملكية كاملة", "إيجار", "شراكة", "مملوكة مع جهة أخرى"];
const ownershipLabels: Record<OwnershipType, string> = {
  "ملكية كاملة": "Pleine propriété",
  "إيجار": "Location",
  "شراكة": "Partenariat",
  "مملوكة مع جهة أخرى": "Copropriété"
};

const legalDomains: LegalDomain[] = ["مجال عام للجهة", "مجال خاص للجهة", "خارج ملكية الجهة"];
const legalDomainLabels: Record<LegalDomain, string> = {
  "مجال عام للجهة": "Domaine public",
  "مجال خاص للجهة": "Domaine privé",
  "خارج ملكية الجهة": "Hors propriété"
};

const jurisdictionTypes: JurisdictionType[] = ["خاص", "محال", "تنسيق"];
const jurisdictionLabels: Record<JurisdictionType, string> = {
  "خاص": "Privé",
  "محال": "Délégué",
  "تنسيق": "Coordination"
};

const statusOptions: FacilityStatus[] = ["نشط", "غير نشط", "قيد الإنشاء", "معلق"];
const statusLabels: Record<FacilityStatus, string> = {
  "نشط": "Actif",
  "غير نشط": "Inactif",
  "قيد الإنشاء": "En construction",
  "معلق": "Suspendu"
};

const licenseStatusLabels: Record<string, string> = {
  "ساري": "Valide",
  "قريب الانتهاء": "Expire bientôt",
  "منتهي": "Expiré",
  "ملغى": "Annulé"
};

const FacilityDetails = () => {
  const { t } = useLanguage();
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
          <main className="flex-1 p-6 min-w-0">
            <Skeleton className="h-8 w-64 mb-6" />
            <Skeleton className="h-24 w-full mb-6" />
            <Skeleton className="h-96 w-full" />
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
          <main className="flex-1 p-6 min-w-0">
            <div className="card-institutional text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t("Établissement non trouvé", "لم يتم العثور على المنشأة")}</h3>
              <p className="text-muted-foreground mb-4">{t("L'établissement demandé n'existe pas ou a été supprimé", "المنشأة المطلوبة غير موجودة أو تم حذفها")}</p>
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
        
        <main className="flex-1 p-6 min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">
              {t("Tableau de bord", "لوحة التحكم")}
            </button>
            <ArrowRight className="w-4 h-4" />
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">
              {t("Établissements", "المنشآت")}
            </button>
            <ArrowRight className="w-4 h-4" />
            <span className="text-foreground">{facility.name}</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {facility.image_url ? (
                <img src={facility.image_url} alt={facility.name} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-accent-foreground" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{facility.name}</h1>
                  <Badge className={getStatusBadge(facility.status)}>{statusLabels[facility.status] || facility.status}</Badge>
                </div>
                <p className="text-muted-foreground">{facility.short_name} • {sectorLabels[facility.sector] || facility.sector}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} className="gap-2" disabled={updateFacility.isPending}>
                    <X className="w-4 h-4" />
                    {t("Annuler", "إلغاء")}
                  </Button>
                  <Button onClick={handleSave} className="gap-2" disabled={updateFacility.isPending}>
                    <Save className="w-4 h-4" />
                    {updateFacility.isPending ? t("Enregistrement...", "جاري الحفظ...") : t("Enregistrer", "حفظ")}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit3 className="w-4 h-4" />
                  {t("Modifier", "تعديل")}
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="bg-muted p-1 rounded-lg">
              <TabsTrigger value="basic" className="gap-2 data-[state=active]:bg-card">
                <FileText className="w-4 h-4" />
                {t("Informations de base", "المعلومات الأساسية")}
              </TabsTrigger>
              <TabsTrigger value="location" className="gap-2 data-[state=active]:bg-card">
                <MapPin className="w-4 h-4" />
                {t("Localisation", "الموقع")}
              </TabsTrigger>
              <TabsTrigger value="legal" className="gap-2 data-[state=active]:bg-card">
                <Calendar className="w-4 h-4" />
                {t("Statut juridique", "الوضع القانوني")}
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-card">
                <History className="w-4 h-4" />
                {t("Historique", "السجل")}
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Info Card */}
                <div className="card-institutional space-y-5">
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
                <div className="card-institutional space-y-5">
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
                <div className="card-institutional space-y-5">
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
                <div className="card-institutional space-y-5">
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
                <div className="card-institutional space-y-5">
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