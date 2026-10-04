import type { Metadata } from "next";
import { Suspense } from "react";
import { Wrapup } from "./Wrapup";

export const metadata: Metadata = { title: "Wrap-up" };

// ?date=YYYY-MM-DD; a scanned pass or helper code arrives in the #fragment.
export default function Page() {
  return (
    <Suspense>
      <Wrapup />
    </Suspense>
  );
}
