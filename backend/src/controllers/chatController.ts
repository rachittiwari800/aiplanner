import { Request, Response } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import { env } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY || 'dummy_key',
});

const chatSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty'),
  context: z.object({
    destination: z.string().optional(),
    budget: z.number().optional(),
    currency: z.string().optional(),
    travelStyle: z.string().optional(),
    durationDays: z.number().optional(),
  }).optional(),
});

function getSmartTravelResponse(query: string, context?: { destination?: string; budget?: number; currency?: string; travelStyle?: string; durationDays?: number }) {
  const dest = context?.destination || 'your destination';
  const currency = context?.currency || 'INR';
  const q = query.toLowerCase();

  if (q.includes('budget') || q.includes('cost') || q.includes('expense') || q.includes('price')) {
    const budgetTotal = context?.budget || 25000;
    return `💰 **Budget Breakdown for ${dest}** (Target: ${currency} ${budgetTotal.toLocaleString()}):\n\n` +
      `• **Stays & Hotels (35%)**: ${currency} ${Math.round(budgetTotal * 0.35).toLocaleString()} — Look for boutique homestays or 3/4-star verified stays.\n` +
      `• **Flights / Transit (35%)**: ${currency} ${Math.round(budgetTotal * 0.35).toLocaleString()} — Book 3–4 weeks ahead for best fares.\n` +
      `• **Food & Dining (15%)**: ${currency} ${Math.round(budgetTotal * 0.15).toLocaleString()} — Savor authentic street food and renowned local cafes.\n` +
      `• **Activities & Entry (10%)**: ${currency} ${Math.round(budgetTotal * 0.10).toLocaleString()} — Guided tours, museum tickets, and adventure permits.\n` +
      `• **Emergency & Miscellaneous (5%)**: ${currency} ${Math.round(budgetTotal * 0.05).toLocaleString()}.\n\n` +
      `💡 *Tip: Check local markets for handicrafts and negotiate gently!*`;
  }

  if (q.includes('pack') || q.includes('bring') || q.includes('cloth') || q.includes('wear')) {
    const isCold = /manali|ladakh|leh|kashmir|srinagar|shimla|darjeeling|switzerland/i.test(dest);
    const isBeach = /goa|andaman|kerala|bali|maldives/i.test(dest);

    if (isCold) {
      return `🎒 **Packing Essentials for ${dest} (High Altitude / Cold Weather)**:\n\n` +
        `• **Layers**: 2x thermal inners, windproof fleece, insulated waterproof jacket.\n` +
        `• **Footwear**: Sturdy hiking boots with ankle grip & wool/merino socks.\n` +
        `• **Protection**: UV sunglasses, SPF 50+ sunscreen, cold cream & lip balm.\n` +
        `• **Electronics**: 20,000mAh Power Bank (batteries drain fast in the cold), universal charger.\n` +
        `• **Health**: High-altitude sickness tablets (Diamox/Avomine), basic pain relief, hydration salts.`;
    }

    if (isBeach) {
      return `🎒 **Packing Essentials for ${dest} (Coastal & Tropical)**:\n\n` +
        `• **Attire**: Light breathable linen shirts, quick-dry shorts, and swimwear.\n` +
        `• **Sun & Sand**: Broad-spectrum waterproof sunscreen, UV sunglasses, sun hat.\n` +
        `• **Gear**: Dry bag for boat rides/water sports, waterproof phone pouch.\n` +
        `• **Footwear**: Comfortable walking sandals and flip-flops.\n` +
        `• **Hydration**: Reusable water bottle and electrolyte packets.`;
    }

    return `🎒 **Top Packing Essentials for ${dest}**:\n\n` +
      `• Comfortable walking footwear for exploring historical districts.\n` +
      `• Layered weather-appropriate clothing and a lightweight daypack.\n` +
      `• Government ID / Passport, digital copies on phone, and hotel bookings.\n` +
      `• Universal power adapter, portable charging bank, and essential medications.`;
  }

  if (q.includes('food') || q.includes('eat') || q.includes('dish') || q.includes('restaurant') || q.includes('cafe')) {
    return `🍽️ **Must-Try Culinary Experiences in ${dest}**:\n\n` +
      `• **Local Signature Dish**: Taste authentic regional delicacies at historic family-run eateries.\n` +
      `• **Street Food Trails**: Join a guided evening food walk through the heritage bazaar or riverside promenade.\n` +
      `• **Scenic Dining**: Reserve a table at a viewpoint or rooftop cafe around sunset for memorable views.\n` +
      `• **Hygiene Tip**: Opt for bustling spots with high turnaround and drink bottled/filtered water.`;
  }

  if (q.includes('time') || q.includes('season') || q.includes('month') || q.includes('weather')) {
    return `🌤️ **Best Time to Visit ${dest}**:\n\n` +
      `• **Peak Season (Oct – March)**: Pleasant climate, clear skies, and ideal for sightseeing and outdoor trails.\n` +
      `• **Shoulder Months (April – June)**: Great for mountain retreats escaping summer heat; lush landscapes.\n` +
      `• **Monsoon (July – Sept)**: Dramatic waterfalls and misty scenery, but check road conditions and weather advisories before traveling.\n\n` +
      `Check our **Weather** tab for an instant 5-day live forecast!`;
  }

  if (q.includes('activity') || q.includes('activities') || q.includes('thing') || q.includes('visit') || q.includes('place') || q.includes('landmark')) {
    return `✨ **Top Curated Highlights in ${dest}**:\n\n` +
      `1. **Sunrise Exploration**: Beat the crowds at the most iconic viewpoint or sacred monument.\n` +
      `2. **Heritage & Culture Walk**: Explore historic lanes, palaces, and artisan workshops with a local guide.\n` +
      `3. **Adventure & Nature**: Scenic treks, river rafting, boat cruises, or nature reserve safaris.\n` +
      `4. **Evening Magic**: Sunset viewpoints followed by traditional cultural shows or riverside aartis.\n\n` +
      `Head over to the **AI Trip Planner** tab to generate an exact day-by-day itinerary!`;
  }

  return `✨ **Assistant Advice for ${dest}**:\n\n` +
    `Regarding "${query}":\n\n` +
    `• ${dest} offers a wonderful mix of natural charm, cultural depth, and vibrant food.\n` +
    `• For your ${context?.durationDays ? `${context.durationDays}-day` : 'upcoming'} trip, pace each day with 2–3 key landmarks in the morning, followed by relaxed evenings.\n` +
    `• You can save this trip to your **Trips** dashboard, check live weather, or get customized visa requirements in the sidebar anytime!`;
}

export const handleChatMessage = async (req: Request, res: Response) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, parsed.error.errors[0].message, 400);
  }

  const { message, context } = parsed.data;

  try {
    if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY.includes('dummy')) {
      const reply = getSmartTravelResponse(message, context);
      return sendSuccess(res, { reply, source: 'ai-travel-engine' }, 'Response generated');
    }

    const systemPrompt = `You are Wayfarer's AI Travel Assistant. You provide friendly, highly detailed, realistic, and practical travel recommendations.
Current planning context:
- Destination: ${context?.destination || 'Not specified'}
- Budget: ${context?.currency || 'INR'} ${context?.budget || 'Not specified'}
- Style: ${context?.travelStyle || 'Balanced'}
- Duration: ${context?.durationDays ? `${context.durationDays} days` : 'Not specified'}
Answer the user concisely with formatting (bullet points, bold highlights, emojis). Be especially knowledgeable about both Indian destinations (Manali, Ladakh, Kerala, Goa, Jaipur, Varanasi, Kashmir, etc.) and global travel spots.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content || getSmartTravelResponse(message, context);
    return sendSuccess(res, { reply, source: 'openai' }, 'Response generated');
  } catch (err) {
    console.warn('OpenAI Chat error, falling back to smart travel assistant:', err);
    const reply = getSmartTravelResponse(message, context);
    return sendSuccess(res, { reply, source: 'ai-travel-engine' }, 'Response generated');
  }
};

