import { useNavigate } from "react-router-dom";
import { Plus, FileUp, Download, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const QuickActions = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap gap-3">
      <Button className="gap-2" onClick={() => navigate("/add-facility")}>
        <Plus className="w-4 h-4" />
        {t("Ajouter un établissement", "إضافة منشأة")}
      </Button>
      <Button variant="outline" className="gap-2">
        <FileUp className="w-4 h-4" />
        {t("Importer des données", "استيراد البيانات")}
      </Button>
      <Button variant="outline" className="gap-2">
        <Download className="w-4 h-4" />
        {t("Exporter un rapport", "تصدير تقرير")}
      </Button>
      <Button variant="outline" className="gap-2">
        <RefreshCw className="w-4 h-4" />
        {t("Actualiser les données", "تحديث البيانات")}
      </Button>
    </div>
  );
};

export default QuickActions;