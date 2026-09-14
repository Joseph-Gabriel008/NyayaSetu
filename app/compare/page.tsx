import type { Metadata } from "next";
import { CompareView } from "@/components/CompareView";

export const metadata: Metadata = {
  title: "Compare Contract Drafts | NyayaSetu",
  description:
    "Side-by-side contract comparison tool. Compare Draft 1 vs Draft 2 to see material changes, who they favor, and how your risk shifts.",
};

export default function ComparePage() {
  return (
    <div className="py-2">
      <CompareView />
    </div>
  );
}
