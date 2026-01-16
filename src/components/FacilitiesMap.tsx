import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useFacilities, type Facility, type FacilityStatus } from "@/hooks/useFacilities";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Parse GPS coordinates from string
const parseGPS = (gps: string | null): [number, number] | null => {
  if (!gps) return null;
  
  const parts = gps.split(",").map(s => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return [parts[0], parts[1]];
  }
  return null;
};

// Custom marker icons based on status
const createCustomIcon = (status: FacilityStatus) => {
  const colors: Record<FacilityStatus, string> = {
    "نشط": "#00A95C",
    "غير نشط": "#D01C1F",
    "قيد الإنشاء": "#FFD700",
    "معلق": "#FFD700",
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

interface FacilitiesMapProps {
  height?: string;
  showLegend?: boolean;
}

const FacilitiesMap = ({ height = "400px", showLegend = true }: FacilitiesMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { data: facilities, isLoading } = useFacilities();
  const navigate = useNavigate();

  // Default center (Nouadhibou, Mauritania)
  const defaultCenter: [number, number] = [20.9340, -17.0320];

  const getStatusLabel = (status: FacilityStatus) => {
    const config: Record<FacilityStatus, string> = {
      "نشط": "bg-success text-success-foreground",
      "غير نشط": "bg-critical text-critical-foreground",
      "قيد الإنشاء": "bg-warning text-warning-foreground",
      "معلق": "bg-warning text-warning-foreground",
    };
    return config[status];
  };

  const facilitiesWithCoords = facilities?.filter(f => parseGPS(f.gps_coordinates)) || [];

  useEffect(() => {
    if (!mapRef.current || isLoading) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Create new map
    const map = L.map(mapRef.current).setView(defaultCenter, 12);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add markers for each facility
    const markers: L.Marker[] = [];

    facilitiesWithCoords.forEach((facility) => {
      const coords = parseGPS(facility.gps_coordinates);
      if (!coords) return;

      const marker = L.marker(coords, { icon: createCustomIcon(facility.status) })
        .addTo(map);

      const popupContent = `
        <div style="padding: 8px; min-width: 200px; direction: rtl; text-align: right;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <h3 style="font-weight: bold; margin: 0;">${facility.name}</h3>
          </div>
          <div style="font-size: 14px; margin-bottom: 12px;">
            <p style="margin: 4px 0; color: #666;"><span style="font-weight: 500;">القطاع:</span> ${facility.sector}</p>
            <p style="margin: 4px 0; color: #666;"><span style="font-weight: 500;">المنطقة:</span> ${facility.region}</p>
            <p style="margin: 4px 0; color: #666;"><span style="font-weight: 500;">الحالة:</span> ${facility.status}</p>
          </div>
          <button 
            onclick="window.location.href='/facility/${facility.id}'"
            style="width: 100%; padding: 8px 12px; background: #00A95C; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;"
          >
            عرض التفاصيل
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      markers.push(marker);
    });

    // Fit bounds to show all markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [facilities, isLoading]);

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
        ref={mapRef}
        className="rounded-xl overflow-hidden border border-border shadow-sm"
        style={{ height }}
      />

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