import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useFacilities, type Facility, type FacilityStatus } from "@/hooks/useFacilities";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

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
  selectedDistrict?: string;
  selectedSector?: string;
}

// District polygon coordinates for the 3 main districts (approximate boundaries)
const districtPolygons: Record<string, { coords: [number, number][]; color: string; nameAr: string; nameFr: string }> = {
  "tevragh-zeina": {
    coords: [
      [18.09, -16.015],
      [18.09, -15.98],
      [18.13, -15.98],
      [18.13, -16.015],
      [18.09, -16.015]
    ],
    color: "#3B82F6", // Blue
    nameAr: "تفرغ زينة",
    nameFr: "Tevragh Zeina"
  },
  "sebkha": {
    coords: [
      [18.055, -16.02],
      [18.055, -15.975],
      [18.095, -15.975],
      [18.095, -16.02],
      [18.055, -16.02]
    ],
    color: "#10B981", // Green
    nameAr: "السبخة",
    nameFr: "Sebkha"
  },
  "ksar": {
    coords: [
      [18.085, -15.975],
      [18.085, -15.935],
      [18.125, -15.935],
      [18.125, -15.975],
      [18.085, -15.975]
    ],
    color: "#F59E0B", // Orange
    nameAr: "لكصر",
    nameFr: "Ksar"
  }
};

// District bounds for filtering - all moughataa of Nouakchott
const districtBounds: Record<string, { center: [number, number]; bounds: L.LatLngBoundsExpression }> = {
  "tevragh-zeina": {
    center: [18.110344, -15.9993672],
    bounds: [[18.09, -16.015], [18.13, -15.98]]
  },
  "sebkha": {
    center: [18.0748218, -15.9983611],
    bounds: [[18.055, -16.02], [18.095, -15.975]]
  },
  "ksar": {
    center: [18.1054371, -15.9552997],
    bounds: [[18.085, -15.975], [18.125, -15.935]]
  },
  "el-mina": {
    center: [18.05, -15.995],
    bounds: [[18.03, -16.02], [18.07, -15.97]]
  },
  "arafat": {
    center: [18.025, -15.97],
    bounds: [[18.00, -16.00], [18.05, -15.94]]
  },
  "dar-naim": {
    center: [18.125, -15.925],
    bounds: [[18.10, -15.95], [18.15, -15.90]]
  },
  "toujounine": {
    center: [18.075, -15.915],
    bounds: [[18.05, -15.95], [18.10, -15.88]]
  },
  "riyadh": {
    center: [18.045, -15.95],
    bounds: [[18.02, -15.98], [18.07, -15.92]]
  },
  "teyarett": {
    center: [18.10, -15.975],
    bounds: [[18.08, -16.00], [18.12, -15.95]]
  }
};

const FacilitiesMap = ({ height = "400px", showLegend = true, selectedDistrict = "all", selectedSector = "all" }: FacilitiesMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { data: facilities, isLoading } = useFacilities();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // Center of the 3 districts (Tevragh Zeina, Sebkha, Ksar)
  const defaultCenter: [number, number] = [18.0967, -15.9843];
  
  // Bounds for the 3 districts only
  const mapBounds: L.LatLngBoundsExpression = [
    [18.05, -16.02],  // Southwest corner (south of Sebkha)
    [18.14, -15.93]   // Northeast corner (east of Ksar)
  ];

  // Dynamic status labels
  const statusLabels: Record<FacilityStatus, string> = {
    "نشط": t("Actif", "نشط"),
    "غير نشط": t("Inactif", "غير نشط"),
    "قيد الإنشاء": t("En construction", "قيد الإنشاء"),
    "معلق": t("Suspendu", "معلق"),
  };

  // Dynamic sector labels
  const sectorLabels: Record<string, string> = {
    "صحية": t("Santé", "صحية"),
    "تعليمية": t("Éducation", "تعليمية"),
    "صناعية": t("Industrie", "صناعية"),
    "زراعية": t("Agriculture", "زراعية"),
    "رياضية": t("Sport", "رياضية"),
    "ثقافية": t("Culture", "ثقافية"),
    "اجتماعية": t("Social", "اجتماعية"),
    "دينية": t("Religieux", "دينية"),
    "نقل": t("Transport", "نقل"),
    "تجارة": t("Commerce", "تجارة"),
    "سياحة": t("Tourisme", "سياحة"),
    "إدارية": t("Administratif", "إدارية"),
    "قضائية": t("Judiciaire", "قضائية"),
    "سياسية": t("Politique", "سياسية"),
    "مالية": t("Finance", "مالية"),
    "كهربائية": t("Électricité", "كهربائية"),
    "مائية": t("Eau", "مائية"),
    "تكنولوجية": t("Technologie", "تكنولوجية"),
    "بيئية": t("Environnement", "بيئية"),
  };

  const getStatusLabel = (status: FacilityStatus) => {
    const config: Record<FacilityStatus, string> = {
      "نشط": "bg-success text-success-foreground",
      "غير نشط": "bg-critical text-critical-foreground",
      "قيد الإنشاء": "bg-warning text-warning-foreground",
      "معلق": "bg-warning text-warning-foreground",
    };
    return config[status];
  };

  // Filter facilities based on selected district and sector
  const facilitiesWithCoords = facilities?.filter(f => {
    const coords = parseGPS(f.gps_coordinates);
    if (!coords) return false;
    
    // Filter by sector
    if (selectedSector !== "all" && f.sector !== selectedSector) return false;
    
    // Filter by district
    if (selectedDistrict === "all") return true;
    
    const districtInfo = districtBounds[selectedDistrict];
    if (!districtInfo) return true;
    
    const [lat, lng] = coords;
    const [[minLat, minLng], [maxLat, maxLng]] = districtInfo.bounds as [[number, number], [number, number]];
    
    return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
  }) || [];

  useEffect(() => {
    if (!mapRef.current || isLoading) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Determine bounds based on selected district
    const activeBounds = selectedDistrict !== "all" && districtBounds[selectedDistrict] 
      ? districtBounds[selectedDistrict].bounds 
      : mapBounds;
    
    const activeCenter = selectedDistrict !== "all" && districtBounds[selectedDistrict]
      ? districtBounds[selectedDistrict].center
      : defaultCenter;

    // Create new map with bounds restriction
    const map = L.map(mapRef.current, {
      maxBounds: mapBounds,
      maxBoundsViscosity: 1.0,
      minZoom: 13,
      maxZoom: 18,
    }).setView(activeCenter, selectedDistrict !== "all" ? 15 : 14);
    mapInstanceRef.current = map;

    // Set initial bounds
    map.fitBounds(activeBounds);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add district boundaries polygons
    Object.entries(districtPolygons).forEach(([districtId, district]) => {
      const polygon = L.polygon(district.coords, {
        color: district.color,
        weight: 3,
        opacity: 0.8,
        fillColor: district.color,
        fillOpacity: 0.15,
        dashArray: selectedDistrict === districtId ? undefined : "5, 10",
      }).addTo(map);

      // Add district label
      const center = polygon.getBounds().getCenter();
      const label = L.divIcon({
        className: "district-label",
        html: `
          <div style="
            background-color: ${district.color};
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            ${language === "ar" ? district.nameAr : district.nameFr}
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [40, 10],
      });
      L.marker(center, { icon: label, interactive: false }).addTo(map);

      // Highlight on hover
      polygon.on("mouseover", () => {
        polygon.setStyle({ fillOpacity: 0.3, weight: 4 });
      });
      polygon.on("mouseout", () => {
        polygon.setStyle({ 
          fillOpacity: 0.15, 
          weight: 3,
          dashArray: selectedDistrict === districtId ? undefined : "5, 10"
        });
      });
    });

    // Add markers for each facility
    const markers: L.Marker[] = [];

    facilitiesWithCoords.forEach((facility) => {
      const coords = parseGPS(facility.gps_coordinates);
      if (!coords) return;

      const marker = L.marker(coords, { icon: createCustomIcon(facility.status) })
        .addTo(map);

      const popupDirection = language === "ar" ? "rtl" : "ltr";
      const popupTextAlign = language === "ar" ? "right" : "left";
      
      const popupContent = `
        <div style="padding: 8px; min-width: 200px; direction: ${popupDirection}; text-align: ${popupTextAlign};">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <h3 style="font-weight: bold; margin: 0;">${facility.name}</h3>
          </div>
          <div style="font-size: 14px; margin-bottom: 12px;">
            <p style="margin: 4px 0; color: #666;"><span style="font-weight: 500;">${language === "fr" ? "Secteur:" : "القطاع:"}</span> ${sectorLabels[facility.sector] || facility.sector}</p>
            <p style="margin: 4px 0; color: #666;"><span style="font-weight: 500;">${language === "fr" ? "Région:" : "المنطقة:"}</span> ${facility.region}</p>
            <p style="margin: 4px 0; color: #666;"><span style="font-weight: 500;">${language === "fr" ? "Statut:" : "الحالة:"}</span> ${statusLabels[facility.status] || facility.status}</p>
          </div>
          <button 
            onclick="window.location.href='/facility/${facility.id}'"
            style="width: 100%; padding: 8px 12px; background: #00A95C; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;"
          >
            ${language === "fr" ? "Voir les détails" : "عرض التفاصيل"}
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
  }, [facilities, isLoading, language, statusLabels, sectorLabels, selectedDistrict, selectedSector]);

  if (isLoading) {
    return (
      <div 
        className="bg-muted rounded-xl flex items-center justify-center animate-pulse"
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">{t("Chargement de la carte...", "جاري تحميل الخريطة...")}</p>
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
        <div className="space-y-3">
          {/* Status Legend */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium text-foreground">{t("Statuts:", "الحالات:")}</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-success border-2 border-white shadow" />
              <span className="text-muted-foreground">{t("Actif", "نشط")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-warning border-2 border-white shadow" />
              <span className="text-muted-foreground">{t("En révision", "قيد المراجعة")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-critical border-2 border-white shadow" />
              <span className="text-muted-foreground">{t("Inactif", "غير نشط")}</span>
            </div>
            <span className="text-muted-foreground ms-auto">
              {facilitiesWithCoords.length} {t("établissement(s) sur la carte", "منشأة على الخريطة")}
            </span>
          </div>
          
          {/* Districts Legend */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium text-foreground">{t("Moughataa:", "المقاطعات:")}</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2" style={{ borderColor: "#3B82F6", backgroundColor: "rgba(59, 130, 246, 0.2)" }} />
              <span className="text-muted-foreground">{t("Tevragh Zeina", "تفرغ زينة")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2" style={{ borderColor: "#10B981", backgroundColor: "rgba(16, 185, 129, 0.2)" }} />
              <span className="text-muted-foreground">{t("Sebkha", "السبخة")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2" style={{ borderColor: "#F59E0B", backgroundColor: "rgba(245, 158, 11, 0.2)" }} />
              <span className="text-muted-foreground">{t("Ksar", "لكصر")}</span>
            </div>
          </div>
        </div>
      )}

      {facilitiesWithCoords.length === 0 && !isLoading && (
        <div className="text-center py-4 text-muted-foreground">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>{t("Aucun établissement avec coordonnées GPS", "لا توجد منشآت بإحداثيات GPS")}</p>
          <p className="text-sm">{t("Ajoutez des coordonnées GPS lors de la création", "أضف إحداثيات GPS عند الإنشاء")}</p>
        </div>
      )}
    </div>
  );
};

export default FacilitiesMap;