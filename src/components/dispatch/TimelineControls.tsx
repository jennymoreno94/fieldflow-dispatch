 import { useDispatchStore } from "@/hooks/useDispatchStore";
 import { SERVICE_STATUS_COLORS } from "@/types/dispatch";
 import { ChevronLeft, ChevronRight, Calendar, Search, Trash2 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { format, addDays, subDays, addWeeks, subWeeks } from "date-fns";
 import { es } from "date-fns/locale";
 
 const zones = ["Norte", "Centro", "Chapinero", "Occidente", "Suba"];
 const specialties = ["Electricidad", "HVAC", "Plomería", "Gas", "Telecomunicaciones", "Refrigeración"];
 
 export function TimelineControls() {
   const technicians = useDispatchStore((state) => state.technicians);
   const timelineFilters = useDispatchStore((state) => state.timelineFilters);
   const setTimelineFilters = useDispatchStore((state) => state.setTimelineFilters);
   const clearTimelineFilters = useDispatchStore((state) => state.clearTimelineFilters);
 
   const handlePrevDate = () => {
     const newDate = timelineFilters.viewMode === "day" 
       ? subDays(timelineFilters.currentDate, 1)
       : subWeeks(timelineFilters.currentDate, 1);
     setTimelineFilters({ currentDate: newDate });
   };
 
   const handleNextDate = () => {
     const newDate = timelineFilters.viewMode === "day"
       ? addDays(timelineFilters.currentDate, 1)
       : addWeeks(timelineFilters.currentDate, 1);
     setTimelineFilters({ currentDate: newDate });
   };
 
   return (
     <div className="bg-card border-b border-border">
       {/* Filter Row */}
       <div className="flex items-center gap-3 p-3 border-b border-border">
         <select
           className="flex-1 h-9 px-3 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
           value={timelineFilters.zone || ""}
           onChange={(e) => setTimelineFilters({ zone: e.target.value || null })}
         >
           <option value="">Zonas</option>
           {zones.map((zone) => (
             <option key={zone} value={zone}>{zone}</option>
           ))}
         </select>
 
         <select
           className="flex-1 h-9 px-3 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
           value={timelineFilters.specialty || ""}
           onChange={(e) => setTimelineFilters({ specialty: e.target.value || null })}
         >
           <option value="">Especialidades</option>
           {specialties.map((spec) => (
             <option key={spec} value={spec}>{spec}</option>
           ))}
         </select>
 
         <select
           className="flex-1 h-9 px-3 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
           value={timelineFilters.responsible || ""}
           onChange={(e) => setTimelineFilters({ responsible: e.target.value || null })}
         >
           <option value="">Responsables</option>
           {technicians.map((tech) => (
             <option key={tech.id} value={tech.id}>{tech.name}</option>
           ))}
         </select>
 
         <button
           onClick={clearTimelineFilters}
           className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
         >
           <Trash2 className="w-4 h-4" />
           LIMPIAR
         </button>
 
         <button
           className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
         >
           <Search className="w-4 h-4" />
           BUSCAR
         </button>
       </div>
 
       {/* Date Navigation & Status Legend Row */}
       <div className="flex items-center justify-between px-3 py-2">
         <div className="flex items-center gap-3">
           {/* Date Navigation */}
           <div className="flex items-center gap-1">
             <button
               onClick={handlePrevDate}
               className="p-1.5 hover:bg-muted rounded transition-colors"
             >
               <ChevronLeft className="w-5 h-5 text-muted-foreground" />
             </button>
             <button
               onClick={handleNextDate}
               className="p-1.5 hover:bg-muted rounded transition-colors"
             >
               <ChevronRight className="w-5 h-5 text-muted-foreground" />
             </button>
           </div>
 
           {/* Date Picker */}
           <div className="flex items-center gap-2 border border-input rounded-md px-3 py-1.5 bg-background">
             <span className="text-sm">
               {format(timelineFilters.currentDate, "dd/MM/yyyy", { locale: es })}
             </span>
             <Calendar className="w-4 h-4 text-muted-foreground" />
           </div>
 
           {/* Service Number Search */}
           <div className="relative">
             <input
               type="text"
               placeholder="Número servicio"
               className="w-48 h-8 pl-3 pr-8 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
               value={timelineFilters.serviceNumber}
               onChange={(e) => setTimelineFilters({ serviceNumber: e.target.value })}
             />
             <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           </div>
 
           {/* Status Legend */}
           <div className="flex items-center gap-3 ml-4">
             {Object.entries(SERVICE_STATUS_COLORS).map(([key, { color, fill }]) => (
               <div
                 key={key}
                 className={cn(
                   "w-4 h-4 rounded-full border-2",
                   fill ? color : `border-current ${color.replace('bg-', 'text-')}`
                 )}
                 style={!fill ? { backgroundColor: 'transparent' } : undefined}
                 title={SERVICE_STATUS_COLORS[key as keyof typeof SERVICE_STATUS_COLORS].label}
               />
             ))}
           </div>
         </div>
 
         {/* View Mode Toggle */}
         <div className="flex items-center gap-1">
           <button
             onClick={() => setTimelineFilters({ viewMode: "day" })}
             className={cn(
               "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
               timelineFilters.viewMode === "day"
                 ? "bg-primary text-primary-foreground"
                 : "bg-muted text-muted-foreground hover:bg-muted/80"
             )}
           >
             DIA
           </button>
           <button
             onClick={() => setTimelineFilters({ viewMode: "week" })}
             className={cn(
               "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
               timelineFilters.viewMode === "week"
                 ? "bg-primary text-primary-foreground"
                 : "bg-muted text-muted-foreground hover:bg-muted/80"
             )}
           >
             SEMANA
           </button>
         </div>
       </div>
     </div>
   );
 }