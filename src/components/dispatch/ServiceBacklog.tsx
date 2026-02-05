 import { useState } from "react";
 import { useDispatchStore } from "@/hooks/useDispatchStore";
 import { Service } from "@/types/dispatch";
 import { Search, Filter, CheckSquare, Square, Clock, MapPin, Wrench } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 function PriorityBadge({ priority }: { priority: string }) {
   const styles = {
     high: "priority-high",
     medium: "priority-medium",
     low: "priority-low",
   };
   const labels = { high: "Alta", medium: "Media", low: "Baja" };
   return (
     <span className={cn("priority-badge", styles[priority as keyof typeof styles])}>
       {labels[priority as keyof typeof labels]}
     </span>
   );
 }
 
 function ServiceCard({ service, isSelected, onSelect }: { 
   service: Service; 
   isSelected: boolean;
   onSelect: () => void;
 }) {
   return (
     <div 
       className={cn("service-card", isSelected && "service-card-selected")}
       onClick={onSelect}
     >
       <div className="flex items-start justify-between mb-1.5">
         <div className="flex items-center gap-2">
           {isSelected ? (
             <CheckSquare className="w-4 h-4 text-primary" />
           ) : (
             <Square className="w-4 h-4 text-muted-foreground" />
           )}
           <span className="font-semibold text-foreground">{service.id}</span>
         </div>
         <PriorityBadge priority={service.priority} />
       </div>
       
       <p className="text-xs font-medium text-foreground mb-1">{service.clientName}</p>
       
       <div className="space-y-1 text-muted-foreground">
         <div className="flex items-center gap-1.5">
           <Clock className="w-3 h-3" />
           <span>{service.timeWindow}</span>
           <span className="mx-1">•</span>
           <span>{service.estimatedDuration}min</span>
         </div>
         <div className="flex items-center gap-1.5">
           <MapPin className="w-3 h-3" />
           <span className="truncate">{service.zone}</span>
         </div>
         <div className="flex items-center gap-1.5">
           <Wrench className="w-3 h-3" />
           <span>{service.specialty}</span>
         </div>
       </div>
     </div>
   );
 }
 
 export function ServiceBacklog() {
   const services = useDispatchStore((state) => state.services);
   const selectedServiceIds = useDispatchStore((state) => state.selectedServiceIds);
   const toggleServiceSelection = useDispatchStore((state) => state.toggleServiceSelection);
   const priorityFilter = useDispatchStore((state) => state.priorityFilter);
   const setPriorityFilter = useDispatchStore((state) => state.setPriorityFilter);
   const searchQuery = useDispatchStore((state) => state.searchQuery);
   const setSearchQuery = useDispatchStore((state) => state.setSearchQuery);
 
   const unassignedServices = services.filter(s => s.status === "unassigned");
 
   const filteredServices = unassignedServices.filter(service => {
     const matchesPriority = !priorityFilter || service.priority === priorityFilter;
     const matchesSearch = !searchQuery || 
       service.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
       service.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       service.zone.toLowerCase().includes(searchQuery.toLowerCase());
     return matchesPriority && matchesSearch;
   });
 
   const priorities = [
     { value: null, label: "Todas" },
     { value: "high", label: "Alta" },
     { value: "medium", label: "Media" },
     { value: "low", label: "Baja" },
   ];
 
   return (
     <aside className="w-72 bg-card border-r border-border flex flex-col h-full">
       <div className="panel-header">
         <span className="flex items-center gap-2">
           <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
           No Asignados ({unassignedServices.length})
         </span>
       </div>
 
       <div className="p-2 space-y-2 border-b border-border">
         <div className="relative">
           <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <input
             type="text"
             placeholder="Buscar servicio..."
             className="w-full pl-8 pr-3 py-1.5 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
         </div>
 
         <div className="flex items-center gap-1">
           <Filter className="w-3.5 h-3.5 text-muted-foreground" />
           {priorities.map((p) => (
             <button
               key={p.label}
               onClick={() => setPriorityFilter(p.value)}
               className={cn(
                 "px-2 py-0.5 text-2xs rounded transition-colors",
                 priorityFilter === p.value 
                   ? "bg-primary text-primary-foreground" 
                   : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
               )}
             >
               {p.label}
             </button>
           ))}
         </div>
       </div>
 
       {selectedServiceIds.length > 0 && (
         <div className="p-2 bg-accent border-b border-border">
           <p className="text-xs text-accent-foreground">
             {selectedServiceIds.length} servicio(s) seleccionado(s)
           </p>
           <p className="text-2xs text-muted-foreground mt-0.5">
             Arrastra al timeline para asignar
           </p>
         </div>
       )}
 
       <div className="flex-1 overflow-y-auto p-2 space-y-2">
         {filteredServices.map((service) => (
           <ServiceCard
             key={service.id}
             service={service}
             isSelected={selectedServiceIds.includes(service.id)}
             onSelect={() => toggleServiceSelection(service.id)}
           />
         ))}
         {filteredServices.length === 0 && (
           <div className="text-center py-8 text-muted-foreground text-xs">
             No hay servicios pendientes
           </div>
         )}
       </div>
     </aside>
   );
 }