import { MapPin, Calendar, Building2, ExternalLink } from "lucide-react";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface FacilityCardProps {
  id?: string;
  name: string;
  sector: string;
  location: string;
  status: "active" | "pending" | "expired";
  licenseExpiry?: string;
  websiteUrl?: string | null;
}

const FacilityCard = ({ id = "1", name, sector, location, status, licenseExpiry, websiteUrl }: FacilityCardProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const statusConfig = {
    active: {
      label: t("Actif", "نشط"),
      className: "bg-success text-success-foreground hover:bg-success/90",
    },
    pending: {
      label: t("En révision", "قيد المراجعة"),
      className: "bg-warning text-warning-foreground hover:bg-warning/90",
    },
    expired: {
      label: t("Expiré", "منتهي"),
      className: "bg-critical text-critical-foreground hover:bg-critical/90",
    },
  };

  const config = statusConfig[status];

  return (
    <div 
      onClick={() => navigate(`/facility/${id}`)}
      className="card-institutional hover:shadow-md hover:border-primary/50 transition-all cursor-pointer animate-fade-in"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent">
            <Building2 className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-muted-foreground text-sm">{sector}</p>
          </div>
        </div>
        <Badge className={config.className}>{config.label}</Badge>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
        {licenseExpiry && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{t("Expiration de la licence:", "انتهاء الترخيص:")} {licenseExpiry}</span>
          </div>
        )}
        {websiteUrl && (
          <a 
            href={websiteUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{t("Visiter le site", "زيارة الموقع")}</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default FacilityCard;