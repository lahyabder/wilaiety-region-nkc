import { MapPin, Calendar, Building2 } from "lucide-react";
import { Badge } from "./ui/badge";

interface FacilityCardProps {
  name: string;
  sector: string;
  location: string;
  status: "active" | "pending" | "expired";
  licenseExpiry?: string;
}

const FacilityCard = ({ name, sector, location, status, licenseExpiry }: FacilityCardProps) => {
  const statusConfig = {
    active: {
      label: "نشط",
      className: "bg-success text-success-foreground hover:bg-success/90",
    },
    pending: {
      label: "قيد المراجعة",
      className: "bg-warning text-warning-foreground hover:bg-warning/90",
    },
    expired: {
      label: "منتهي",
      className: "bg-critical text-critical-foreground hover:bg-critical/90",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="card-institutional hover:shadow-md transition-shadow animate-fade-in">
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
            <span>انتهاء الترخيص: {licenseExpiry}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityCard;
