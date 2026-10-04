import type { Metadata } from "next";
import { Suspense } from "react";
import { ClubPrint } from "./ClubPrint";

export const metadata: Metadata = { title: "Club printables" };

// ?what=chart|stamps|tents|score|ladder (&step=N, &date=YYYY-MM-DD)
export default function Page() {
  return (
    <Suspense>
      <ClubPrint />
    </Suspense>
  );
}
