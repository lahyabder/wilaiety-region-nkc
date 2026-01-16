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
import * as XLSX from "xlsx";
import { toast } from "sonner";

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

  const isLoading = facilitiesLoading || statsLoading || licensesLoading || licenseStatsLoading;

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Rapport des établissements et licences", 14, 22);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Généré le: ${new Date().toLocaleDateString("fr-FR")}`, 14, 32);
    
    // Facilities Summary
    doc.setFont("helvetica", "bold");
    doc.text("Résumé des établissements", 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [["Catégorie", "Nombre"]],
      body: [
        ["Total des établissements", String(facilityStats?.total || 0)],
        ["Actifs", String(facilityStats?.active || 0)],
        ["En attente", String(facilityStats?.pending || 0)],
        ["Inactifs", String(facilityStats?.inactive || 0)],
      ],
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
    });
    
    // Licenses Summary
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    doc.setFont("helvetica", "bold");
    doc.text("Résumé des licences", 14, finalY + 15);
    
    autoTable(doc, {
      startY: finalY + 20,
      head: [["Catégorie", "Nombre"]],
      body: [
        ["Total des licences", String(licenseStats?.total || 0)],
        ["Valides", String(licenseStats?.active || 0)],
        ["Expirent bientôt", String(licenseStats?.expiringSoon || 0)],
        ["Expirées", String(licenseStats?.expired || 0)],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
    });
    
    // Sector Distribution
    const finalY2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    doc.setFont("helvetica", "bold");
    doc.text("Répartition par secteur", 14, finalY2 + 15);
    
    const sectorRows = Object.entries(facilityStats?.sectorCounts || {})
      .filter(([_, count]) => (count as number) > 0)
      .map(([sector, count]) => [sectorLabels[sector] || sector, String(count)]);
    
    if (sectorRows.length > 0) {
      autoTable(doc, {
        startY: finalY2 + 20,
        head: [["Secteur", "Nombre"]],
        body: sectorRows,
        theme: "striped",
        headStyles: { fillColor: [168, 85, 247] },
      });
    }
    
    doc.save("rapport-etablissements.pdf");
    toast.success("Rapport exporté avec succès");
  };

  // Export to Excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Facilities Summary Sheet
    const facilitiesSummary = [
      ["Statistiques des établissements", ""],
      ["Total", facilityStats?.total || 0],
      ["Actifs", facilityStats?.active || 0],
      ["En attente", facilityStats?.pending || 0],
      ["Inactifs", facilityStats?.inactive || 0],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(facilitiesSummary);
    XLSX.utils.book_append_sheet(workbook, ws1, "Établissements");
    
    // Licenses Summary Sheet
    const licensesSummary = [
      ["Statistiques des licences", ""],
      ["Total", licenseStats?.total || 0],
      ["Valides", licenseStats?.active || 0],
      ["Expirent bientôt", licenseStats?.expiringSoon || 0],
      ["Expirées", licenseStats?.expired || 0],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(licensesSummary);
    XLSX.utils.book_append_sheet(workbook, ws2, "Licences");
    
    // Sector Distribution Sheet
    const sectorData = [["Secteur", "Nombre"]];
    Object.entries(facilityStats?.sectorCounts || {}).forEach(([sector, count]) => {
      if ((count as number) > 0) {
        sectorData.push([sectorLabels[sector] || sector, count as unknown as string]);
      }
    });
    const ws3 = XLSX.utils.aoa_to_sheet(sectorData);
    XLSX.utils.book_append_sheet(workbook, ws3, "Secteurs");
    
    // Facilities List Sheet
    if (facilities && facilities.length > 0) {
      const facilitiesData = [["Nom", "Secteur", "Région", "Statut", "Date de création"]];
      facilities.forEach((f) => {
        facilitiesData.push([
          f.name,
          sectorLabels[f.sector] || f.sector,
          f.region,
          f.status,
          new Date(f.created_at).toLocaleDateString("fr-FR"),
        ]);
      });
      const ws4 = XLSX.utils.aoa_to_sheet(facilitiesData);
      XLSX.utils.book_append_sheet(workbook, ws4, "Liste des établissements");
    }
    
    // Licenses List Sheet
    if (licenses && licenses.length > 0) {
      const licensesData = [["Numéro de licence", "Type", "Autorité émettrice", "Date d'émission", "Date d'expiration", "Statut"]];
      licenses.forEach((l) => {
        licensesData.push([
          l.license_number,
          l.license_type,
          l.issuing_authority,
          new Date(l.issue_date).toLocaleDateString("fr-FR"),
          new Date(l.expiry_date).toLocaleDateString("fr-FR"),
          l.status,
        ]);
      });
      const ws5 = XLSX.utils.aoa_to_sheet(licensesData);
      XLSX.utils.book_append_sheet(workbook, ws5, "Liste des licences");
    }
    
    XLSX.writeFile(workbook, "rapport-etablissements.xlsx");
    toast.success("Rapport exporté avec succès");
  };

  // Prepare sector data for charts
  const sectorData = facilityStats?.sectorCounts 
    ? Object.entries(facilityStats.sectorCounts)
        .filter(([_, count]) => (count as number) > 0)
        .map(([sector, count]) => ({
          name: sectorLabels[sector] || sector,
          value: count as number,
        }))
    : [];

  // Prepare facility status data - only include items with value > 0
  const facilityStatusData = [
    { name: "Actif", value: facilityStats?.active || 0, color: "hsl(142, 76%, 36%)" },
    { name: "En attente", value: facilityStats?.pending || 0, color: "hsl(45, 93%, 47%)" },
    { name: "Inactif", value: facilityStats?.inactive || 0, color: "hsl(0, 84%, 60%)" },
  ].filter(item => item.value > 0);

  // Prepare license status data - only include items with value > 0
  const licenseStatusData = [
    { name: "Valide", value: licenseStats?.active || 0, color: "hsl(142, 76%, 36%)" },
    { name: "Expire bientôt", value: licenseStats?.expiringSoon || 0, color: "hsl(45, 93%, 47%)" },
    { name: "Expiré", value: licenseStats?.expired || 0, color: "hsl(0, 84%, 60%)" },
  ].filter(item => item.value > 0);

  // Monthly trends (mock data based on actual counts)
  const monthlyData = [
    { month: "Janvier", facilities: Math.floor((facilityStats?.total || 0) * 0.6), licenses: Math.floor((licenseStats?.total || 0) * 0.5) },
    { month: "Février", facilities: Math.floor((facilityStats?.total || 0) * 0.7), licenses: Math.floor((licenseStats?.total || 0) * 0.6) },
    { month: "Mars", facilities: Math.floor((facilityStats?.total || 0) * 0.75), licenses: Math.floor((licenseStats?.total || 0) * 0.7) },
    { month: "Avril", facilities: Math.floor((facilityStats?.total || 0) * 0.8), licenses: Math.floor((licenseStats?.total || 0) * 0.75) },
    { month: "Mai", facilities: Math.floor((facilityStats?.total || 0) * 0.9), licenses: Math.floor((licenseStats?.total || 0) * 0.85) },
    { month: "Juin", facilities: facilityStats?.total || 0, licenses: licenseStats?.total || 0 },
  ];

  const chartConfig = {
    facilities: {
      label: "Établissements",
      color: "hsl(var(--primary))",
    },
    licenses: {
      label: "Licences",
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
              <h1 className="text-2xl font-bold text-foreground">Rapports et statistiques</h1>
              <p className="text-muted-foreground">Vue d'ensemble des établissements et des licences</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToPDF} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Exporter PDF
              </Button>
              <Button onClick={exportToExcel} variant="outline" className="gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Exporter Excel
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total des établissements</p>
                        <p className="text-3xl font-bold text-foreground">{facilityStats?.total || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total des licences</p>
                        <p className="text-3xl font-bold text-foreground">{licenseStats?.total || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-chart-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Licences expirent bientôt</p>
                        <p className="text-3xl font-bold text-chart-4">{licenseStats?.expiringSoon || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-chart-4/10 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-chart-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Licences expirées</p>
                        <p className="text-3xl font-bold text-destructive">{licenseStats?.expired || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-destructive" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Sector Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Répartition par secteur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sectorData.length > 0 ? (
                      <ChartContainer config={chartConfig} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sectorData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        Aucune donnée disponible
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Facility Status Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Statut des établissements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {facilityStatusData.length > 0 ? (
                      <ChartContainer config={chartConfig} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={facilityStatusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              innerRadius={40}
                              dataKey="value"
                              paddingAngle={2}
                            >
                              {facilityStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        Aucune donnée disponible
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* License Status Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Statut des licences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {licenseStatusData.length > 0 ? (
                      <ChartContainer config={chartConfig} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={licenseStatusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              innerRadius={40}
                              dataKey="value"
                              paddingAngle={2}
                            >
                              {licenseStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        Aucune donnée disponible
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Monthly Trend Line Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Croissance mensuelle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="facilities" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            name="Établissements"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="licenses" 
                            stroke="hsl(var(--chart-2))" 
                            strokeWidth={2}
                            name="Licences"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Stats Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Résumé détaillé</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Établissements
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-chart-2" />
                            Actifs
                          </span>
                          <span className="font-medium">{facilityStats?.active || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-chart-4" />
                            En attente
                          </span>
                          <span className="font-medium">{facilityStats?.pending || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-destructive" />
                            Inactifs
                          </span>
                          <span className="font-medium">{facilityStats?.inactive || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Licences
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-chart-2" />
                            Valides
                          </span>
                          <span className="font-medium">{licenseStats?.active || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-chart-4" />
                            Expirent bientôt
                          </span>
                          <span className="font-medium">{licenseStats?.expiringSoon || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-destructive" />
                            Expirées
                          </span>
                          <span className="font-medium">{licenseStats?.expired || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Indicateurs de performance
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Taux d'établissements actifs</span>
                          <span className="font-medium text-chart-2">
                            {facilityStats?.total 
                              ? Math.round((facilityStats.active / facilityStats.total) * 100) 
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Taux de licences valides</span>
                          <span className="font-medium text-chart-2">
                            {licenseStats?.total 
                              ? Math.round((licenseStats.active / licenseStats.total) * 100) 
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Ratio licence/établissement</span>
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
    </div>
  );
};

export default ReportsPage;