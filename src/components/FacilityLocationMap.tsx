import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

interface FacilityLocationMapProps {
  coordinates: string | null;
  facilityName: string;
  address: string;
}

const FacilityLocationMap = ({ coordinates, facilityName, address }: FacilityLocationMapProps) => {
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

  const customIcon = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  if (!position) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-muted-foreground/10 flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-muted-foreground">لا توجد إحداثيات GPS</p>
        </div>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${position[0]},${position[1]}`;

  return (
    <div className="space-y-3">
      <div className="aspect-video rounded-lg overflow-hidden border border-border">
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={customIcon}>
            <Popup>
              <div className="text-center">
                <strong>{facilityName}</strong>
                <br />
                <span className="text-sm">{address}</span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <a 
        href={googleMapsUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        فتح في خرائط Google
      </a>
    </div>
  );
};

export default FacilityLocationMap;