import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import FacilityCard from "@/components/FacilityCard";
import { useFacilities, type FacilitySector } from "@/hooks/useFacilities";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const SectorFacilitiesPage = () => {
  const { sector } = useParams<{ sector: string }>();
  const navigate = useNavigate();
  const { data: facilities, isLoading } = useFacilities();
  const { t } = useLanguage();

  const decodedSector = sector ? decodeURIComponent(sector) : "";
  
  const filteredFacilities = facilities?.filter(
    (f) => f.sector === decodedSector
  ) || [];

  const getStatusForCard = (status: string): "active" | "pending" | "expired" => {
    if (status === "نشط") return "active";
    if (status === "غير نشط") return "expired";
    return "pending";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex w-full">
        <Sidebar />
        
        <main className="flex-1 p-6 min-w-0">
          {/* Fil d'Ariane */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">
              {t("Tableau de bord", "لوحة التحكم")}
            </button>
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="text-foreground">{t("Secteur", "قطاع")} {decodedSector}</span>
          </div>

          {/* En-tête */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {t("Établissements du secteur", "منشآت قطاع")} {decodedSector}
                </h1>
                <p className="text-muted-foreground">
                  {filteredFacilities.length} {t("établissement(s) dans ce secteur", "منشأة في هذا القطاع")}
                </p>
              </div>
            </div>
            
            <Button className="gap-2" onClick={() => navigate("/add-facility")}>
              <Plus className="w-4 h-4" />
              {t("Ajouter un établissement", "إضافة منشأة")}
            </Button>
          </div>

          {/* Grille des établissements */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : filteredFacilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFacilities.map((facility) => (
                <FacilityCard
                  key={facility.id}
                  id={facility.id}
                  name={facility.name}
                  sector={`${t("Secteur", "قطاع")} ${facility.sector}`}
                  location={facility.region}
                  status={getStatusForCard(facility.status)}
                />
              ))}
            </div>
          ) : (
            <div className="card-institutional text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("Aucun établissement dans ce secteur", "لا توجد منشآت في هذا القطاع")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("Commencez par ajouter un nouvel établissement", "ابدأ بإضافة منشأة جديدة")}
              </p>
              <Button onClick={() => navigate("/add-facility")}>
                <Plus className="w-4 h-4 ml-2" />
                {t("Ajouter un établissement", "إضافة منشأة")}
              </Button>
            </div>
          )}
          
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default SectorFacilitiesPage;
