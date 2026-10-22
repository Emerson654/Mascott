import type { Metadata } from "next";
import { Suspense } from "react";
import { Funnel } from "@/components/funnel/Funnel";

export const metadata: Metadata = {
  title: "Create your mascot",
  description: "Describe your mascot, tell her about your product, pick her look. Free to create.",
  robots: { index: false },
};

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-[80dvh]" />}>
      <Funnel />
    </Suspense>
  );
}
