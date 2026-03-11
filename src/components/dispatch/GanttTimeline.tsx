import { useRef, useEffect, useMemo } from "react";
import { useDispatchStore } from "@/hooks/useDispatchStore";
import { Service, Technician } from "@/types/dispatch";
import { WORK_START_HOUR, WORK_END_HOUR, TIME_SLOT_MINUTES } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Car, Percent } from "lucide-react";
import { TimelineControls } from "./TimelineControls";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
 
 const techColors: Record<string, string> = {
   "tech-1": "bg-tech-1",
   "tech-2": "bg-tech-2",
   "tech-3": "bg-tech-3",
   "tech-4": "bg-tech-4",
   "tech-5": "bg-tech-5",
   "tech-6": "bg-tech-6",
 };
 
 const techBgColors: Record<string, string> = {
   "tech-1": "#00897B",
   "tech-2": "#7C3AED",
   "tech-3": "#EA580C",
   "tech-4": "#0EA5E9",
   "tech-5": "#DB2777",
   "tech-6": "#EAB308",
 };
 
 function timeToMinutes(time: string): number {
   const [hours, minutes] = time.split(":").map(Number);
   return hours * 60 + minutes;
 }
 
 function minutesToPosition(minutes: number): number {
   const startMinutes = WORK_START_HOUR * 60;
   const totalMinutes = (WORK_END_HOUR - WORK_START_HOUR) * 60;
   return ((minutes - startMinutes) / totalMinutes) * 100;
 }
 
 function durationToWidth(duration: number): number {
   const totalMinutes = (WORK_END_HOUR - WORK_START_HOUR) * 60;
   return (duration / totalMinutes) * 100;
 }
 
function generateTimeSlots() {
  const slots: string[] = [];
  for (let h = WORK_START_HOUR; h < WORK_END_HOUR; h++) {
    for (let m = 0; m < 60; m += TIME_SLOT_MINUTES) {
      slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }
  return slots;
}

function DayTimeHeader() {
  const slots = useMemo(() => generateTimeSlots(), []);
  const totalSlots = slots.length;

  return (
    <div className="flex border-b border-border bg-muted sticky top-0 z-10">
      <div className="w-56 flex-shrink-0 border-r border-border" />
      <div className="flex-1 relative h-8 overflow-x-auto" style={{ minWidth: `${totalSlots * 40}px` }}>
        {slots.map((slot, idx) => {
          const isHour = slot.endsWith(":00");
          return (
            <div
              key={slot}
              className="absolute top-0 h-full flex items-center"
              style={{ left: `${(idx / totalSlots) * 100}%` }}
            >
              <span className={cn(
                "text-2xs font-medium px-0.5 border-l h-full flex items-center whitespace-nowrap",
                isHour ? "text-foreground border-border" : "text-muted-foreground border-timeline-grid"
              )}>
                {slot}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekTimeHeader({ weekDays, currentDate }: { weekDays: Date[]; currentDate: Date }) {
  const today = new Date();
  const slots = useMemo(() => generateTimeSlots(), []);
  const totalSlots = slots.length;

  return (
    <div className="flex border-b border-border bg-muted sticky top-0 z-10">
      <div className="w-56 flex-shrink-0 border-r border-border" />
      <div className="flex-1 overflow-x-auto" style={{ minWidth: `${weekDays.length * totalSlots * 40}px` }}>
        {/* Day labels row */}
        <div className="flex h-6">
          {weekDays.map((day) => {
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, currentDate);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex items-center justify-center text-xs font-medium border-l border-border",
                  isToday && "bg-primary/15 text-primary font-bold",
                  isSelected && !isToday && "bg-accent"
                )}
                style={{ width: `${(1 / weekDays.length) * 100}%` }}
              >
                <span className="capitalize">{format(day, "EEE", { locale: es })}</span>
                <span className={cn("ml-1", isToday && "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-2xs")}>
                  {format(day, "dd")}
                </span>
              </div>
            );
          })}
        </div>
        {/* Time slots row per day */}
        <div className="flex h-5 border-t border-border">
          {weekDays.map((day) => (
            <div key={`slots-${day.toISOString()}`} className="relative border-l border-border" style={{ width: `${(1 / weekDays.length) * 100}%` }}>
              {slots.map((slot, idx) => {
                const isHour = slot.endsWith(":00");
                return (
                  <div
                    key={`${day.toISOString()}-${slot}`}
                    className="absolute top-0 h-full flex items-center"
                    style={{ left: `${(idx / totalSlots) * 100}%` }}
                  >
                    <span className={cn(
                      "text-2xs px-0.5 border-l h-full flex items-center whitespace-nowrap",
                      isHour ? "text-foreground border-border font-medium" : "text-muted-foreground border-timeline-grid"
                    )}>
                      {slot}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
 
 function TechnicianInfo({ technician, isSelected, onClick }: { 
   technician: Technician; 
   isSelected: boolean;
   onClick: () => void;
 }) {
   return (
     <div 
       className={cn(
         "w-56 flex-shrink-0 border-r border-border p-2 flex items-center gap-2 cursor-pointer transition-colors",
         isSelected && "bg-accent"
       )}
       onClick={onClick}
     >
       <img 
         src={technician.photo} 
         alt={technician.name}
         className="w-8 h-8 rounded-full border-2"
         style={{ borderColor: techBgColors[technician.color] }}
       />
       <div className="flex-1 min-w-0">
         <p className="text-xs font-semibold text-foreground truncate">{technician.name}</p>
         <div className="flex items-center gap-1 text-2xs text-muted-foreground">
           <Car className="w-3 h-3" />
           <span className="truncate">{technician.vehicle.split(" - ")[0]}</span>
         </div>
       </div>
       <div className="flex items-center gap-1">
         <Percent className="w-3 h-3 text-muted-foreground" />
         <span className={cn(
           "text-xs font-bold",
           technician.saturation > 80 ? "text-destructive" : 
           technician.saturation > 60 ? "text-yellow-600" : "text-primary"
         )}>
           {technician.saturation}%
         </span>
       </div>
     </div>
   );
 }
 
 function ServiceBlock({ service, technician }: { service: Service; technician: Technician }) {
   const validationError = useDispatchStore((state) => state.validationError);
   const hasError = validationError?.includes(service.id);
   
   if (!service.startTime) return null;
   
   const startMinutes = timeToMinutes(service.startTime);
   const left = minutesToPosition(startMinutes);
   const width = durationToWidth(service.estimatedDuration);
 
   return (
     <div
       className={cn(
         "service-block text-white",
         hasError && "animate-pulse-error"
       )}
       style={{
         left: `${left}%`,
         width: `${width}%`,
         backgroundColor: techBgColors[technician.color],
         top: "4px",
         bottom: "4px",
       }}
       title={`${service.id} - ${service.clientName}\n${service.timeWindow}\n${service.specialty}`}
     >
       <div className="truncate leading-tight">
         <span className="font-bold">{service.id}</span>
       </div>
       <div className="truncate leading-tight opacity-90">
         {service.clientName}
       </div>
     </div>
   );
 }
 
 function TravelBlock({ fromTime, toTime, color }: { fromTime: string; toTime: string; color: string }) {
   const fromMinutes = timeToMinutes(fromTime);
   const toMinutes = timeToMinutes(toTime);
   const duration = toMinutes - fromMinutes;
   
   if (duration <= 0) return null;
   
   const left = minutesToPosition(fromMinutes);
   const width = durationToWidth(duration);
 
   return (
     <div
       className="travel-block"
       style={{
         left: `${left}%`,
         width: `${width}%`,
       }}
       title={`Tiempo de viaje: ${duration} min`}
     />
   );
 }
 
function TechnicianRow({ technician, viewMode, weekDays }: { technician: Technician; viewMode: "day" | "week"; weekDays?: Date[] }) {
  const services = useDispatchStore((state) => state.services);
  const selectedTechnicianId = useDispatchStore((state) => state.selectedTechnicianId);
  const setSelectedTechnicianId = useDispatchStore((state) => state.setSelectedTechnicianId);
  const rowRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  
  const techServices = services
    .filter(s => s.technicianId === technician.id && s.status === "assigned")
    .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  const isSelected = selectedTechnicianId === technician.id;

  useEffect(() => {
    if (isSelected && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isSelected]);

  // Generate travel blocks between services
  const travelBlocks = techServices.slice(0, -1).map((service, idx) => {
    const nextService = techServices[idx + 1];
    if (!service.startTime || !nextService.startTime) return null;
    
    const endMinutes = timeToMinutes(service.startTime) + service.estimatedDuration;
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;
    
    return { fromTime: endTime, toTime: nextService.startTime, key: `${service.id}-${nextService.id}` };
  }).filter(Boolean);

  return (
    <div 
      ref={rowRef}
      className={cn("gantt-row", isSelected && "ring-2 ring-inset ring-primary")}
    >
      <TechnicianInfo 
        technician={technician} 
        isSelected={isSelected}
        onClick={() => setSelectedTechnicianId(isSelected ? null : technician.id)}
      />
      <div className="flex-1 relative h-full">
        {viewMode === "day" ? (
          <>
            {/* Day grid lines */}
            {Array.from({ length: WORK_END_HOUR - WORK_START_HOUR }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-timeline-grid"
                style={{ left: `${(i / (WORK_END_HOUR - WORK_START_HOUR)) * 100}%` }}
              />
            ))}
            {/* Travel blocks */}
            {travelBlocks.map((block) => block && (
              <TravelBlock key={block.key} fromTime={block.fromTime} toTime={block.toTime} color={techBgColors[technician.color]} />
            ))}
            {/* Service blocks */}
            {techServices.map((service) => (
              <ServiceBlock key={service.id} service={service} technician={technician} />
            ))}
          </>
        ) : (
          <>
            {/* Week day columns */}
            {weekDays?.map((day, idx) => {
              const isToday = isSameDay(day, today);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "absolute top-0 bottom-0 border-l border-timeline-grid",
                    isToday && "bg-primary/5"
                  )}
                  style={{ left: `${(idx / 7) * 100}%`, width: `${100 / 7}%` }}
                />
              );
            })}
            {/* Service count badges per day */}
            {weekDays?.map((day, idx) => {
              const dayStr = format(day, "yyyy-MM-dd");
              const dayServices = techServices.filter(s => s.startTime && s.startTime.startsWith(dayStr));
              const count = dayServices.length || techServices.length; // fallback: show all in current mock
              return (
                <div
                  key={`count-${day.toISOString()}`}
                  className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{ left: `${(idx / 7) * 100}%`, width: `${100 / 7}%` }}
                >
                  {idx === 0 && techServices.length > 0 && (
                    <span className="text-2xs px-1.5 py-0.5 rounded text-primary-foreground font-medium" style={{ backgroundColor: techBgColors[technician.color] }}>
                      {techServices.length} servicios
                    </span>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
 
export function GanttTimeline() {
  const technicians = useDispatchStore((state) => state.technicians);
  const timelineFilters = useDispatchStore((state) => state.timelineFilters);
  const todayRef = useRef<HTMLDivElement>(null);

  // Calculate week days from Monday
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(timelineFilters.currentDate, { weekStartsOn: 1 }); // Monday
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [timelineFilters.currentDate]);

  // Filter technicians based on timeline filters
  const filteredTechnicians = technicians.filter((tech) => {
    if (timelineFilters.responsible && tech.id !== timelineFilters.responsible) return false;
    if (timelineFilters.specialty && !tech.specialties.includes(timelineFilters.specialty)) return false;
    return true;
  });

  // Auto-scroll to today column in week view
  useEffect(() => {
    if (timelineFilters.viewMode === "week" && todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [timelineFilters.viewMode, timelineFilters.currentDate]);

  return (
    <div className="flex-1 bg-card border-t border-border flex flex-col min-h-0">
      <TimelineControls />
      <div className="flex-1 overflow-auto min-h-0">
        {timelineFilters.viewMode === "day" ? (
          <DayTimeHeader />
        ) : (
          <WeekTimeHeader weekDays={weekDays} currentDate={timelineFilters.currentDate} />
        )}
        {filteredTechnicians.map((technician) => (
          <TechnicianRow 
            key={technician.id} 
            technician={technician} 
            viewMode={timelineFilters.viewMode}
            weekDays={weekDays}
          />
        ))}
        {filteredTechnicians.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No hay técnicos que coincidan con los filtros
          </div>
        )}
      </div>
    </div>
  );
}