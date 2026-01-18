import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import FacilityCard from "@/components/FacilityCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFacilities, type FacilitySector } from "@/hooks/useFacilities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Building2, Search, Plus, Filter } from "lucide-react";

const sectorLabels: Record<FacilitySector, { fr: string; ar: string }> = {
  "صحية": { fr: "Santé", ar: "صحية" },
  "تعليمية": { fr: "Éducation", ar: "تعليمية" },
  "صناعية": { fr: "Industrie", ar: "صناعية" },
  "زراعية": { fr: "Agriculture", ar: "زراعية" },
  "رياضية": { fr: "Sport", ar: "رياضية" },
  "ثقافية": { fr: "Culture", ar: "ثقافية" },
  "اجتماعية": { fr: "Social", ar: "اجتماعية" },
  "دينية": { fr: "Religieux", ar: "دينية" },
  "نقل": { fr: "Transport", ar: "نقل" },
  "تجارة": { fr: "Commerce", ar: "تجارة" },
  "سياحة": { fr: "Tourisme", ar: "سياحة" },
  "إدارية": { fr: "Administratif", ar: "إدارية" },
  "قضائية": { fr: "Judiciaire", ar: "قضائية" },
  "سياسية": { fr: "Politique", ar: "سياسية" },
  "مالية": { fr: "Finance", ar: "مالية" },
  "كهربائية": { fr: "Électricité", ar: "كهربائية" },
  "مائية": { fr: "Eau", ar: "مائية" },
  "تكنولوجية": { fr: "Technologie", ar: "تكنولوجية" },
  "بيئية": { fr: "Environnement", ar: "بيئية" },
};

const allSectors: FacilitySector[] = [
  "صحية", "تعليمية", "صناعية", "زراعية", "رياضية", "ثقافية", "اجتماعية", 
  "دينية", "نقل", "تجارة", "سياحة", "إدارية", "قضائية", "سياسية", 
  "مالية", "كهربائية", "مائية", "تكنولوجية", "بيئية"
];

const AllFacilitiesPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: facilities, isLoading } = useFacilities();
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getStatusForCard = (status: string): "active" | "pending" | "expired" => {
    if (status === "نشط") return "active";
    if (status === "غير نشط") return "expired";
    return "pending";
  };

  const getSectorLabel = (sector: FacilitySector) => {
    const label = sectorLabels[sector];
    return `${t("Secteur", "قطاع")} ${t(label.fr, label.ar)}`;
  };

  const filteredFacilities = facilities?.filter(facility => {
    const matchesSearch = 
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.short_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSector = sectorFilter === "all" || facility.sector === sectorFilter;
    const matchesStatus = statusFilter === "all" || facility.status === statusFilter;
    
    return matchesSearch && matchesSector && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex w-full">
        <Sidebar />
        
        <main className="flex-1 p-3 sm:p-4 md:p-6 min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">
              {t("Tableau de bord", "لوحة التحكم")}
            </button>
            <ArrowRight className="w-4 h-4" />
            <span className="text-foreground">{t("Tous les établissements", "جميع المنشآت")}</span>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("Tous les établissements", "جميع المنشآت")}</h1>
                <p className="text-muted-foreground">
                  {t(`${filteredFacilities?.length || 0} établissements trouvés`, `${filteredFacilities?.length || 0} منشأة`)}
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/add-facility")} className="gap-2">
              <Plus className="w-4 h-4" />
              {t("Ajouter", "إضافة منشأة")}
            </Button>
          </div>

          {/* Filters */}
          <div className="card-institutional mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("Rechercher par nom ou région...", "البحث بالاسم أو المنطقة...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue placeholder={t("Secteur", "القطاع")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("Tous les secteurs", "جميع القطاعات")}</SelectItem>
                  {allSectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {t(sectorLabels[sector].fr, sectorLabels[sector].ar)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={t("Statut", "الحالة")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("Tous", "الكل")}</SelectItem>
                  <SelectItem value="نشط">{t("Actif", "نشط")}</SelectItem>
                  <SelectItem value="غير نشط">{t("Inactif", "غير نشط")}</SelectItem>
                  <SelectItem value="قيد الإنشاء">{t("En construction", "قيد الإنشاء")}</SelectItem>
                  <SelectItem value="معلق">{t("Suspendu", "معلق")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Facilities Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : filteredFacilities && filteredFacilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFacilities.map((facility) => (
                <FacilityCard
                  key={facility.id}
                  id={facility.id}
                  name={facility.name}
                  sector={getSectorLabel(facility.sector)}
                  location={facility.region}
                  status={getStatusForCard(facility.status)}
                />
              ))}
            </div>
          ) : (
            <div className="card-institutional text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("Aucun établissement trouvé", "لا توجد منشآت")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || sectorFilter !== "all" || statusFilter !== "all"
                  ? t("Essayez de modifier vos critères de recherche", "جرب تعديل معايير البحث")
                  : t("Commencez par ajouter un nouvel établissement", "ابدأ بإضافة منشأة جديدة")}
              </p>
              {!searchQuery && sectorFilter === "all" && statusFilter === "all" && (
                <Button onClick={() => navigate("/add-facility")}>
                  <Plus className="w-4 h-4 ml-2" />
                  {t("Ajouter un établissement", "إضافة منشأة")}
                </Button>
              )}
            </div>
          )}

          <Footer />
        </main>
      </div>
    </div>
  );
};

export default AllFacilitiesPage;
