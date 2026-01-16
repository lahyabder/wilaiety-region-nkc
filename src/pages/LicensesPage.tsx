import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLicenses, useLicenseStats, useCreateLicense, useDeleteLicense, type LicenseStatus } from "@/hooks/useLicenses";
import { useFacilities } from "@/hooks/useFacilities";
import StatsCard from "@/components/StatsCard";
import { 
  ArrowRight, 
  FileText, 
  Plus, 
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Building2,
  Calendar,
  Trash2,
  Eye,
  RefreshCw
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";

const LicensesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const { data: licenses, isLoading } = useLicenses();
  const { data: stats, isLoading: statsLoading } = useLicenseStats();
  const { data: facilities } = useFacilities();
  const createLicense = useCreateLicense();
  const deleteLicense = useDeleteLicense();

  // Form state
  const [formData, setFormData] = useState({
    facility_id: "",
    license_number: "",
    license_type: "",
    issuing_authority: "",
    issue_date: "",
    expiry_date: "",
    notes: "",
  });

  const getStatusBadge = (status: LicenseStatus) => {
    const config: Record<LicenseStatus, { className: string; icon: typeof CheckCircle }> = {
      "ساري": { className: "bg-success text-success-foreground", icon: CheckCircle },
      "قريب الانتهاء": { className: "bg-warning text-warning-foreground", icon: AlertTriangle },
      "منتهي": { className: "bg-critical text-critical-foreground", icon: XCircle },
      "ملغى": { className: "bg-muted text-muted-foreground", icon: XCircle },
    };
    const { className, icon: Icon } = config[status];
    return (
      <Badge className={`${className} gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const getDaysRemaining = (expiryDate: string) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days < 0) return <span className="text-critical font-medium">منتهي منذ {Math.abs(days)} يوم</span>;
    if (days === 0) return <span className="text-critical font-medium">ينتهي اليوم</span>;
    if (days <= 30) return <span className="text-warning font-medium">{days} يوم متبقي</span>;
    return <span className="text-success">{days} يوم متبقي</span>;
  };

  const filteredLicenses = licenses?.filter(license => {
    const matchesSearch = 
      license.license_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.facilities?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.license_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || license.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateLicense = async () => {
    if (!formData.facility_id || !formData.license_number || !formData.license_type || 
        !formData.issuing_authority || !formData.issue_date || !formData.expiry_date) {
      return;
    }

    await createLicense.mutateAsync({
      facility_id: formData.facility_id,
      license_number: formData.license_number,
      license_type: formData.license_type,
      issuing_authority: formData.issuing_authority,
      issue_date: formData.issue_date,
      expiry_date: formData.expiry_date,
      notes: formData.notes || undefined,
    });

    setIsAddDialogOpen(false);
    setFormData({
      facility_id: "",
      license_number: "",
      license_type: "",
      issuing_authority: "",
      issue_date: "",
      expiry_date: "",
      notes: "",
    });
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
            <span className="text-foreground">التراخيص</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">إدارة التراخيص</h1>
                <p className="text-muted-foreground">متابعة وإدارة تراخيص المنشآت</p>
              </div>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة ترخيص
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>إضافة ترخيص جديد</DialogTitle>
                  <DialogDescription>
                    أدخل بيانات الترخيص الجديد
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div>
                    <Label>المنشأة *</Label>
                    <Select 
                      value={formData.facility_id} 
                      onValueChange={(value) => setFormData({...formData, facility_id: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر المنشأة" />
                      </SelectTrigger>
                      <SelectContent>
                        {facilities?.map((facility) => (
                          <SelectItem key={facility.id} value={facility.id}>
                            {facility.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>رقم الترخيص *</Label>
                      <Input 
                        className="mt-1"
                        placeholder="LIC-2024-XXXXX"
                        value={formData.license_number}
                        onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>نوع الترخيص *</Label>
                      <Input 
                        className="mt-1"
                        placeholder="ترخيص تشغيل"
                        value={formData.license_type}
                        onChange={(e) => setFormData({...formData, license_type: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>جهة الإصدار *</Label>
                    <Input 
                      className="mt-1"
                      placeholder="وزارة الصحة"
                      value={formData.issuing_authority}
                      onChange={(e) => setFormData({...formData, issuing_authority: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>تاريخ الإصدار *</Label>
                      <Input 
                        type="date"
                        className="mt-1"
                        value={formData.issue_date}
                        onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>تاريخ الانتهاء *</Label>
                      <Input 
                        type="date"
                        className="mt-1"
                        value={formData.expiry_date}
                        onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>ملاحظات</Label>
                    <Textarea 
                      className="mt-1"
                      placeholder="ملاحظات إضافية..."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    onClick={handleCreateLicense}
                    disabled={createLicense.isPending}
                  >
                    {createLicense.isPending ? "جاري الحفظ..." : "حفظ الترخيص"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsLoading ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
            ) : (
              <>
                <StatsCard
                  title="إجمالي التراخيص"
                  value={(stats?.total || 0).toLocaleString("ar-SA")}
                  icon={FileText}
                />
                <StatsCard
                  title="تراخيص سارية"
                  value={(stats?.active || 0).toLocaleString("ar-SA")}
                  icon={CheckCircle}
                  variant="success"
                />
                <StatsCard
                  title="قريبة الانتهاء"
                  value={(stats?.expiringSoon || 0).toLocaleString("ar-SA")}
                  icon={Clock}
                  variant="warning"
                />
                <StatsCard
                  title="منتهية"
                  value={(stats?.expired || 0).toLocaleString("ar-SA")}
                  icon={XCircle}
                  variant="critical"
                />
              </>
            )}
          </div>

          {/* Filters */}
          <div className="card-institutional mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث عن ترخيص..."
                    className="pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="حالة الترخيص" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="ساري">ساري</SelectItem>
                  <SelectItem value="قريب الانتهاء">قريب الانتهاء</SelectItem>
                  <SelectItem value="منتهي">منتهي</SelectItem>
                  <SelectItem value="ملغى">ملغى</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                تحديث
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="card-institutional">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : filteredLicenses && filteredLicenses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الترخيص</TableHead>
                    <TableHead>المنشأة</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>جهة الإصدار</TableHead>
                    <TableHead>تاريخ الانتهاء</TableHead>
                    <TableHead>المدة المتبقية</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLicenses.map((license) => (
                    <TableRow key={license.id}>
                      <TableCell className="font-mono font-medium">
                        {license.license_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span>{license.facilities?.name || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{license.license_type}</TableCell>
                      <TableCell>{license.issuing_authority}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(license.expiry_date), "dd MMM yyyy", { locale: ar })}
                        </div>
                      </TableCell>
                      <TableCell>{getDaysRemaining(license.expiry_date)}</TableCell>
                      <TableCell>{getStatusBadge(license.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/facility/${license.facility_id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-critical hover:text-critical"
                            onClick={() => deleteLicense.mutate(license.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد تراخيص</h3>
                <p className="text-muted-foreground mb-4">ابدأ بإضافة ترخيص جديد</p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة ترخيص
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LicensesPage;
