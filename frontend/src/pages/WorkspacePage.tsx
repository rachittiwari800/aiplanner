import React, { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  Bell,
  Building2,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  CloudSun,
  FileText,
  LoaderCircle,
  LogOut,
  Luggage,
  Mail,
  Map,
  MapPin,
  MessageSquare,
  Plane,
  Plus,
  Send,
  Settings,
  ShieldAlert,
  Sparkles,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useUIStore } from "../store/useUIStore";
import { tripService } from "../services/tripService";
import type { Trip, PackingItem } from "../types";
import { useAuth } from "../context/AuthContext";
import { DestinationDiscovery } from "../components/workspace/DestinationDiscovery";
import {
  usePlannerStore,
  type SelectedDestination,
} from "../store/usePlannerStore";
import type { DestinationLocation } from "../services/destinationService";
import { WeatherWidget } from "../components/weather/WeatherWidget";
import { chatService } from "../services/chatService";
import { visaService, type VisaDetails } from "../services/visaService";

const details: Record<
  string,
  { title: string; description: string; icon: React.ElementType }
> = {
  planner: {
    title: "AI Trip Planner",
    description: "Generate an intelligent, comprehensive multi-day itinerary for any Indian or global destination.",
    icon: Sparkles,
  },
  trips: {
    title: "Your Trips",
    description: "Manage, view detailed day-by-day itineraries, and check off packing lists for all your trips.",
    icon: Luggage,
  },
  chat: {
    title: "AI Chat Assistant",
    description: "Chat with your personal travel copilot for recommendations, budget tips, and packing advice.",
    icon: MessageSquare,
  },
  flights: {
    title: "Flights",
    description: "Search domestic and international flight options tailored to your origin and budget.",
    icon: Plane,
  },
  hotels: {
    title: "Hotels & Stays",
    description: "Discover boutique resorts, heritage havelis, and verified stays.",
    icon: Building2,
  },
  maps: {
    title: "Explore Destinations",
    description: "Discover curated landmarks, local attractions, and coordinates worldwide.",
    icon: Map,
  },
  weather: {
    title: "Weather Forecast",
    description: "Live 5-day temperature, rainfall, and wind forecast for any travel destination.",
    icon: CloudSun,
  },
  budget: {
    title: "Budget Planner",
    description: "Track estimated categories, log custom expenses, and manage your travel finances.",
    icon: Wallet,
  },
  packing: {
    title: "Packing List",
    description: "Build, customize, and check off essential gear tailored to your destination climate.",
    icon: CheckSquare,
  },
  visa: {
    title: "Visa & Entry Guidelines",
    description: "Official entry rules, document checklists, and permit guidelines for Indian & global spots.",
    icon: FileText,
  },
  notifications: {
    title: "Notifications",
    description: "Review and manage your planning activity and alerts.",
    icon: Bell,
  },
  profile: {
    title: "Traveler Profile",
    description: "Manage your personal travel identity and account settings.",
    icon: User,
  },
  settings: {
    title: "Settings",
    description: "Configure default currencies, travel styles, and departure airports.",
    icon: Settings,
  },
};

const inputClass =
  "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/30 transition-all";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <label className="block space-y-1.5">
    <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
      {label}
    </span>
    {children}
  </label>
);

const popularDestinationsPresets = [
  "Manali",
  "Goa",
  "Jaipur",
  "Ladakh",
  "Kerala",
  "Varanasi",
  "Udaipur",
  "Kashmir",
  "Paris",
  "Tokyo",
  "Bali",
  "Dubai",
];

// ==========================================
// 1. AI TRIP PLANNER TOOL
// ==========================================
const PlannerTool: React.FC = () => {
  const addNotification = useUIStore((state) => state.addNotification);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const { formData, selectedDestination, updateFormData } = usePlannerStore();
  const { user } = useAuth();

  const [destination, setDestination] = useState(
    selectedDestination?.name || formData.destination || "Manali"
  );
  const [startDate, setStartDate] = useState("2026-10-10");
  const [endDate, setEndDate] = useState("2026-10-15");
  const [budget, setBudget] = useState("35000");
  const [currency, setCurrency] = useState("INR");
  const [travelers, setTravelers] = useState("2");
  const [style, setStyle] = useState<Trip["travelStyle"]>("Balanced");
  const [interests, setInterests] = useState("Nature, Culture, Local Food, Photography");
  const [result, setResult] = useState<Trip | null>(null);
  const [status, setStatus] = useState("");
  const [working, setWorking] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  // Email state
  const [emailSending, setEmailSending] = useState(false);
  const [emailTarget, setEmailTarget] = useState(user?.email || "");
  const [emailSentNotice, setEmailSentNotice] = useState<string | null>(null);
  const [emailOnSave, setEmailOnSave] = useState(true);

  useEffect(() => {
    if (user?.email && !emailTarget) {
      setEmailTarget(user.email);
    }
  }, [user?.email]);

  useEffect(() => {
    if (selectedDestination?.name) setDestination(selectedDestination.name);
    else if (formData.destination) setDestination(formData.destination);
  }, [selectedDestination, formData.destination]);

  const handleEmailDraft = async () => {
    if (!result) return;
    const recipient = emailTarget.trim() || user?.email;
    if (!recipient) {
      alert("Please enter a valid email address to receive your itinerary.");
      return;
    }
    setEmailSending(true);
    setEmailSentNotice(null);
    try {
      await tripService.emailTripDraft(
        {
          ...result,
          startDate,
          endDate,
          durationDays: result.itinerary.length,
          travelersCount: Number(travelers) || 1,
          travelStyle: style,
        },
        recipient
      );
      setEmailSentNotice(`Full itinerary sent to ${recipient}! Check your inbox.`);
      addNotification({
        title: "Itinerary Emailed",
        message: `Your ${result.destination} itinerary was emailed to ${recipient}`,
        type: "planner",
      });
    } catch (err: any) {
      alert("Failed to email itinerary: " + (err?.message || "Check connection"));
    } finally {
      setEmailSending(false);
    }
  };

  const generate = async (event: FormEvent) => {
    event.preventDefault();
    setWorking(true);
    setStatus("Generating comprehensive itinerary with AI...");
    setSavedSuccess(false);
    setEmailSentNotice(null);

    try {
      const durationDays = Math.max(
        1,
        Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            86400000
        )
      );

      const response = await tripService.generateTrip({
        destination,
        startDate,
        endDate,
        durationDays,
        travelersCount: Number(travelers) || 1,
        travelStyle: style,
        budgetAmount: Number(budget) || 30000,
        currency,
        interests: interests
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      });

      setResult(response.data as Trip);
      updateFormData({ destination, durationDays, budgetAmount: Number(budget), currency });
      addNotification({
        title: "Itinerary Ready",
        message: `${destination} ${durationDays}-day itinerary generated successfully!`,
        type: "planner",
      });
      setStatus("Your itinerary is ready to review below!");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Could not generate the itinerary. Check connection and try again."
      );
    } finally {
      setWorking(false);
    }
  };

  const save = async () => {
    if (!result) return;
    setStatus("Saving trip to your account...");
    try {
      const savedRes = await tripService.saveTrip({
        ...result,
        startDate,
        endDate,
        durationDays: result.itinerary.length,
        travelersCount: Number(travelers) || 1,
        travelStyle: style,
      });

      // Auto-email itinerary upon save if configured
      const recipient = emailTarget.trim() || user?.email;
      const tripId = savedRes.data?.trip?.id;
      if (emailOnSave && recipient && tripId) {
        try {
          await tripService.emailTrip(tripId, recipient);
          setEmailSentNotice(`Saved and emailed to ${recipient}!`);
        } catch (mailErr) {
          console.warn("Auto-email on save notice:", mailErr);
        }
      }

      addNotification({
        title: "Trip Saved",
        message: `${result.destination} was successfully saved to Your Trips!`,
        type: "planner",
      });
      setSavedSuccess(true);
      setStatus(
        `Trip saved successfully! ${
          emailOnSave && recipient ? `A copy was also emailed to ${recipient}.` : ""
        } You can view and manage it in 'Your Trips'.`
      );
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Could not save this trip."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Destination Chips */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
          Popular destinations:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {popularDestinationsPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setDestination(preset)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                destination.toLowerCase() === preset.toLowerCase()
                  ? "bg-purple-600 text-white border-purple-600 font-semibold"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-400"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={generate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Destination (Indian or Global)">
          <input
            className={inputClass}
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="e.g. Manali, Goa, Ladakh, Paris, Tokyo"
            required
          />
        </Field>

        <Field label="Travel Style">
          <select
            className={inputClass}
            value={style}
            onChange={(event) =>
              setStyle(event.target.value as Trip["travelStyle"])
            }
          >
            <option>Balanced</option>
            <option>Adventure</option>
            <option>Culture</option>
            <option>Relaxation</option>
            <option>Budget</option>
            <option>Luxury</option>
          </select>
        </Field>

        <Field label="Start Date">
          <input
            className={inputClass}
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            required
          />
        </Field>

        <Field label="End Date">
          <input
            className={inputClass}
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Total Budget">
            <input
              className={inputClass}
              type="number"
              min="100"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              required
            />
          </Field>
          <Field label="Currency">
            <select
              className={inputClass}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </Field>
        </div>

        <Field label="Number of Travelers">
          <input
            className={inputClass}
            type="number"
            min="1"
            max="50"
            value={travelers}
            onChange={(event) => setTravelers(event.target.value)}
            required
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Interests & Preferences (comma separated)">
            <input
              className={inputClass}
              value={interests}
              onChange={(event) => setInterests(event.target.value)}
              placeholder="e.g. Hiking, Local Food, Temples, Photography, Architecture"
            />
          </Field>
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          disabled={working}
          className="sm:col-span-2 sm:w-fit gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {working ? "Crafting Itinerary..." : "Generate Full Itinerary"}
        </Button>
      </form>

      {status ? (
        <div className="rounded-xl p-3 bg-purple-50 dark:bg-purple-950/40 text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center justify-between">
          <span>{status}</span>
          {savedSuccess ? (
            <Button size="sm" variant="gradient" onClick={() => setActiveTab("trips")}>
              View in Your Trips
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* Generated Itinerary Detailed Display */}
      {result ? (
        <Card className="p-5 sm:p-6 space-y-6 border border-purple-100 dark:border-purple-900/40">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl h-44 bg-gray-900">
            <img
              src={result.coverImage || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1200"}
              alt={result.destination}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
              <span className="text-xs uppercase font-bold tracking-wider text-purple-300">
                {result.country} · {result.travelStyle} Style
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold">{result.destination}</h2>
              <p className="text-xs text-gray-200 mt-1">
                {result.itinerary.length} Days · {travelers} Traveler(s) · Budget: {result.budget.currency} {result.budget.totalEstimated.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Estimated Budget Breakdown
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleEmailDraft}
                disabled={emailSending}
                className="gap-1.5"
              >
                {emailSending ? (
                  <LoaderCircle className="w-4 h-4 animate-spin text-purple-600" />
                ) : (
                  <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                )}
                <span>{emailSending ? "Sending Email..." : "Email Itinerary"}</span>
              </Button>
              <Button size="sm" variant="gradient" onClick={save} disabled={savedSuccess}>
                <Check className="w-4 h-4" />
                {savedSuccess ? "Saved to Your Trips" : "Save Trip"}
              </Button>
            </div>
          </div>

          {/* Email Recipient Config */}
          <div className="rounded-xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Email Itinerary to:
              </span>
              <input
                type="email"
                value={emailTarget}
                onChange={(e) => setEmailTarget(e.target.value)}
                placeholder="your-email@gmail.com"
                className="rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 px-2.5 py-1 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-purple-500 w-52 sm:w-64"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-300 select-none">
              <input
                type="checkbox"
                checked={emailOnSave}
                onChange={(e) => setEmailOnSave(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
              />
              <span>Send confirmation email on Save</span>
            </label>
          </div>

          {emailSentNotice ? (
            <div className="rounded-xl p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{emailSentNotice}</span>
            </div>
          ) : null}

          {/* Budget Allocation Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {Object.entries(result.budget.categories).map(([cat, amount]) => (
              <div
                key={cat}
                className="rounded-xl bg-gray-50 dark:bg-gray-800/70 p-3 text-center border border-gray-100 dark:border-gray-800"
              >
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 capitalize">
                  {cat}
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                  {result.budget.currency} {Number(amount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Day by Day Itinerary */}
          <div className="space-y-3 pt-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Day-by-Day Schedule ({result.itinerary.length} Days)
            </h3>

            <div className="space-y-3">
              {result.itinerary.map((day) => {
                const isOpen = expandedDay === day.dayNumber;
                return (
                  <div
                    key={day.dayNumber}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedDay(isOpen ? null : day.dayNumber)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer"
                    >
                      <div>
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                          Day {day.dayNumber}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                          {day.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-medium">
                          {day.activities.length} activities
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {isOpen ? (
                      <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800/60 space-y-3 mt-2">
                        {day.activities.map((act, index) => (
                          <div
                            key={act.id || index}
                            className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3.5 space-y-1.5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                                <Clock className="w-3.5 h-3.5" />
                                {act.time || "Morning"}
                              </span>
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                                {act.category}
                              </span>
                            </div>
                            <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                              {act.title}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                              {act.description}
                            </p>
                            <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-1">
                              {act.location ? (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-purple-500" />
                                  {act.location}
                                </span>
                              ) : <span />}
                              {act.estimatedCost !== undefined ? (
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                  Est: {result.budget.currency} {act.estimatedCost.toLocaleString()}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
};

// ==========================================
// 2. YOUR TRIPS TOOL (FULL CRUD)
// ==========================================
const TripsTool: React.FC = () => {
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const addNotification = useUIStore((state) => state.addNotification);
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [emailingTripId, setEmailingTripId] = useState<string | null>(null);
  const [emailedNotice, setEmailedNotice] = useState<{ [id: string]: string }>({});

  const handleEmailSavedTrip = async (tripId: string, destination: string) => {
    setEmailingTripId(tripId);
    try {
      await tripService.emailTrip(tripId, user?.email);
      const recipient = user?.email || "your email";
      setEmailedNotice((prev) => ({ ...prev, [tripId]: `Sent to ${recipient}` }));
      addNotification({
        title: "Itinerary Emailed",
        message: `${destination} itinerary was emailed to ${recipient}.`,
        type: "planner",
      });
    } catch (err: any) {
      alert("Could not email itinerary: " + (err?.message || "Failed to send"));
    } finally {
      setEmailingTripId(null);
    }
  };

  const loadTrips = async () => {
    setLoading(true);
    try {
      const res = await tripService.getUserTrips();
      setTrips(res.data.trips);
    } catch (err: any) {
      setError(err?.message || "Could not load trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTrips();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the trip to ${name}?`)) return;
    try {
      await tripService.deleteTrip(id);
      setTrips((current) => current.filter((t) => t.id !== id));
      if (expandedTripId === id) setExpandedTripId(null);
    } catch (err: any) {
      alert("Could not delete trip: " + (err?.message || "Unknown error"));
    }
  };

  const togglePackingItem = async (trip: Trip, itemId: string) => {
    const updatedList = trip.packingList.map((item) =>
      item.id === itemId ? { ...item, packed: !item.packed } : item
    );

    // Optimistic UI update
    setTrips((current) =>
      current.map((t) => (t.id === trip.id ? { ...t, packingList: updatedList } : t))
    );

    try {
      await tripService.updateTrip(trip.id, { packingList: updatedList });
    } catch {
      // Revert if error
      setTrips((current) =>
        current.map((t) => (t.id === trip.id ? { ...t, packingList: trip.packingList } : t))
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-500 dark:text-gray-400 gap-2">
        <LoaderCircle className="w-5 h-5 animate-spin text-purple-600" />
        <span>Loading your saved trips...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-xs text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <Card className="p-8 text-center space-y-3">
        <Luggage className="w-12 h-12 text-purple-400 mx-auto" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          No trips saved yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Generate an itinerary for Manali, Goa, Ladakh, or any world destination and save it to review here.
        </p>
        <Button variant="gradient" onClick={() => setActiveTab("planner")}>
          <Sparkles className="w-4 h-4" />
          Plan a Trip Now
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => {
        const isExpanded = expandedTripId === trip.id;
        const packedCount = trip.packingList.filter((i) => i.packed).length;

        return (
          <Card key={trip.id} className="overflow-hidden border border-gray-200 dark:border-gray-800">
            {/* Trip Header Row */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={trip.coverImage || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=300"}
                  alt={trip.destination}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                    {trip.destination}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {trip.durationDays} days · {trip.travelStyle} Style · {trip.budget.currency} {trip.budget.totalEstimated.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()} · {packedCount}/{trip.packingList.length} packed
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEmailSavedTrip(trip.id, trip.destination)}
                  disabled={emailingTripId === trip.id}
                  title={`Email ${trip.destination} itinerary to ${user?.email || "your email"}`}
                  className="gap-1.5"
                >
                  {emailingTripId === trip.id ? (
                    <LoaderCircle className="w-3.5 h-3.5 animate-spin text-purple-600" />
                  ) : (
                    <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  )}
                  <span>{emailedNotice[trip.id] ? "Emailed!" : "Email Itinerary"}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                >
                  {isExpanded ? "Hide Details" : "View Itinerary & Packing"}
                  {isExpanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(trip.id, trip.destination)}
                  className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-2"
                  title="Delete Trip"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Expanded Detailed View */}
            {isExpanded ? (
              <div className="border-t border-gray-100 dark:border-gray-800 p-5 bg-gray-50/50 dark:bg-gray-800/30 space-y-6">
                {/* Email Banner inside expanded view */}
                <div className="rounded-xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/60 dark:bg-purple-950/20 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        Send this itinerary to your inbox
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Includes day-by-day plan, budget breakdown, and packing checklist.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => handleEmailSavedTrip(trip.id, trip.destination)}
                    disabled={emailingTripId === trip.id}
                    className="gap-1.5"
                  >
                    {emailingTripId === trip.id ? (
                      <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Mail className="w-3.5 h-3.5" />
                    )}
                    <span>{emailedNotice[trip.id] || `Send to ${user?.email || "My Email"}`}</span>
                  </Button>
                </div>

                {/* Budget summary */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">
                    Budget Breakdown
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {Object.entries(trip.budget.categories).map(([k, v]) => (
                      <div key={k} className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-center">
                        <span className="text-[10px] text-gray-400 uppercase font-medium">{k}</span>
                        <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                          {trip.budget.currency} {Number(v).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Day-by-day Itinerary */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Day-by-Day Schedule
                  </h4>
                  <div className="space-y-2">
                    {trip.itinerary.map((day) => (
                      <div key={day.dayNumber} className="rounded-xl bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                            Day {day.dayNumber}: {day.title}
                          </span>
                          <span className="text-[11px] text-gray-400">{day.activities.length} activities</span>
                        </div>
                        <div className="grid gap-2 pt-1">
                          {day.activities.map((act, i) => (
                            <div key={i} className="text-xs p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 flex items-start justify-between gap-3">
                              <div>
                                <span className="font-bold text-gray-900 dark:text-white">{act.time ? `${act.time} — ` : ''}{act.title}</span>
                                <p className="text-gray-600 dark:text-gray-300 mt-0.5">{act.description}</p>
                                {act.location ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                                    <MapPin className="w-2.5 h-2.5" /> {act.location}
                                  </span>
                                ) : null}
                              </div>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 shrink-0">
                                {act.category}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Packing Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Packing Checklist ({packedCount} of {trip.packingList.length} packed)
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {trip.packingList.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => togglePackingItem(trip, item.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                          item.packed
                            ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-gray-500 line-through"
                            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:border-purple-300"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            item.packed
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {item.packed ? <Check className="w-3 h-3" /> : null}
                        </span>
                        <span className="font-medium truncate">{item.item}</span>
                        <span className="text-[10px] text-gray-400 ml-auto shrink-0">{item.category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
};

// ==========================================
// 3. AI CHAT ASSISTANT TOOL
// ==========================================
const ChatTool: React.FC = () => {
  const { formData, selectedDestination } = usePlannerStore();
  const activeDest = selectedDestination?.name || formData.destination || "Manali";
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
    {
      sender: "ai",
      text: `Hello! I am your AI Travel Assistant. I have deep knowledge of ${activeDest} and destinations across India and the globe. Ask me anything about best visiting seasons, hidden gems, local street food, packing essentials, or budget adjustments!`,
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || sending) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { sender: "user", text: query, time }]);
    if (!textToSend) setInput("");
    setSending(true);

    try {
      const res = await chatService.sendMessage(query, {
        destination: activeDest,
        budget: formData.budgetAmount,
        currency: formData.currency || "INR",
        travelStyle: formData.travelStyle,
        durationDays: formData.durationDays,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: res.reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I couldn't reach the assistant right now. Please try again in a moment.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-xs font-semibold text-purple-700 dark:text-purple-300">
        <span>Active planning destination: <strong>{activeDest}</strong></span>
        <span>Budget: {formData.currency || "INR"} {formData.budgetAmount.toLocaleString()}</span>
      </div>

      <div className="h-96 overflow-y-auto space-y-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-purple-600 text-white rounded-br-xs font-medium"
                  : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-xs shadow-xs"
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>
              <span className={`block text-[9px] mt-1 ${m.sender === "user" ? "text-purple-200 text-right" : "text-gray-400"}`}>
                {m.time}
              </span>
            </div>
          </div>
        ))}
        {sending ? (
          <div className="flex justify-start">
            <div className="p-3 rounded-2xl bg-white dark:bg-gray-900 text-xs text-purple-600 dark:text-purple-400 flex items-center gap-2 border border-gray-100 dark:border-gray-800">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-1.5">
        {[
          `Budget breakdown for ${activeDest}`,
          `Must-try food in ${activeDest}`,
          `Top 5 hidden gems in ${activeDest}`,
          `What to pack for ${activeDest}`,
        ].map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => sendMessage(prompt)}
            className="text-[11px] px-3 py-1 rounded-full border border-purple-200 dark:border-purple-900 bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage();
        }}
        className="flex gap-2"
      >
        <input
          className={inputClass}
          value={input}
          disabled={sending}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask anything about traveling to ${activeDest}...`}
        />
        <Button type="submit" variant="gradient" disabled={sending || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

// ==========================================
// 4. VISA & ENTRY GUIDELINES TOOL
// ==========================================
const VisaTool: React.FC = () => {
  const { formData, selectedDestination } = usePlannerStore();
  const defaultQuery = selectedDestination?.name || formData.destination || "India";
  const [country, setCountry] = useState(defaultQuery);
  const [detailsData, setDetailsData] = useState<VisaDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkVisa = async (targetCountry: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await visaService.getVisaInfo(targetCountry);
      setDetailsData(res.visa);
    } catch (err: any) {
      setError(err?.message || "Could not retrieve visa information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void checkVisa(country);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (country.trim()) void checkVisa(country.trim());
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className={inputClass}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Enter country or Indian destination (e.g. Thailand, Ladakh, France, UAE)"
          required
        />
        <Button type="submit" variant="gradient" disabled={loading}>
          {loading ? "Checking..." : "Check Requirements"}
        </Button>
      </form>

      {/* Suggested chips */}
      <div className="flex flex-wrap gap-1.5">
        {[
          "India Domestic",
          "Ladakh (ILP)",
          "Thailand",
          "Dubai / UAE",
          "Bali / Indonesia",
          "France / Schengen",
          "Switzerland",
          "Japan",
          "USA",
        ].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setCountry(p);
              void checkVisa(p);
            }}
            className="text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-purple-400 cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-xs text-gray-500 dark:text-gray-400">
          <LoaderCircle className="w-4 h-4 animate-spin text-purple-600" />
          <span>Fetching entry rules for {country}...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : detailsData ? (
        <Card className="p-5 space-y-4 border border-purple-100 dark:border-purple-900/40">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
                Official Entry Protocol
              </span>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                {detailsData.country}
              </h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                !detailsData.visaRequired
                  ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300"
                  : "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300"
              }`}
            >
              {detailsData.visaType}
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Max Stay</span>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                {detailsData.maxStayDays} Days
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Passport Validity</span>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                {detailsData.passportValidityMonths > 0 ? `${detailsData.passportValidityMonths}+ Months` : "Not required (ID only)"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Processing</span>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                {detailsData.processingTimeDays ? `${detailsData.processingTimeDays} Days` : "Instant / On Arrival"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Estimated Fee</span>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                {detailsData.costEstimate || "Free"}
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Required Documents Checklist
            </h4>
            <div className="space-y-1.5">
              {detailsData.documentsNeeded.map((doc, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Advisory Notes */}
          <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200">
            <p className="font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              Travel Advisory
            </p>
            <p className="mt-1 leading-relaxed text-gray-600 dark:text-gray-300">{detailsData.notes}</p>
          </div>
        </Card>
      ) : null}
    </div>
  );
};

// ==========================================
// 5. BUDGET PLANNER TOOL
// ==========================================
const BudgetTool: React.FC = () => {
  const { formData } = usePlannerStore();
  const [totalBudget, setTotalBudget] = useState(formData.budgetAmount || 40000);
  const [currency, setCurrency] = useState(formData.currency || "INR");
  const [customExpenses, setCustomExpenses] = useState<Array<{ id: string; title: string; amount: number }>>([
    { id: "e1", title: "Flight / Train Tickets", amount: Math.round(totalBudget * 0.35) },
    { id: "e2", title: "Hotel / Homestay Booking", amount: Math.round(totalBudget * 0.35) },
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const totalSpent = customExpenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = Math.max(0, totalBudget - totalSpent);
  const percentSpent = Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  const addExpense = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;
    setCustomExpenses((prev) => [
      ...prev,
      { id: `exp_${Date.now()}`, title: newTitle.trim(), amount: Number(newAmount) },
    ]);
    setNewTitle("");
    setNewAmount("");
  };

  const removeExpense = (id: string) => {
    setCustomExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Total Trip Budget">
          <input
            className={inputClass}
            type="number"
            min="100"
            value={totalBudget}
            onChange={(e) => setTotalBudget(Number(e.target.value))}
          />
        </Field>
        <Field label="Currency">
          <select
            className={inputClass}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </Field>
      </div>

      {/* Progress Card */}
      <Card className="p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between text-xs font-semibold">
          <span className="text-gray-500">Allocated: {currency} {totalSpent.toLocaleString()}</span>
          <span className="text-purple-600 dark:text-purple-400">Total: {currency} {totalBudget.toLocaleString()}</span>
          <span className={remaining > 0 ? "text-emerald-600" : "text-rose-500"}>
            Remaining: {currency} {remaining.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${percentSpent > 90 ? "bg-rose-500" : "bg-purple-600"}`}
            style={{ width: `${percentSpent}%` }}
          />
        </div>
      </Card>

      {/* Expense Logger */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Custom Expenses & Bookings
        </h4>

        <form onSubmit={addExpense} className="flex flex-col sm:flex-row gap-2">
          <input
            className={inputClass}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Expense title (e.g. Scuba diving, Museum tickets)"
            required
          />
          <input
            className={`${inputClass} sm:w-40`}
            type="number"
            min="1"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder={`Amount (${currency})`}
            required
          />
          <Button type="submit" variant="gradient" className="shrink-0">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </form>

        <div className="space-y-2">
          {customExpenses.map((exp) => (
            <div
              key={exp.id}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs"
            >
              <span className="font-semibold text-gray-800 dark:text-gray-200">{exp.title}</span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 dark:text-white">
                  {currency} {exp.amount.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => removeExpense(exp.id)}
                  className="text-gray-400 hover:text-rose-500 cursor-pointer p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. PACKING LIST TOOL
// ==========================================
const PackingTool: React.FC = () => {
  const [items, setItems] = useState<PackingItem[]>(() => {
    const saved = localStorage.getItem("wayfarer_packing_items");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: "p1", item: "Government ID / Passport & Bookings", category: "Essentials", packed: true },
      { id: "p2", item: "Universal Adapter & Fast Power Bank", category: "Electronics", packed: false },
      { id: "p3", item: "Weather-Appropriate Jacket / Layering", category: "Clothing", packed: false },
      { id: "p4", item: "Comfortable Walking & Trekking Shoes", category: "Footwear", packed: false },
      { id: "p5", item: "First Aid Kit & Motion Sickness Pills", category: "Medical", packed: true },
      { id: "p6", item: "Sunscreen SPF 50+ & Lip Balm", category: "Toiletries", packed: false },
    ];
  });

  const [newItem, setNewItem] = useState("");
  const [newCat, setNewCat] = useState("Essentials");

  useEffect(() => {
    localStorage.setItem("wayfarer_packing_items", JSON.stringify(items));
  }, [items]);

  const addItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: `pack_${Date.now()}`, item: newItem.trim(), category: newCat, packed: false },
    ]);
    setNewItem("");
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, packed: !i.packed } : i))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const packedCount = items.filter((i) => i.packed).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
        <span>Checklist Progress:</span>
        <span className="text-purple-600 dark:text-purple-400 font-bold">
          {packedCount} of {items.length} items packed ({items.length ? Math.round((packedCount / items.length) * 100) : 0}%)
        </span>
      </div>

      <form onSubmit={addItem} className="flex flex-col sm:flex-row gap-2">
        <input
          className={inputClass}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add an item (e.g. Hiking pole, Raincoat)"
          required
        />
        <select
          className={`${inputClass} sm:w-40`}
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
        >
          <option>Essentials</option>
          <option>Clothing</option>
          <option>Footwear</option>
          <option>Electronics</option>
          <option>Toiletries</option>
          <option>Medical</option>
        </select>
        <Button type="submit" variant="gradient" className="shrink-0">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((i) => (
          <div
            key={i.id}
            className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-colors ${
              i.packed
                ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-gray-400 line-through"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleItem(i.id)}
              className="flex items-center gap-3 flex-1 text-left cursor-pointer truncate"
            >
              <span
                className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                  i.packed ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {i.packed ? <Check className="w-3 h-3" /> : null}
              </span>
              <span className="font-medium truncate">{i.item}</span>
            </button>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-[10px] text-gray-400">{i.category}</span>
              <button
                type="button"
                onClick={() => removeItem(i.id)}
                className="text-gray-400 hover:text-rose-500 cursor-pointer p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 7. PROFILE TOOL
// ==========================================
const ProfileTool: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setMsg("");
    try {
      await updateUser(name.trim());
      setMsg("Profile name updated successfully!");
    } catch (err: any) {
      setMsg(err?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md">
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
        <img
          src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
          alt="Avatar"
          className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/40"
        />
        <div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white">{user?.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
          <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            {user?.isPremium ? "Premium Member" : "Free Plan"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <Field label="Display Name">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Button variant="gradient" disabled={saving} onClick={handleSave}>
          {saving ? "Saving..." : "Save Profile"}
        </Button>

        {msg ? <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{msg}</p> : null}
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
        <Button
          variant="outline"
          onClick={logout}
          className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900 gap-2"
        >
          <LogOut className="w-4 h-4" /> Sign Out of Wayfarer
        </Button>
      </div>
    </div>
  );
};

// ==========================================
// 8. SETTINGS TOOL
// ==========================================
const SettingsTool: React.FC = () => {
  const { logout } = useAuth();
  const [currency, setCurrency] = useState(() => localStorage.getItem("wayfarer_pref_currency") || "INR");
  const [airport, setAirport] = useState(() => localStorage.getItem("wayfarer_pref_airport") || "Delhi (DEL)");
  const [style, setStyle] = useState(() => localStorage.getItem("wayfarer_pref_style") || "Balanced");
  const [foodRecs, setFoodRecs] = useState(true);
  const [budgetPick, setBudgetPick] = useState(true);
  const [msg, setMsg] = useState("");

  const saveSettings = () => {
    localStorage.setItem("wayfarer_pref_currency", currency);
    localStorage.setItem("wayfarer_pref_airport", airport);
    localStorage.setItem("wayfarer_pref_style", style);
    setMsg("Preferences saved successfully!");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="space-y-6 max-w-md">
      <div className="space-y-4">
        <Field label="Default Planning Currency">
          <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </Field>

        <Field label="Home Airport / Origin City">
          <input
            className={inputClass}
            value={airport}
            onChange={(e) => setAirport(e.target.value)}
            placeholder="e.g. Delhi (DEL), Mumbai (BOM), Bengaluru (BLR)"
          />
        </Field>

        <Field label="Preferred Travel Style">
          <select className={inputClass} value={style} onChange={(e) => setStyle(e.target.value)}>
            <option>Balanced</option>
            <option>Adventure</option>
            <option>Culture</option>
            <option>Relaxation</option>
            <option>Budget</option>
            <option>Luxury</option>
          </select>
        </Field>

        <div className="space-y-2 pt-2">
          <label className="flex items-center gap-3 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={foodRecs}
              onChange={(e) => setFoodRecs(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            Include local authentic food recommendations in every itinerary
          </label>
          <label className="flex items-center gap-3 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={budgetPick}
              onChange={(e) => setBudgetPick(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            Highlight cost-efficient transit and verified local homestays
          </label>
        </div>

        <Button variant="gradient" onClick={saveSettings}>
          Save Settings
        </Button>

        {msg ? <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{msg}</p> : null}
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
        <Button
          variant="outline"
          onClick={logout}
          className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900 gap-2"
        >
          <LogOut className="w-4 h-4" /> Sign Out of Account
        </Button>
      </div>
    </div>
  );
};

// ==========================================
// MAIN WORKSPACE PAGE COMPONENT
// ==========================================
interface WorkspacePageProps {
  tab: string;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({ tab }) => {
  const { setActiveTab, notifications, markNotificationsRead } = useUIStore();
  const selectedDestination = usePlannerStore((state) => state.selectedDestination);
  const setSelectedDestination = usePlannerStore((state) => state.setSelectedDestination);
  const updatePlannerForm = usePlannerStore((state) => state.updateFormData);

  const info = details[tab] ?? details.planner;
  const Icon = info.icon;

  const selectDestination = (destination: string) => {
    updatePlannerForm({ destination });
    setActiveTab("planner");
  };

  const selectLocation = (location: DestinationLocation) => {
    if (selectedDestination?.id === location.id) return;
    const selected: SelectedDestination = {
      id: location.id,
      name: location.name,
      country: location.country,
      region: location.region,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone,
    };
    setSelectedDestination(selected);
  };

  const renderContent = () => {
    switch (tab) {
      case "planner":
        return <PlannerTool />;
      case "trips":
        return <TripsTool />;
      case "chat":
        return <ChatTool />;
      case "flights":
      case "hotels":
        return (
          <DestinationDiscovery
            initialKind={tab}
            initialLocation={selectedDestination}
            onSelectDestination={selectDestination}
            onSelectLocation={selectLocation}
          />
        );
      case "maps":
        return (
          <DestinationDiscovery
            initialKind="places"
            initialLocation={selectedDestination}
            onSelectDestination={selectDestination}
            onSelectLocation={selectLocation}
          />
        );
      case "weather":
        return <WeatherWidget />;
      case "visa":
        return <VisaTool />;
      case "budget":
        return <BudgetTool />;
      case "packing":
        return <PackingTool />;
      case "profile":
        return <ProfileTool />;
      case "settings":
        return <SettingsTool />;
      case "notifications":
        return (
          <div className="space-y-4">
            {notifications.length ? (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-4 border border-gray-100 dark:border-gray-800 ${
                    notification.read ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {notification.createdAt}
                    </span>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-5 text-center text-sm text-gray-500">
                You have caught up with all notifications.
              </Card>
            )}
            <Button variant="gradient" onClick={markNotificationsRead}>
              Mark all as read
            </Button>
          </div>
        );
      default:
        return <PlannerTool />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("dashboard")}
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Button>
      </div>

      <Card className="p-5 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Travel Workspace
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
              {info.title}
            </h1>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
              {info.description}
            </p>
            <div className="mt-6">{renderContent()}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
