import { Newspaper } from "lucide-react";
import { PageHeader }    from "@/components/layout/page-header";
import { NewsDashboard } from "@/components/news/news-dashboard";

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="News Consolidator"
        description="Latest social media industry news aggregated from top publications — filtered by topic."
        icon={Newspaper}
      />
      <NewsDashboard />
    </div>
  );
}
