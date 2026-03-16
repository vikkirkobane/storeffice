"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { icon, LatLngBounds, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Building2 } from "lucide-react";

// Fix default marker icon in Leaflet with webpack
const DefaultIcon = icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface SpaceWithCoords {
  id: string;
  title: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  hourlyPrice?: number | null;
  dailyPrice?: number | null;
  monthlyPrice?: number | null;
  capacity: number;
}

interface MapViewProps {
  spaces: SpaceWithCoords[];
  onSelect?: (spaceId: string) => void;
}

function FitBounds({ spaces }: { spaces: SpaceWithCoords[] }) {
  const map = useMap();
  const boundsRef = useRef<LatLngBounds | null>(null);

  useEffect(() => {
    const validSpaces = spaces.filter(s => s.latitude != null && s.longitude != null);
    if (validSpaces.length === 0) return;

    const bounds = new LatLngBounds(
      validSpaces.map(s => [s.latitude!, s.longitude!] as [number, number])
    );
    boundsRef.current = bounds;
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [spaces, map]);

  return null;
}

export default function MapView({ spaces, onSelect }: MapViewProps) {
  const validSpaces = spaces.filter(s => s.latitude != null && s.longitude != null);
  const center: [number, number] = validSpaces.length > 0
    ? [validSpaces[0].latitude!, validSpaces[0].longitude!]
    : [-1.2921, 36.8219]; // Default Nairobi

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border">
      <MapContainer center={center} zoom={10} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds spaces={validSpaces} />
        {validSpaces.map((space) => (
          <Marker
            key={space.id}
            position={[space.latitude!, space.longitude!]}
            icon={DefaultIcon}
            eventHandlers={{
              click: () => onSelect?.(space.id),
            }}
          >
            <Popup>
              <div className="font-medium">{space.title}</div>
              <div className="text-sm text-muted-foreground">{space.address}, {space.city}</div>
              <div className="text-sm">
                Capacity: {space.capacity}
                {space.hourlyPrice && <>, ${Number(space.hourlyPrice).toFixed(2)}/hr</>}
                {space.dailyPrice && <>, ${Number(space.dailyPrice).toFixed(2)}/day</>}
                {space.monthlyPrice && <>, ${Number(space.monthlyPrice).toFixed(2)}/mo</>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
