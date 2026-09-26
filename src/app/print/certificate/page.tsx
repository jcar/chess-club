import type { Metadata } from "next";
import { Suspense } from "react";
import { Certificate } from "./Certificate";

export const metadata: Metadata = { title: "Certificate" };

export default function Page() {
  return (
    <Suspense>
      <Certificate />
    </Suspense>
  );
}
