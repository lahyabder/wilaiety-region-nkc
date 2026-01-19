import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import FacilitiesMap from "@/components/FacilitiesMap";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Layers, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFacilities, type Facility } from "@/hooks/useFacilities";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// District bounds for counting - only Tevragh Zeina, Sebkha, Ksar
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
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { data: facilities } = useFacilities();

  // Get filtered facilities for export
  const filteredFacilities = useMemo(() => {
    return facilities?.filter(f => {
      const coords = parseGPS(f.gps_coordinates);
      if (!coords) return false;
      
      // Filter by sector
      if (selectedSector !== "all" && f.sector !== selectedSector) return false;
      
      // Filter by district
      if (selectedDistrict === "all") return true;
      
      const districtInfo = districtBounds[selectedDistrict];
      if (!districtInfo) return true;
      
      const [lat, lng] = coords;
      const [[minLat, minLng], [maxLat, maxLng]] = districtInfo.bounds;
      
      return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    }) || [];
  }, [facilities, selectedDistrict, selectedSector]);

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

  // Export to Excel
  const handleExportExcel = () => {
    if (filteredFacilities.length === 0) {
      toast.error(t("Aucune donnée à exporter", "لا توجد بيانات للتصدير"));
      return;
    }

    const exportData = filteredFacilities.map((f: Facility) => ({
      [t("Nom", "الاسم")]: language === "ar" ? f.name : (f.name_fr || f.name),
      [t("Nom court", "الاسم المختصر")]: language === "ar" ? f.short_name : (f.short_name_fr || f.short_name),
      [t("Secteur", "القطاع")]: f.sector,
      [t("Statut", "الحالة")]: f.status,
      [t("Région", "المنطقة")]: f.region,
      [t("Adresse", "العنوان")]: language === "ar" ? f.address : (f.address_fr || f.address),
      [t("Coordonnées GPS", "إحداثيات GPS")]: f.gps_coordinates || "",
      [t("Type de propriété", "نوع الملكية")]: f.ownership,
      [t("Type d'activité", "نوع النشاط")]: language === "ar" ? f.activity_type : (f.activity_type_fr || f.activity_type),
      [t("Date de création", "تاريخ الإنشاء")]: f.created_date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t("Établissements", "المنشآت"));
    
    const districtName = selectedDistrict === "all" 
      ? t("tous", "الكل") 
      : districts.find(d => d.id === selectedDistrict)?.[language === "ar" ? "nameAr" : "nameFr"] || selectedDistrict;
    
    const fileName = `${t("etablissements", "منشآت")}_${districtName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success(t(`${filteredFacilities.length} établissements exportés`, `تم تصدير ${filteredFacilities.length} منشأة`));
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
                <SelectContent className="bg-background border border-border shadow-lg z-50 max-h-[300px] overflow-y-auto">
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
                <SelectContent className="bg-background border border-border shadow-lg z-50 max-h-[400px] overflow-y-auto">
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

              {/* Export Button */}
              <Button variant="outline" className="gap-2" onClick={handleExportExcel}>
                <Download className="w-4 h-4" />
                {t("Exporter", "تصدير")}
              </Button>

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