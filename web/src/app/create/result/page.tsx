import type { Metadata } from "next";
import { Result } from "@/components/funnel/Result";

export const metadata: Metadata = {
  title: "Your mascot",
  robots: { index: false, follow: false },
};

export default function ResultPage() {
  return <Result />;
}
