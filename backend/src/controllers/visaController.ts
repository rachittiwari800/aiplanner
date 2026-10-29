import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

interface CountryVisaData {
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

const visaDatabase: Record<string, CountryVisaData> = {
  india: {
    country: 'India',
    isDomesticIndia: true,
    visaRequired: false,
    visaType: 'Domestic Travel (No Visa Required for Indian Citizens)',
    maxStayDays: 365,
    passportValidityMonths: 0,
    permitRequired: false,
    documentsNeeded: [
      'Original Government Photo ID (Aadhaar Card, Voter ID, or Driving License)',
      'Flight / Train / Bus Booking Confirmations',
      'Hotel or Homestay Reservation Proof',
      'Inner Line Permit (ILP) only if visiting protected zones in Ladakh, Arunachal Pradesh, or Sikkim border',
    ],
    notes: 'No passport or visa needed for Indian citizens traveling domestically. Keep original ID cards handy at airport and checkposts.',
  },
  ladakh: {
    country: 'Ladakh (India)',
    isDomesticIndia: true,
    visaRequired: false,
    visaType: 'Domestic Travel + Inner Line Permit (ILP)',
    maxStayDays: 30,
    passportValidityMonths: 0,
    permitRequired: true,
    permitDetails: 'Inner Line Permit (ILP) required for visiting Pangong Tso, Nubra Valley, Khardung La, and Hanle.',
    documentsNeeded: [
      'Original Govt Photo ID (Aadhaar / Voter ID / Passport)',
      'Online LAHDC Inner Line Permit printout (easily obtained at lahdc.nic.in or Leh DC office)',
      'Physical printouts of hotel bookings and driver permits',
      'Acclimatization proof / minimum 48 hours rest in Leh before crossing high passes',
    ],
    notes: 'Acclimatization in Leh for 48 hours is mandatory by local administration. Carry cash as ATM connectivity is sparse outside Leh.',
  },
  thailand: {
    country: 'Thailand',
    visaRequired: false,
    visaType: 'Visa Exemption (Visa-Free for Indian Citizens)',
    maxStayDays: 60,
    passportValidityMonths: 6,
    documentsNeeded: [
      'Passport with minimum 6 months validity & 2 blank pages',
      'Confirmed return flight ticket within stay window',
      'Proof of accommodation / hotel voucher',
      'Sufficient funds (minimum 10,000 THB / approx ₹25,000 per person)',
    ],
    costEstimate: 'Free (Visa Exemption Scheme)',
    notes: 'Indian passport holders enjoy visa-free entry for tourism up to 60 days under the current bilateral agreement.',
  },
  malaysia: {
    country: 'Malaysia',
    visaRequired: false,
    visaType: 'Visa-Free Entry (Up to 30 Days)',
    maxStayDays: 30,
    passportValidityMonths: 6,
    documentsNeeded: [
      'Passport with at least 6 months validity',
      'Confirmed return flight ticket',
      'Malaysia Digital Arrival Card (MDAC) filled online within 3 days of arrival',
      'Confirmed hotel bookings and sufficient funds',
    ],
    costEstimate: 'Free',
    notes: 'Ensure to submit the free MDAC (Malaysia Digital Arrival Card) online before boarding your flight.',
  },
  uae: {
    country: 'United Arab Emirates (Dubai)',
    visaRequired: true,
    visaType: 'Tourist eVisa (30 Days or 60 Days) / Visa on Arrival for US/UK/EU Visa holders',
    maxStayDays: 30,
    passportValidityMonths: 6,
    documentsNeeded: [
      'Passport scanned copy with 6 months validity',
      'Passport-sized digital photograph with white background',
      'Confirmed round-trip flight booking with airline',
      'Hotel voucher in Dubai / UAE',
    ],
    processingTimeDays: 3,
    costEstimate: '₹6,500 – ₹7,500',
    notes: 'Indian passport holders with valid US, UK, or EU residence/tourist visas can obtain Visa on Arrival at Dubai International Airport.',
  },
  indonesia: {
    country: 'Indonesia (Bali)',
    visaRequired: true,
    visaType: 'Electronic Visa on Arrival (e-VOA) / VoA at Airport',
    maxStayDays: 30,
    passportValidityMonths: 6,
    documentsNeeded: [
      'Passport valid for at least 6 months',
      'Return ticket to India or onward flight',
      'Payment of IDR 500,000 (approx ₹2,700) at immigration or online',
      'Electronic Customs Declaration (e-CD) QR code',
    ],
    processingTimeDays: 1,
    costEstimate: 'IDR 500,000 (approx ₹2,700)',
    notes: 'Can be extended once for an additional 30 days while in Bali. Apply online at molina.imigrasi.go.id to skip airport queues.',
  },
  srilanka: {
    country: 'Sri Lanka',
    visaRequired: true,
    visaType: 'Free Electronic Travel Authorization (ETA)',
    maxStayDays: 30,
    passportValidityMonths: 6,
    documentsNeeded: [
      'Passport valid for at least 6 months',
      'Approved ETA confirmation slip',
      'Return flight ticket',
      'Sufficient funds for duration of stay',
    ],
    costEstimate: 'Free for Indian citizens under the tourism waiver',
    notes: 'Apply for the official online ETA at eta.gov.lk before departure.',
  },
  france: {
    country: 'France & Schengen Area',
    visaRequired: true,
    visaType: 'Schengen Short-Stay Tourist Visa (Type C)',
    maxStayDays: 90,
    passportValidityMonths: 3,
    documentsNeeded: [
      'Passport issued within the last 10 years with at least 2 blank pages',
      'Schengen Travel Medical Insurance with minimum €30,000 coverage',
      'Round-trip flight reservations and day-by-day itinerary',
      'Proof of accommodation for all nights',
      'Last 3 months certified bank statements and last 2 years ITR',
    ],
    processingTimeDays: 15,
    costEstimate: '€90 (approx ₹8,200) + VFS appointment service fee',
    notes: 'Apply at VFS Global at least 4–6 weeks prior to intended travel date. Valid across all 29 Schengen member states.',
  },
  switzerland: {
    country: 'Switzerland',
    visaRequired: true,
    visaType: 'Schengen Short-Stay Visa (Type C)',
    maxStayDays: 90,
    passportValidityMonths: 3,
    documentsNeeded: [
      'Passport valid for at least 3 months beyond intended departure date',
      'Travel Health Insurance covering medical emergencies up to €30,000',
      'Proof of financial means (CHF 100 per day for adults)',
      'Detailed travel itinerary, train/flight bookings, hotel reservations',
      'Employment leave certificate / business proof & 3-year ITR',
    ],
    processingTimeDays: 15,
    costEstimate: '€90 (approx ₹8,200) + VFS appointment fee',
    notes: 'Swiss visa holders can freely travel throughout Switzerland and neighboring Schengen countries.',
  },
  japan: {
    country: 'Japan',
    visaRequired: true,
    visaType: 'Short-Term Tourist eVisa',
    maxStayDays: 90,
    passportValidityMonths: 6,
    documentsNeeded: [
      'Valid Indian Passport',
      'Japan eVisa issued through the official JAPAN eVISA portal',
      'Round-trip flight tickets and daily itinerary plan',
      'Bank balance certificate and latest ITR Form 16',
      'Confirmed hotel reservations',
    ],
    processingTimeDays: 5,
    costEstimate: 'Approx ₹1,800 + VFS handling fee',
    notes: 'Indian nationals can conveniently apply for single-entry tourist eVisas online without submitting physical passports.',
  },
  singapore: {
    country: 'Singapore',
    visaRequired: true,
    visaType: 'Singapore Tourist eVisa (via Authorized Agents)',
    maxStayDays: 30,
    passportValidityMonths: 6,
    documentsNeeded: [
      'Passport with 6 months validity',
      'Completed Form 14A with recent passport photograph',
      'Confirmed return flight tickets and hotel bookings',
      'Singapore Arrival Card (SGAC) with electronic health declaration within 3 days of arrival',
    ],
    processingTimeDays: 4,
    costEstimate: 'SGD 30 (approx ₹1,900) + agent processing fee',
    notes: 'Singapore issues an electronic visa (e-Visa). Apply via authorized travel agents or trusted airlines.',
  },
  usa: {
    country: 'United States',
    visaRequired: true,
    visaType: 'B1/B2 Visitor Visa',
    maxStayDays: 180,
    passportValidityMonths: 6,
    documentsNeeded: [
      'DS-160 confirmation barcode page',
      'Valid passport and appointment confirmation letter',
      'Proof of funds, employment, property, and ties to home country',
      'In-person consular interview and biometric appointment',
    ],
    processingTimeDays: 30,
    costEstimate: '$185 (approx ₹15,500)',
    notes: 'Schedule appointments well in advance due to biometric and interview wait times. Usually issued as a 10-year multiple-entry visa.',
  },
  uk: {
    country: 'United Kingdom',
    visaRequired: true,
    visaType: 'Standard Visitor Visa (6 Months)',
    maxStayDays: 180,
    passportValidityMonths: 6,
    documentsNeeded: [
      'Current passport and travel history',
      'Online UK Visa application confirmation & VFS appointment',
      'Detailed travel plan and accommodation bookings',
      'Last 6 months bank statements, pay slips, and financial solvency proof',
    ],
    processingTimeDays: 15,
    costEstimate: '£115 (approx ₹12,000)',
    notes: 'Biometrics and physical passport submission are required at VFS UK centers in India.',
  },
};

export const getVisaInfo = async (req: Request, res: Response) => {
  const { country } = req.params;
  if (!country || typeof country !== 'string') {
    return sendError(res, 'Country or destination name is required', 400);
  }

  const normalized = country.trim().toLowerCase();

  // Check if destination is in India
  const isIndianPlace = /india|manali|goa|jaipur|udaipur|ladakh|leh|kerala|munnar|alleppey|varanasi|rishikesh|agra|amritsar|kashmir|srinagar|andaman|darjeeling|hampi|shimla|mumbai|delhi|bengaluru|chennai|kolkata/i.test(normalized);

  if (isIndianPlace) {
    if (normalized.includes('ladakh') || normalized.includes('leh')) {
      return sendSuccess(res, { visa: visaDatabase.ladakh }, 'Visa information retrieved');
    }
    return sendSuccess(res, { visa: visaDatabase.india }, 'Visa information retrieved');
  }

  const matchedKey = Object.keys(visaDatabase).find((key) => normalized.includes(key));
  if (matchedKey) {
    return sendSuccess(res, { visa: visaDatabase[matchedKey] }, 'Visa information retrieved');
  }

  // Fallback structured guide for any other global destination
  const genericVisa: CountryVisaData = {
    country: country.charAt(0).toUpperCase() + country.slice(1),
    visaRequired: true,
    visaType: `Tourist Visa / eVisa for ${country}`,
    maxStayDays: 30,
    passportValidityMonths: 6,
    documentsNeeded: [
      'Original passport with minimum 6 months validity from return date',
      'Confirmed return or onward travel tickets',
      'Proof of hotel accommodation or host invitation',
      'Bank statements verifying adequate travel funds',
      'Comprehensive International Travel & Medical Insurance',
    ],
    notes: `Verify latest visa protocols with the embassy or consulate of ${country} or apply through authorized visa portals before departure.`,
  };

  return sendSuccess(res, { visa: genericVisa }, 'Visa requirements information retrieved');
};

