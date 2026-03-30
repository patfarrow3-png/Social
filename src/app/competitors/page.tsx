import { Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CompetitorsDashboard } from "@/components/competitors/competitors-dashboard";

export default function CompetitorsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitor Tracker"
        description="Monitor competitor activity, benchmark your growth, and stay ahead of the curve."
        icon={Users}
      />
      <CompetitorsDashboard />
    </div>
  );
}
