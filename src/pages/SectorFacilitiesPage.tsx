import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FacilityCard from "@/components/FacilityCard";
import { useFacilities, type FacilitySector } from "@/hooks/useFacilities";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Plus } from "lucide-react";

const SectorFacilitiesPage = () => {
  const { sector } = useParams<{ sector: string }>();
  const navigate = useNavigate();
  const { data: facilities, isLoading } = useFacilities();

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
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">
              لوحة التحكم
            </button>
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="text-foreground">قطاع {decodedSector}</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">منشآت قطاع {decodedSector}</h1>
                <p className="text-muted-foreground">{filteredFacilities.length} منشأة في هذا القطاع</p>
              </div>
            </div>
            
            <Button className="gap-2" onClick={() => navigate("/add-facility")}>
              <Plus className="w-4 h-4" />
              إضافة منشأة
            </Button>
          </div>

          {/* Facilities Grid */}
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
                  sector={`القطاع ${facility.sector}`}
                  location={facility.region}
                  status={getStatusForCard(facility.status)}
                />
              ))}
            </div>
          ) : (
            <div className="card-institutional text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد منشآت في هذا القطاع</h3>
              <p className="text-muted-foreground mb-4">ابدأ بإضافة منشأة جديدة</p>
              <Button onClick={() => navigate("/add-facility")}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة منشأة
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SectorFacilitiesPage;
