import { useNavigate } from "react-router-dom";
import { Plus, FileUp, Download, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-3">
      <Button className="gap-2" onClick={() => navigate("/add-facility")}>
        <Plus className="w-4 h-4" />
        Ajouter un établissement
      </Button>
      <Button variant="outline" className="gap-2">
        <FileUp className="w-4 h-4" />
        Importer des données
      </Button>
      <Button variant="outline" className="gap-2">
        <Download className="w-4 h-4" />
        Exporter un rapport
      </Button>
      <Button variant="outline" className="gap-2">
        <RefreshCw className="w-4 h-4" />
        Actualiser les données
      </Button>
    </div>
  );
};

export default QuickActions;