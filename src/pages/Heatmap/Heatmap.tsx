import { CalendarDays } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { HeatmapPreview } from "@/pages/Dashboard/HeatmapPreview";

export default function Heatmap() {
  return <PageContainer><div className="page-heading"><CalendarDays /><div><h1>Your consistency</h1><p>A quiet record of the days you chose to show up.</p></div></div><div className="mt-8"><HeatmapPreview /></div></PageContainer>;
}
