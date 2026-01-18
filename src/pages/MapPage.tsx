import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import FacilitiesMap from "@/components/FacilitiesMap";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Layers } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFacilities } from "@/hooks/useFacilities";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// District bounds for counting
const districtBounds: Record<string, { bounds: [[number, number], [number, number]] }> = {
  "tevragh-zeina": { bounds: [[18.09, -16.015], [18.13, -15.98]] },
  "sebkha": { bounds: [[18.055, -16.02], [18.095, -15.975]] },
  "ksar": { bounds: [[18.085, -15.975], [18.125, -15.935]] },
};

const districts = [
  { id: "all", nameAr: "جميع المقاطعات", nameFr: "Toutes les moughataa" },
  { id: "tevragh-zeina", nameAr: "تفرغ زينة", nameFr: "Tevragh Zeina" },
  { id: "sebkha", nameAr: "السبخة", nameFr: "Sebkha" },
  { id: "ksar", nameAr: "لكصر", nameFr: "Ksar" },
];

const sectors = [
  { id: "all", nameAr: "جميع القطاعات", nameFr: "Tous les secteurs" },
  { id: "صحية", nameAr: "صحية", nameFr: "Santé" },
  { id: "تعليمية", nameAr: "تعليمية", nameFr: "Éducation" },
  { id: "صناعية", nameAr: "صناعية", nameFr: "Industrie" },
  { id: "زراعية", nameAr: "زراعية", nameFr: "Agriculture" },
  { id: "رياضية", nameAr: "رياضية", nameFr: "Sport" },
  { id: "ثقافية", nameAr: "ثقافية", nameFr: "Culture" },
  { id: "اجتماعية", nameAr: "اجتماعية", nameFr: "Social" },
  { id: "دينية", nameAr: "دينية", nameFr: "Religieux" },
  { id: "نقل", nameAr: "نقل", nameFr: "Transport" },
  { id: "تجارة", nameAr: "تجارة", nameFr: "Commerce" },
  { id: "سياحة", nameAr: "سياحة", nameFr: "Tourisme" },
  { id: "إدارية", nameAr: "إدارية", nameFr: "Administratif" },
  { id: "قضائية", nameAr: "قضائية", nameFr: "Judiciaire" },
  { id: "سياسية", nameAr: "سياسية", nameFr: "Politique" },
  { id: "مالية", nameAr: "مالية", nameFr: "Finance" },
  { id: "كهربائية", nameAr: "كهربائية", nameFr: "Électricité" },
  { id: "مائية", nameAr: "مائية", nameFr: "Eau" },
  { id: "تكنولوجية", nameAr: "تكنولوجية", nameFr: "Technologie" },
  { id: "بيئية", nameAr: "بيئية", nameFr: "Environnement" },
];

// Parse GPS coordinates
const parseGPS = (gps: string | null): [number, number] | null => {
  if (!gps) return null;
  const parts = gps.split(",").map(s => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return [parts[0], parts[1]];
  }
  return null;
};

const MapPage = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: facilities } = useFacilities();

  // Count facilities per district
  const districtCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    
    facilities?.forEach(facility => {
      const coords = parseGPS(facility.gps_coordinates);
      if (!coords) return;
      
      counts.all++;
      
      Object.entries(districtBounds).forEach(([districtId, { bounds }]) => {
        const [lat, lng] = coords;
        const [[minLat, minLng], [maxLat, maxLng]] = bounds;
        
        if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
          counts[districtId] = (counts[districtId] || 0) + 1;
        }
      });
    });
    
    return counts;
  }, [facilities]);

  // Count facilities per sector
  const sectorCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    
    facilities?.forEach(facility => {
      const coords = parseGPS(facility.gps_coordinates);
      if (!coords) return;
      
      counts.all++;
      counts[facility.sector] = (counts[facility.sector] || 0) + 1;
    });
    
    return counts;
  }, [facilities]);

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
            <span className="text-foreground">{t("Carte des établissements", "خريطة المنشآت")}</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Layers className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("Carte des établissements", "خريطة المنشآت")}</h1>
                <p className="text-muted-foreground">{t("Vue géographique de tous les établissements", "عرض جغرافي لجميع المنشآت")}</p>
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap justify-end">
              {/* District Filter */}
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder={t("Filtrer par moughataa", "فلترة حسب المقاطعة")} />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span>{t(district.nameFr, district.nameAr)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {districtCounts[district.id] || 0}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sector Filter */}
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t("Filtrer par secteur", "فلترة حسب القطاع")} />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span>{t(sector.nameFr, sector.nameAr)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {sectorCounts[sector.id] || 0}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button className="gap-2" onClick={() => navigate("/add-facility")}>
                <Plus className="w-4 h-4" />
                {t("Ajouter un établissement", "إضافة منشأة")}
              </Button>
            </div>
          </div>

          {/* Map */}
          <div className="card-institutional flex-1">
            <FacilitiesMap 
              height="calc(100vh - 280px)" 
              showLegend={true} 
              selectedDistrict={selectedDistrict}
              selectedSector={selectedSector}
            />
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
};

export default MapPage;