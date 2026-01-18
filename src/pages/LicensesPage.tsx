import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { supabase } from "@/integrations/supabase/client";
import { useLicenses, useLicenseStats, useCreateLicense, useDeleteLicense, type LicenseStatus } from "@/hooks/useLicenses";
import { useFacilities } from "@/hooks/useFacilities";
import LicensePreviewCard from "@/components/LicensePreviewCard";
import StatsCard from "@/components/StatsCard";
import { toast } from "sonner";
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
  RefreshCw,
  Upload,
  Image,
  Loader2,
  X
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fr, ar } from "date-fns/locale";

const LicensesPage = () => {
  const { t } = useLanguage();
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
    image_url: "",
  });

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("Veuillez sélectionner un fichier image valide", "يرجى اختيار ملف صورة صالح"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("La taille de l'image doit être inférieure à 5 Mo", "حجم الصورة يجب أن يكون أقل من 5 ميجابايت"));
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `licenses/new/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("facility-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("facility-images")
        .getPublicUrl(data.path);

      setImagePreview(urlData.publicUrl);
      setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
      toast.success(t("Image téléchargée avec succès", "تم رفع الصورة بنجاح"));
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(t("Échec du téléchargement de l'image", "فشل في رفع الصورة"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStatusLabel = (status: LicenseStatus) => {
    const labels: Record<LicenseStatus, { fr: string; ar: string }> = {
      "ساري": { fr: "Valide", ar: "ساري" },
      "قريب الانتهاء": { fr: "Expire bientôt", ar: "قريب الانتهاء" },
      "منتهي": { fr: "Expiré", ar: "منتهي" },
      "ملغى": { fr: "Annulé", ar: "ملغى" },
    };
    return t(labels[status].fr, labels[status].ar);
  };

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
        {getStatusLabel(status)}
      </Badge>
    );
  };

  const getDaysRemaining = (expiryDate: string) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days < 0) return <span className="text-critical font-medium">{t(`Expiré depuis ${Math.abs(days)} jours`, `منتهي منذ ${Math.abs(days)} يوم`)}</span>;
    if (days === 0) return <span className="text-critical font-medium">{t("Expire aujourd'hui", "ينتهي اليوم")}</span>;
    if (days <= 30) return <span className="text-warning font-medium">{t(`${days} jours restants`, `${days} يوم متبقي`)}</span>;
    return <span className="text-success">{t(`${days} jours restants`, `${days} يوم متبقي`)}</span>;
  };

  const getDateLocale = () => {
    return t("fr", "ar") === "ar" ? ar : fr;
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
      image_url: formData.image_url || undefined,
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
      image_url: "",
    });
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex w-full">
        <Sidebar />
        
        <main className="flex-1 p-6 min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">
              {t("Tableau de bord", "لوحة التحكم")}
            </button>
            <ArrowRight className="w-4 h-4" />
            <span className="text-foreground">{t("Licences", "التراخيص")}</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("Gestion des licences", "إدارة التراخيص")}</h1>
                <p className="text-muted-foreground">{t("Suivi et gestion des licences des établissements", "متابعة وإدارة تراخيص المنشآت")}</p>
              </div>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t("Ajouter une licence", "إضافة ترخيص")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg">{t("Ajouter une nouvelle licence", "إضافة ترخيص جديد")}</DialogTitle>
                      <DialogDescription className="text-sm">
                        {t("Remplissez les informations requises pour créer une nouvelle licence", "املأ المعلومات المطلوبة لإنشاء ترخيص جديد")}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6 py-6">
                  {/* Facility Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {t("Établissement", "المنشأة")}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={formData.facility_id} 
                      onValueChange={(value) => setFormData({...formData, facility_id: value})}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={t("Sélectionner l'établissement", "اختيار المنشأة")} />
                      </SelectTrigger>
                      <SelectContent>
                        {facilities?.map((facility) => (
                          <SelectItem key={facility.id} value={facility.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              {facility.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* License Info Section */}
                  <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      {t("Informations de la licence", "معلومات الترخيص")}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">
                          {t("Numéro de licence", "رقم الترخيص")}
                          <span className="text-destructive mr-1">*</span>
                        </Label>
                        <Input 
                          className="h-10"
                          placeholder="LIC-2024-XXXXX"
                          value={formData.license_number}
                          onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">
                          {t("Type de licence", "نوع الترخيص")}
                          <span className="text-destructive mr-1">*</span>
                        </Label>
                        <Input 
                          className="h-10"
                          placeholder={t("Licence d'exploitation", "ترخيص تشغيل")}
                          value={formData.license_type}
                          onChange={(e) => setFormData({...formData, license_type: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">
                        {t("Autorité émettrice", "الجهة المصدرة")}
                        <span className="text-destructive mr-1">*</span>
                      </Label>
                      <Input 
                        className="h-10"
                        placeholder={t("Ministère de la Santé", "وزارة الصحة")}
                        value={formData.issuing_authority}
                        onChange={(e) => setFormData({...formData, issuing_authority: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Dates Section */}
                  <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {t("Dates de validité", "تواريخ الصلاحية")}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">
                          {t("Date d'émission", "تاريخ الإصدار")}
                          <span className="text-destructive mr-1">*</span>
                        </Label>
                        <Input 
                          type="date"
                          className="h-10"
                          value={formData.issue_date}
                          onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">
                          {t("Date d'expiration", "تاريخ الانتهاء")}
                          <span className="text-destructive mr-1">*</span>
                        </Label>
                        <Input 
                          type="date"
                          className="h-10"
                          value={formData.expiry_date}
                          onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t("Notes", "ملاحظات")}
                      <span className="text-muted-foreground text-xs mr-2">({t("optionnel", "اختياري")})</span>
                    </Label>
                    <Textarea 
                      className="min-h-[80px] resize-none"
                      placeholder={t("Ajouter des notes ou remarques supplémentaires...", "إضافة ملاحظات أو تعليقات إضافية...")}
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>

                  {/* License Image Upload */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Image className="w-4 h-4 text-muted-foreground" />
                      {t("Image de la licence", "صورة الترخيص")}
                      <span className="text-muted-foreground text-xs">({t("optionnel", "اختياري")})</span>
                    </Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    {imagePreview ? (
                      <div className="relative group rounded-xl overflow-hidden border border-border">
                        <img
                          src={imagePreview}
                          alt={t("Aperçu de la licence", "معاينة الترخيص")}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-3">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="shadow-lg"
                          >
                            {uploadingImage ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span className="mr-2">{t("Changer", "تغيير")}</span>
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemoveImage}
                            className="shadow-lg"
                          >
                            <X className="w-4 h-4" />
                            <span className="mr-2">{t("Supprimer", "حذف")}</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="h-36 bg-gradient-to-br from-muted/50 to-muted rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 cursor-pointer transition-all duration-200 group"
                      >
                        {uploadingImage ? (
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
                            <span className="text-sm font-medium text-muted-foreground">{t("Téléchargement en cours...", "جاري الرفع...")}</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors">
                              <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{t("Cliquez pour télécharger", "انقر للرفع")}</span>
                            <p className="text-xs text-muted-foreground mt-1">{t("PNG, JPG jusqu'à 5 Mo", "PNG, JPG حتى 5 ميجابايت")}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="pt-4 border-t border-border gap-3 sm:gap-3">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="min-w-[100px]">
                    {t("Annuler", "إلغاء")}
                  </Button>
                  <Button 
                    onClick={handleCreateLicense}
                    disabled={createLicense.isPending}
                    className="min-w-[140px] gap-2"
                  >
                    {createLicense.isPending ? t("Enregistrement...", "جاري الحفظ...") : t("Enregistrer la licence", "حفظ الترخيص")}
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
                  title={t("Total des licences", "إجمالي التراخيص")}
                  value={(stats?.total || 0).toLocaleString("fr-FR")}
                  icon={FileText}
                />
                <StatsCard
                  title={t("Licences valides", "التراخيص السارية")}
                  value={(stats?.active || 0).toLocaleString("fr-FR")}
                  icon={CheckCircle}
                  variant="success"
                />
                <StatsCard
                  title={t("Expirent bientôt", "قريبة الانتهاء")}
                  value={(stats?.expiringSoon || 0).toLocaleString("fr-FR")}
                  icon={Clock}
                  variant="warning"
                />
                <StatsCard
                  title={t("Expirées", "منتهية")}
                  value={(stats?.expired || 0).toLocaleString("fr-FR")}
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
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("Rechercher une licence...", "البحث عن ترخيص...")}
                    className="ps-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("Statut de la licence", "حالة الترخيص")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("Tous les statuts", "جميع الحالات")}</SelectItem>
                  <SelectItem value="ساري">{t("Valide", "ساري")}</SelectItem>
                  <SelectItem value="قريب الانتهاء">{t("Expire bientôt", "قريب الانتهاء")}</SelectItem>
                  <SelectItem value="منتهي">{t("Expiré", "منتهي")}</SelectItem>
                  <SelectItem value="ملغى">{t("Annulé", "ملغى")}</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                {t("Actualiser", "تحديث")}
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
                    <TableHead>{t("Numéro de licence", "رقم الترخيص")}</TableHead>
                    <TableHead>{t("Établissement", "المنشأة")}</TableHead>
                    <TableHead>{t("Type", "النوع")}</TableHead>
                    <TableHead>{t("Autorité émettrice", "الجهة المصدرة")}</TableHead>
                    <TableHead>{t("Date d'expiration", "تاريخ الانتهاء")}</TableHead>
                    <TableHead>{t("Temps restant", "الوقت المتبقي")}</TableHead>
                    <TableHead>{t("Statut", "الحالة")}</TableHead>
                    <TableHead>{t("Actions", "الإجراءات")}</TableHead>
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
                          {format(new Date(license.expiry_date), "dd MMM yyyy", { locale: getDateLocale() })}
                        </div>
                      </TableCell>
                      <TableCell>{getDaysRemaining(license.expiry_date)}</TableCell>
                      <TableCell>{getStatusBadge(license.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <LicensePreviewCard license={license} />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/facility/${license.facility_id}`)}
                            title={t("Voir l'établissement", "عرض المنشأة")}
                          >
                            <Building2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-critical hover:text-critical"
                            onClick={() => deleteLicense.mutate(license.id)}
                            title={t("Supprimer", "حذف")}
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
                <h3 className="text-lg font-semibold text-foreground mb-2">{t("Aucune licence", "لا توجد تراخيص")}</h3>
                <p className="text-muted-foreground mb-4">{t("Commencez par ajouter une nouvelle licence", "ابدأ بإضافة ترخيص جديد")}</p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t("Ajouter une licence", "إضافة ترخيص")}
                </Button>
              </div>
            )}
          </div>
          
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default LicensesPage;