import OpenAI from 'openai';
import { env } from '../config/env.js';
import { searchDestinations, searchLandmarks } from './destinationService.js';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY || 'dummy_key',
});

export interface GenerateItineraryParams {
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  travelersCount: number;
  travelStyle: string;
  budgetAmount: number;
  currency: string;
  interests?: string[];
}

export async function generateItineraryAI(params: GenerateItineraryParams) {
  const prompt = `You are an expert AI Travel Planner. Create a comprehensive, realistic, and highly detailed ${params.durationDays}-day travel itinerary for ${params.travelersCount} traveler(s) visiting ${params.destination} from ${params.startDate} to ${params.endDate}.
Travel Style: ${params.travelStyle}
Target Budget: ${params.currency} ${params.budgetAmount}
Interests: ${params.interests?.join(', ') || 'Sightseeing, Local Food, Culture'}

Use real, named landmarks for ${params.destination}. Assign a different named landmark to each day. Never use placeholders such as "Landmark #1", "Landmark #2", or "Activity Name".

You MUST respond ONLY with a valid JSON object strictly matching this schema:
{
  "destination": "${params.destination}",
  "country": "Country Name",
  "coverImage": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=800",
  "budget": {
    "totalEstimated": ${params.budgetAmount},
    "currency": "${params.currency}",
    "categories": {
      "flights": number,
      "hotels": number,
      "food": number,
      "activities": number,
      "other": number
    }
  },
  "itinerary": [
    {
      "dayNumber": 1,
      "date": "${params.startDate}",
      "title": "Day Title",
      "activities": [
        {
          "id": "act_1",
          "time": "09:00 AM",
          "title": "A specific real landmark name",
          "description": "Activity Description",
          "location": "The landmark location",
          "estimatedCost": number,
          "category": "Sightseeing | Food & Drink | Adventure | Shopping | Culture | Relaxation",
          "coordinates": { "lat": number, "lng": number },
          "rating": 4.8
        }
      ]
    }
  ],
  "packingList": [
    { "id": "pack_1", "item": "Passport & Travel Documents", "category": "Essentials", "packed": false },
    { "id": "pack_2", "item": "Comfortable Walking Shoes", "category": "Clothing", "packed": false }
  ]
}`;

  try {
    if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY.includes('dummy')) {
      return await getMockItinerary(params);
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an AI travel assistant that outputs raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.warn('⚠️ OpenAI API call failed or key missing. Returning fallback structured itinerary.', error);
    return await getMockItinerary(params);
  }
}

async function getMockItinerary(params: GenerateItineraryParams) {
  const daysCount = params.durationDays || 5;
  const days = [];
  const profile = await getDestinationProfile(params.destination);
  const landmarks = profile.landmarks;

  for (let i = 1; i <= daysCount; i++) {
    days.push({
      dayNumber: i,
      date: `Day ${i}`,
      title: i === 1 ? 'Arrival & Local Exploration' : i === daysCount ? 'Farewell & Cultural Shopping' : `Highlights & Adventure Day ${i}`,
      activities: [
        {
          id: `act_${i}_1`,
          time: '09:00 AM',
          title: `Visit ${landmarks[(i - 1) % landmarks.length]}`,
          description: `Spend the morning exploring ${landmarks[(i - 1) % landmarks.length]} and its surrounding area.`,
          location: landmarks[(i - 1) % landmarks.length],
          estimatedCost: Math.round(params.budgetAmount * 0.05),
          category: 'Sightseeing',
          coordinates: profile.coordinatesForDay(i),
          rating: 4.9,
        },
        {
          id: `act_${i}_2`,
          time: '01:00 PM',
          title: `Traditional ${params.destination} Lunch Experience`,
          description: 'Savor authentic local delicacies and fresh seasonal specialties.',
          location: 'Old Town Bistro',
          estimatedCost: Math.round(params.budgetAmount * 0.03),
          category: 'Food & Drink',
          coordinates: profile.coordinatesForDay(i + 1),
          rating: 4.7,
        },
        {
          id: `act_${i}_3`,
          time: '04:00 PM',
          title: `Sunset Viewpoint & Leisure Walk`,
          description: 'Unwind with panoramic scenic views and photography opportunities.',
          location: 'Scenic Panorama Deck',
          estimatedCost: Math.round(params.budgetAmount * 0.02),
          category: 'Relaxation',
          coordinates: profile.coordinatesForDay(i + 2),
          rating: 4.8,
        },
      ],
    });
  }

  const destinationImages: Record<string, string> = {
    manali: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1200',
    goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1200',
    jaipur: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=1200',
    udaipur: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&q=80&w=1200',
    ladakh: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=1200',
    leh: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=1200',
    kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=1200',
    munnar: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=1200',
    alleppey: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=1200',
    varanasi: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=1200',
    rishikesh: 'https://images.unsplash.com/photo-1600100397608-f010f443b745?auto=format&fit=crop&q=80&w=1200',
    agra: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=1200',
    amritsar: 'https://images.unsplash.com/photo-1583144005877-2f3b9c7b8849?auto=format&fit=crop&q=80&w=1200',
    kashmir: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=1200',
    srinagar: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=1200',
    andaman: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&q=80&w=1200',
    darjeeling: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200',
    hampi: 'https://images.unsplash.com/photo-1600100397500-1c3f15033871?auto=format&fit=crop&q=80&w=1200',
    shimla: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1200',
    mumbai: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=1200',
    delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=1200',
    paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1200',
    tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=1200',
    bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1200',
    dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1200',
    rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1200',
    london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=1200',
    switzerland: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=1200',
    thailand: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&q=80&w=1200',
    singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=1200',
  };

  const destKey = Object.keys(destinationImages).find((key) => params.destination.toLowerCase().includes(key));
  const coverImage = destKey ? destinationImages[destKey] : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200';

  const isColdMountain = /manali|shimla|ladakh|leh|kashmir|srinagar|darjeeling|switzerland|himalaya/i.test(params.destination);
  const isBeach = /goa|andaman|bali|maldives|phuket|krabi|beach/i.test(params.destination);

  const packingList = [
    { id: 'pack_1', item: 'Government ID & Travel Documents', category: 'Essentials', packed: true },
    { id: 'pack_2', item: isColdMountain ? 'Heavy Fleece / Down Jacket & Gloves' : isBeach ? 'Sunscreen, Shades & Beachwear' : 'Comfortable Walking Attire & Daypack', category: 'Clothing', packed: false },
    { id: 'pack_3', item: 'Universal Adapter & High-Capacity Power Bank', category: 'Electronics', packed: false },
    { id: 'pack_4', item: isColdMountain ? 'Trekking Boots with Ankle Support' : 'Comfortable Walking / Running Shoes', category: 'Footwear', packed: false },
    { id: 'pack_5', item: 'Personal Meds & Emergency First-Aid Kit', category: 'Health & Essentials', packed: true },
    { id: 'pack_6', item: isColdMountain ? 'Thermals & Windproof Scarf' : 'Hand Sanitizer & Wet Wipes', category: 'Gear', packed: false },
  ];

  return {
    destination: params.destination,
    country: profile.country,
    coverImage,
    budget: {
      totalEstimated: params.budgetAmount,
      currency: params.currency || 'INR',
      categories: {
        flights: Math.round(params.budgetAmount * 0.35),
        hotels: Math.round(params.budgetAmount * 0.35),
        food: Math.round(params.budgetAmount * 0.15),
        activities: Math.round(params.budgetAmount * 0.10),
        other: Math.round(params.budgetAmount * 0.05),
      },
    },
    itinerary: days,
    packingList,
  };
}

interface DestinationProfile {
  country: string;
  landmarks: string[];
  landmarkCoordinates: Array<{ lat: number; lng: number }>;
  coordinatesForDay: (day: number) => { lat: number; lng: number };
}

async function getDestinationProfile(destination: string): Promise<DestinationProfile> {
  const fallbackByDestination: Record<string, { country: string; landmarks: string[] }> = {
    manali: {
      country: 'India',
      landmarks: ['Solang Valley', 'Hadimba Temple', 'Old Manali Cafes & Beas River', 'Jogini Falls', 'Atal Tunnel & Sissu Valley', 'Vashisht Hot Water Springs'],
    },
    goa: {
      country: 'India',
      landmarks: ['Baga & Calangute Beach', 'Fort Aguada Viewpoint', 'Fontainhas Latin Quarter', 'Dudhsagar Waterfalls', 'Anjuna Flea Market', 'Basilica of Bom Jesus'],
    },
    jaipur: {
      country: 'India',
      landmarks: ['Amber Fort & Sheesh Mahal', 'Hawa Mahal Honeycomb Facade', 'City Palace & Courtyard Museum', 'Jantar Mantar Royal Observatory', 'Nahargarh Fort Sunset Point', 'Jal Mahal at Man Sagar Lake'],
    },
    udaipur: {
      country: 'India',
      landmarks: ['City Palace Lake Complex', 'Lake Pichola Boat Cruise to Jag Mandir', 'Saheliyon Ki Bari Gardens', 'Fateh Sagar Lake Promenade', 'Bagore Ki Haveli Folk Show', 'Monsoon Palace Sajjangarh'],
    },
    ladakh: {
      country: 'India',
      landmarks: ['Pangong Tso Blue Lake', 'Nubra Valley Sand Dunes & Diskit', 'Khardung La High Altitude Pass', 'Thiksey Monastery Complex', 'Magnetic Hill & Indus Sangam', 'Shanti Stupa Leh'],
    },
    leh: {
      country: 'India',
      landmarks: ['Leh Palace', 'Shanti Stupa Panoramic View', 'Pangong Tso Day Trip', 'Nubra Valley & Double-Humped Camels', 'Hemis Monastery', 'Hall of Fame Museum'],
    },
    kerala: {
      country: 'India',
      landmarks: ['Alleppey Backwaters Houseboat Cruise', 'Munnar Rolling Tea Estates', 'Eravikulam National Park Nilgiri Tahr', 'Mattupetty Lake & Echo Point', 'Marari Serene Beach', 'Fort Kochi Heritage Streets & Chinese Fishing Nets'],
    },
    munnar: {
      country: 'India',
      landmarks: ['Tata Tea Museum & Plantations', 'Eravikulam National Park', 'Mattupetty Dam & Speedboating', 'Top Station Cloud View', 'Attukad Waterfalls', 'Kundala Lake'],
    },
    alleppey: {
      country: 'India',
      landmarks: ['Punnamada Lake Backwaters', 'Marari White Sand Beach', 'Vembanad Lake Houseboat Cruise', 'Alappuzha Lighthouse & Pier', 'Pathiramanal Island Bird Sanctuary', 'Krishnapuram Palace'],
    },
    varanasi: {
      country: 'India',
      landmarks: ['Kashi Vishwanath Temple Corridor', 'Dashashwamedh Ghat Evening Ganga Aarti', 'Assi Ghat Sunrise Boat Cruise', 'Sarnath Buddhist Heritage Park', 'Manikarnika & Harishchandra Ghats', 'Ramnagar Fort & Ganges Museum'],
    },
    rishikesh: {
      country: 'India',
      landmarks: ['Laxman Jhula & Ram Jhula Walkways', 'Triveni Ghat Maha Aarti', 'Beatles Ashram Beatles Graffiti Wall', 'Neer Garh Natural Waterfall', 'Shivpuri White Water River Rafting', 'Parmarth Niketan Ashram'],
    },
    agra: {
      country: 'India',
      landmarks: ['Taj Mahal Marble Monument', 'Agra Fort Mughal Citadel', 'Mehtab Bagh Yamuna Sunset View', 'Fatehpur Sikri Royal Complex', 'Itmad-ud-Daulah (Baby Taj)', 'Kinari Bazaar Petha Walk'],
    },
    amritsar: {
      country: 'India',
      landmarks: ['Sri Harmandir Sahib (Golden Temple)', 'Wagah Border Beating Retreat Ceremony', 'Jallianwala Bagh Memorial', 'Gobindgarh Fort Light & Sound Show', 'Partition Museum Town Hall', 'Heritage Street Food Walk'],
    },
    kashmir: {
      country: 'India',
      landmarks: ['Dal Lake Shikara & Floating Market', 'Mughal Gardens Shalimar & Nishat', 'Gulmarg Gondola World’s Highest Cable Car', 'Pahalgam Betaab Valley & Aru Valley', 'Sonamarg Thajiwas Glacier', 'Shankaracharya Hilltop Temple'],
    },
    srinagar: {
      country: 'India',
      landmarks: ['Dal Lake Houseboat Stay', 'Nishat Bagh Mughal Terraces', 'Chashme Shahi Natural Spring', 'Old City Jamia Masjid & Wooden Architecture', 'Pari Mahal Palace of Fairies', 'Tulip Garden Boulevard'],
    },
    andaman: {
      country: 'India',
      landmarks: ['Radhanagar Beach Havelock (Asia’s Best Beach)', 'Cellular Jail National Memorial', 'Elephant Beach Coral Snorkeling', 'Neil Island Natural Rock Bridge', 'Ross Island Colonial Ruins', 'Chidiya Tapu Sunset View'],
    },
    darjeeling: {
      country: 'India',
      landmarks: ['Tiger Hill Kanchenjunga Sunrise View', 'Batasia Loop UNESCO Toy Train', 'Happy Valley Historic Tea Estate', 'Himalayan Mountaineering Institute & Zoo', 'Japanese Peace Pagoda', 'Ghum Monastery'],
    },
    hampi: {
      country: 'India',
      landmarks: ['Virupaksha Temple Riverfront', 'Vittala Temple Musical Pillars & Stone Chariot', 'Matanga Hill Sunrise Trek', 'Lotus Mahal & Royal Zenana Enclosure', 'Tungabhadra River Coracle Crossing', 'Elephant Stables'],
    },
    shimla: {
      country: 'India',
      landmarks: ['The Ridge & Historic Christ Church', 'Mall Road & Lakkar Bazaar', 'Jakhoo Hill Hanuman Temple & Cable Car', 'Viceregal Lodge (Indian Institute of Advanced Study)', 'Kufri Himalayan Nature Park', 'Chadwick Waterfall Trail'],
    },
    mumbai: {
      country: 'India',
      landmarks: ['Gateway of India & Taj Mahal Palace', 'Marine Drive Queen’s Necklace', 'Elephanta Caves UNESCO Rock Temples', 'Chhatrapati Shivaji Terminus Heritage Rail', 'Bandra Fort & Bandstand', 'Colaba Causeway Craft Market'],
    },
    delhi: {
      country: 'India',
      landmarks: ['Qutub Minar Complex', 'Humayun’s Tomb Garden Tomb', 'India Gate & Kartavya Path', 'Red Fort Lal Qila', 'Lotus Temple Bahai House of Worship', 'Old Delhi Chandni Chowk Food Experience'],
    },
    paris: {
      country: 'France',
      landmarks: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Arc de Triomphe', 'Montmartre & Sacré-Cœur'],
    },
    london: {
      country: 'United Kingdom',
      landmarks: ['Tower of London', 'Westminster Abbey', 'British Museum', 'London Eye', 'Buckingham Palace'],
    },
    rome: {
      country: 'Italy',
      landmarks: ['Colosseum', 'Trevi Fountain', 'Pantheon', 'Roman Forum', 'Vatican Museums'],
    },
    tokyo: {
      country: 'Japan',
      landmarks: ['Senso-ji Temple', 'Shibuya Crossing', 'Tokyo Skytree', 'Meiji Shrine', 'teamLab Borderless'],
    },
    bali: {
      country: 'Indonesia',
      landmarks: ['Uluwatu Temple Cliff', 'Tegallalang Rice Terrace', 'Tanah Lot Ocean Temple', 'Sacred Monkey Forest Ubud', 'Tirta Empul Holy Water Temple'],
    },
    dubai: {
      country: 'UAE',
      landmarks: ['Burj Khalifa Sky Deck', 'Dubai Mall & Fountain Show', 'Palm Jumeirah & Atlantis', 'Museum of the Future', 'Old Dubai Gold & Spice Souk'],
    },
    switzerland: {
      country: 'Switzerland',
      landmarks: ['Matterhorn Zermatt', 'Jungfraujoch Top of Europe', 'Lake Geneva Promenade', 'Lucerne Chapel Bridge', 'Interlaken Alpine Lakes'],
    },
  };

  const keyMatch = Object.keys(fallbackByDestination).find((key) => destination.trim().toLowerCase().includes(key));
  const fallback = keyMatch ? fallbackByDestination[keyMatch] : null;

  const fallbackNames = fallback?.landmarks ?? [
    `${destination} historic center`,
    `${destination} main square`,
    `${destination} local cultural market`,
    `${destination} city museum & heritage hall`,
    `${destination} scenic panoramic viewpoint`,
  ];

  try {
    const locations = await searchDestinations(destination);
    const location = locations[0];
    if (location) {
      let nearbyLandmarks = [] as Awaited<ReturnType<typeof searchLandmarks>>;
      try {
        nearbyLandmarks = await searchLandmarks(location.latitude, location.longitude);
      } catch {
        // Geocoding is still useful even if the landmark provider is unavailable.
      }
      const names = fallback?.landmarks?.length ? fallback.landmarks : nearbyLandmarks.map((landmark) => landmark.name).filter(Boolean);
      const landmarkCoordinates = nearbyLandmarks.map((landmark) => ({ lat: landmark.latitude, lng: landmark.longitude }));
      const base = { lat: location.latitude, lng: location.longitude };
      return {
        country: location.country || fallback?.country || 'India',
        landmarks: names.length ? names : fallbackNames,
        landmarkCoordinates,
        coordinatesForDay: (day) => landmarkCoordinates[(day - 1) % landmarkCoordinates.length] || { lat: base.lat + day * 0.003, lng: base.lng + day * 0.003 },
      };
    }
  } catch {
    // Use local profile when external service is offline
  }

  return {
    country: fallback?.country || 'India',
    landmarks: fallbackNames,
    landmarkCoordinates: [],
    coordinatesForDay: (day) => ({ lat: 28.6139 + day * 0.003, lng: 77.2090 + day * 0.003 }),
  };
}

