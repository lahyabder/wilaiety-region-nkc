import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import StatsCard from "@/components/StatsCard";
import SectorCard from "@/components/SectorCard";
import FacilityCard from "@/components/FacilityCard";
import QuickActions from "@/components/QuickActions";
import { useFacilities, useFacilityStats, type FacilitySector } from "@/hooks/useFacilities";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
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
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();
  const { data: stats, isLoading: statsLoading } = useFacilityStats();

  const getStatusForCard = (status: string): "active" | "pending" | "expired" => {
    if (status === "نشط") return "active";
    if (status === "غير نشط") return "expired";
    return "pending";
  };

  const getSectorLabel = (sector: FacilitySector) => `Secteur ${sectorLabels[sector]}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
            <p className="text-muted-foreground">Aperçu des établissements de la région</p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActions />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsLoading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </>
            ) : (
              <>
                <StatsCard
                  title="Total des établissements"
                  value={(stats?.total || 0).toLocaleString("fr-FR")}
                  icon={Building2}
                />
                <StatsCard
                  title="Établissements actifs"
                  value={(stats?.active || 0).toLocaleString("fr-FR")}
                  icon={CheckCircle}
                  variant="success"
                />
                <StatsCard
                  title="En cours de révision"
                  value={(stats?.pending || 0).toLocaleString("fr-FR")}
                  icon={AlertTriangle}
                  variant="warning"
                />
                <StatsCard
                  title="Inactifs"
                  value={(stats?.inactive || 0).toLocaleString("fr-FR")}
                  icon={XCircle}
                  variant="critical"
                />
              </>
            )}
          </div>

          {/* Sectors Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Secteurs</h2>
              <button className="text-primary hover:underline text-sm font-medium">
                Voir tout
              </button>
            </div>
            {statsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {allSectors.slice(0, 10).map((sector) => (
                  <SectorCard
                    key={sector}
                    name={sectorLabels[sector]}
                    icon={sectorIcons[sector]}
                    count={stats?.sectorCounts[sector] || 0}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent Facilities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Derniers établissements</h2>
              <button className="text-primary hover:underline text-sm font-medium">
                Voir tout
              </button>
            </div>
            {facilitiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : facilities && facilities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="card-institutional text-center py-12">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Aucun établissement</h3>
                <p className="text-muted-foreground">Commencez par ajouter un nouvel établissement</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Jihety - Plateforme souveraine de gestion des données institutionnelles
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;