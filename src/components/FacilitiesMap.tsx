import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useFacilities, type Facility, type FacilityStatus } from "@/hooks/useFacilities";
import { Badge } from "./ui/badge";
import { Building2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icons based on status
const createCustomIcon = (status: FacilityStatus) => {
  const colors: Record<FacilityStatus, string> = {
    "نشط": "#00A95C", // Green
    "غير نشط": "#D01C1F", // Red
    "قيد الإنشاء": "#FFD700", // Yellow
    "معلق": "#FFD700", // Yellow
  };

  const color = colors[status] || "#00A95C";

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
          <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M4 11h16v10H4z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Parse GPS coordinates from string
const parseGPS = (gps: string | null): [number, number] | null => {
  if (!gps) return null;
  
  const parts = gps.split(",").map(s => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return [parts[0], parts[1]];
  }
  return null;
};

// Component to fit map bounds to markers
const FitBounds = ({ facilities }: { facilities: Facility[] }) => {
  const map = useMap();

  useEffect(() => {
    const validFacilities = facilities.filter(f => parseGPS(f.gps_coordinates));
    
    if (validFacilities.length > 0) {
      const bounds = L.latLngBounds(
        validFacilities.map(f => {
          const coords = parseGPS(f.gps_coordinates)!;
          return [coords[0], coords[1]] as [number, number];
        })
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [facilities, map]);

  return null;
};

interface FacilitiesMapProps {
  height?: string;
  showLegend?: boolean;
}

const FacilitiesMap = ({ height = "400px", showLegend = true }: FacilitiesMapProps) => {
  const { data: facilities, isLoading } = useFacilities();
  const navigate = useNavigate();

  // Default center (Algeria)
  const defaultCenter: [number, number] = [28.0339, 1.6596];

  const getStatusBadge = (status: FacilityStatus) => {
    const config: Record<FacilityStatus, string> = {
      "نشط": "bg-success text-success-foreground",
      "غير نشط": "bg-critical text-critical-foreground",
      "قيد الإنشاء": "bg-warning text-warning-foreground",
      "معلق": "bg-warning text-warning-foreground",
    };
    return config[status];
  };

  const facilitiesWithCoords = facilities?.filter(f => parseGPS(f.gps_coordinates)) || [];

  if (isLoading) {
    return (
      <div 
        className="bg-muted rounded-xl flex items-center justify-center animate-pulse"
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div 
        className="rounded-xl overflow-hidden border border-border shadow-sm"
        style={{ height }}
      >
        <MapContainer
          center={defaultCenter}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {facilitiesWithCoords.length > 0 && <FitBounds facilities={facilitiesWithCoords} />}
          
          {facilitiesWithCoords.map((facility) => {
            const coords = parseGPS(facility.gps_coordinates);
            if (!coords) return null;

            return (
              <Marker
                key={facility.id}
                position={coords}
                icon={createCustomIcon(facility.status)}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]" dir="rtl">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-foreground">{facility.name}</h3>
                    </div>
                    <div className="space-y-1 text-sm mb-3">
                      <p className="text-muted-foreground">
                        <span className="font-medium">القطاع:</span> {facility.sector}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">المنطقة:</span> {facility.region}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-medium text-muted-foreground">الحالة:</span>
                        <Badge className={getStatusBadge(facility.status)}>
                          {facility.status}
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/facility/${facility.id}`)}
                      className="w-full px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {showLegend && (
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium text-foreground">دليل الألوان:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-success border-2 border-white shadow" />
            <span className="text-muted-foreground">نشط</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-warning border-2 border-white shadow" />
            <span className="text-muted-foreground">قيد المراجعة</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-critical border-2 border-white shadow" />
            <span className="text-muted-foreground">غير نشط</span>
          </div>
          <span className="text-muted-foreground mr-auto">
            {facilitiesWithCoords.length} منشأة على الخريطة
          </span>
        </div>
      )}

      {facilitiesWithCoords.length === 0 && !isLoading && (
        <div className="text-center py-4 text-muted-foreground">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>لا توجد منشآت بإحداثيات GPS حتى الآن</p>
          <p className="text-sm">أضف إحداثيات GPS عند إضافة منشأة جديدة</p>
        </div>
      )}
    </div>
  );
};

export default FacilitiesMap;
