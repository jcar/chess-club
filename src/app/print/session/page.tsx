import type { Metadata } from "next";
import { Suspense } from "react";
import { SessionPack } from "./SessionPack";

export const metadata: Metadata = { title: "Session pack" };

// ?date=YYYY-MM-DD: the saved plan for that day (plans live in this browser only).
export default function Page() {
  return (
    <Suspense>
      <SessionPack />
    </Suspense>
  );
}
