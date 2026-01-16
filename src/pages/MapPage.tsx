import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FacilitiesMap from "@/components/FacilitiesMap";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Layers, Filter } from "lucide-react";

const MapPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">
              Tableau de bord
            </button>
            <ArrowLeft className="w-4 h-4" />
            <span className="text-foreground">Carte des établissements</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Layers className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Carte des établissements</h1>
                <p className="text-muted-foreground">Vue géographique de tous les établissements</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtrer
              </Button>
              <Button className="gap-2" onClick={() => navigate("/add-facility")}>
                <Plus className="w-4 h-4" />
                Ajouter un établissement
              </Button>
            </div>
          </div>

          {/* Map */}
          <div className="card-institutional">
            <FacilitiesMap height="calc(100vh - 280px)" showLegend={true} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MapPage;