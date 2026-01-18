import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useFacilities, useFacilityStats } from "@/hooks/useFacilities";
import { useLicenses, useLicenseStats } from "@/hooks/useLicenses";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";
import { 
  Building2, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  FileSpreadsheet
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { useRef } from "react";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const sectorLabels: Record<string, string> = {
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

const ReportsPage = () => {
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();
  const { data: facilityStats, isLoading: statsLoading } = useFacilityStats();
  const { data: licenses, isLoading: licensesLoading } = useLicenses();
  const { data: licenseStats, isLoading: licenseStatsLoading } = useLicenseStats();
  const { t, language } = useLanguage();
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const isLoading = facilitiesLoading || statsLoading || licensesLoading || licenseStatsLoading;

  // Export to PDF using html2canvas for Arabic support
  const exportToPDF = async () => {
    toast.info(t("Génération du PDF en cours...", "جاري إنشاء ملف PDF..."));
    
    // Create a hidden div with the report content
    const reportContent = document.createElement('div');
    reportContent.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: 800px;
      padding: 40px;
      background: white;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      direction: ${language === 'ar' ? 'rtl' : 'ltr'};
    `;
    
    const sectorRows = Object.entries(facilityStats?.sectorCounts || {})
      .filter(([_, count]) => (count as number) > 0)
      .map(([sector, count]) => `<tr><td style="padding: 8px; border: 1px solid #ddd;">${sector}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${count}</td></tr>`)
      .join('');

    reportContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #16a34a; margin-bottom: 10px; font-size: 24px;">${t("Rapport des établissements et licences", "تقرير المنشآت والتراخيص")}</h1>
        <p style="color: #666;">${t("Généré le:", "تاريخ الإنشاء:")} ${new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'fr-FR')}</p>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; font-size: 18px;">${t("Résumé des établissements", "ملخص المنشآت")}</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background: #3b82f6; color: white;">
              <th style="padding: 10px; border: 1px solid #ddd;">${t("Catégorie", "الفئة")}</th>
              <th style="padding: 10px; border: 1px solid #ddd;">${t("Nombre", "العدد")}</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="padding: 8px; border: 1px solid #ddd;">${t("Total des établissements", "إجمالي المنشآت")}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${facilityStats?.total || 0}</td></tr>
            <tr style="background: #f9fafb;"><td style="padding: 8px; border: 1px solid #ddd;">${t("Actifs", "نشطة")}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${facilityStats?.active || 0}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;">${t("En attente", "معلقة")}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${facilityStats?.pending || 0}</td></tr>
            <tr style="background: #f9fafb;"><td style="padding: 8px; border: 1px solid #ddd;">${t("Inactifs", "غير نشطة")}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${facilityStats?.inactive || 0}</td></tr>
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px; font-size: 18px;">${t("Résumé des licences", "ملخص التراخيص")}</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background: #22c55e; color: white;">
              <th style="padding: 10px; border: 1px solid #ddd;">${t("Catégorie", "الفئة")}</th>
              <th style="padding: 10px; border: 1px solid #ddd;">${t("Nombre", "العدد")}</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="padding: 8px; border: 1px solid #ddd;">${t("Total des licences", "إجمالي التراخيص")}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${licenseStats?.total || 0}</td></tr>
            <tr style="background: #f9fafb;"><td style="padding: 8px; border: 1px solid #ddd;">${t("Valides", "سارية")}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${licenseStats?.active || 0}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;">${t("Expirent bientôt", "قريبة الانتهاء")}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${licenseStats?.expiringSoon || 0}</td></tr>
            <tr style="background: #f9fafb;"><td style="padding: 8px; border: 1px solid #ddd;">${t("Expirées", "منتهية")}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${licenseStats?.expired || 0}</td></tr>
          </tbody>
        </table>
      </div>

      ${sectorRows ? `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #a855f7; border-bottom: 2px solid #a855f7; padding-bottom: 10px; font-size: 18px;">${t("Répartition par secteur", "التوزيع حسب القطاع")}</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background: #a855f7; color: white;">
              <th style="padding: 10px; border: 1px solid #ddd;">${t("Secteur", "القطاع")}</th>
              <th style="padding: 10px; border: 1px solid #ddd;">${t("Nombre", "العدد")}</th>
            </tr>
          </thead>
          <tbody>
            ${sectorRows}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
        ${t("Conception et développement: Dar Mauritanie", "تصميم وبرمجة: دار موريتانيا")}
      </div>
    `;
    
    document.body.appendChild(reportContent);
    
    try {
      const canvas = await html2canvas(reportContent, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(language === 'ar' ? 'تقرير-المنشآت.pdf' : 'rapport-etablissements.pdf');
      toast.success(t("Rapport exporté avec succès", "تم تصدير التقرير بنجاح"));
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(t("Erreur lors de la génération du PDF", "خطأ في إنشاء ملف PDF"));
    } finally {
      document.body.removeChild(reportContent);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Facilities Summary Sheet
    const facilitiesSummary = [
      [t("Statistiques des établissements", "إحصائيات المنشآت"), ""],
      [t("Total", "الإجمالي"), facilityStats?.total || 0],
      [t("Actifs", "نشطة"), facilityStats?.active || 0],
      [t("En attente", "معلقة"), facilityStats?.pending || 0],
      [t("Inactifs", "غير نشطة"), facilityStats?.inactive || 0],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(facilitiesSummary);
    XLSX.utils.book_append_sheet(workbook, ws1, t("Établissements", "المنشآت"));
    
    // Licenses Summary Sheet
    const licensesSummary = [
      [t("Statistiques des licences", "إحصائيات التراخيص"), ""],
      [t("Total", "الإجمالي"), licenseStats?.total || 0],
      [t("Valides", "سارية"), licenseStats?.active || 0],
      [t("Expirent bientôt", "قريبة الانتهاء"), licenseStats?.expiringSoon || 0],
      [t("Expirées", "منتهية"), licenseStats?.expired || 0],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(licensesSummary);
    XLSX.utils.book_append_sheet(workbook, ws2, t("Licences", "التراخيص"));
    
    // Sector Distribution Sheet
    const sectorData = [[t("Secteur", "القطاع"), t("Nombre", "العدد")]];
    Object.entries(facilityStats?.sectorCounts || {}).forEach(([sector, count]) => {
      if ((count as number) > 0) {
        sectorData.push([sector, count as unknown as string]);
      }
    });
    const ws3 = XLSX.utils.aoa_to_sheet(sectorData);
    XLSX.utils.book_append_sheet(workbook, ws3, t("Secteurs", "القطاعات"));
    
    // Facilities List Sheet
    if (facilities && facilities.length > 0) {
      const facilitiesData = [[t("Nom", "الاسم"), t("Secteur", "القطاع"), t("Région", "المنطقة"), t("Statut", "الحالة"), t("Date de création", "تاريخ الإنشاء")]];
      facilities.forEach((f) => {
        facilitiesData.push([
          f.name,
          f.sector,
          f.region,
          f.status,
          new Date(f.created_at).toLocaleDateString(t("fr-FR", "ar-SA")),
        ]);
      });
      const ws4 = XLSX.utils.aoa_to_sheet(facilitiesData);
      XLSX.utils.book_append_sheet(workbook, ws4, t("Liste des établissements", "قائمة المنشآت"));
    }
    
    // Licenses List Sheet
    if (licenses && licenses.length > 0) {
      const licensesData = [[t("Numéro de licence", "رقم الترخيص"), t("Type", "النوع"), t("Autorité émettrice", "الجهة المصدرة"), t("Date d'émission", "تاريخ الإصدار"), t("Date d'expiration", "تاريخ الانتهاء"), t("Statut", "الحالة")]];
      licenses.forEach((l) => {
        licensesData.push([
          l.license_number,
          l.license_type,
          l.issuing_authority,
          new Date(l.issue_date).toLocaleDateString(t("fr-FR", "ar-SA")),
          new Date(l.expiry_date).toLocaleDateString(t("fr-FR", "ar-SA")),
          l.status,
        ]);
      });
      const ws5 = XLSX.utils.aoa_to_sheet(licensesData);
      XLSX.utils.book_append_sheet(workbook, ws5, t("Liste des licences", "قائمة التراخيص"));
    }
    
    XLSX.writeFile(workbook, t("rapport-etablissements.xlsx", "تقرير-المنشآت.xlsx"));
    toast.success(t("Rapport exporté avec succès", "تم تصدير التقرير بنجاح"));
  };

  // Prepare sector data for charts - use Arabic sector names directly
  const sectorData = facilityStats?.sectorCounts 
    ? Object.entries(facilityStats.sectorCounts)
        .filter(([_, count]) => (count as number) > 0)
        .map(([sector, count]) => ({
          name: sector, // Use Arabic sector name directly
          value: count as number,
        }))
    : [];

  // Prepare facility status data - only include items with value > 0
  const facilityStatusData = [
    { name: t("Actif", "نشط"), value: facilityStats?.active || 0, color: "hsl(142, 76%, 36%)" },
    { name: t("En attente", "معلق"), value: facilityStats?.pending || 0, color: "hsl(45, 93%, 47%)" },
    { name: t("Inactif", "غير نشط"), value: facilityStats?.inactive || 0, color: "hsl(0, 84%, 60%)" },
  ].filter(item => item.value > 0);

  // Prepare license status data - only include items with value > 0
  const licenseStatusData = [
    { name: t("Valide", "ساري"), value: licenseStats?.active || 0, color: "hsl(142, 76%, 36%)" },
    { name: t("Expire bientôt", "قريب الانتهاء"), value: licenseStats?.expiringSoon || 0, color: "hsl(45, 93%, 47%)" },
    { name: t("Expiré", "منتهي"), value: licenseStats?.expired || 0, color: "hsl(0, 84%, 60%)" },
  ].filter(item => item.value > 0);

  // Monthly trends (mock data based on actual counts)
  const monthlyData = [
    { month: t("Janvier", "يناير"), facilities: Math.floor((facilityStats?.total || 0) * 0.6), licenses: Math.floor((licenseStats?.total || 0) * 0.5) },
    { month: t("Février", "فبراير"), facilities: Math.floor((facilityStats?.total || 0) * 0.7), licenses: Math.floor((licenseStats?.total || 0) * 0.6) },
    { month: t("Mars", "مارس"), facilities: Math.floor((facilityStats?.total || 0) * 0.75), licenses: Math.floor((licenseStats?.total || 0) * 0.7) },
    { month: t("Avril", "أبريل"), facilities: Math.floor((facilityStats?.total || 0) * 0.8), licenses: Math.floor((licenseStats?.total || 0) * 0.75) },
    { month: t("Mai", "ماي"), facilities: Math.floor((facilityStats?.total || 0) * 0.9), licenses: Math.floor((licenseStats?.total || 0) * 0.85) },
    { month: t("Juin", "يونيو"), facilities: facilityStats?.total || 0, licenses: licenseStats?.total || 0 },
  ];

  const chartConfig = {
    facilities: {
      label: t("Établissements", "المنشآت"),
      color: "hsl(var(--primary))",
    },
    licenses: {
      label: t("Licences", "التراخيص"),
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 p-6 min-w-0">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("Rapports et statistiques", "التقارير والإحصائيات")}</h1>
              <p className="text-muted-foreground">{t("Vue d'ensemble des établissements et des licences", "نظرة عامة على المنشآت والتراخيص")}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToPDF} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                {t("Exporter PDF", "تصدير PDF")}
              </Button>
              <Button onClick={exportToExcel} variant="outline" className="gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                {t("Exporter Excel", "تصدير Excel")}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-card rounded-xl p-4 sm:p-5 border border-primary border-s-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1 line-clamp-2">
                        {t("Total des établissements", "إجمالي المنشآت")}
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">
                        {(facilityStats?.total || 0).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-4 sm:p-5 border border-muted-foreground border-s-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1 line-clamp-2">
                        {t("Total des licences", "إجمالي التراخيص")}
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">
                        {(licenseStats?.total || 0).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 rounded-xl bg-muted text-muted-foreground flex-shrink-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-4 sm:p-5 border border-warning border-s-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1 line-clamp-2">
                        {t("Licences expirent bientôt", "تراخيص قريبة الانتهاء")}
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">
                        {(licenseStats?.expiringSoon || 0).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 rounded-xl bg-warning/10 text-warning-foreground flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-4 sm:p-5 border border-critical border-s-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1 line-clamp-2">
                        {t("Licences expirées", "تراخيص منتهية")}
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">
                        {(licenseStats?.expired || 0).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 rounded-xl bg-critical/10 text-critical flex-shrink-0">
                      <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                {/* Sector Distribution */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg font-bold text-center">{t("Répartition par secteur", "التوزيع حسب القطاع")}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    {sectorData.length > 0 ? (
                      <div className="h-72 sm:h-80" style={{ direction: "ltr" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sectorData} layout="vertical" margin={{ left: 80, right: 30 }}>
                            <XAxis 
                              type="number" 
                              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                              axisLine={{ stroke: "hsl(var(--border))" }}
                              tickLine={{ stroke: "hsl(var(--border))" }}
                            />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              width={75}
                              tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                              axisLine={{ stroke: "hsl(var(--border))" }}
                              tickLine={false}
                            />
                            <ChartTooltip 
                              content={<ChartTooltipContent />} 
                              cursor={{ fill: "hsl(var(--accent))" }}
                            />
                            <Bar 
                              dataKey="value" 
                              fill="hsl(var(--primary))" 
                              radius={[0, 4, 4, 0]}
                              maxBarSize={24}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-72 flex items-center justify-center text-muted-foreground">
                        {t("Aucune donnée disponible", "لا توجد بيانات متاحة")}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Facility Status Pie Chart */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg font-bold text-center">{t("Statut des établissements", "حالة المنشآت")}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    {facilityStatusData.length > 0 ? (
                      <div className="h-72 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={facilityStatusData}
                              cx="50%"
                              cy="45%"
                              labelLine={false}
                              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                if (percent < 0.05) return null;
                                const RADIAN = Math.PI / 180;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                return (
                                  <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-semibold">
                                    {`${(percent * 100).toFixed(0)}%`}
                                  </text>
                                );
                              }}
                              outerRadius={80}
                              innerRadius={50}
                              dataKey="value"
                              paddingAngle={2}
                            >
                              {facilityStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend 
                              verticalAlign="bottom" 
                              height={36}
                              iconType="circle"
                              iconSize={10}
                              wrapperStyle={{ fontSize: "12px", direction: language === "ar" ? "rtl" : "ltr" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-72 flex items-center justify-center text-muted-foreground">
                        {t("Aucune donnée disponible", "لا توجد بيانات متاحة")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                {/* License Status Pie Chart */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg font-bold text-center">{t("Statut des licences", "حالة التراخيص")}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    {licenseStatusData.length > 0 ? (
                      <div className="h-72 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={licenseStatusData}
                              cx="50%"
                              cy="45%"
                              labelLine={false}
                              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                if (percent < 0.05) return null;
                                const RADIAN = Math.PI / 180;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                return (
                                  <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-semibold">
                                    {`${(percent * 100).toFixed(0)}%`}
                                  </text>
                                );
                              }}
                              outerRadius={80}
                              innerRadius={50}
                              dataKey="value"
                              paddingAngle={2}
                            >
                              {licenseStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend 
                              verticalAlign="bottom" 
                              height={36}
                              iconType="circle"
                              iconSize={10}
                              wrapperStyle={{ fontSize: "12px", direction: language === "ar" ? "rtl" : "ltr" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-72 flex items-center justify-center text-muted-foreground">
                        {t("Aucune donnée disponible", "لا توجد بيانات متاحة")}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Monthly Trend Line Chart */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg font-bold text-center">{t("Croissance mensuelle", "النمو الشهري")}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="h-72 sm:h-80" style={{ direction: "ltr" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="month" 
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            axisLine={{ stroke: "hsl(var(--border))" }}
                          />
                          <YAxis 
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            axisLine={{ stroke: "hsl(var(--border))" }}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend 
                            wrapperStyle={{ fontSize: "12px", direction: language === "ar" ? "rtl" : "ltr" }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="facilities" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                            name={t("Établissements", "المنشآت")}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="licenses" 
                            stroke="hsl(var(--chart-2))" 
                            strokeWidth={2}
                            dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2 }}
                            name={t("Licences", "التراخيص")}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Stats Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("Résumé détaillé", "ملخص تفصيلي")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {t("Établissements", "المنشآت")}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-chart-2" />
                            {t("Actifs", "نشطة")}
                          </span>
                          <span className="font-medium">{facilityStats?.active || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-chart-4" />
                            {t("En attente", "معلقة")}
                          </span>
                          <span className="font-medium">{facilityStats?.pending || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-destructive" />
                            {t("Inactifs", "غير نشطة")}
                          </span>
                          <span className="font-medium">{facilityStats?.inactive || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {t("Licences", "التراخيص")}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-chart-2" />
                            {t("Valides", "سارية")}
                          </span>
                          <span className="font-medium">{licenseStats?.active || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-chart-4" />
                            {t("Expirent bientôt", "قريبة الانتهاء")}
                          </span>
                          <span className="font-medium">{licenseStats?.expiringSoon || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-destructive" />
                            {t("Expirées", "منتهية")}
                          </span>
                          <span className="font-medium">{licenseStats?.expired || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        {t("Indicateurs de performance", "مؤشرات الأداء")}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{t("Taux d'établissements actifs", "نسبة المنشآت النشطة")}</span>
                          <span className="font-medium text-chart-2">
                            {facilityStats?.total 
                              ? Math.round((facilityStats.active / facilityStats.total) * 100) 
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{t("Taux de licences valides", "نسبة التراخيص السارية")}</span>
                          <span className="font-medium text-chart-2">
                            {licenseStats?.total 
                              ? Math.round((licenseStats.active / licenseStats.total) * 100) 
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{t("Ratio licence/établissement", "نسبة الترخيص/المنشأة")}</span>
                          <span className="font-medium">
                            {facilityStats?.total 
                              ? ((licenseStats?.total || 0) / facilityStats.total).toFixed(1) 
                              : 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ReportsPage;