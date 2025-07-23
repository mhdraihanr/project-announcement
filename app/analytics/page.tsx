import { Metadata } from "next";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  title: "Analytics - PT Pupuk Kujang",
  description: "Analytics dashboard for announcements and documents",
};

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <Analytics />
    </div>
  );
}