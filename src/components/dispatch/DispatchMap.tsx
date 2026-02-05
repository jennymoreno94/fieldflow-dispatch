 import { useEffect, useRef } from "react";
 import L from "leaflet";
 import { useDispatchStore } from "@/hooks/useDispatchStore";
 import { RotateCw, Crosshair, Car } from "lucide-react";
 import "leaflet/dist/leaflet.css";
 
 // Fix for default marker icons
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
 
 export function DispatchMap() {
   const services = useDispatchStore((state) => state.services);
   const technicians = useDispatchStore((state) => state.technicians);
   const selectedTechnicianId = useDispatchStore((state) => state.selectedTechnicianId);
   const setSelectedTechnicianId = useDispatchStore((state) => state.setSelectedTechnicianId);
   
   const mapContainerRef = useRef<HTMLDivElement>(null);
   const mapRef = useRef<L.Map | null>(null);
   const markersRef = useRef<L.Marker[]>([]);
   const polylinesRef = useRef<L.Polyline[]>([]);
 
   const assignedServices = services.filter(s => s.status === "assigned");
   const unassignedServices = services.filter(s => s.status === "unassigned");
 
   // Initialize map
   useEffect(() => {
     if (!mapContainerRef.current || mapRef.current) return;
 
     const map = L.map(mapContainerRef.current).setView([4.65, -74.07], 12);
     
     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
     }).addTo(map);
 
     mapRef.current = map;
 
     return () => {
       map.remove();
       mapRef.current = null;
     };
   }, []);
 
   // Update markers and polylines
   useEffect(() => {
     if (!mapRef.current) return;
 
     // Clear existing markers and polylines
     markersRef.current.forEach(marker => marker.remove());
     polylinesRef.current.forEach(polyline => polyline.remove());
     markersRef.current = [];
     polylinesRef.current = [];
 
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
 
     // Draw polylines
     technicianRoutes.forEach(({ technician, services: techServices, color }) => {
       if (techServices.length < 2) return;
       const positions = techServices.map(s => [s.lat, s.lng] as [number, number]);
       const polyline = L.polyline(positions, {
         color,
         weight: 3,
         opacity: selectedTechnicianId && selectedTechnicianId !== technician.id ? 0.3 : 0.8,
         dashArray: selectedTechnicianId === technician.id ? undefined : "5, 5",
       }).addTo(mapRef.current!);
       polylinesRef.current.push(polyline);
     });
 
     // Add assigned service markers
     technicianRoutes.forEach(({ technician, services: techServices, color }) => {
       techServices.forEach(service => {
         const marker = L.marker([service.lat, service.lng], {
           icon: createColoredMarker(color),
           opacity: selectedTechnicianId && selectedTechnicianId !== technician.id ? 0.4 : 1,
         }).addTo(mapRef.current!);
         
         marker.bindPopup(`
           <div style="font-size: 12px;">
             <p style="font-weight: 600; margin: 0;">${service.id}</p>
             <p style="margin: 2px 0;">${service.clientName}</p>
             <p style="color: #6b7280; margin: 2px 0;">${service.timeWindow}</p>
             <p style="margin-top: 4px; font-weight: 500; color: ${color};">${technician.name}</p>
           </div>
         `);
         
         marker.on("click", () => setSelectedTechnicianId(technician.id));
         markersRef.current.push(marker);
       });
     });
 
     // Add unassigned service markers
     unassignedServices.forEach(service => {
       const marker = L.marker([service.lat, service.lng], {
         icon: createColoredMarker("#EF4444", true),
       }).addTo(mapRef.current!);
       
       marker.bindPopup(`
         <div style="font-size: 12px;">
           <p style="font-weight: 600; color: #EF4444; margin: 0;">${service.id} (Sin Asignar)</p>
           <p style="margin: 2px 0;">${service.clientName}</p>
           <p style="color: #6b7280; margin: 2px 0;">${service.timeWindow}</p>
         </div>
       `);
       
       markersRef.current.push(marker);
     });
   }, [services, technicians, selectedTechnicianId, assignedServices, unassignedServices, setSelectedTechnicianId]);
 
   // Focus on selected technician
   useEffect(() => {
     if (!mapRef.current || !selectedTechnicianId) return;
 
     const techServices = services.filter(s => s.technicianId === selectedTechnicianId);
     if (techServices.length > 0) {
       const bounds = L.latLngBounds(techServices.map(s => [s.lat, s.lng]));
       mapRef.current.fitBounds(bounds, { padding: [50, 50] });
     }
   }, [selectedTechnicianId, services]);
 
   const handleCenterMap = () => {
     if (!mapRef.current) return;
     const allCoords = services.map(s => [s.lat, s.lng] as [number, number]);
     if (allCoords.length > 0) {
       const bounds = L.latLngBounds(allCoords);
       mapRef.current.fitBounds(bounds, { padding: [30, 30] });
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
         <div ref={mapContainerRef} className="w-full h-full" />
 
         {/* Legend */}
         <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg z-[1000]">
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