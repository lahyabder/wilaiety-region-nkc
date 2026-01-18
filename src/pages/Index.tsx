import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import SectorCard from "@/components/SectorCard";
import FacilityCard from "@/components/FacilityCard";
import QuickActions from "@/components/QuickActions";
import LicenseStatsCards from "@/components/dashboard/LicenseStatsCards";
import StatusPieChart from "@/components/dashboard/StatusPieChart";
import SectorBarChart from "@/components/dashboard/SectorBarChart";
import { useFacilities, useFacilityStats, type FacilitySector } from "@/hooks/useFacilities";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Building2, 
  Stethoscope,
  GraduationCap,
  Factory,
  Wheat,
  Dumbbell,
  Palette,
  Heart,
  Church,
  Bus,
  ShoppingCart,
  Plane,
  Landmark,
  Scale,
  Vote,
  Wallet,
  Zap,
  Droplets,
  Cpu,
  TreePine
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const sectorIcons: Record<FacilitySector, LucideIcon> = {
  "صحية": Stethoscope,
  "تعليمية": GraduationCap,
  "صناعية": Factory,
  "زراعية": Wheat,
  "رياضية": Dumbbell,
  "ثقافية": Palette,
  "اجتماعية": Heart,
  "دينية": Church,
  "نقل": Bus,
  "تجارة": ShoppingCart,
  "سياحة": Plane,
  "إدارية": Landmark,
  "قضائية": Scale,
  "سياسية": Vote,
  "مالية": Wallet,
  "كهربائية": Zap,
  "مائية": Droplets,
  "تكنولوجية": Cpu,
  "بيئية": TreePine,
};

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

const allSectors: FacilitySector[] = [
  "صحية", "تعليمية", "صناعية", "زراعية", "رياضية", "ثقافية", "اجتماعية", 
  "دينية", "نقل", "تجارة", "سياحة", "إدارية", "قضائية", "سياسية", 
  "مالية", "كهربائية", "مائية", "تكنولوجية", "بيئية"
];

const Index = () => {
  const navigate = useNavigate();
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();
  const { data: stats, isLoading: statsLoading } = useFacilityStats();
  const { t } = useLanguage();

  const getStatusForCard = (status: string): "active" | "pending" | "expired" => {
    if (status === "نشط") return "active";
    if (status === "غير نشط") return "expired";
    return "pending";
  };

  const getSectorLabel = (sector: FacilitySector) => `${t("Secteur", "قطاع")} ${sectorLabels[sector]}`;

  // Calculate status counts for pie chart
  const statusCounts = {
    active: stats?.active || 0,
    inactive: stats?.inactive || 0,
    pending: stats?.pending || 0,
    underConstruction: facilities?.filter(f => f.status === "قيد الإنشاء").length || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex w-full">
        <Sidebar />
        
        <main className="flex-1 p-3 sm:p-4 md:p-6 min-w-0">
          {/* Page Title */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t("Tableau de bord", "لوحة التحكم")}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{t("Vue d'ensemble des établissements et licences", "نظرة عامة على المنشآت والتراخيص")}</p>
          </div>

          {/* Quick Actions */}
          <div className="mb-6 sm:mb-8">
            <QuickActions />
          </div>

          {/* License & Facility Stats Cards */}
          <div className="mb-6 sm:mb-8">
            {statsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : (
              <LicenseStatsCards totalFacilities={stats?.total || 0} />
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {statsLoading ? (
              <>
                <Skeleton className="h-80 rounded-xl" />
                <Skeleton className="h-80 rounded-xl" />
              </>
            ) : (
              <>
                <SectorBarChart sectorCounts={stats?.sectorCounts || {} as Record<FacilitySector, number>} />
                <StatusPieChart {...statusCounts} />
              </>
            )}
          </div>

          {/* Sectors Grid */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">{t("Secteurs", "القطاعات")}</h2>
              <button 
                onClick={() => navigate("/sector/all")}
                className="text-primary hover:underline text-xs sm:text-sm font-medium"
              >
                {t("Voir tout", "عرض الكل")}
              </button>
            </div>
            {statsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-20 sm:h-24 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {allSectors.slice(0, 10).map((sector) => (
                  <SectorCard
                    key={sector}
                    name={t(sectorLabels[sector], sector)}
                    arabicName={sector}
                    icon={sectorIcons[sector]}
                    count={stats?.sectorCounts[sector] || 0}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent Facilities */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">{t("Derniers établissements", "أحدث المنشآت")}</h2>
              <button 
                onClick={() => navigate("/facilities")}
                className="text-primary hover:underline text-xs sm:text-sm font-medium"
              >
                {t("Voir tout", "عرض الكل")}
              </button>
            </div>
            {facilitiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-28 sm:h-32 rounded-xl" />
                ))}
              </div>
            ) : facilities && facilities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {facilities.slice(0, 4).map((facility) => (
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
              <div className="card-institutional text-center py-8 sm:py-12">
                <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{t("Aucun établissement", "لا توجد منشآت")}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{t("Commencez par ajouter un nouvel établissement", "ابدأ بإضافة منشأة جديدة")}</p>
              </div>
            )}
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Index;
