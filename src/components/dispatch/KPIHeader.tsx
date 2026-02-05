 import { useDispatchStore } from "@/hooks/useDispatchStore";
 import { ClipboardList, CheckCircle, Clock, MapPin } from "lucide-react";
 
 export function KPIHeader() {
   const kpis = useDispatchStore((state) => state.kpis);
   const validationError = useDispatchStore((state) => state.validationError);
 
   return (
     <header className="bg-card border-b border-border px-4 py-3">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
             <ClipboardList className="w-5 h-5 text-primary-foreground" />
           </div>
           <div>
             <h1 className="text-base font-semibold text-foreground">Consola de Despacho</h1>
             <p className="text-xs text-muted-foreground">Optimización de rutas en tiempo real</p>
           </div>
         </div>
 
         {validationError && (
           <div className="animate-pulse-error bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-lg text-sm font-medium">
             ⚠️ {validationError}
           </div>
         )}
 
         <div className="flex items-center gap-6">
           <div className="kpi-card">
             <div className="flex items-center gap-2 text-muted-foreground">
               <ClipboardList className="w-4 h-4" />
               <span className="text-2xs uppercase font-medium">Total Servicios</span>
             </div>
             <span className="text-xl font-bold text-foreground">{kpis.totalServices}</span>
           </div>
 
           <div className="kpi-card">
             <div className="flex items-center gap-2 text-muted-foreground">
               <CheckCircle className="w-4 h-4" />
               <span className="text-2xs uppercase font-medium">Asignados</span>
             </div>
             <span className="text-xl font-bold text-primary">{kpis.assignedServices}</span>
           </div>
 
           <div className="kpi-card">
             <div className="flex items-center gap-2 text-muted-foreground">
               <Clock className="w-4 h-4" />
               <span className="text-2xs uppercase font-medium">% Ventanas</span>
             </div>
             <span className="text-xl font-bold text-foreground">{kpis.windowCompliance}%</span>
           </div>
 
           <div className="kpi-card">
             <div className="flex items-center gap-2 text-muted-foreground">
               <MapPin className="w-4 h-4" />
               <span className="text-2xs uppercase font-medium">Km Totales</span>
             </div>
             <span className="text-xl font-bold text-foreground">{kpis.totalKm}</span>
           </div>
         </div>
       </div>
     </header>
   );
 }