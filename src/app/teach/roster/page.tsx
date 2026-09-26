import type { Metadata } from "next";
import { Suspense } from "react";
import { Roster } from "./Roster";

export const metadata: Metadata = { title: "Roster" };

// Kid ids exist only in this browser, so a kid's page is ?kid=<id> on this
// one static route rather than a dynamic route (see the static-export notes in CLAUDE.md).
export default function Page() {
  return (
    <Suspense>
      <Roster />
    </Suspense>
  );
}
