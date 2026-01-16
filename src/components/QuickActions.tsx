import { useNavigate } from "react-router-dom";
import { Plus, FileUp, Download, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const QuickActions = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      <Button className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4" onClick={() => navigate("/add-facility")}>
        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden xs:inline">{t("Ajouter un établissement", "إضافة منشأة")}</span>
        <span className="xs:hidden">{t("Ajouter", "إضافة")}</span>
      </Button>
      <Button variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4">
        <FileUp className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">{t("Importer des données", "استيراد البيانات")}</span>
        <span className="sm:hidden">{t("Importer", "استيراد")}</span>
      </Button>
      <Button variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4">
        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">{t("Exporter un rapport", "تصدير تقرير")}</span>
        <span className="sm:hidden">{t("Exporter", "تصدير")}</span>
      </Button>
      <Button variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4 hidden md:flex">
        <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
        {t("Actualiser les données", "تحديث البيانات")}
      </Button>
    </div>
  );
};

export default QuickActions;