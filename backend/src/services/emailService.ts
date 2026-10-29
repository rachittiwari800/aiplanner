import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { Trip } from '@prisma/client';

export interface SendItineraryEmailParams {
  recipientEmail: string;
  recipientName?: string;
  trip: {
    destination: string;
    country?: string | null;
    startDate: Date | string;
    endDate: Date | string;
    durationDays: number;
    travelersCount: number;
    travelStyle: string;
    coverImage?: string | null;
    budget: {
      totalEstimated: number;
      currency: string;
      categories: {
        flights: number;
        hotels: number;
        food: number;
        activities: number;
        other: number;
      };
    };
    itinerary: Array<{
      dayNumber: number;
      title: string;
      date?: string | null;
      activities: Array<{
        time?: string | null;
        title: string;
        description: string;
        location?: string | null;
        category: string;
        estimatedCost?: number | null;
      }>;
    }>;
    packingList: Array<{
      item: string;
      category: string;
      packed: boolean;
    }>;
  };
}

let cachedTransporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;

  if (host && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return cachedTransporter;
  }

  // Fallback: create an Ethereal test account or local fallback for dev
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return cachedTransporter;
  } catch {
    // If offline, create a json transport that logs to console
    cachedTransporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    return cachedTransporter;
  }
}

function generateItineraryHtml(params: SendItineraryEmailParams): string {
  const { trip, recipientName } = params;
  const startStr = new Date(trip.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const endStr = new Date(trip.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const currency = trip.budget.currency || 'INR';

  const defaultImg = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1200';
  const cover = trip.coverImage || defaultImg;

  const dayRows = trip.itinerary
    .map(
      (day) => `
      <div style="margin-bottom: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="background: #f8fafc; padding: 14px 18px; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 11px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.05em;">Day ${day.dayNumber}</span>
          <h3 style="margin: 4px 0 0 0; font-size: 16px; font-weight: 700; color: #0f172a;">${day.title}</h3>
        </div>
        <div style="padding: 14px 18px;">
          ${day.activities
            .map(
              (act) => `
            <div style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <span style="font-size: 12px; font-weight: 700; color: #6d28d9;">${act.time || 'Activity'}</span>
                <span style="font-size: 10px; background: #f3e8ff; color: #6d28d9; padding: 2px 8px; border-radius: 9999px; font-weight: 600;">${act.category}</span>
              </div>
              <div style="font-size: 14px; font-weight: 600; color: #1e293b;">${act.title}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 3px; line-height: 1.5;">${act.description}</div>
              ${act.location ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">📍 ${act.location}</div>` : ''}
              ${act.estimatedCost ? `<div style="font-size: 11px; font-weight: 600; color: #059669; margin-top: 2px;">Estimated: ${currency} ${act.estimatedCost.toLocaleString()}</div>` : ''}
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
    )
    .join('');

  const packingRows = trip.packingList
    .slice(0, 12)
    .map(
      (item) => `
      <li style="font-size: 13px; color: #334155; margin-bottom: 6px;">
        <span style="color: ${item.packed ? '#10b981' : '#94a3b8'}; font-weight: bold; margin-right: 6px;">${item.packed ? '✓' : '○'}</span>
        ${item.item} <span style="font-size: 11px; color: #94a3b8;">(${item.category})</span>
      </li>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Itinerary for ${trip.destination}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
    
    <!-- Hero Image & Title -->
    <div style="position: relative; background: #0f172a;">
      <img src="${cover}" alt="${trip.destination}" style="width: 100%; height: 220px; object-fit: cover; display: block; opacity: 0.85;" />
      <div style="padding: 24px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff;">
        <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.9;">Wayfarer AI Travel Planner</span>
        <h1 style="margin: 6px 0 0 0; font-size: 28px; font-weight: 800;">${trip.destination}${trip.country ? `, ${trip.country}` : ''}</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.95;">${trip.durationDays} Days · ${trip.travelStyle} Style · ${trip.travelersCount} Traveler(s)</p>
      </div>
    </div>

    <!-- Personal Greeting & Trip Summary -->
    <div style="padding: 24px 28px 16px 28px;">
      <p style="font-size: 15px; color: #334155; margin-top: 0; line-height: 1.6;">
        Hi ${recipientName || 'Traveler'},<br/>
        Here is your complete personalized travel itinerary for <strong>${trip.destination}</strong> (${startStr} – ${endStr}). Keep this email handy during your travels!
      </p>

      <!-- Stats Grid -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; display: table; width: 100%; box-sizing: border-box;">
        <div style="display: table-row;">
          <div style="display: table-cell; width: 50%; padding-bottom: 8px;">
            <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Dates</span>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${startStr} – ${endStr}</div>
          </div>
          <div style="display: table-cell; width: 50%; padding-bottom: 8px;">
            <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Total Budget</span>
            <div style="font-size: 13px; font-weight: 700; color: #7c3aed;">${currency} ${trip.budget.totalEstimated.toLocaleString()}</div>
          </div>
        </div>
        <div style="display: table-row;">
          <div style="display: table-cell; width: 50%;">
            <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Travelers</span>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${trip.travelersCount} Traveler(s)</div>
          </div>
          <div style="display: table-cell; width: 50%;">
            <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Travel Style</span>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${trip.travelStyle}</div>
          </div>
        </div>
      </div>

      <!-- Budget Breakdown -->
      <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin: 24px 0 12px 0;">Budget Allocation</h3>
      <table style="width: 100%; font-size: 12px; border-collapse: collapse; margin-bottom: 24px;">
        <tr style="background: #f8fafc; text-align: left; border-bottom: 1px solid #e2e8f0;">
          <th style="padding: 8px 12px;">Category</th>
          <th style="padding: 8px 12px; text-align: right;">Estimated Cost</th>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #475569;">Flights & Transit</td>
          <td style="padding: 8px 12px; text-align: right; font-weight: 600;">${currency} ${(trip.budget.categories.flights || 0).toLocaleString()}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #475569;">Hotels & Stays</td>
          <td style="padding: 8px 12px; text-align: right; font-weight: 600;">${currency} ${(trip.budget.categories.hotels || 0).toLocaleString()}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #475569;">Food & Dining</td>
          <td style="padding: 8px 12px; text-align: right; font-weight: 600;">${currency} ${(trip.budget.categories.food || 0).toLocaleString()}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; color: #475569;">Sightseeing & Activities</td>
          <td style="padding: 8px 12px; text-align: right; font-weight: 600;">${currency} ${(trip.budget.categories.activities || 0).toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; color: #475569;">Miscellaneous & Emergency</td>
          <td style="padding: 8px 12px; text-align: right; font-weight: 600;">${currency} ${(trip.budget.categories.other || 0).toLocaleString()}</td>
        </tr>
      </table>

      <!-- Daily Itinerary -->
      <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin: 24px 0 16px 0;">Daily Itinerary Schedule</h3>
      ${dayRows}

      <!-- Packing List -->
      ${
        trip.packingList.length > 0
          ? `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-top: 24px;">
          <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin: 0 0 10px 0;">Recommended Packing Items</h3>
          <ul style="padding-left: 16px; margin: 0; list-style-type: none;">
            ${packingRows}
          </ul>
        </div>
      `
          : ''
      }
    </div>

    <!-- Footer -->
    <div style="padding: 24px; background: #0f172a; color: #94a3b8; text-align: center; font-size: 12px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #ffffff;">Wayfarer AI Travel Planner</p>
      <p style="margin: 0; line-height: 1.5;">Travel, thoughtfully planned with artificial intelligence.</p>
    </div>

  </div>
</body>
</html>
  `;
}

export async function sendItineraryEmail(params: SendItineraryEmailParams): Promise<{ messageId?: string; previewUrl?: string | false }> {
  const transporter = await getTransporter();
  const html = generateItineraryHtml(params);

  const fromAddress = process.env.SMTP_FROM || '"Wayfarer AI Travel Planner" <planner@wayfarer.travel>';
  const subject = `✈️ Your ${params.trip.destination} Itinerary (${params.trip.durationDays} Days)`;

  const info = await transporter.sendMail({
    from: fromAddress,
    to: params.recipientEmail,
    subject,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`✉️ Email sent to ${params.recipientEmail}. Ethereal Preview URL: ${previewUrl}`);
  } else {
    console.log(`✉️ Email dispatched to ${params.recipientEmail}`);
  }

  return {
    messageId: info.messageId,
    previewUrl,
  };
}
