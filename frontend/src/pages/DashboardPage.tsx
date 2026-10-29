import React from "react";
import { HeroBanner } from "../components/dashboard/HeroBanner";
import { QuickToolsGrid } from "../components/dashboard/QuickToolsGrid";
import { UpcomingTripsGrid } from "../components/dashboard/UpcomingTripsGrid";
import { BudgetOverviewWidget } from "../components/dashboard/BudgetOverviewWidget";
import { PopularDestinations } from "../components/dashboard/PopularDestinations";

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero Banner with Next Trip Card */}
      <HeroBanner />

      {/* Quick Tools Grid */}
      <QuickToolsGrid />

      {/* Grid containing Upcoming Trips & Budget Pie Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7">
          <UpcomingTripsGrid />
        </div>
        <div className="md:col-span-5">
          <BudgetOverviewWidget />
        </div>
      </div>

      {/* Popular Destinations Grid */}
      <PopularDestinations />
    </div>
  );
};
