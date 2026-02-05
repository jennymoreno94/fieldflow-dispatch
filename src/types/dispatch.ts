 export type Priority = "high" | "medium" | "low";
 export type ServiceStatus = "unassigned" | "assigned" | "in-progress" | "completed";

// Status colors from Agenda Personal
export const SERVICE_STATUS_COLORS = {
  "pending": { color: "border-green-500", label: "Pendiente", fill: false },
  "confirmed": { color: "bg-green-500", label: "Confirmado", fill: true },
  "in-progress": { color: "bg-yellow-400", label: "En Progreso", fill: true },
  "paused": { color: "bg-pink-300", label: "Pausado", fill: true },
  "canceled": { color: "bg-rose-500", label: "Cancelado", fill: true },
  "completed": { color: "bg-gray-500", label: "Completado", fill: true },
} as const;

export type ServiceStatusKey = keyof typeof SERVICE_STATUS_COLORS;
 
 export interface Service {
   id: string;
   clientName: string;
   address: string;
   zone: string;
   priority: Priority;
   timeWindow: string;
   estimatedDuration: number; // in minutes
   specialty: string;
   status: ServiceStatus;
   technicianId?: string;
   startTime?: string;
   lat: number;
   lng: number;
  statusDetail?: ServiceStatusKey;
 }
 
 export interface Technician {
   id: string;
   name: string;
   photo: string;
   vehicle: string;
   specialties: string[];
   color: string;
   saturation: number; // percentage of workday filled
 }
 
 export interface TravelBlock {
   fromServiceId: string;
   toServiceId: string;
   duration: number; // in minutes
   startTime: string;
 }
 
 export interface KPIs {
   totalServices: number;
   assignedServices: number;
   windowCompliance: number;
   totalKm: number;
 }

export interface TimelineFilters {
  zone: string | null;
  specialty: string | null;
  responsible: string | null;
  serviceNumber: string;
  viewMode: "day" | "week";
  currentDate: Date;
}