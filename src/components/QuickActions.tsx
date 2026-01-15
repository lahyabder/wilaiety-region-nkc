import { useNavigate } from "react-router-dom";
import { Plus, FileUp, Download, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-3">
      <Button className="gap-2" onClick={() => navigate("/add-facility")}>
        <Plus className="w-4 h-4" />
        إضافة منشأة
      </Button>
      <Button variant="outline" className="gap-2">
        <FileUp className="w-4 h-4" />
        استيراد بيانات
      </Button>
      <Button variant="outline" className="gap-2">
        <Download className="w-4 h-4" />
        تصدير تقرير
      </Button>
      <Button variant="outline" className="gap-2">
        <RefreshCw className="w-4 h-4" />
        تحديث البيانات
      </Button>
    </div>
  );
};

export default QuickActions;
