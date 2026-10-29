import { create } from 'zustand';
import type { TravelStyle, Trip } from '../types';

export interface SelectedDestination {
  id: number;
  name: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}


export interface PlannerWizardForm {
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  travelersCount: number;
  travelStyle: TravelStyle;
  budgetAmount: number;
  currency: string;
  interests: string[];
  notes?: string;
}

interface PlannerState {
  currentStep: number;
  formData: PlannerWizardForm;
  selectedDestination: SelectedDestination | null;
  isGenerating: boolean;
  generatedTrip: Trip | null;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<PlannerWizardForm>) => void;
  setSelectedDestination: (destination: SelectedDestination | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setGeneratedTrip: (trip: Trip | null) => void;
  resetForm: () => void;
}

const initialFormData: PlannerWizardForm = {
  destination: 'Switzerland',
  startDate: '2025-08-12',
  endDate: '2025-08-20',
  durationDays: 8,
  travelersCount: 2,
  travelStyle: 'Balanced',
  budgetAmount: 2840,
  currency: 'USD',
  interests: ['Nature', 'Sightseeing', 'Food & Wine', 'Adventure'],
};

export const usePlannerStore = create<PlannerState>((set) => ({
  currentStep: 1,
  formData: initialFormData,
  selectedDestination: null,
  isGenerating: false,
  generatedTrip: null,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  setSelectedDestination: (selectedDestination) => set({ selectedDestination }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setGeneratedTrip: (trip) => set({ generatedTrip: trip }),
  resetForm: () => set({ currentStep: 1, formData: initialFormData, selectedDestination: null, generatedTrip: null }),
}));
