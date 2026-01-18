import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import FacilitiesMap from "@/components/FacilitiesMap";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Layers } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const districts = [
  { id: "all", nameAr: "جميع المقاطعات", nameFr: "Toutes les moughataa" },
  { id: "tevragh-zeina", nameAr: "تفرغ زينة", nameFr: "Tevragh Zeina" },
  { id: "sebkha", nameAr: "السبخة", nameFr: "Sebkha" },
  { id: "ksar", nameAr: "لكصر", nameFr: "Ksar" },
];

const MapPage = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const { t } = useLanguage();
  const navigate = useNavigate();

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
            
            <div className="flex gap-2">
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t("Filtrer par moughataa", "فلترة حسب المقاطعة")} />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {t(district.nameFr, district.nameAr)}
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
            <FacilitiesMap height="calc(100vh - 280px)" showLegend={true} selectedDistrict={selectedDistrict} />
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
};

export default MapPage;