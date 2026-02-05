 export type Priority = "high" | "medium" | "low";
 export type ServiceStatus = "unassigned" | "assigned" | "in-progress" | "completed";
 
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