import api from './api';

export interface VisaDetails {
  country: string;
  isDomesticIndia?: boolean;
  visaRequired: boolean;
  visaType: string;
  maxStayDays: number;
  passportValidityMonths: number;
  permitRequired?: boolean;
  permitDetails?: string;
  documentsNeeded: string[];
  processingTimeDays?: number;
  costEstimate?: string;
  notes: string;
}

export const visaService = {
  async getVisaInfo(country: string): Promise<{ visa: VisaDetails }> {
    const response = await api.get(`/visa/${encodeURIComponent(country)}`);
    return response.data.data;
  },
};

