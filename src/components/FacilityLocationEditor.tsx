import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "./ui/button";
import { Crosshair, MapPin, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FacilityLocationEditorProps {
  coordinates: string | null;
  onCoordinatesChange: (coordinates: string) => void;
  facilityName?: string;
}

const FacilityLocationEditor = ({ coordinates, onCoordinatesChange, facilityName }: FacilityLocationEditorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Parse coordinates from string format "lat,lng" or "lat, lng"
  const parseCoordinates = (coords: string | null): [number, number] | null => {
    if (!coords) return null;
    
    const parts = coords.split(",").map(p => p.trim());
    if (parts.length !== 2) return null;
    
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    
    if (isNaN(lat) || isNaN(lng)) return null;
    
    return [lat, lng];
  };

  const position = parseCoordinates(coordinates);
  
  // Default to Nouadhibou, Mauritania if no coordinates
  const defaultPosition: [number, number] = [20.9340, -17.0320];

  const updateMarker = (map: L.Map, lat: number, lng: number) => {
    const icon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon, draggable: true })
        .addTo(map)
        .bindPopup(facilityName || "موقع المنشأة");

      // Handle marker drag
      markerRef.current.on("dragend", () => {
        const newPos = markerRef.current?.getLatLng();
        if (newPos) {
          const coordString = `${newPos.lat.toFixed(4)},${newPos.lng.toFixed(4)}`;
          onCoordinatesChange(coordString);
        }
      });
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }

    const initialPosition = position || defaultPosition;

    // Create new map
    const map = L.map(mapRef.current).setView(initialPosition, position ? 15 : 12);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add marker if we have coordinates
    if (position) {
      updateMarker(map, position[0], position[1]);
    }

    // Handle map click to set location
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      updateMarker(map, lat, lng);
      const coordString = `${lat.toFixed(4)},${lng.toFixed(4)}`;
      onCoordinatesChange(coordString);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position when coordinates change externally
  useEffect(() => {
    if (mapInstanceRef.current && position) {
      updateMarker(mapInstanceRef.current, position[0], position[1]);
      mapInstanceRef.current.setView(position, 15);
    }
  }, [coordinates]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "غير مدعوم",
        description: "متصفحك لا يدعم خدمة تحديد الموقع",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coordString = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
        onCoordinatesChange(coordString);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
          updateMarker(mapInstanceRef.current, latitude, longitude);
        }

        toast({
          title: "تم تحديد الموقع",
          description: "تم الحصول على موقعك الحالي بنجاح",
        });
        setIsGettingLocation(false);
      },
      (error) => {
        let message = "حدث خطأ أثناء تحديد الموقع";
        if (error.code === error.PERMISSION_DENIED) {
          message = "يرجى السماح بالوصول للموقع";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "الموقع غير متاح حالياً";
        } else if (error.code === error.TIMEOUT) {
          message = "انتهت مهلة تحديد الموقع";
        }

        toast({
          title: "فشل تحديد الموقع",
          description: message,
          variant: "destructive",
        });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="gap-2"
        >
          {isGettingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Crosshair className="w-4 h-4" />
          )}
          موقعي الحالي
        </Button>
        <span className="text-xs text-muted-foreground">
          أو انقر على الخريطة لتحديد الموقع
        </span>
      </div>
      
      <div 
        ref={mapRef} 
        className="aspect-video rounded-lg overflow-hidden border border-border cursor-crosshair"
        style={{ minHeight: "300px" }}
      />
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="w-4 h-4" />
        <span>
          {position 
            ? `الإحداثيات: ${position[0].toFixed(4)}, ${position[1].toFixed(4)}`
            : "لم يتم تحديد الموقع بعد"
          }
        </span>
      </div>
      
      <p className="text-xs text-muted-foreground">
        💡 يمكنك سحب العلامة لضبط الموقع بدقة
      </p>
    </div>
  );
};

export default FacilityLocationEditor;