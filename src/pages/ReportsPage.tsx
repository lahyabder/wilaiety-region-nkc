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
  health: "الصحة",
  education: "التعليم",
  commerce: "التجارة",
  industry: "الصناعة",
  agriculture: "الزراعة",
  tourism: "السياحة",
  transport: "النقل",
  technology: "التقنية",
  energy: "الطاقة",
  construction: "البناء",
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
    
    // Add Arabic font support note - jsPDF has limited Arabic support
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Facilities & Licenses Report", 14, 22);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
    
    // Facilities Summary
    doc.setFont("helvetica", "bold");
    doc.text("Facilities Summary", 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [["Category", "Count"]],
      body: [
        ["Total Facilities", String(facilityStats?.total || 0)],
        ["Active", String(facilityStats?.active || 0)],
        ["Pending", String(facilityStats?.pending || 0)],
        ["Inactive", String(facilityStats?.inactive || 0)],
      ],
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
    });
    
    // Licenses Summary
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    doc.setFont("helvetica", "bold");
    doc.text("Licenses Summary", 14, finalY + 15);
    
    autoTable(doc, {
      startY: finalY + 20,
      head: [["Category", "Count"]],
      body: [
        ["Total Licenses", String(licenseStats?.total || 0)],
        ["Active", String(licenseStats?.active || 0)],
        ["Expiring Soon", String(licenseStats?.expiringSoon || 0)],
        ["Expired", String(licenseStats?.expired || 0)],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
    });
    
    // Sector Distribution
    const finalY2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    doc.setFont("helvetica", "bold");
    doc.text("Sector Distribution", 14, finalY2 + 15);
    
    const sectorRows = Object.entries(facilityStats?.sectorCounts || {})
      .filter(([_, count]) => (count as number) > 0)
      .map(([sector, count]) => [sectorLabels[sector] || sector, String(count)]);
    
    if (sectorRows.length > 0) {
      autoTable(doc, {
        startY: finalY2 + 20,
        head: [["Sector", "Count"]],
        body: sectorRows,
        theme: "striped",
        headStyles: { fillColor: [168, 85, 247] },
      });
    }
    
    doc.save("facilities-report.pdf");
    toast.success("تم تصدير التقرير بنجاح");
  };

  // Export to Excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Facilities Summary Sheet
    const facilitiesSummary = [
      ["إحصائيات المنشآت", ""],
      ["الإجمالي", facilityStats?.total || 0],
      ["نشطة", facilityStats?.active || 0],
      ["قيد المراجعة", facilityStats?.pending || 0],
      ["غير نشطة", facilityStats?.inactive || 0],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(facilitiesSummary);
    XLSX.utils.book_append_sheet(workbook, ws1, "المنشآت");
    
    // Licenses Summary Sheet
    const licensesSummary = [
      ["إحصائيات التراخيص", ""],
      ["الإجمالي", licenseStats?.total || 0],
      ["سارية", licenseStats?.active || 0],
      ["قريبة الانتهاء", licenseStats?.expiringSoon || 0],
      ["منتهية", licenseStats?.expired || 0],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(licensesSummary);
    XLSX.utils.book_append_sheet(workbook, ws2, "التراخيص");
    
    // Sector Distribution Sheet
    const sectorData = [["القطاع", "العدد"]];
    Object.entries(facilityStats?.sectorCounts || {}).forEach(([sector, count]) => {
      if ((count as number) > 0) {
        sectorData.push([sectorLabels[sector] || sector, count as unknown as string]);
      }
    });
    const ws3 = XLSX.utils.aoa_to_sheet(sectorData);
    XLSX.utils.book_append_sheet(workbook, ws3, "القطاعات");
    
    // Facilities List Sheet
    if (facilities && facilities.length > 0) {
      const facilitiesData = [["الاسم", "القطاع", "المنطقة", "الحالة", "تاريخ الإنشاء"]];
      facilities.forEach((f) => {
        facilitiesData.push([
          f.name,
          sectorLabels[f.sector] || f.sector,
          f.region,
          f.status,
          new Date(f.created_at).toLocaleDateString("ar"),
        ]);
      });
      const ws4 = XLSX.utils.aoa_to_sheet(facilitiesData);
      XLSX.utils.book_append_sheet(workbook, ws4, "قائمة المنشآت");
    }
    
    // Licenses List Sheet
    if (licenses && licenses.length > 0) {
      const licensesData = [["رقم الترخيص", "النوع", "جهة الإصدار", "تاريخ الإصدار", "تاريخ الانتهاء", "الحالة"]];
      licenses.forEach((l) => {
        licensesData.push([
          l.license_number,
          l.license_type,
          l.issuing_authority,
          new Date(l.issue_date).toLocaleDateString("ar"),
          new Date(l.expiry_date).toLocaleDateString("ar"),
          l.status,
        ]);
      });
      const ws5 = XLSX.utils.aoa_to_sheet(licensesData);
      XLSX.utils.book_append_sheet(workbook, ws5, "قائمة التراخيص");
    }
    
    XLSX.writeFile(workbook, "facilities-report.xlsx");
    toast.success("تم تصدير التقرير بنجاح");
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

  // Prepare facility status data
  const facilityStatusData = [
    { name: "نشط", value: facilityStats?.active || 0, color: "hsl(var(--chart-2))" },
    { name: "قيد المراجعة", value: facilityStats?.pending || 0, color: "hsl(var(--chart-4))" },
    { name: "غير نشط", value: facilityStats?.inactive || 0, color: "hsl(var(--chart-5))" },
  ].filter(item => item.value > 0);

  // Prepare license status data
  const licenseStatusData = [
    { name: "ساري", value: licenseStats?.active || 0, color: "hsl(var(--chart-2))" },
    { name: "قريب الانتهاء", value: licenseStats?.expiringSoon || 0, color: "hsl(var(--chart-4))" },
    { name: "منتهي", value: licenseStats?.expired || 0, color: "hsl(var(--chart-5))" },
  ].filter(item => item.value > 0);

  // Monthly trends (mock data based on actual counts)
  const monthlyData = [
    { month: "يناير", facilities: Math.floor((facilityStats?.total || 0) * 0.6), licenses: Math.floor((licenseStats?.total || 0) * 0.5) },
    { month: "فبراير", facilities: Math.floor((facilityStats?.total || 0) * 0.7), licenses: Math.floor((licenseStats?.total || 0) * 0.6) },
    { month: "مارس", facilities: Math.floor((facilityStats?.total || 0) * 0.75), licenses: Math.floor((licenseStats?.total || 0) * 0.7) },
    { month: "أبريل", facilities: Math.floor((facilityStats?.total || 0) * 0.8), licenses: Math.floor((licenseStats?.total || 0) * 0.75) },
    { month: "مايو", facilities: Math.floor((facilityStats?.total || 0) * 0.9), licenses: Math.floor((licenseStats?.total || 0) * 0.85) },
    { month: "يونيو", facilities: facilityStats?.total || 0, licenses: licenseStats?.total || 0 },
  ];

  const chartConfig = {
    facilities: {
      label: "المنشآت",
      color: "hsl(var(--primary))",
    },
    licenses: {
      label: "التراخيص",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">التقارير والإحصائيات</h1>
              <p className="text-muted-foreground">نظرة شاملة على بيانات المنشآت والتراخيص</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToPDF} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                تصدير PDF
              </Button>
              <Button onClick={exportToExcel} variant="outline" className="gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                تصدير Excel
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
                        <p className="text-sm text-muted-foreground">إجمالي المنشآت</p>
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
                        <p className="text-sm text-muted-foreground">إجمالي التراخيص</p>
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
                        <p className="text-sm text-muted-foreground">تراخيص قريبة الانتهاء</p>
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
                        <p className="text-sm text-muted-foreground">تراخيص منتهية</p>
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
                    <CardTitle className="text-lg">توزيع المنشآت حسب القطاع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sectorData.length > 0 ? (
                      <ChartContainer config={chartConfig} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sectorData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={80} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        لا توجد بيانات
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Facility Status Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">حالة المنشآت</CardTitle>
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
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {facilityStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        لا توجد بيانات
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
                    <CardTitle className="text-lg">حالة التراخيص</CardTitle>
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
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {licenseStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        لا توجد بيانات
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Monthly Trend Line Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">النمو الشهري</CardTitle>
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
                            name="المنشآت"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="licenses" 
                            stroke="hsl(var(--chart-2))" 
                            strokeWidth={2}
                            name="التراخيص"
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
                  <CardTitle className="text-lg">ملخص تفصيلي</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        المنشآت
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-chart-2" />
                            نشطة
                          </span>
                          <span className="font-medium">{facilityStats?.active || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-chart-4" />
                            قيد المراجعة
                          </span>
                          <span className="font-medium">{facilityStats?.pending || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-destructive" />
                            غير نشطة
                          </span>
                          <span className="font-medium">{facilityStats?.inactive || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        التراخيص
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-chart-2" />
                            سارية
                          </span>
                          <span className="font-medium">{licenseStats?.active || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-chart-4" />
                            قريبة الانتهاء
                          </span>
                          <span className="font-medium">{licenseStats?.expiringSoon || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-destructive" />
                            منتهية
                          </span>
                          <span className="font-medium">{licenseStats?.expired || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        مؤشرات الأداء
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">نسبة المنشآت النشطة</span>
                          <span className="font-medium text-chart-2">
                            {facilityStats?.total 
                              ? Math.round((facilityStats.active / facilityStats.total) * 100) 
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">نسبة التراخيص السارية</span>
                          <span className="font-medium text-chart-2">
                            {licenseStats?.total 
                              ? Math.round((licenseStats.active / licenseStats.total) * 100) 
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">معدل الترخيص لكل منشأة</span>
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
