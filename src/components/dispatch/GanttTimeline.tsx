import { useRef, useEffect, useMemo } from "react";
import { useDispatchStore } from "@/hooks/useDispatchStore";
import { Service, Technician } from "@/types/dispatch";
import { WORK_START_HOUR, WORK_END_HOUR, TIME_SLOT_MINUTES } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Car, Percent } from "lucide-react";
import { TimelineControls } from "./TimelineControls";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

const SLOT_WIDTH = 42; // px per 10-min slot

const techBgColors: Record<string, string> = {
  "tech-1": "#00897B",
  "tech-2": "#7C3AED",
  "tech-3": "#EA580C",
  "tech-4": "#0EA5E9",
  "tech-5": "#DB2777",
  "tech-6": "#EAB308",
};

function generateTimeSlots() {
  const slots: string[] = [];
  for (let h = WORK_START_HOUR; h < WORK_END_HOUR; h++) {
    for (let m = 0; m < 60; m += TIME_SLOT_MINUTES) {
      slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }
  return slots;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToPx(minutes: number, totalSlots: number): number {
  const startMinutes = WORK_START_HOUR * 60;
  const totalMinutes = (WORK_END_HOUR - WORK_START_HOUR) * 60;
  const totalWidth = totalSlots * SLOT_WIDTH;
  return ((minutes - startMinutes) / totalMinutes) * totalWidth;
}

function durationToPx(duration: number, totalSlots: number): number {
  const totalMinutes = (WORK_END_HOUR - WORK_START_HOUR) * 60;
  const totalWidth = totalSlots * SLOT_WIDTH;
  return (duration / totalMinutes) * totalWidth;
}

// ── Time Header (shared for day view) ──
function TimeSlotHeader({ slots }: { slots: string[] }) {
  return (
    <div className="flex">
      {slots.map((slot) => {
        const isHour = slot.endsWith(":00");
        return (
          <div
            key={slot}
            className={cn(
              "flex-shrink-0 h-8 flex items-center justify-center text-2xs border-l whitespace-nowrap",
              isHour
                ? "text-foreground font-semibold border-border"
                : "text-muted-foreground border-timeline-grid"
            )}
            style={{ width: `${SLOT_WIDTH}px` }}
          >
            {slot}
          </div>
        );
      })}
    </div>
  );
}

// ── Week Header ──
function WeekDayHeader({ weekDays, currentDate, slots }: { weekDays: Date[]; currentDate: Date; slots: string[] }) {
  const today = new Date();
  const dayWidth = slots.length * SLOT_WIDTH;

  return (
    <div>
      {/* Day name row */}
      <div className="flex">
        {weekDays.map((day) => {
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, currentDate);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "flex-shrink-0 h-7 flex items-center justify-center text-xs font-medium border-l border-border",
                isToday && "bg-primary/15 text-primary font-bold",
                isSelected && !isToday && "bg-accent"
              )}
              style={{ width: `${dayWidth}px` }}
            >
              <span className="capitalize">{format(day, "EEE", { locale: es })}</span>
              <span className={cn(
                "ml-1",
                isToday && "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-2xs"
              )}>
                {format(day, "dd")}
              </span>
            </div>
          );
        })}
      </div>
      {/* Time slots row per day */}
      <div className="flex border-t border-border">
        {weekDays.map((day) => (
          <div key={`slots-${day.toISOString()}`} className="flex flex-shrink-0">
            {slots.map((slot) => {
              const isHour = slot.endsWith(":00");
              return (
                <div
                  key={`${day.toISOString()}-${slot}`}
                  className={cn(
                    "flex-shrink-0 h-5 flex items-center justify-center text-2xs border-l whitespace-nowrap",
                    isHour
                      ? "text-foreground font-medium border-border"
                      : "text-muted-foreground border-timeline-grid"
                  )}
                  style={{ width: `${SLOT_WIDTH}px` }}
                >
                  {slot}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Technician Info (sticky left) ──
function TechnicianInfo({ technician, isSelected, onClick }: {
  technician: Technician;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "w-56 flex-shrink-0 border-r border-border p-2 flex items-center gap-2 cursor-pointer transition-colors sticky left-0 z-[5] bg-card",
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
          technician.saturation > 60 ? "text-warning" : "text-primary"
        )}>
          {technician.saturation}%
        </span>
      </div>
    </div>
  );
}

// ── Service Block ──
function ServiceBlock({ service, technician, totalSlots }: { service: Service; technician: Technician; totalSlots: number }) {
  const validationError = useDispatchStore((state) => state.validationError);
  const hasError = validationError?.includes(service.id);

  if (!service.startTime) return null;

  const startMinutes = timeToMinutes(service.startTime);
  const left = minutesToPx(startMinutes, totalSlots);
  const width = durationToPx(service.estimatedDuration, totalSlots);

  return (
    <div
      className={cn(
        "service-block text-white",
        hasError && "animate-pulse-error"
      )}
      style={{
        left: `${left}px`,
        width: `${width}px`,
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

// ── Travel Block ──
function TravelBlock({ fromTime, toTime, totalSlots }: { fromTime: string; toTime: string; totalSlots: number }) {
  const fromMinutes = timeToMinutes(fromTime);
  const toMinutes = timeToMinutes(toTime);
  const duration = toMinutes - fromMinutes;

  if (duration <= 0) return null;

  const left = minutesToPx(fromMinutes, totalSlots);
  const width = durationToPx(duration, totalSlots);

  return (
    <div
      className="travel-block"
      style={{
        left: `${left}px`,
        width: `${width}px`,
      }}
      title={`Tiempo de viaje: ${duration} min`}
    />
  );
}

// ── Technician Row ──
function TechnicianRow({ technician, viewMode, weekDays, slots, totalSlots }: {
  technician: Technician;
  viewMode: "day" | "week";
  weekDays?: Date[];
  slots: string[];
  totalSlots: number;
}) {
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

  const travelBlocks = techServices.slice(0, -1).map((service, idx) => {
    const nextService = techServices[idx + 1];
    if (!service.startTime || !nextService.startTime) return null;
    const endMinutes = timeToMinutes(service.startTime) + service.estimatedDuration;
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;
    return { fromTime: endTime, toTime: nextService.startTime, key: `${service.id}-${nextService.id}` };
  }).filter(Boolean);

  const timelineWidth = viewMode === "day"
    ? totalSlots * SLOT_WIDTH
    : (weekDays?.length || 7) * totalSlots * SLOT_WIDTH;

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
      <div className="relative h-full" style={{ width: `${timelineWidth}px` }}>
        {viewMode === "day" ? (
          <>
            {/* Grid lines */}
            {slots.map((slot, i) => {
              const isHour = slot.endsWith(":00");
              return (
                <div
                  key={i}
                  className={cn("absolute top-0 bottom-0 border-l border-b border-timeline-grid", isHour && "border-l-border")}
                  style={{ left: `${i * SLOT_WIDTH}px`, width: `${SLOT_WIDTH}px` }}
                />
              );
            })}
            {/* Travel blocks */}
            {travelBlocks.map((block) => block && (
              <TravelBlock key={block.key} fromTime={block.fromTime} toTime={block.toTime} totalSlots={totalSlots} />
            ))}
            {/* Service blocks */}
            {techServices.map((service) => (
              <ServiceBlock key={service.id} service={service} technician={technician} totalSlots={totalSlots} />
            ))}
          </>
        ) : (
          <>
            {/* Week: day columns with grid */}
            {weekDays?.map((day, dayIdx) => {
              const isToday = isSameDay(day, today);
              const dayWidth = totalSlots * SLOT_WIDTH;
              return (
                <div
                  key={day.toISOString()}
                  className={cn("absolute top-0 bottom-0", isToday && "bg-primary/5")}
                  style={{ left: `${dayIdx * dayWidth}px`, width: `${dayWidth}px` }}
                >
                  {slots.map((slot, i) => {
                    const isHour = slot.endsWith(":00");
                    return (
                      <div
                        key={`${dayIdx}-${i}`}
                        className={cn("absolute top-0 bottom-0 border-l", isHour ? "border-border" : "border-timeline-grid")}
                        style={{ left: `${i * SLOT_WIDTH}px` }}
                      />
                    );
                  })}
                </div>
              );
            })}
            {/* Service count badges */}
            {weekDays?.map((day, idx) => {
              const dayWidth = totalSlots * SLOT_WIDTH;
              return (
                <div
                  key={`count-${day.toISOString()}`}
                  className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{ left: `${idx * dayWidth}px`, width: `${dayWidth}px` }}
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

// ── Main Component ──
export function GanttTimeline() {
  const technicians = useDispatchStore((state) => state.technicians);
  const timelineFilters = useDispatchStore((state) => state.timelineFilters);

  const slots = useMemo(() => generateTimeSlots(), []);
  const totalSlots = slots.length;

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(timelineFilters.currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [timelineFilters.currentDate]);

  const filteredTechnicians = technicians.filter((tech) => {
    if (timelineFilters.responsible && tech.id !== timelineFilters.responsible) return false;
    if (timelineFilters.specialty && !tech.specialties.includes(timelineFilters.specialty)) return false;
    return true;
  });

  const timelineWidth = timelineFilters.viewMode === "day"
    ? totalSlots * SLOT_WIDTH
    : weekDays.length * totalSlots * SLOT_WIDTH;

  return (
    <div className="flex-1 bg-card border-t border-border flex flex-col min-h-0">
      <TimelineControls />
      <div className="flex-1 overflow-auto min-h-0">
        {/* Sticky header row */}
        <div className="flex sticky top-0 z-10 bg-muted border-b border-border">
          <div className="w-56 flex-shrink-0 border-r border-border sticky left-0 z-[6] bg-muted" />
          <div style={{ width: `${timelineWidth}px` }}>
            {timelineFilters.viewMode === "day" ? (
              <TimeSlotHeader slots={slots} />
            ) : (
              <WeekDayHeader weekDays={weekDays} currentDate={timelineFilters.currentDate} slots={slots} />
            )}
          </div>
        </div>
        {/* Technician rows */}
        {filteredTechnicians.map((technician) => (
          <TechnicianRow
            key={technician.id}
            technician={technician}
            viewMode={timelineFilters.viewMode}
            weekDays={weekDays}
            slots={slots}
            totalSlots={totalSlots}
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
