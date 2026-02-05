 import { useEffect, useRef } from "react";
 import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
 import L from "leaflet";
 import { useDispatchStore } from "@/hooks/useDispatchStore";
 import { RotateCw, Crosshair, Car } from "lucide-react";
 import "leaflet/dist/leaflet.css";
 
 // Fix for default marker icons in React-Leaflet
 delete (L.Icon.Default.prototype as any)._getIconUrl;
 L.Icon.Default.mergeOptions({
   iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
   iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
   shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
 });
 
 const techColors: Record<string, string> = {
   "tech-1": "#00897B",
   "tech-2": "#7C3AED",
   "tech-3": "#EA580C",
   "tech-4": "#0EA5E9",
   "tech-5": "#DB2777",
   "tech-6": "#EAB308",
 };
 
 function createColoredMarker(color: string, isUnassigned = false) {
   const svg = isUnassigned
     ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" width="28" height="28"><circle cx="12" cy="12" r="8"/></svg>`
     : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
   
   return L.divIcon({
     html: svg,
     className: "custom-marker",
     iconSize: [isUnassigned ? 28 : 32, isUnassigned ? 28 : 32],
     iconAnchor: [isUnassigned ? 14 : 16, isUnassigned ? 14 : 32],
     popupAnchor: [0, isUnassigned ? -14 : -32],
   });
 }
 
 function MapController({ selectedTechnicianId }: { selectedTechnicianId: string | null }) {
   const map = useMap();
   const services = useDispatchStore((state) => state.services);
 
   useEffect(() => {
     if (selectedTechnicianId) {
       const techServices = services.filter(s => s.technicianId === selectedTechnicianId);
       if (techServices.length > 0) {
         const bounds = L.latLngBounds(techServices.map(s => [s.lat, s.lng]));
         map.fitBounds(bounds, { padding: [50, 50] });
       }
     }
   }, [selectedTechnicianId, services, map]);
 
   return null;
 }
 
 export function DispatchMap() {
   const services = useDispatchStore((state) => state.services);
   const technicians = useDispatchStore((state) => state.technicians);
   const selectedTechnicianId = useDispatchStore((state) => state.selectedTechnicianId);
   const setSelectedTechnicianId = useDispatchStore((state) => state.setSelectedTechnicianId);
   const mapRef = useRef<L.Map | null>(null);
 
   const assignedServices = services.filter(s => s.status === "assigned");
   const unassignedServices = services.filter(s => s.status === "unassigned");
 
   // Group services by technician for route lines
   const technicianRoutes = technicians.map(tech => {
     const techServices = assignedServices
       .filter(s => s.technicianId === tech.id)
       .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
     return {
       technician: tech,
       services: techServices,
       color: techColors[tech.color] || "#666",
     };
   });
 
   const handleCenterMap = () => {
     if (mapRef.current) {
       const allCoords = services.map(s => [s.lat, s.lng] as [number, number]);
       if (allCoords.length > 0) {
         const bounds = L.latLngBounds(allCoords);
         mapRef.current.fitBounds(bounds, { padding: [30, 30] });
       }
     }
   };
 
   return (
     <div className="flex-1 flex flex-col relative">
       <div className="panel-header">
         <span>Visualización Espacial</span>
         <div className="flex items-center gap-2">
           <button className="action-btn action-btn-primary">
             <RotateCw className="w-3.5 h-3.5" />
             Recalcular Rutas
           </button>
           <button className="action-btn action-btn-secondary" onClick={handleCenterMap}>
             <Crosshair className="w-3.5 h-3.5" />
             Centrar
           </button>
           <button className="action-btn action-btn-secondary">
             <Car className="w-3.5 h-3.5" />
             Ver Tráfico
           </button>
         </div>
       </div>
 
       <div className="flex-1 relative">
         <MapContainer
           center={[4.65, -74.07]}
           zoom={12}
           className="w-full h-full"
           ref={mapRef}
         >
           <TileLayer
             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
           />
           
           <MapController selectedTechnicianId={selectedTechnicianId} />
 
           {/* Route polylines */}
           {technicianRoutes.map(({ technician, services, color }) => {
             if (services.length < 2) return null;
             const positions = services.map(s => [s.lat, s.lng] as [number, number]);
             return (
               <Polyline
                 key={technician.id}
                 positions={positions}
                 color={color}
                 weight={3}
                 opacity={selectedTechnicianId && selectedTechnicianId !== technician.id ? 0.3 : 0.8}
                 dashArray={selectedTechnicianId === technician.id ? undefined : "5, 5"}
               />
             );
           })}
 
           {/* Assigned service markers */}
           {technicianRoutes.map(({ technician, services, color }) => 
             services.map((service) => (
               <Marker
                 key={service.id}
                 position={[service.lat, service.lng]}
                 icon={createColoredMarker(color)}
                 opacity={selectedTechnicianId && selectedTechnicianId !== technician.id ? 0.4 : 1}
                 eventHandlers={{
                   click: () => setSelectedTechnicianId(technician.id),
                 }}
               >
                 <Popup>
                   <div className="text-xs">
                     <p className="font-semibold">{service.id}</p>
                     <p>{service.clientName}</p>
                     <p className="text-muted-foreground">{service.timeWindow}</p>
                     <p className="mt-1 font-medium" style={{ color }}>
                       {technician.name}
                     </p>
                   </div>
                 </Popup>
               </Marker>
             ))
           )}
 
           {/* Unassigned service markers */}
           {unassignedServices.map((service) => (
             <Marker
               key={service.id}
               position={[service.lat, service.lng]}
               icon={createColoredMarker("#EF4444", true)}
             >
               <Popup>
                 <div className="text-xs">
                   <p className="font-semibold text-destructive">{service.id} (Sin Asignar)</p>
                   <p>{service.clientName}</p>
                   <p className="text-muted-foreground">{service.timeWindow}</p>
                 </div>
               </Popup>
             </Marker>
           ))}
         </MapContainer>
 
         {/* Legend */}
         <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
           <p className="text-2xs font-semibold text-muted-foreground mb-2">TÉCNICOS</p>
           <div className="space-y-1.5">
             {technicians.map((tech) => (
               <button
                 key={tech.id}
                 onClick={() => setSelectedTechnicianId(selectedTechnicianId === tech.id ? null : tech.id)}
                 className={`flex items-center gap-2 text-xs w-full px-2 py-1 rounded transition-colors ${
                   selectedTechnicianId === tech.id ? "bg-accent" : "hover:bg-muted"
                 }`}
               >
                 <div
                   className="w-3 h-3 rounded-full"
                   style={{ backgroundColor: techColors[tech.color] }}
                 />
                 <span className="truncate">{tech.name}</span>
               </button>
             ))}
             <div className="flex items-center gap-2 text-xs px-2 py-1">
               <div className="w-3 h-3 rounded-full bg-destructive" />
               <span>Sin Asignar</span>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 }