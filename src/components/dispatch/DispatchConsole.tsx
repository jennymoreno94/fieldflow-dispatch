 import { KPIHeader } from "./KPIHeader";
 import { ServiceBacklog } from "./ServiceBacklog";
 import { DispatchMap } from "./DispatchMap";
 import { GanttTimeline } from "./GanttTimeline";
 
 export function DispatchConsole() {
   return (
     <div className="h-screen flex flex-col bg-background overflow-hidden">
       <KPIHeader />
       
       <div className="flex-1 flex overflow-hidden">
         {/* Left Sidebar - Service Backlog */}
         <ServiceBacklog />
         
         {/* Main Content Area */}
         <div className="flex-1 flex flex-col overflow-hidden">
           {/* Map Panel */}
           <DispatchMap />
           
           {/* Gantt Timeline */}
           <GanttTimeline />
         </div>
       </div>
     </div>
   );
 }