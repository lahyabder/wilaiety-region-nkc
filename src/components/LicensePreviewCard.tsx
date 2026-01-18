import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Download, FileText, Building2, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";
import { ar, fr } from "date-fns/locale";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { License } from "@/hooks/useLicenses";

interface LicensePreviewCardProps {
  license: License;
}

const LicensePreviewCard = ({ license }: LicensePreviewCardProps) => {
  const { t, language } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  const getDateLocale = () => (language === "ar" ? ar : fr);

  const statusLabels: Record<string, string> = {
    "ساري": t("Valide", "ساري"),
    "قريب الانتهاء": t("Expire bientôt", "قريب الانتهاء"),
    "منتهي": t("Expiré", "منتهي"),
    "ملغى": t("Annulé", "ملغى")
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      "ساري": "bg-success text-success-foreground",
      "قريب الانتهاء": "bg-warning text-warning-foreground",
      "منتهي": "bg-critical text-critical-foreground",
      "ملغى": "bg-muted text-muted-foreground",
    };
    return statusConfig[status] || "bg-muted text-muted-foreground";
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: getDateLocale() });
    } catch {
      return dateString;
    }
  };

  const exportToPDF = async () => {
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`license-${license.license_number}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="w-4 h-4" />
          {t("Aperçu", "معاينة")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t("Aperçu de la licence", "معاينة الترخيص")}
          </DialogTitle>
        </DialogHeader>

        {/* Export Button */}
        <div className="flex justify-end mb-4">
          <Button onClick={exportToPDF} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            {t("Télécharger PDF", "تحميل PDF")}
          </Button>
        </div>

        {/* License Preview Card */}
        <div 
          ref={printRef}
          className="bg-white p-6 rounded-xl border-2 border-primary/20 shadow-lg"
          style={{ direction: language === "ar" ? "rtl" : "ltr" }}
        >
          {/* Header */}
          <div className="text-center border-b-2 border-primary pb-4 mb-6">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {t("Licence d'établissement", "ترخيص منشأة")}
            </h2>
            <p className="text-muted-foreground mt-1">{license.license_type}</p>
          </div>

          {/* License Number & Status */}
          <div className="flex justify-between items-center mb-6 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">{t("Numéro de licence", "رقم الترخيص")}</p>
              <p className="text-xl font-mono font-bold text-primary">{license.license_number}</p>
            </div>
            <Badge className={`${getStatusBadge(license.status)} text-sm px-3 py-1`}>
              {statusLabels[license.status] || license.status}
            </Badge>
          </div>

          {/* Facility Info */}
          {license.facilities && (
            <div className="mb-6 p-4 bg-accent/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-accent-foreground" />
                <span className="font-semibold text-foreground">{t("Établissement", "المنشأة")}</span>
              </div>
              <p className="text-lg font-medium text-foreground">{license.facilities.name}</p>
              <p className="text-sm text-muted-foreground">{license.facilities.region}</p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t("Date d'émission", "تاريخ الإصدار")}</span>
              </div>
              <p className="font-medium text-foreground">{formatDate(license.issue_date)}</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t("Date d'expiration", "تاريخ الانتهاء")}</span>
              </div>
              <p className="font-medium text-foreground">{formatDate(license.expiry_date)}</p>
            </div>
          </div>

          {/* Issuing Authority */}
          <div className="mb-6 p-4 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">{t("Autorité émettrice", "الجهة المصدرة")}</p>
            <p className="font-medium text-foreground">{license.issuing_authority}</p>
          </div>

          {/* License Image */}
          {license.image_url && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">{t("Image de la licence", "صورة الترخيص")}</p>
              <img 
                src={license.image_url} 
                alt={t("Image de la licence", "صورة الترخيص")}
                className="w-full max-h-64 object-contain rounded-lg border border-border"
              />
            </div>
          )}

          {/* Notes */}
          {license.notes && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{t("Notes", "ملاحظات")}</p>
              <p className="text-foreground">{license.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-foreground">
            <p>{t("Ce document est généré automatiquement", "هذا المستند تم إنشاؤه آلياً")}</p>
            <p>{t("Date d'impression", "تاريخ الطباعة")}: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: getDateLocale() })}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LicensePreviewCard;
