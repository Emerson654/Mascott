import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { Funnel } from "@/components/funnel/Funnel";

export const metadata = pageMetadata({
  title: "Create your AI mascot for free",
  description: "Describe your mascot in one sentence, tell her about your product and pick her look. Free to create, no card needed.",
  path: "/create",
});

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-[80dvh]" />}>
      <Funnel />
    </Suspense>
  );
}
