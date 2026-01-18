import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import FacilityCard from "@/components/FacilityCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFacilities, type FacilitySector, type Facility } from "@/hooks/useFacilities";
import { useAdministrativeDivisions } from "@/hooks/useAdministrativeDivisions";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ArrowRight, Building2, Search, Plus, Filter, Download, FileText, FileSpreadsheet, MapPin } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

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

const statusLabels: Record<string, { fr: string; ar: string }> = {
  "نشط": { fr: "Actif", ar: "نشط" },
  "غير نشط": { fr: "Inactif", ar: "غير نشط" },
  "قيد الإنشاء": { fr: "En construction", ar: "قيد الإنشاء" },
  "معلق": { fr: "Suspendu", ar: "معلق" },
};

const allSectors: FacilitySector[] = [
  "صحية", "تعليمية", "صناعية", "زراعية", "رياضية", "ثقافية", "اجتماعية", 
  "دينية", "نقل", "تجارة", "سياحة", "إدارية", "قضائية", "سياسية", 
  "مالية", "كهربائية", "مائية", "تكنولوجية", "بيئية"
];

const AllFacilitiesPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { data: facilities, isLoading } = useFacilities();
  const { data: divisions } = useAdministrativeDivisions();
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const printRef = useRef<HTMLDivElement>(null);

  // Get unique regions from facilities
  const uniqueRegions = [...new Set(facilities?.map(f => f.region) || [])].filter(Boolean);

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
    const matchesRegion = regionFilter === "all" || facility.region === regionFilter;
    
    return matchesSearch && matchesSector && matchesStatus && matchesRegion;
  });

  const getExportTitle = () => {
    let title = t("Liste des établissements", "قائمة المنشآت");
    if (sectorFilter !== "all") {
      const sectorLabel = sectorLabels[sectorFilter as FacilitySector];
      title += ` - ${t(sectorLabel.fr, sectorLabel.ar)}`;
    }
    if (regionFilter !== "all") {
      title += ` - ${regionFilter}`;
    }
    return title;
  };

  const exportToPDF = async () => {
    try {
      toast.loading(t("Génération du PDF...", "جاري إنشاء PDF..."));

      // Create a hidden div for PDF content
      const container = document.createElement("div");
      container.style.cssText = `
        position: absolute; 
        left: -9999px; 
        top: 0; 
        width: 800px; 
        padding: 40px; 
        background: white;
        font-family: Arial, sans-serif;
        direction: ${language === "ar" ? "rtl" : "ltr"};
      `;

      const exportTitle = getExportTitle();
      const currentDate = new Date().toLocaleDateString(language === "ar" ? "ar-SA" : "fr-FR");

      container.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1a5f2a; padding-bottom: 20px;">
          <h1 style="color: #1a5f2a; font-size: 24px; margin: 0 0 10px 0;">${exportTitle}</h1>
          <p style="color: #666; font-size: 14px; margin: 0;">${t("Date d'exportation", "تاريخ التصدير")}: ${currentDate}</p>
          <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">${t("Nombre d'établissements", "عدد المنشآت")}: ${filteredFacilities?.length || 0}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #1a5f2a; color: white;">
              <th style="padding: 12px 8px; text-align: ${language === "ar" ? "right" : "left"}; border: 1px solid #ddd;">#</th>
              <th style="padding: 12px 8px; text-align: ${language === "ar" ? "right" : "left"}; border: 1px solid #ddd;">${t("Nom", "الاسم")}</th>
              <th style="padding: 12px 8px; text-align: ${language === "ar" ? "right" : "left"}; border: 1px solid #ddd;">${t("Abréviation", "الاختصار")}</th>
              <th style="padding: 12px 8px; text-align: ${language === "ar" ? "right" : "left"}; border: 1px solid #ddd;">${t("Secteur", "القطاع")}</th>
              <th style="padding: 12px 8px; text-align: ${language === "ar" ? "right" : "left"}; border: 1px solid #ddd;">${t("Région", "المنطقة")}</th>
              <th style="padding: 12px 8px; text-align: ${language === "ar" ? "right" : "left"}; border: 1px solid #ddd;">${t("Statut", "الحالة")}</th>
            </tr>
          </thead>
          <tbody>
            ${filteredFacilities?.map((facility, index) => {
              const sectorLabel = sectorLabels[facility.sector];
              const statLabel = statusLabels[facility.status];
              return `
                <tr style="background: ${index % 2 === 0 ? "#f9f9f9" : "white"};">
                  <td style="padding: 10px 8px; border: 1px solid #ddd;">${index + 1}</td>
                  <td style="padding: 10px 8px; border: 1px solid #ddd; font-weight: 500;">${facility.name}</td>
                  <td style="padding: 10px 8px; border: 1px solid #ddd;">${facility.short_name}</td>
                  <td style="padding: 10px 8px; border: 1px solid #ddd;">${t(sectorLabel?.fr || facility.sector, sectorLabel?.ar || facility.sector)}</td>
                  <td style="padding: 10px 8px; border: 1px solid #ddd;">${facility.region}</td>
                  <td style="padding: 10px 8px; border: 1px solid #ddd;">${t(statLabel?.fr || facility.status, statLabel?.ar || facility.status)}</td>
                </tr>
              `;
            }).join("") || ""}
          </tbody>
        </table>
        <div style="margin-top: 30px; text-align: center; color: #999; font-size: 11px;">
          <p>${t("Document généré automatiquement", "مستند تم إنشاؤه آلياً")}</p>
        </div>
      `;

      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `facilities-${sectorFilter !== "all" ? sectorFilter + "-" : ""}${regionFilter !== "all" ? regionFilter + "-" : ""}${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      toast.dismiss();
      toast.success(t("PDF exporté avec succès", "تم تصدير PDF بنجاح"));
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.dismiss();
      toast.error(t("Erreur lors de l'exportation", "خطأ في التصدير"));
    }
  };

  const exportToExcel = () => {
    try {
      if (!filteredFacilities || filteredFacilities.length === 0) {
        toast.error(t("Aucune donnée à exporter", "لا توجد بيانات للتصدير"));
        return;
      }

      const data = filteredFacilities.map((facility, index) => {
        const sectorLabel = sectorLabels[facility.sector];
        const statLabel = statusLabels[facility.status];
        return {
          [t("#", "#")]: index + 1,
          [t("Nom", "الاسم")]: facility.name,
          [t("Abréviation", "الاختصار")]: facility.short_name,
          [t("Nom légal", "الاسم القانوني")]: facility.legal_name,
          [t("Secteur", "القطاع")]: t(sectorLabel?.fr || facility.sector, sectorLabel?.ar || facility.sector),
          [t("Type d'activité", "نوع النشاط")]: facility.activity_type,
          [t("Région", "المنطقة")]: facility.region,
          [t("Adresse", "العنوان")]: facility.address,
          [t("Coordonnées GPS", "إحداثيات GPS")]: facility.gps_coordinates || "",
          [t("Statut", "الحالة")]: t(statLabel?.fr || facility.status, statLabel?.ar || facility.status),
          [t("Date de création", "تاريخ الإنشاء")]: facility.created_date,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, t("Établissements", "المنشآت"));

      // Auto-size columns
      const maxWidth = 50;
      const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.min(maxWidth, Math.max(key.length, ...data.map(row => String(row[key as keyof typeof row] || "").length)))
      }));
      worksheet["!cols"] = colWidths;

      const fileName = `facilities-${sectorFilter !== "all" ? sectorFilter + "-" : ""}${regionFilter !== "all" ? regionFilter + "-" : ""}${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success(t("Excel exporté avec succès", "تم تصدير Excel بنجاح"));
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error(t("Erreur lors de l'exportation", "خطأ في التصدير"));
    }
  };

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
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    {t("Exporter", "تصدير")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToPDF} className="gap-2 cursor-pointer">
                    <FileText className="w-4 h-4" />
                    {t("Exporter en PDF", "تصدير PDF")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToExcel} className="gap-2 cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4" />
                    {t("Exporter en Excel", "تصدير Excel")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => navigate("/add-facility")} className="gap-2">
                <Plus className="w-4 h-4" />
                {t("Ajouter", "إضافة منشأة")}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="card-institutional mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
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
                <SelectTrigger className="w-full lg:w-48">
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
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <MapPin className="w-4 h-4 ml-2" />
                  <SelectValue placeholder={t("Région", "المنطقة")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("Toutes les régions", "جميع المناطق")}</SelectItem>
                  {uniqueRegions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-40">
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
                {searchQuery || sectorFilter !== "all" || statusFilter !== "all" || regionFilter !== "all"
                  ? t("Essayez de modifier vos critères de recherche", "جرب تعديل معايير البحث")
                  : t("Commencez par ajouter un nouvel établissement", "ابدأ بإضافة منشأة جديدة")}
              </p>
              {!searchQuery && sectorFilter === "all" && statusFilter === "all" && regionFilter === "all" && (
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
