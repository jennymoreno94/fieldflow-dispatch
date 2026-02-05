 import { create } from "zustand";
 import { Service, Technician, KPIs } from "@/types/dispatch";
 import { mockServices, mockTechnicians } from "@/data/mockData";
 
 interface DispatchState {
   services: Service[];
   technicians: Technician[];
   selectedServiceIds: string[];
   selectedTechnicianId: string | null;
   priorityFilter: string | null;
   searchQuery: string;
   kpis: KPIs;
   validationError: string | null;
   
   // Actions
   setSelectedServiceIds: (ids: string[]) => void;
   toggleServiceSelection: (id: string) => void;
   setSelectedTechnicianId: (id: string | null) => void;
   setPriorityFilter: (priority: string | null) => void;
   setSearchQuery: (query: string) => void;
   assignService: (serviceId: string, technicianId: string, startTime: string) => void;
   unassignService: (serviceId: string) => void;
   moveService: (serviceId: string, newTechnicianId: string, newStartTime: string) => void;
   setValidationError: (error: string | null) => void;
   calculateKPIs: () => void;
 }
 
 export const useDispatchStore = create<DispatchState>((set, get) => ({
   services: mockServices,
   technicians: mockTechnicians,
   selectedServiceIds: [],
   selectedTechnicianId: null,
   priorityFilter: null,
   searchQuery: "",
   validationError: null,
   kpis: {
     totalServices: mockServices.length,
     assignedServices: mockServices.filter(s => s.status === "assigned").length,
     windowCompliance: 87,
     totalKm: 156,
   },
   
   setSelectedServiceIds: (ids) => set({ selectedServiceIds: ids }),
   
   toggleServiceSelection: (id) => set((state) => {
     const isSelected = state.selectedServiceIds.includes(id);
     return {
       selectedServiceIds: isSelected
         ? state.selectedServiceIds.filter(sid => sid !== id)
         : [...state.selectedServiceIds, id]
     };
   }),
   
   setSelectedTechnicianId: (id) => set({ selectedTechnicianId: id }),
   
   setPriorityFilter: (priority) => set({ priorityFilter: priority }),
   
   setSearchQuery: (query) => set({ searchQuery: query }),
   
   assignService: (serviceId, technicianId, startTime) => {
     const state = get();
     const service = state.services.find(s => s.id === serviceId);
     const technician = state.technicians.find(t => t.id === technicianId);
     
     // Validate specialty
     if (service && technician && !technician.specialties.includes(service.specialty)) {
       set({ validationError: `${technician.name} no tiene la especialidad "${service.specialty}" requerida` });
       setTimeout(() => set({ validationError: null }), 3000);
       return;
     }
     
     set((state) => ({
       services: state.services.map(s => 
         s.id === serviceId 
           ? { ...s, status: "assigned" as const, technicianId, startTime }
           : s
       ),
       selectedServiceIds: state.selectedServiceIds.filter(id => id !== serviceId),
     }));
     get().calculateKPIs();
   },
   
   unassignService: (serviceId) => set((state) => ({
     services: state.services.map(s => 
       s.id === serviceId 
         ? { ...s, status: "unassigned" as const, technicianId: undefined, startTime: undefined }
         : s
     ),
   })),
   
   moveService: (serviceId, newTechnicianId, newStartTime) => {
     const state = get();
     const service = state.services.find(s => s.id === serviceId);
     const technician = state.technicians.find(t => t.id === newTechnicianId);
     
     // Validate specialty
     if (service && technician && !technician.specialties.includes(service.specialty)) {
       set({ validationError: `${technician.name} no tiene la especialidad "${service.specialty}" requerida` });
       setTimeout(() => set({ validationError: null }), 3000);
       return;
     }
     
     set((state) => ({
       services: state.services.map(s => 
         s.id === serviceId 
           ? { ...s, technicianId: newTechnicianId, startTime: newStartTime }
           : s
       ),
     }));
   },
   
   setValidationError: (error) => set({ validationError: error }),
   
   calculateKPIs: () => set((state) => ({
     kpis: {
       totalServices: state.services.length,
       assignedServices: state.services.filter(s => s.status === "assigned").length,
       windowCompliance: Math.round((state.services.filter(s => s.status === "assigned").length / state.services.length) * 100),
       totalKm: Math.round(state.services.filter(s => s.status === "assigned").length * 12),
     }
   })),
 }));